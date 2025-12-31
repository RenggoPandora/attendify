# Attendify

A comprehensive attendance management system with QR code-based check-in/check-out functionality, built for modern workplaces.

## Overview

Attendify is an enterprise-grade attendance tracking system that utilizes dynamic QR codes for employee attendance recording. The system provides role-based access control for Administrators, HR Managers, and Employees, with real-time attendance monitoring, permit letter management, and comprehensive reporting capabilities.

### Key Features

- **QR Code-Based Attendance**: Time-sensitive QR codes with 30-second validity
- **Dual Check System**: Separate check-in (morning) and check-out (evening) QR codes
- **Role-Based Access Control**: Admin, HR, and Employee roles with specific permissions
- **Real-Time Monitoring**: Live attendance tracking and statistics
- **Permit Letter Management**: Submit, approve, and track absence permits
- **Comprehensive Reports**: Monthly recaps, department-wise analytics, and CSV exports
- **Auto-Absence Marking**: Automated daily task to mark absent employees
- **Audit Trail**: Complete logging of all attendance modifications

## Technology Stack

### Backend
- **PHP**: 8.3+
- **Laravel**: 12.x
- **MySQL**: 8.0+
- **Laravel Fortify**: Authentication and two-factor authentication
- **Spatie Laravel Permission**: Role and permission management
- **Carbon**: Date and time manipulation

### Frontend
- **React**: 18.x with TypeScript
- **Inertia.js**: Server-driven single-page application
- **Vite**: Frontend build tool
- **shadcn/ui**: Component library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Additional Tools
- **Composer**: PHP dependency management
- **NPM/PNPM**: Node package management
- **Laravel Artisan**: Command-line interface
- **Laravel Scheduler**: Cron job management

## System Requirements

- PHP 8.3 or higher
- MySQL 8.0 or higher
- Composer 2.x
- Node.js 20.x or higher
- NPM or PNPM

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/RenggoPandora/attendify.git
cd attendify
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Install Node Dependencies

```bash
npm install
# or
pnpm install
```

### 4. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:

```env
APP_NAME=Attendify
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=attendify
DB_USERNAME=root
DB_PASSWORD=your_password

CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
```

### 5. Generate Application Key

```bash
php artisan key:generate
```

### 6. Create Database

Create a new MySQL database named `attendify`:

```sql
CREATE DATABASE attendify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 7. Run Migrations and Seeders

```bash
php artisan migrate:fresh --seed
```

This command will:
- Create all database tables
- Seed 5 departments
- Create 16 users (1 Admin, 2 HR, 13 Employees)
- Generate 286 attendance records (last 30 days)
- Create sample permit letters

### 8. Build Frontend Assets

For development:
```bash
npm run dev
```

For production:
```bash
npm run build
```

### 9. Start Development Server

```bash
php artisan serve
```

Visit: `http://127.0.0.1:8000`

## Demo Credentials

All accounts use the password: `password`

### Administrator
```
Email: admin@attendify.local
Role: Full system access
```

### HR Managers
```
Email: hr@attendify.local
Role: Attendance management + Employee attendance

Email: hr.manager@attendify.local
Role: Attendance management + Employee attendance
```

### Employees (Sample)
```
Email: john.doe@attendify.local
Department: Information Technology

Email: robert.lee@attendify.local
Department: Finance & Accounting

Email: sophia.martinez@attendify.local
Department: Marketing & Sales
```

For complete credentials list, see [DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md)

## Business Logic

### Check-in Rules
- **Available Time**: 00:00 - 15:59
- **Status Determination**:
  - Check-in ≤ 10:00 → Status: `hadir` (Present)
  - Check-in > 10:00 → Status: `telat` (Late)
- **Validation**: Cannot check-in after 16:00

### Check-out Rules
- **Available Time**: 16:00 - 23:59
- **Validation**: 
  - Must check-in before check-out
  - Check-out time must be after check-in time
  - Cannot check-out before 16:00

### QR Code System
- **Validity Period**: 30 seconds per QR code
- **Auto-Refresh**: QR codes regenerate automatically
- **Type-Based**: Separate QR codes for check-in and check-out
- **Cache Strategy**: Independent cache keys for each type

### Auto-Absence Marking
- **Schedule**: Daily at 23:59
- **Logic**: Employees without attendance record are marked as `alpha` (Absent)
- **Command**: `php artisan attendance:mark-absent`

For detailed business logic, see [ATTENDANCE_LOGIC.md](ATTENDANCE_LOGIC.md)

## Usage Guide

### For Administrators

1. **QR Display Management**
   - Navigate to `/admin/qr-display`
   - View current active QR code
   - Monitor QR type (check-in/check-out)
   - QR auto-refreshes every 30 seconds

