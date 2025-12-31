import { Head, router, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Download, ChevronLeft, ChevronRight, FileSpreadsheet, Eye, FileText } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    employee_id: string;
    department: {
        name: string;
    } | null;
    permit_letters: PermitLetter[];
}

interface PermitLetter {
    id: number;
    permit_date: string;
    reason: string;
    description: string | null;
    file_name: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    rejection_reason: string | null;
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
    const [departmentId, setDepartmentId] = useState(filters.department_id?.toString() || 'all');
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

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
                department_id: (newDeptId || departmentId) === 'all' ? undefined : (newDeptId || departmentId),
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
                                        <SelectItem value="all">All Departments</SelectItem>
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
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map(({ user, stats }) => (
                                            <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedUser({ user, stats })}>
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
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedUser({ user, stats });
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Detail
                                                    </Button>
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

                    {/* Employee Detail Modal */}
                    <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Employee Detail</DialogTitle>
                                <DialogDescription>
                                    Attendance statistics and permit letters
                                </DialogDescription>
                            </DialogHeader>
                            
                            {selectedUser && (
                                <div className="space-y-6">
                                    {/* Employee Info */}
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Name</p>
                                            <p className="font-semibold">{selectedUser.user.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Employee ID</p>
                                            <p className="font-mono font-semibold">{selectedUser.user.employee_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Department</p>
                                            <p className="font-semibold">{selectedUser.user.department?.name || '-'}</p>
                                        </div>
                                    </div>

                                    {/* Attendance Stats */}
                                    <div>
                                        <h3 className="font-semibold mb-3">Attendance Statistics</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            <Card>
                                                <CardContent className="pt-4">
                                                    <p className="text-xs text-muted-foreground">Total Days</p>
                                                    <p className="text-2xl font-bold">{selectedUser.stats.total_days}</p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="pt-4">
                                                    <p className="text-xs text-muted-foreground">Hadir</p>
                                                    <p className="text-2xl font-bold text-green-600">{selectedUser.stats.hadir}</p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="pt-4">
                                                    <p className="text-xs text-muted-foreground">Telat</p>
                                                    <p className="text-2xl font-bold text-yellow-600">{selectedUser.stats.telat}</p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="pt-4">
                                                    <p className="text-xs text-muted-foreground">Izin</p>
                                                    <p className="text-2xl font-bold text-blue-600">{selectedUser.stats.izin}</p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="pt-4">
                                                    <p className="text-xs text-muted-foreground">Sakit</p>
                                                    <p className="text-2xl font-bold text-orange-600">{selectedUser.stats.sakit}</p>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="pt-4">
                                                    <p className="text-xs text-muted-foreground">Alpha</p>
                                                    <p className="text-2xl font-bold text-red-600">{selectedUser.stats.alpha}</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>

                                    {/* Permit Letters */}
                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Permit Letters
                                        </h3>
                                        {selectedUser.user.permit_letters && selectedUser.user.permit_letters.length > 0 ? (
                                            <div className="space-y-2">
                                                {selectedUser.user.permit_letters.map((letter) => (
                                                    <div key={letter.id} className="p-4 border rounded-lg hover:bg-muted/50">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className="font-semibold">
                                                                        {new Date(letter.permit_date).toLocaleDateString('id-ID', {
                                                                            day: 'numeric',
                                                                            month: 'long',
                                                                            year: 'numeric',
                                                                        })}
                                                                    </p>
                                                                    <Badge className={
                                                                        letter.status === 'pending' ? 'bg-yellow-500' :
                                                                        letter.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                                                                    }>
                                                                        {letter.status === 'pending' ? 'Pending' :
                                                                         letter.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm capitalize text-muted-foreground">
                                                                    {letter.reason}
                                                                </p>
                                                                {letter.description && (
                                                                    <p className="text-sm text-muted-foreground mt-1">
                                                                        {letter.description}
                                                                    </p>
                                                                )}
                                                                {letter.rejection_reason && (
                                                                    <p className="text-sm text-red-600 mt-1">
                                                                        Alasan ditolak: {letter.rejection_reason}
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-muted-foreground mt-2">
                                                                    File: {letter.file_name}
                                                                </p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    asChild
                                                                >
                                                                    <Link href={route('hr.permit-letters.download', letter.id)}>
                                                                        <Download className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                                {letter.status === 'pending' && (
                                                                    <>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="text-green-600"
                                                                            onClick={() => {
                                                                                if (confirm('Setujui surat izin ini?')) {
                                                                                    router.post(
                                                                                        route('hr.permit-letters.approve', letter.id),
                                                                                        {},
                                                                                        { preserveState: true }
                                                                                    );
                                                                                }
                                                                            }}
                                                                        >
                                                                            Approve
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="text-red-600"
                                                                            onClick={() => {
                                                                                const reason = prompt('Alasan penolakan:');
                                                                                if (reason) {
                                                                                    router.post(
                                                                                        route('hr.permit-letters.reject', letter.id),
                                                                                        { rejection_reason: reason },
                                                                                        { preserveState: true }
                                                                                    );
                                                                                }
                                                                            }}
                                                                        >
                                                                            Reject
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground border rounded-lg">
                                                <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                                <p>Tidak ada surat izin</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
