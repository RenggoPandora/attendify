import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface User {
    id: number;
    name: string;
    employee_id: string;
    department: {
        name: string;
    } | null;
}

interface Attendance {
    id: number;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    notes: string | null;
    user: User;
}

interface Props {
    attendance: Attendance;
}

export default function EditAttendance({ attendance }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        status: attendance.status,
        notes: attendance.notes || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('hr.attendance.update', attendance.id));
    };

    const statusOptions = [
        { value: 'hadir', label: 'Hadir', color: 'text-green-600' },
        { value: 'telat', label: 'Telat', color: 'text-yellow-600' },
        { value: 'izin', label: 'Izin', color: 'text-blue-600' },
        { value: 'sakit', label: 'Sakit', color: 'text-orange-600' },
        { value: 'alpha', label: 'Alpha', color: 'text-red-600' },
    ];

    return (
        <AppLayout>
            <Head title="Edit Attendance" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={route('hr.attendance.index')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Edit Attendance</h1>
                            <p className="text-muted-foreground mt-1">
                                Modify attendance status and add notes
                            </p>
                        </div>
                    </div>

                    {/* Employee Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Employee Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Employee ID</p>
                                <p className="font-mono font-semibold">{attendance.user.employee_id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-semibold">{attendance.user.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Department</p>
                                <p className="font-semibold">{attendance.user.department?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date</p>
                                <p className="font-semibold">
                                    {new Date(attendance.date).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attendance Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Details</CardTitle>
                            <CardDescription>Current attendance information</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Check In</p>
                                <p className="font-semibold">
                                    {attendance.check_in
                                        ? new Date(attendance.check_in).toLocaleTimeString('id-ID', {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                          })
                                        : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Check Out</p>
                                <p className="font-semibold">
                                    {attendance.check_out
                                        ? new Date(attendance.check_out).toLocaleTimeString('id-ID', {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                          })
                                        : '-'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Edit Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Attendance</CardTitle>
                            <CardDescription>Change status or add notes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <span className={option.color}>{option.label}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-500">{errors.status}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Add notes about this attendance record..."
                                        rows={4}
                                    />
                                    {errors.notes && (
                                        <p className="text-sm text-red-500">{errors.notes}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Max 500 characters
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