2. **System Management**
   - Manage QR sessions
   - View audit logs
   - Access all system features

### For HR Managers

1. **Attendance Management**
   - View daily attendance records
   - Filter by date and department
   - Edit attendance records
   - Add notes to attendance

2. **Permit Letter Approval**
   - Review submitted permits
   - Approve or reject requests
   - Change absence status (alpha → sick/leave)

3. **Reports and Analytics**
   - Generate monthly recaps
   - View statistics by employee
   - Export data to CSV
   - Department-wise analytics

### For Employees

1. **Daily Attendance**
   - Navigate to Scan QR page
   - Scan check-in QR (morning)
   - Scan check-out QR (evening)
   - View confirmation status

2. **Attendance History**
   - View 30-day attendance history
   - Check attendance statistics
   - Filter by month

3. **Permit Letters**
   - Upload absence permits
   - Track approval status
   - Download submitted letters

## Development

### Run Development Server

```bash
# Backend
php artisan serve

# Frontend (separate terminal)
npm run dev
```

### Run Tests

```bash
php artisan test
```

### Code Quality

```bash
# PHP CodeSniffer
composer run-script phpcs

# ESLint
npm run lint
```

### Database Management

```bash
# Reset database with fresh data
php artisan migrate:fresh --seed

# Run specific seeder
php artisan db:seed --class=DatabaseSeeder

# Create new migration
php artisan make:migration create_table_name
```

### Scheduled Tasks

For production, add to crontab:

```bash
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

For local testing:

```bash
php artisan schedule:work
```

## Project Structure

```
attendify/
├── app/
│   ├── Console/Commands/      # Artisan commands
│   ├── Http/
│   │   ├── Controllers/       # Route controllers
│   │   │   ├── Admin/        # Admin controllers
│   │   │   ├── Employee/     # Employee controllers
│   │   │   └── Hr/           # HR controllers
│   │   └── Middleware/        # HTTP middleware
│   ├── Models/                # Eloquent models
│   └── Services/              # Business logic services
├── database/
│   ├── migrations/            # Database migrations
│   └── seeders/               # Database seeders
├── resources/
│   ├── css/                   # Stylesheets
│   └── js/
│       ├── components/        # React components
│       ├── layouts/           # Page layouts
│       └── pages/             # Inertia pages
├── routes/
│   ├── console.php            # Console routes & schedules
│   └── web.php                # Web routes
└── public/                    # Public assets
```

## API Endpoints

### Authentication
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /register` - User registration

### Employee Routes
- `GET /employee/dashboard` - Employee dashboard
- `GET /employee/scan` - QR scan page
- `POST /employee/attendance/submit` - Submit attendance
- `GET /employee/history` - Attendance history
- `GET /employee/permit-letters` - Permit letters list

### HR Routes
- `GET /hr/dashboard` - HR dashboard
- `GET /hr/attendance` - Attendance management
- `PUT /hr/attendance/{id}` - Update attendance
- `GET /hr/recap` - Monthly recap
- `GET /hr/export/csv` - Export CSV

### Admin Routes
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/qr-display` - QR display
- `GET /admin/qr-sessions` - QR session management

## Troubleshooting

### QR Code Not Refreshing
**Issue**: QR code does not auto-refresh

**Solution**: Ensure Vite dev server is running (`npm run dev`)

### Database Connection Error
**Issue**: SQLSTATE[HY000] [1045] Access denied

**Solution**: Verify database credentials in `.env` file

### Migration Failed
**Issue**: Duplicate column or table exists

**Solution**: Use `migrate:fresh` to reset database
```bash
php artisan migrate:fresh --seed
```

### 404 After Login
**Issue**: Redirect to non-existent route

**Solution**: Clear cache and rebuild routes
```bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear
```

### Permission Denied
**Issue**: User cannot access certain pages

**Solution**: Verify role assignment in database
```sql
SELECT u.email, r.name 
FROM users u 
JOIN role_user ru ON u.id = ru.user_id 
JOIN roles r ON ru.role_id = r.id;
```

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Documentation

- [Attendance Logic](ATTENDANCE_LOGIC.md) - Detailed business logic and implementation
- [Demo Credentials](DEMO_CREDENTIALS.md) - Complete list of demo accounts
- [Quick Start Guide](QUICK_START.md) - Step-by-step setup and testing guide
- [Validation Rules](VALIDATION_RULES.md) - Backend validation rules and error handling

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

## Acknowledgments

- Laravel Framework
- Inertia.js
- React
- shadcn/ui
- Tailwind CSS

---

**Version**: 1.0.0  
**Last Updated**: December 31, 2025  
**Maintained by**: Renggo Pandora
