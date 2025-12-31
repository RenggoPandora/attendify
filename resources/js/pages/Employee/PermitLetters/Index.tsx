import { Head, Link, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { FileText, Upload, Download, Trash2, Plus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { route as ziggyRoute } from 'ziggy-js';

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

interface Props {
    permitLetters: PermitLetter[];
}

export default function PermitLettersIndex({ permitLetters }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        permit_date: '',
        reason: 'sakit',
        description: '',
        file: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(ziggyRoute('employee.permit-letters.store'), {
            onSuccess: () => {
                reset();
                setIsOpen(false);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus surat izin ini?')) {
            router.delete(ziggyRoute('employee.permit-letters.destroy', id));
        }
    };

    const statusColors = {
        pending: 'bg-yellow-500',
        approved: 'bg-green-500',
        rejected: 'bg-red-500',
    };

    const statusLabels = {
        pending: 'Pending',
        approved: 'Disetujui',
        rejected: 'Ditolak',
    };

    return (
        <AppLayout>
            <Head title="Surat Izin" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <FileText className="h-8 w-8" />
                                Surat Izin
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Upload surat izin untuk absen yang terlewat
                            </p>
                        </div>
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Upload Surat Izin
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Upload Surat Izin</DialogTitle>
                                    <DialogDescription>
                                        Upload surat izin untuk absen yang terlewat atau sakit
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={submit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="permit_date">Tanggal</Label>
                                        <Input
                                            id="permit_date"
                                            type="date"
                                            value={data.permit_date}
                                            onChange={(e) => setData('permit_date', e.target.value)}
                                            required
                                        />
                                        {errors.permit_date && (
                                            <p className="text-sm text-red-500 mt-1">{errors.permit_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="reason">Alasan</Label>
                                        <Select value={data.reason} onValueChange={(val) => setData('reason', val)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sakit">Sakit</SelectItem>
                                                <SelectItem value="izin">Izin</SelectItem>
                                                <SelectItem value="lainnya">Lainnya</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.reason && (
                                            <p className="text-sm text-red-500 mt-1">{errors.reason}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Keterangan (Opsional)</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Keterangan tambahan..."
                                            rows={3}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="file">File Surat (PDF/Image, max 2MB)</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                            required
                                        />
                                        {errors.file && (
                                            <p className="text-sm text-red-500 mt-1">{errors.file}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={processing} className="flex-1">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Batal
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Surat Izin</CardTitle>
                            <CardDescription>Riwayat surat izin yang Anda upload</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {permitLetters.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Alasan</TableHead>
                                            <TableHead>File</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Upload</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {permitLetters.map((letter) => (
                                            <TableRow key={letter.id}>
                                                <TableCell>
                                                    {new Date(letter.permit_date).toLocaleDateString('id-ID')}
                                                </TableCell>
                                                <TableCell className="capitalize">
                                                    <div>
                                                        {letter.reason}
                                                        {letter.description && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {letter.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">{letter.file_name}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusColors[letter.status]}>
                                                        {statusLabels[letter.status]}
                                                    </Badge>
                                                    {letter.status === 'rejected' && letter.rejection_reason && (
                                                        <p className="text-xs text-red-600 mt-1">
                                                            {letter.rejection_reason}
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(letter.created_at).toLocaleDateString('id-ID')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={ziggyRoute(
                                                                    'employee.permit-letters.download',
                                                                    letter.id
                                                                )}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        {letter.status === 'pending' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(letter.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>Belum ada surat izin yang diupload</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
