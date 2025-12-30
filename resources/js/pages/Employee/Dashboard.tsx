import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, QrCode, Calendar, CheckCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Attendance {
    id: number;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: 'hadir' | 'telat' | 'izin' | 'sakit' | 'alpha';
}

interface User {
    id: number;
    name: string;
    email: string;
    employee_id: string;
    role: {
        name: string;
        display_name: string;
    };
    department: {
        name: string;
    } | null;
}

interface Props {
    todayAttendance: Attendance | null;
    user: User;
}

export default function EmployeeDashboard({ todayAttendance, user }: Props) {
    const statusColors = {
        hadir: 'bg-green-500',
        telat: 'bg-yellow-500',
        izin: 'bg-blue-500',
        sakit: 'bg-orange-500',
        alpha: 'bg-red-500',
    };

    const statusLabels = {
        hadir: 'Hadir',
        telat: 'Telat',
        izin: 'Izin',
        sakit: 'Sakit',
        alpha: 'Alpha',
    };

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Welcome Section */}
                    <div>
                        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
                        <p className="text-muted-foreground mt-1">
                            {user.employee_id} • {user.department?.name || 'No Department'}
                        </p>
                    </div>

                    {/* Today's Attendance Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Today's Attendance
                            </CardTitle>
                            <CardDescription>
                                {new Date().toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {todayAttendance ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span className="text-lg font-semibold">Attendance Recorded</span>
                                        <Badge className={statusColors[todayAttendance.status]}>
                                            {statusLabels[todayAttendance.status]}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Check In</p>
                                            <p className="text-xl font-bold">
                                                {todayAttendance.check_in
                                                    ? new Date(todayAttendance.check_in).toLocaleTimeString('id-ID', {
                                                          hour: '2-digit',
                                                          minute: '2-digit',
                                                      })
                                                    : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Check Out</p>
                                            <p className="text-xl font-bold">
                                                {todayAttendance.check_out
                                                    ? new Date(todayAttendance.check_out).toLocaleTimeString('id-ID', {
                                                          hour: '2-digit',
                                                          minute: '2-digit',
                                                      })
                                                    : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-4">No attendance recorded today</p>
                                    <Button asChild>
                                        <Link href={route('employee.scan') as string}>
                                            <QrCode className="mr-2 h-4 w-4" />
                                            Scan QR Code
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href={route('employee.scan') as string}>
                            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <QrCode className="h-5 w-5" />
                                        Scan Attendance
                                    </CardTitle>
                                    <CardDescription>Scan QR code to mark your attendance</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>

                        <Link href={route('employee.history') as string}>
                            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Attendance History
                                    </CardTitle>
                                    <CardDescription>View your attendance records</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
