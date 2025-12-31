# 🚀 Quick Start Guide - Attendify Demo

## 📋 Prerequisites
- PHP 8.3+
- MySQL 8.0+
- Composer
- Node.js 20+
- NPM/PNPM

## 🔧 Installation

### 1. Clone & Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install Node dependencies
npm install
# or
pnpm install
```

### 2. Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 3. Database Configuration
Edit `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=attendify
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 4. Run Migrations & Seeders
```bash
php artisan migrate:fresh --seed
```

### 5. Build Frontend Assets
```bash
# Development
npm run dev

# Production
npm run build
```

### 6. Start Development Server
```bash
php artisan serve
```

Visit: `http://127.0.0.1:8000`

---

## 🎯 Quick Demo Test

### Test Check-in Flow (Before 16:00)
1. **Admin Panel** - Open `http://127.0.0.1:8000/admin/qr-display`
   - Login: `admin@attendify.local` / `password`
   - View check-in QR code

2. **Employee Scan** - Open new incognito window
   - Go to: `http://127.0.0.1:8000`
   - Login: `john.doe@attendify.local` / `password`
   - Navigate to "Scan QR" page
   - Scan the QR from admin panel
   - Check status: **Hadir** (if before/at 10:00) or **Telat** (if after 10:00)

### Test Check-out Flow (After 16:00)
1. **Change System Time** to after 16:00 or wait until 16:00
2. **Admin Panel** - Refresh QR display
   - QR type should change to "Check-out"
3. **Employee Scan** - Scan the new check-out QR
   - Should successfully record check-out time

### Test HR Management
1. Login as HR: `hr@attendify.local` / `password`
2. Go to **Attendance** page
3. View 286 attendance records
4. Filter by:
   - Date (default: today)
   - Department (IT, HR, Finance, Marketing, Operations)
5. Click **Edit** on any record
6. Change status or add notes
7. View **Permit Letters** for employees

### Test Reports
1. Still as HR, go to **Recap** page
2. View statistics by employee:
   - Total attendance days
   - Hadir, Telat, Izin, Sakit, Alpha counts
3. Filter by department or month
4. Export to CSV

---

## 📊 Demo Data Overview

| Data Type | Count | Description |
|-----------|-------|-------------|
| Users | 16 | 1 Admin, 2 HR, 13 Employees |
| Departments | 5 | IT, HR, Finance, Marketing, Operations |
| Attendance | ~286 | Last 30 days, weekdays only |
| Permit Letters | ~2-10 | Sample sick/leave permits |

---

## 🕒 Time-Based Features

### QR Code Types
| Time Range | QR Type | Status Logic |
|------------|---------|--------------|
| 00:00 - 10:00 | Check-in | Status: **Hadir** |
| 10:01 - 15:59 | Check-in | Status: **Telat** |
| 16:00 - 23:59 | Check-out | Keep existing status |

### Auto-Refresh
- QR codes auto-refresh every **30 seconds**
- Frontend polls for new QR automatically
- No manual refresh needed

---

## 🔐 Test Accounts Summary

```
Admin:    admin@attendify.local / password
HR:       hr@attendify.local / password
Employee: john.doe@attendify.local / password

Password for ALL accounts: password
```

Full credentials: See [DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md)

---

## 🧪 Testing Scenarios

### Scenario 1: On-Time Attendance
1. Login as employee before/at 10:00
2. Scan check-in QR → Status: **Hadir** ✅
3. After 16:00, scan check-out QR → Check-out recorded

### Scenario 2: Late Attendance
1. Login as employee after 10:00
2. Scan check-in QR → Status: **Telat** ⏰
3. After 16:00, scan check-out QR → Status remains **Telat**

### Scenario 3: Duplicate Prevention
1. Scan check-in QR successfully
2. Try to scan check-in QR again → Error: "Sudah check-in hari ini" ❌

### Scenario 4: Check-out Without Check-in
1. After 16:00, try to scan check-out QR without check-in
2. Error: "Harus check-in terlebih dahulu" ❌

### Scenario 5: Permit Letter Upload
1. Login as employee
2. Go to History page
3. Find an alpha/absent day
4. Upload permit letter (PDF/image)
5. Wait for HR approval

### Scenario 6: HR Approval
1. Login as HR
2. Go to Attendance page
3. See permit letter indicator
4. Click to view/approve letter
5. Change status from alpha → sakit/izin

---

## 🛠️ Development Commands

```bash
# Database
php artisan migrate:fresh --seed   # Reset with demo data
php artisan migrate                 # Run new migrations only

# Cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Queue (for background jobs)
php artisan queue:work

# Schedule (for auto-absent marking)
php artisan schedule:work           # Local testing
php artisan attendance:mark-absent  # Manual run

# Frontend
npm run dev                         # Development with HMR
npm run build                       # Production build
npm run lint                        # ESLint check
```

---

## 📁 Project Structure

```
attendify/
├── app/
│   ├── Console/Commands/
│   │   └── MarkAbsentEmployees.php
│   ├── Http/Controllers/
│   │   ├── Admin/
│   │   ├── Employee/
│   │   └── Hr/
│   ├── Models/
│   │   ├── Attendance.php
│   │   ├── Department.php
│   │   ├── PermitLetter.php
│   │   ├── QrSession.php
│   │   ├── Role.php
│   │   └── User.php
│   └── Services/
│       ├── AttendanceService.php
│       └── QrService.php
├── database/
│   ├── migrations/
│   └── seeders/
│       └── DatabaseSeeder.php
├── resources/
│   └── js/
│       ├── components/
│       ├── layouts/
│       └── pages/
│           ├── Admin/
│           ├── Employee/
│           └── Hr/
└── routes/
    └── web.php
```

---

## 🐛 Troubleshooting

### Issue: QR not refreshing
**Solution:** Check if `npm run dev` is running. Frontend needs Vite dev server.

### Issue: 404 after login
**Solution:** Redirect issue fixed. Clear browser cache and try again.

### Issue: Duplicate column error
**Solution:** Migration already run. Use `migrate:fresh --seed` to reset.

### Issue: "Call to protected method"
**Solution:** Fixed. Methods in QrService are now public.

### Issue: Permit letters not showing
**Solution:** Relationship added to Attendance model. Re-seed database.

---

## 📚 Documentation

- [ATTENDANCE_LOGIC.md](ATTENDANCE_LOGIC.md) - Detailed business logic
- [DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md) - All login credentials
- [README.md](README.md) - Project overview

---

## ✅ Checklist for Demo

- [ ] Database migrated and seeded
- [ ] Frontend assets built
- [ ] Dev server running (`php artisan serve`)
- [ ] Frontend dev server running (`npm run dev`)
- [ ] Admin can access QR display
- [ ] Employee can scan QR (check-in)
- [ ] Employee can scan QR (check-out after 16:00)
- [ ] HR can view attendance records
- [ ] HR can approve permit letters
- [ ] Reports/recap accessible

---

**Ready to Demo! 🎉**

For issues or questions, check [ATTENDANCE_LOGIC.md](ATTENDANCE_LOGIC.md) for detailed implementation details.
