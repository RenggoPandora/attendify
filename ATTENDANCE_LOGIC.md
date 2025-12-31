# Attendance Business Logic Implementation

## Overview
Sistem absensi dengan 2 kali scan QR per hari (Check-in & Check-out) dengan aturan bisnis yang ketat.

## Time-Based QR System

### Check-in QR
- **Waktu Tersedia**: 00:00 - 15:59
- **Durasi Valid**: 30 detik per QR
- **Cache Key**: `active_qr_session_check_in`
- **Status Logic**:
  - **Hadir**: Check-in <= 10:00
  - **Telat**: Check-in > 10:00 (dan <= 16:00)
  - **Alpha**: Tidak check-in sama sekali (auto-marked at 23:59)

### Check-out QR
- **Waktu Tersedia**: 16:00 - 23:59
- **Durasi Valid**: 30 detik per QR
- **Cache Key**: `active_qr_session_check_out`
- **Status**: Tidak mengubah status (tetap hadir/telat dari check-in)

## Business Rules

### 1. Duplicate Prevention
- Employee hanya bisa scan check-in **1x per hari**
- Employee hanya bisa scan check-out **1x per hari**
- Check-out **wajib** setelah check-in (tidak bisa check-out tanpa check-in)
- Validasi menggunakan flags: `has_checked_in`, `has_checked_out`

### 2. Late Threshold
- **Batas Waktu**: 10:00 WIB
- Check-in **≤ 10:00** → Status: `hadir`
- Check-in **> 10:00** → Status: `telat`
- Check-in **> 16:00** → Tidak bisa (QR sudah berubah ke check-out)

### 3. Auto-Mark Absent
- **Waktu Eksekusi**: Setiap hari pukul 23:59
- **Command**: `php artisan attendance:mark-absent`
- **Logic**: 
  - Cari semua employee yang **tidak ada** record attendance hari ini
  - Create attendance record dengan status `alpha`
  - Set `has_checked_in = false`, `has_checked_out = false`

### 4. Permit Letter Workflow
- Employee bisa upload surat izin untuk hari dengan status `alpha`
- HR dapat mengubah status dari `alpha` → `sakit` atau `izin` jika ada surat
- Surat izin ter-link ke `attendance_id` spesifik

## Database Schema Changes

### Migration: `2025_12_31_085400_add_qr_type_and_logic_to_tables`

#### Table: `qr_sessions`
```sql
ALTER TABLE qr_sessions ADD COLUMN generated_at_time TIME NULL;
```
- Menyimpan waktu generate QR untuk tracking

#### Table: `attendances`
```sql
ALTER TABLE attendances 
ADD COLUMN has_checked_in BOOLEAN DEFAULT false,
ADD COLUMN has_checked_out BOOLEAN DEFAULT false;
```
- Flag untuk prevent duplicate scan

## Service Layer

### QrService (`app/Services/QrService.php`)

#### Methods:
1. **`determineQrType(Carbon $now): string`**
   - Return: `'check_in'` atau `'check_out'`
   - Logic: Before 16:00 = check_in, after = check_out

2. **`getActiveQrSession(): ?array`**
   - Auto-determine QR type berdasarkan waktu
   - Generate QR baru jika tidak ada atau expired
   - Return: `['token', 'type', 'valid_from', 'valid_until', 'generated_at_time']`

3. **`generateNewQrSession(string $type): array`**
   - Generate QR dengan 30 detik validity
   - Store di cache dengan key: `active_qr_session_{$type}`
   - Return QR session data

4. **`validateQrToken(string $token, string $expectedType): void`**
   - Validate token exist di cache
   - Validate type match dengan expected
   - Validate not expired
   - Throw exception jika invalid

### AttendanceService (`app/Services/AttendanceService.php`)

#### Updated Methods:
1. **`submitAttendance(User $user, string $qrToken): Attendance`**
   - Determine QR type from current time
   - Validate token dengan expected type
   - Check duplicate submission berdasarkan type
   - Record attendance dengan status sesuai waktu
   - Update flags (`has_checked_in` atau `has_checked_out`)

2. **`preventDoubleSubmission(User $user, string $qrType): void`**
   - Query attendance today
   - Check flag `has_checked_in` untuk check-in
   - Check flag `has_checked_out` untuk check-out
   - Validate check-out harus setelah check-in
   - Throw exception jika duplicate

3. **`recordAttendance(User $user, string $qrType, Carbon $now): Attendance`**
   - Find or create attendance record
   - If check-in: Set `check_in`, `has_checked_in`, determine status (hadir/telat)
   - If check-out: Set `check_out`, `has_checked_out`, keep existing status

