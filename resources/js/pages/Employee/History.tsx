import { Head, router } from '@inertiajs/react';
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
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

interface Attendance {
    id: number;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: 'hadir' | 'telat' | 'izin' | 'sakit' | 'alpha';
    notes: string | null;
}

interface Stats {
    total_days: number;
    hadir: number;
    telat: number;
    izin: number;
    sakit: number;
    alpha: number;
}

interface Props {
    attendances: Attendance[];
    stats: Stats;
    currentMonth: string;
}

export default function History({ attendances, stats, currentMonth }: Props) {
    const [month, setMonth] = useState(currentMonth);

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

    const changeMonth = (offset: number) => {
        const date = new Date(month + '-01');
        date.setMonth(date.getMonth() + offset);
        const newMonth = date.toISOString().slice(0, 7);
        setMonth(newMonth);
        router.get(route('employee.history') as string, { month: newMonth }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Attendance History" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Calendar className="h-8 w-8" />
                            Attendance History
                        </h1>
                        <p className="text-muted-foreground mt-1">Your attendance records and statistics</p>
                    </div>

                    {/* Month Selector */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <CardTitle>
                                    {new Date(month + '-01').toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                    })}
                                </CardTitle>
                                <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total Days</CardDescription>
                                <CardTitle className="text-2xl">{stats.total_days}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Hadir</CardDescription>
                                <CardTitle className="text-2xl text-green-600">{stats.hadir}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Telat</CardDescription>
                                <CardTitle className="text-2xl text-yellow-600">{stats.telat}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Izin</CardDescription>
                                <CardTitle className="text-2xl text-blue-600">{stats.izin}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Sakit</CardDescription>
                                <CardTitle className="text-2xl text-orange-600">{stats.sakit}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Alpha</CardDescription>
                                <CardTitle className="text-2xl text-red-600">{stats.alpha}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Attendance Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Records</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {attendances.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Check In</TableHead>
                                            <TableHead>Check Out</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Notes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attendances.map((attendance) => (
                                            <TableRow key={attendance.id}>
                                                <TableCell>
                                                    {new Date(attendance.date).toLocaleDateString('id-ID', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    {attendance.check_in
                                                        ? new Date(attendance.check_in).toLocaleTimeString('id-ID', {
                                                              hour: '2-digit',
                                                              minute: '2-digit',
                                                          })
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {attendance.check_out
                                                        ? new Date(attendance.check_out).toLocaleTimeString('id-ID', {
                                                              hour: '2-digit',
                                                              minute: '2-digit',
                                                          })
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusColors[attendance.status]}>
                                                        {statusLabels[attendance.status]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {attendance.notes || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">No attendance records for this month</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
