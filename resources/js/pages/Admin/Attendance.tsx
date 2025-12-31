import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { BarChart3, Users, Clock, XCircle, TrendingUp, Calendar } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

interface Stats {
    total_present: number;
    total_late: number;
    total_absent: number;
    attendance_rate: number;
}

interface DailyStats {
    date: string;
    day: string;
    present: number;
    late: number;
}

interface DepartmentStats {
    id: number;
    name: string;
    total_employees: number;
    present: number;
    late: number;
    absent: number;
    attendance_rate: number;
}

interface Props {
    stats: Stats;
    dailyStats: DailyStats[];
    departmentStats: DepartmentStats[];
    filters: {
        start_date: string;
        end_date: string;
    };
}

export default function AdminAttendance({ stats, dailyStats, departmentStats, filters }: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = () => {
        router.get(route('admin.attendance.index'), {
            start_date: startDate,
            end_date: endDate,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const maxValue = Math.max(...dailyStats.map(d => d.present + d.late));

    return (
        <AppLayout>
            <Head title="Attendance Statistics" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <BarChart3 className="h-8 w-8" />
                                Attendance Statistics
                            </h1>
                            <p className="text-muted-foreground mt-1">Overview of employee attendance</p>
                        </div>
                    </div>

                    {/* Date Range Filter */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Filter by Date Range
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap items-end gap-4">
                                <div className="flex-1 min-w-[200px]">
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                                <Button onClick={handleFilter}>
                                    Apply Filter
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Present</CardTitle>
                                <Users className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.total_present}</div>
                                <p className="text-xs text-muted-foreground">On time attendance</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Late</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{stats.total_late}</div>
                                <p className="text-xs text-muted-foreground">Late arrivals</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
                                <XCircle className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{stats.total_absent}</div>
                                <p className="text-xs text-muted-foreground">Missing records</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{stats.attendance_rate}%</div>
                                <p className="text-xs text-muted-foreground">Overall percentage</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Daily Attendance Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Attendance Trend</CardTitle>
                            <CardDescription>Last {dailyStats.length} days attendance pattern</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {dailyStats.map((day) => (
                                    <div key={day.date} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium min-w-[80px]">
                                                {day.day} {new Date(day.date).getDate()}
                                            </span>
                                            <div className="flex-1 mx-4 flex gap-1">
                                                {/* Present bar */}
                                                <div
                                                    className="bg-green-500 h-6 rounded-l flex items-center justify-center text-white text-xs font-medium"
                                                    style={{ 
                                                        width: `${maxValue > 0 ? (day.present / maxValue) * 100 : 0}%`,
                                                        minWidth: day.present > 0 ? '30px' : '0'
                                                    }}
                                                >
                                                    {day.present > 0 && day.present}
                                                </div>
                                                {/* Late bar */}
                                                <div
                                                    className="bg-yellow-500 h-6 rounded-r flex items-center justify-center text-white text-xs font-medium"
                                                    style={{ 
                                                        width: `${maxValue > 0 ? (day.late / maxValue) * 100 : 0}%`,
                                                        minWidth: day.late > 0 ? '30px' : '0'
                                                    }}
                                                >
                                                    {day.late > 0 && day.late}
                                                </div>
                                            </div>
                                            <span className="text-muted-foreground min-w-[60px] text-right">
                                                {day.present + day.late} total
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Legend */}
                                <div className="flex items-center gap-4 pt-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                                        <span className="text-sm">Present</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                                        <span className="text-sm">Late</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Department Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Department Summary</CardTitle>
                            <CardDescription>Attendance breakdown by department</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {departmentStats.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Department</TableHead>
                                            <TableHead className="text-center">Employees</TableHead>
                                            <TableHead className="text-center">Present</TableHead>
                                            <TableHead className="text-center">Late</TableHead>
                                            <TableHead className="text-center">Absent</TableHead>
                                            <TableHead className="text-center">Rate</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {departmentStats.map((dept) => (
                                            <TableRow key={dept.id}>
                                                <TableCell className="font-medium">{dept.name}</TableCell>
                                                <TableCell className="text-center">{dept.total_employees}</TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-green-600 font-medium">{dept.present}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-yellow-600 font-medium">{dept.late}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-red-600 font-medium">{dept.absent}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="font-medium">{dept.attendance_rate}%</span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No department data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
