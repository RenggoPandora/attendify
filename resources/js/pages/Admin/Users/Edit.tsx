import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, UserCog } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { FormEventHandler } from 'react';

interface Role {
    id: number;
    name: string;
    display_name: string;
}

interface Department {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    employee_id: string;
    roles: Role[];
    department_id: number | null;
    is_active: boolean;
}

interface Props {
    user: User;
    roles: Role[];
    departments: Department[];
}

export default function EditUser({ user, roles, departments }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        employee_id: user.employee_id,
        password: '',
        password_confirmation: '',
        role_ids: user.roles?.map(r => r.id) || [],
        department_id: user.department_id?.toString() || '',
        is_active: user.is_active,
    });

    const toggleRole = (roleId: number) => {
        const currentRoles = [...data.role_ids];
        const index = currentRoles.indexOf(roleId);
        
        if (index > -1) {
            currentRoles.splice(index, 1);
        } else {
            currentRoles.push(roleId);
        }
        
        setData('role_ids', currentRoles);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.users.update', user.id));
    };

    return (
        <AppLayout>
            <Head title="Edit User" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <UserCog className="h-8 w-8" />
                                Edit User
                            </h1>
                            <p className="text-muted-foreground mt-1">Update user information</p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={route('admin.users.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                            <CardDescription>Update the user details below</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="employee_id">Employee ID *</Label>
                                        <Input
                                            id="employee_id"
                                            value={data.employee_id}
                                            onChange={(e) => setData('employee_id', e.target.value)}
                                            required
                                        />
                                        {errors.employee_id && (
                                            <p className="text-sm text-destructive">{errors.employee_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-destructive">{errors.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Roles *</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border rounded-md p-4">
                                            {roles.map((role) => (
                                                <div key={role.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`role-${role.id}`}
                                                        checked={data.role_ids.includes(role.id)}
                                                        onCheckedChange={() => toggleRole(role.id)}
                                                    />
                                                    <Label
                                                        htmlFor={`role-${role.id}`}
                                                        className="text-sm font-normal cursor-pointer"
                                                    >
                                                        {role.display_name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.role_ids && (
                                            <p className="text-sm text-destructive">{errors.role_ids}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="department_id">Department</Label>
                                        <Select
                                            value={data.department_id}
                                            onValueChange={(value) => setData('department_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.department_id && (
                                            <p className="text-sm text-destructive">{errors.department_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        {errors.password && (
                                            <p className="text-sm text-destructive">{errors.password}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    />
                                    <Label htmlFor="is_active">Active user</Label>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Button variant="outline" type="button" asChild>
                                        <Link href={route('admin.users.index')}>Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating...' : 'Update User'}
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
