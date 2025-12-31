# Business Rules Validation - Attendify

## Backend Validation Rules

### Check-in Rules
✅ **Check-in time must be < 16:00**
- Check-in QR only available: 00:00 - 15:59
- If user tries to check-in at/after 16:00 → Error
- Error message: "Check-in tidak dapat dilakukan setelah pukul 16:00. Silakan scan QR check-out."

✅ **Status determination**
- Check-in ≤ 10:00 → Status: `hadir`
- Check-in > 10:00 → Status: `telat`

### Check-out Rules
✅ **Check-out time must be ≥ 16:00**
- Check-out QR only available: 16:00 - 23:59
- If user tries to check-out before 16:00 → Error
- Error message: "Check-out hanya dapat dilakukan setelah pukul 16:00."

✅ **Check-out must be after check-in**
- Validate: check-out time > check-in time
- Error message: "Waktu check-out tidak valid. Check-out harus setelah check-in."

✅ **Must check-in before check-out**
- Can't check-out without check-in first
- Error message: "Anda harus check-in terlebih dahulu sebelum check-out."

### Duplicate Prevention
✅ **One check-in per day**
- Database flag: `has_checked_in`
- Error message: "Anda sudah melakukan check-in hari ini."

✅ **One check-out per day**
- Database flag: `has_checked_out`
- Error message: "Anda sudah melakukan check-out hari ini."

## HR Edit Validation

When HR edits attendance records, same rules apply:

✅ **Check-in validation**
- Must be before 16:00
- Error: "Waktu check-in tidak valid. Check-in harus sebelum pukul 16:00."

✅ **Check-out validation**
- Must be after 16:00
- Error: "Waktu check-out tidak valid. Check-out harus setelah pukul 16:00."

✅ **Time sequence**
- Check-out must be after check-in
- Error: "Waktu check-out harus setelah check-in."

## Seeder Validation

### Data Generation Rules
✅ **Check-in generation**
```php
$checkInHour = rand(7, 15); // Max hour: 15

// If hour is 15, limit minutes to ensure < 16:00
if ($checkInHour === 15) {
    $checkInMinute = rand(0, 50); // Max 15:50
} else {
    $checkInMinute = rand(0, 59);
}
```

✅ **Check-out generation**
```php
$checkOutHour = rand(16, 18); // Min hour: 16
$checkOutMinute = rand(0, 59);

// Validate check-out > check-in
if ($checkOut->lte($checkIn)) {
    $checkOut = $checkIn->copy()->addHours(rand(1, 3));
}
```

✅ **Status logic**
```php
if ($checkIn->format('H:i') <= '10:00') {
    $status = 'hadir';
} else {
    $status = 'telat';
}
```

## Validation Layers

### 1. QR Service Layer
- `determineQrType()`: Returns correct QR type based on time
- Before 16:00 → `check_in`
- After 16:00 → `check_out`

### 2. Attendance Service Layer
- `preventDoubleSubmission()`: Check duplicate scans
- `recordAttendance()`: Validate time rules before saving
- `editAttendance()`: Validate when HR edits

### 3. Database Layer
- `has_checked_in`: Boolean flag
- `has_checked_out`: Boolean flag
- Constraints ensure data integrity

## Error Handling

All validation errors throw exceptions with Indonesian messages:

```php
throw new \Exception('Check-in tidak dapat dilakukan setelah pukul 16:00.');
throw new \Exception('Check-out hanya dapat dilakukan setelah pukul 16:00.');
throw new \Exception('Waktu check-out harus setelah check-in.');
throw new \Exception('Anda sudah melakukan check-in hari ini.');
throw new \Exception('Anda harus check-in terlebih dahulu sebelum check-out.');
```

Frontend catches these exceptions and displays user-friendly alerts.

## Testing Validation

### Test Case 1: Late Check-in (Valid)
```
Time: 14:30
QR Type: check_in
Expected: Success, Status: telat ✅
```

### Test Case 2: Check-in at 16:00 (Invalid)
```
Time: 16:00
QR Type: check_out (auto-switched)
Expected: Error if trying check-in ❌
```

### Test Case 3: Check-out before 16:00 (Invalid)
```
Time: 15:00
QR Type: check_in
Expected: Can't access check-out QR ❌
```

### Test Case 4: Duplicate Check-in (Invalid)
```
First scan: Success ✅
Second scan: Error "Sudah check-in" ❌
```

### Test Case 5: Check-out before Check-in (Invalid)
```
No check-in yet
Try check-out: Error "Harus check-in dulu" ❌
```

### Test Case 6: Check-out after Check-in (Valid)
```
Check-in: 08:30 ✅
Check-out: 17:00 ✅
Expected: Both recorded successfully
```

## Database Integrity

All seeded data now follows business rules:
- ✅ Check-in times: 07:00 - 15:50
- ✅ Check-out times: 16:00 - 18:59
- ✅ Check-out always > Check-in
- ✅ Status correctly determined based on check-in time
- ✅ Flags (`has_checked_in`, `has_checked_out`) properly set

## Implementation Files

- `app/Services/QrService.php` - QR type determination
- `app/Services/AttendanceService.php` - Business logic validation
- `database/seeders/DatabaseSeeder.php` - Data generation with validation
- `app/Http/Controllers/Employee/AttendanceController.php` - Frontend submission
- `app/Http/Controllers/Hr/AttendanceController.php` - HR edit validation

---

**Last Updated**: December 31, 2025  
**Validation Status**: ✅ All business rules enforced in backend
