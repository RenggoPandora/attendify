import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Download, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    employee_id: string;
    department: {
        name: string;
    } | null;
}

interface Stats {
    total_days: number;
    hadir: number;
    telat: number;
    izin: number;
    sakit: number;
    alpha: number;
}

interface UserData {
    user: User;
    stats: Stats;
}

interface Department {
    id: number;
    name: string;
}

interface Props {
    users: UserData[];
    departments: Department[];
    currentMonth: string;
    filters: {
        department_id: number | null;
    };
}

export default function Recap({ users, departments, currentMonth, filters }: Props) {
    const [month, setMonth] = useState(currentMonth);
    const [departmentId, setDepartmentId] = useState(filters.department_id?.toString() || '');

    const changeMonth = (offset: number) => {
        const date = new Date(month + '-01');
        date.setMonth(date.getMonth() + offset);
        const newMonth = date.toISOString().slice(0, 7);
        setMonth(newMonth);
        applyFilters(newMonth, departmentId);
    };

    const applyFilters = (newMonth?: string, newDeptId?: string) => {
        router.get(
            route('hr.recap') as string,
            {
                month: newMonth || month,
                department_id: newDeptId || departmentId || undefined,
            },
            { preserveState: true }
        );
    };

    const exportCSV = () => {
        window.location.href = route('hr.export.csv', {
            month,
            department_id: departmentId || undefined,
        }) as string;
    };

    return (
        <AppLayout>
            <Head title="Monthly Recap" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <FileSpreadsheet className="h-8 w-8" />
                                Monthly Recap
                            </h1>
                            <p className="text-muted-foreground mt-1">Payroll export and monthly statistics</p>
                        </div>
                        <Button onClick={exportCSV}>
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>

                    {/* Month & Department Selector */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-4">
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
                            <div className="flex gap-4 mt-4">
                                <Select
                                    value={departmentId}
                                    onValueChange={(val) => {
                                        setDepartmentId(val);
                                        applyFilters(month, val);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Departments</SelectItem>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Recap Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Summary</CardTitle>
                            <CardDescription>Monthly attendance statistics per employee</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {users.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee ID</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead className="text-center">Total</TableHead>
                                            <TableHead className="text-center">Hadir</TableHead>
                                            <TableHead className="text-center">Telat</TableHead>
                                            <TableHead className="text-center">Izin</TableHead>
                                            <TableHead className="text-center">Sakit</TableHead>
                                            <TableHead className="text-center">Alpha</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map(({ user, stats }) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-mono">{user.employee_id}</TableCell>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.department?.name || '-'}</TableCell>
                                                <TableCell className="text-center">{stats.total_days}</TableCell>
                                                <TableCell className="text-center text-green-600 font-semibold">
                                                    {stats.hadir}
                                                </TableCell>
                                                <TableCell className="text-center text-yellow-600 font-semibold">
                                                    {stats.telat}
                                                </TableCell>
                                                <TableCell className="text-center text-blue-600 font-semibold">
                                                    {stats.izin}
                                                </TableCell>
                                                <TableCell className="text-center text-orange-600 font-semibold">
                                                    {stats.sakit}
                                                </TableCell>
                                                <TableCell className="text-center text-red-600 font-semibold">
                                                    {stats.alpha}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">No attendance data found</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