## Console Commands

### MarkAbsentEmployees (`app/Console/Commands/MarkAbsentEmployees.php`)

#### Usage:
```bash
# Mark absent for yesterday (default)
php artisan attendance:mark-absent

# Mark absent for specific date
php artisan attendance:mark-absent --date=2025-12-30
```

#### Schedule:
```php
// routes/console.php
Schedule::command('attendance:mark-absent')->dailyAt('23:59');
```

#### Logic:
1. Get all users with role 'employee'
2. Loop each employee
3. Check if attendance record exists for target date
4. If not exist: Create attendance with status 'alpha'

## Controller Updates

### Employee/AttendanceController

#### `scan()` Method:
- Return QR session with type info
- Return today's attendance dengan check-in/out status
- Frontend dapat show indicator "✓ Sudah Check-in" dll

#### `submit()` Method:
- Unchanged (sudah pakai AttendanceService)

### Hr/AttendanceController

#### `index()` Method:
- Load permit letters untuk attendance date
- Frontend dapat show permit letter indicator
- HR dapat lihat alasan dari alpha status

#### `update()` Method:
- Allow status change dari alpha → sakit/izin
- Jika ada permit letter attached

## API Response Examples

### Check-in QR (Before 16:00)
```json
{
  "token": "abc123xyz789",
  "type": "check_in",
  "valid_from": "2025-12-31 08:30:00",
  "valid_until": "2025-12-31 08:30:30",
  "generated_at_time": "08:30:00"
}
```

### Check-out QR (After 16:00)
```json
{
  "token": "def456uvw012",
  "type": "check_out",
  "valid_from": "2025-12-31 17:00:00",
  "valid_until": "2025-12-31 17:00:30",
  "generated_at_time": "17:00:00"
}
```

### Employee Scan Page Response
```json
{
  "activeQrSession": { /* QR data */ },
  "qrType": "check_in",
  "currentTime": "08:45:30",
  "todayAttendance": {
    "id": 123,
    "date": "2025-12-31",
    "check_in": "2025-12-31 08:15:00",
    "check_out": null,
    "status": "hadir",
    "has_checked_in": true,
    "has_checked_out": false
  },
  "hasCheckedIn": true,
  "hasCheckedOut": false
}
```

## Error Messages

### Indonesian Messages:
- `"Anda sudah melakukan check-in hari ini."` - Duplicate check-in
- `"Anda sudah melakukan check-out hari ini."` - Duplicate check-out
- `"Anda harus check-in terlebih dahulu sebelum check-out."` - Check-out before check-in
- `"QR code tidak valid atau sudah tidak aktif."` - Invalid/expired token
- `"QR code type tidak sesuai. Expected: check_in"` - Wrong QR type

## Testing Checklist

### Manual Testing:
- [ ] Scan check-in sebelum 09:30 → Status: hadir
- [ ] Scan check-in setelah 09:30 → Status: telat
- [ ] Try double check-in → Error: "sudah check-in"
- [ ] Try check-out tanpa check-in → Error: "harus check-in dulu"
- [ ] Try double check-out → Error: "sudah check-out"
- [ ] QR expired after 30 seconds → Error: "kadaluarsa"
- [ ] Run command `attendance:mark-absent` → Create alpha records
- [ ] Upload permit letter untuk alpha day
- [ ] HR change alpha → sakit (with permit letter)

### Time-Based Testing:
- [ ] 07:00 - QR type: check_in
- [ ] 09:59 - Scan = status: hadir
- [ ] 10:00 - Scan = status: hadir (batas waktu)
- [ ] 10:01 - Scan = status: telat
- [ ] 15:59 - QR type: check_in (last minute)
- [ ] 16:00 - QR type: check_out
- [ ] 23:59 - QR type: check_out
- [ ] 00:00 - QR type: check_in (next day)

## Migration Steps

1. **Run Migration:**
   ```bash
   php artisan migrate
   ```

2. **Test Schedule (Local):**
   ```bash
   php artisan schedule:work
   ```

3. **Setup Cron (Production):**
   ```bash
   # Add to crontab
   * * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
   ```

4. **Manual Test Command:**
   ```bash
   php artisan attendance:mark-absent --date=2025-12-30
   ```

## Notes

- QR code auto-refresh setiap 30 detik di frontend
- Cache menggunakan Laravel Cache (file/redis)
- Separate cache keys untuk check_in dan check_out
- Status attendance di-set saat check-in, tidak berubah saat check-out
- Auto-absent command sebaiknya run di server dengan timezone yang benar
