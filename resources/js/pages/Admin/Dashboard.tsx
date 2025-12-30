import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Users, Building2, CheckCircle, QrCode, Settings } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Stats {
    total_users: number;
    total_departments: number;
    today_attendance: number;
    active_qr_sessions: number;
}

interface Attendance {
    id: number;
    check_in: string;
    user: {
        name: string;
        employee_id: string;
        department: {
            name: string;
        } | null;
    };
}

interface QrSession {
    id: number;
    type: string;
    valid_from: string;
    valid_until: string;
    creator: {
        name: string;
    };
}

interface Props {
    stats: Stats;
    recentAttendances: Attendance[];
    activeQrSessions: QrSession[];
}

export default function AdminDashboard({ stats, recentAttendances, activeQrSessions }: Props) {
    return (
        <AppLayout>
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Settings className="h-8 w-8" />
                            Admin Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">System overview and management</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_users}</div>
                                <p className="text-xs text-muted-foreground">Active employees</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Departments</CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_departments}</div>
                                <p className="text-xs text-muted-foreground">Active departments</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.today_attendance}</div>
                                <p className="text-xs text-muted-foreground">Recorded today</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Active QR Sessions</CardTitle>
                                <QrCode className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.active_qr_sessions}</div>
                                <p className="text-xs text-muted-foreground">Currently active</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Link href={route('admin.users.index') as string}>
                            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Users
                                    </CardTitle>
                                    <CardDescription>Manage employees</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>

                        <Link href={route('admin.departments.index') as string}>
                            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Departments
                                    </CardTitle>
                                    <CardDescription>Manage departments</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>

                        <Link href={route('admin.qr-sessions.index') as string}>
                            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <QrCode className="h-5 w-5" />
                                        QR Sessions
                                    </CardTitle>
                                    <CardDescription>Generate QR codes</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>

                        <Link href={route('hr.dashboard') as string}>
                            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Attendance
                                    </CardTitle>
                                    <CardDescription>View attendance</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    </div>

                    {/* Recent Attendances */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Attendances</CardTitle>
                            <CardDescription>Latest 10 attendance records today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentAttendances.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Department</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentAttendances.map((attendance) => (
                                            <TableRow key={attendance.id}>
                                                <TableCell>
                                                    {new Date(attendance.check_in).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{attendance.user.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {attendance.user.employee_id}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{attendance.user.department?.name || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No attendance records today</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Active QR Sessions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Active QR Sessions</CardTitle>
                            <CardDescription>Currently active QR codes for attendance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activeQrSessions.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Valid From</TableHead>
                                            <TableHead>Valid Until</TableHead>
                                            <TableHead>Created By</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activeQrSessions.map((session) => (
                                            <TableRow key={session.id}>
                                                <TableCell>
                                                    <Badge>{session.type}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(session.valid_from).toLocaleString('id-ID')}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(session.valid_until).toLocaleString('id-ID')}
                                                </TableCell>
                                                <TableCell>{session.creator.name}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No active QR sessions</p>
                                    <Button asChild className="mt-4">
                                        <Link href={route('admin.qr-sessions.index') as string}>Generate QR Code</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
