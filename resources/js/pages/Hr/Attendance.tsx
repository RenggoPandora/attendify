import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ClipboardList, Edit, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

interface Attendance {
    id: number;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    notes: string | null;
    user: {
        name: string;
        employee_id: string;
        department: {
            name: string;
        } | null;
    };
}

interface Department {
    id: number;
    name: string;
}

interface Props {
    attendances: Attendance[];
    departments: Department[];
    stats: {
        total: number;
        hadir: number;
        telat: number;
        izin: number;
        sakit: number;
        alpha: number;
    };
    filters: {
        date: string;
        department_id: number | null;
    };
}

export default function HrAttendance({ attendances, departments, stats, filters }: Props) {
    const [date, setDate] = useState(filters.date);
    const [departmentId, setDepartmentId] = useState(filters.department_id?.toString() || 'all');
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    const applyFilters = () => {
        router.get(
            route('hr.attendance.index') as string,
            {
                date,
                department_id: departmentId === 'all' ? undefined : departmentId,
            },
            { preserveState: true }
        );
    };

    const statusColors: Record<string, string> = {
        hadir: 'bg-green-500',
        telat: 'bg-yellow-500',
        izin: 'bg-blue-500',
        sakit: 'bg-orange-500',
        alpha: 'bg-red-500',
    };

    const statusLabels: Record<string, string> = {
        hadir: 'Hadir',
        telat: 'Telat',
        izin: 'Izin',
        sakit: 'Sakit',
        alpha: 'Alpha',
    };

    return (
        <AppLayout>
            <Head title="HR Attendance Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <ClipboardList className="h-8 w-8" />
                                Attendance Management
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                View and edit employee attendance records
                            </p>
                        </div>
                        <Button asChild>
                            <Link href={route('hr.recap') as string}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Monthly Recap
                            </Link>
                        </Button>
                    </div>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                {flash.success}
                            </AlertDescription>
                        </Alert>
                    )}
                    {flash?.error && (
                        <Alert className="bg-red-50 border-red-200">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                {flash.error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <Select value={departmentId} onValueChange={setDepartmentId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={applyFilters}>Apply</Button>
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription>Total</CardDescription>
                                <CardTitle className="text-2xl">{stats.total}</CardTitle>
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
                            <CardDescription>
                                Click edit to modify attendance status or add notes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {attendances.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Check In</TableHead>
                                            <TableHead>Check Out</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Notes</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attendances.map((attendance) => (
                                            <TableRow key={attendance.id}>
                                                <TableCell className="font-mono">
                                                    {attendance.user.employee_id}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {attendance.user.name}
                                                </TableCell>
                                                <TableCell>
                                                    {attendance.user.department?.name || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {attendance.check_in
                                                        ? new Date(attendance.check_in).toLocaleTimeString(
                                                              'id-ID',
                                                              {
                                                                  hour: '2-digit',
                                                                  minute: '2-digit',
                                                              }
                                                          )
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {attendance.check_out
                                                        ? new Date(attendance.check_out).toLocaleTimeString(
                                                              'id-ID',
                                                              {
                                                                  hour: '2-digit',
                                                                  minute: '2-digit',
                                                              }
                                                          )
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusColors[attendance.status]}>
                                                        {statusLabels[attendance.status]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {attendance.notes || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link
                                                            href={route(
                                                                'hr.attendance.edit',
                                                                attendance.id
                                                            )}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>No attendance records found for this date</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
