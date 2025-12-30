import { Head, Link, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { QrCode, MoreVertical, Trash, Plus, RefreshCw } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

interface QrSession {
    id: number;
    token: string;
    type: string;
    is_active: boolean;
    valid_from: string;
    valid_until: string;
    creator: {
        name: string;
    };
}

interface Props {
    qrSessions: QrSession[];
}

export default function QrSessionsIndex({ qrSessions = [] }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'check_in',
        valid_minutes: '480', // 8 hours default
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.qr-sessions.store'), {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
        });
    };

    const handleRotate = (sessionId: number) => {
        if (confirm('Rotate this QR session? Old QR code will be invalidated.')) {
            router.post(route('admin.qr-sessions.rotate', sessionId));
        }
    };

    const handleDelete = (sessionId: number) => {
        if (confirm('Are you sure you want to invalidate this QR session?')) {
            router.delete(route('admin.qr-sessions.destroy', sessionId));
        }
    };

    return (
        <AppLayout>
            <Head title="QR Sessions Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <QrCode className="h-8 w-8" />
                                QR Sessions Management
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                QR codes auto-rotate every 15 seconds for security
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.reload()}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Manual Generate
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleSubmit}>
                                        <DialogHeader>
                                            <DialogTitle>Generate New QR Session</DialogTitle>
                                            <DialogDescription>
                                                Create a new QR code for attendance scanning
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="type">Session Type</Label>
                                                <Select
                                                    value={data.type}
                                                    onValueChange={(value) => setData('type', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="check_in">Check In</SelectItem>
                                                        <SelectItem value="check_out">Check Out</SelectItem>
                                                        <SelectItem value="both">Both</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.type && (
                                                    <p className="text-sm text-destructive">{errors.type}</p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="valid_minutes">Valid Duration (minutes)</Label>
                                                <Input
                                                    id="valid_minutes"
                                                    type="number"
                                                    value={data.valid_minutes}
                                                    onChange={(e) => setData('valid_minutes', e.target.value)}
                                                    placeholder="480"
                                                />
                                                {errors.valid_minutes && (
                                                    <p className="text-sm text-destructive">
                                                        {errors.valid_minutes}
                                                    </p>
                                                )}
                                                <p className="text-sm text-muted-foreground">
                                                    Default: 480 minutes (8 hours)
                                                </p>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={processing}>
                                                Generate
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>QR Session History</CardTitle>
                            <CardDescription>
                                Auto-rotating QR codes. System generates new code every 15 seconds automatically.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Token</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Valid From</TableHead>
                                        <TableHead>Valid Until</TableHead>
                                        <TableHead>Created By</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {qrSessions.map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell className="font-mono text-sm">
                                                {session.token.substring(0, 8)}...
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{session.type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={session.is_active ? 'default' : 'secondary'}
                                                >
                                                    {session.is_active ? 'Active' : 'Expired'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(session.valid_from).toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(session.valid_until).toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell>{session.creator.name}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {session.is_active && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleRotate(session.id)}
                                                            >
                                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                                Rotate QR
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(session.id)}
                                                        >
                                                            <Trash className="h-4 w-4 mr-2" />
                                                            Invalidate
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
