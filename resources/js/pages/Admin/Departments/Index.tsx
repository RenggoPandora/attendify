import { Head, Link, router } from '@inertiajs/react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, MoreVertical, Edit, Trash, Plus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Department {
    id: number;
    name: string;
    code?: string;
    description?: string;
    is_active: boolean;
    users_count: number;
}

interface Props {
    departments: Department[];
}

export default function DepartmentsIndex({ departments }: Props) {
    const handleDelete = (deptId: number) => {
        if (confirm('Are you sure you want to delete this department?')) {
            router.delete(route('admin.departments.destroy', deptId));
        }
    };

    return (
        <AppLayout>
            <Head title="Departments Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Building2 className="h-8 w-8" />
                                Departments Management
                            </h1>
                            <p className="text-muted-foreground mt-1">Manage company departments</p>
                        </div>
                        <Link href={route('admin.departments.create')}>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Department
                            </Button>
                        </Link>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>All Departments</CardTitle>
                            <CardDescription>List of all departments in the organization</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Department Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Employees</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {departments.map((dept) => (
                                        <TableRow key={dept.id}>
                                            <TableCell className="font-mono font-medium">{dept.code}</TableCell>
                                            <TableCell className="font-medium">{dept.name}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {dept.description || '-'}
                                            </TableCell>
                                            <TableCell>{dept.users_count} employees</TableCell>
                                            <TableCell>
                                                <Badge variant={dept.is_active ? 'default' : 'secondary'}>
                                                    {dept.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('admin.departments.edit', dept.id)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(dept.id)}
                                                        >
                                                            <Trash className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
