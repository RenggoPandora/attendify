# 🔐 Demo Credentials - Attendify

## Login Information
**Password untuk semua akun: `password`**

---

## 👤 Admin Account
Full system access untuk mengelola seluruh sistem.

| Email | Name | Department | Capabilities |
|-------|------|------------|--------------|
| `admin@attendify.local` | System Administrator | IT | Full system management, QR display, audit logs |

**Features:**
- View QR code display for attendance
- Manage QR sessions
- View all departments and users
- Access audit logs
- System settings

---

## 👔 HR Manager Accounts
Mengelola kehadiran karyawan, approval surat izin, dan laporan.

| Email | Name | Department | Capabilities |
|-------|------|------------|--------------|
| `hr@attendify.local` | Sarah Johnson | HR | HR management + Employee attendance |
| `hr.manager@attendify.local` | Michael Chen | HR | HR management + Employee attendance |

**Features:**
- View and edit employee attendance
- Approve/reject permit letters
- Generate attendance reports (recap)
- Export attendance data (CSV)
- Can also scan attendance (dual role: HR + Employee)

---

## 👷 Employee Accounts
Scan QR untuk absensi, lihat history, dan upload surat izin.

### IT Department
| Email | Name | Employee ID |
|-------|------|-------------|
| `john.doe@attendify.local` | John Doe | IT001 |
| `alice.wong@attendify.local` | Alice Wong | IT002 |
| `david.smith@attendify.local` | David Smith | IT003 |
| `emma.wilson@attendify.local` | Emma Wilson | IT004 |

### Finance & Accounting
| Email | Name | Employee ID |
|-------|------|-------------|
| `robert.lee@attendify.local` | Robert Lee | FIN001 |
| `lisa.tan@attendify.local` | Lisa Tan | FIN002 |
| `james.brown@attendify.local` | James Brown | FIN003 |

### Marketing & Sales
| Email | Name | Employee ID |
|-------|------|-------------|
| `sophia.martinez@attendify.local` | Sophia Martinez | MKT001 |
| `oliver.garcia@attendify.local` | Oliver Garcia | MKT002 |
| `emily.rodriguez@attendify.local` | Emily Rodriguez | MKT003 |

### Operations
| Email | Name | Employee ID |
|-------|------|-------------|
| `william.anderson@attendify.local` | William Anderson | OPS001 |
| `ava.thomas@attendify.local` | Ava Thomas | OPS002 |
| `lucas.moore@attendify.local` | Lucas Moore | OPS003 |

**Features:**
- Scan QR code for check-in (before 16:00)
- Scan QR code for check-out (after 16:00)
- View personal attendance history
- Upload permit letters for absences
- Download permit letters

---

## 📊 Sample Data Included

### Attendance Records
- **30 days** of attendance history (weekdays only)
- **~286 records** across all employees
- Mix of statuses:
  - ✅ **Hadir** (on-time, before 09:30)
  - ⏰ **Telat** (late, after 09:30)
  - 🏥 **Sakit** (sick with permit letter)
  - 📝 **Izin** (leave with permit letter)
  - ❌ **Alpha** (absent without reason)

### Permit Letters
- **Sample permit letters** for recent sick/leave days
- Mix of **approved** and **pending** status
- Linked to specific attendance records

### Departments
- Information Technology (IT)
- Human Resources (HR)
- Finance & Accounting (FIN)
- Marketing & Sales (MKT)
- Operations (OPS)

---

## 🎯 Demo Flow Suggestions

### As Admin
1. Login as `admin@attendify.local`
2. Go to **QR Display** page
3. View current QR code (check-in before 16:00, check-out after 16:00)
4. Monitor QR auto-refresh every 30 seconds

### As HR
1. Login as `hr@attendify.local`
2. Go to **Attendance Management**
3. Filter by date/department
4. Edit attendance records
5. View **Permit Letters** section
6. Approve/reject pending letters
7. Export attendance report (CSV)
8. View **Attendance Recap** for statistics

### As Employee
1. Login as `john.doe@attendify.local`
2. View **Dashboard** with today's attendance status
3. Go to **Scan QR** page
4. Scan check-in QR (before 09:30 = hadir, after = telat)
5. Come back after 16:00 to scan check-out QR
6. View **History** page with 30 days data
7. Upload **Permit Letter** for any alpha/absent day

---

## ⚙️ System Features Demonstrated

### Time-Based QR System
- **Check-in QR**: Available 00:00 - 15:59
- **Check-out QR**: Available 16:00 - 23:59
- **30-second validity** per QR code
- Auto-refresh in real-time

### Business Logic
- **Late threshold**: 09:30 WIB
- **Duplicate prevention**: Can't scan same type twice
- **Check-out validation**: Must check-in first
- **Auto-absent marking**: Scheduled daily at 23:59

### Roles & Permissions
- **Admin**: Full system access
- **HR**: Attendance management + own attendance
- **Employee**: Personal attendance only

---

## 🔄 Reset Database

Untuk reset ulang ke data demo:

```bash
php artisan migrate:fresh --seed
```

⚠️ **Warning**: Perintah ini akan menghapus semua data dan membuat ulang dengan data demo.

---

## 📞 Support

Jika ada kendala atau pertanyaan, silakan hubungi system administrator.

**Last Updated**: December 31, 2025
