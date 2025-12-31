import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, AlertCircle, RefreshCw } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { FormEventHandler, useEffect, useState } from 'react';

interface QrSession {
    token: string;
    type: string;
    valid_until: string;
}

interface Props {
    activeQrSession: QrSession | null;
}

export default function ScanQr({ activeQrSession }: Props) {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const { data, setData, post, processing, errors } = useForm({
        qr_token: '',
    });

    // Auto-refresh page every 10 seconds to get new QR
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['activeQrSession'] });
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    // Calculate time left
    useEffect(() => {
        if (!activeQrSession) return;

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const validUntil = new Date(activeQrSession.valid_until).getTime();
            const diff = Math.max(0, Math.floor((validUntil - now) / 1000));
            setTimeLeft(diff);

            // Auto-refresh when expired
            if (diff === 0) {
                setTimeout(() => {
                    router.reload({ only: ['activeQrSession'] });
                }, 500);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [activeQrSession]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('employee.attendance.submit') as string, {
            onSuccess: () => setData('qr_token', ''),
        });
    };

    const useCurrentQr = () => {
        if (activeQrSession) {
            setData('qr_token', activeQrSession.token);
        }
    };

    return (
        <AppLayout>
            <Head title="Scan QR Code" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Current Active QR Display */}
                    {activeQrSession && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <QrCode className="h-6 w-6" />
                                        Active QR Code
                                    </span>
                                    <span className={`text-sm font-mono ${timeLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                        {timeLeft}s
                                    </span>
                                </CardTitle>
                                <CardDescription>
                                    Current QR code - Auto refreshes every 15 seconds
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg text-center">
                                    <div className="inline-flex items-center justify-center w-48 h-48 bg-white rounded-lg shadow-lg mb-4">
                                        <QrCode className="h-32 w-32 text-primary" />
                                    </div>
                                    <p className="font-mono text-lg font-bold mb-2 break-all px-4">
                                        {activeQrSession.token}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Type: {activeQrSession.type}
                                    </p>
                                </div>
                                <Button onClick={useCurrentQr} variant="outline" className="w-full">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Use This QR Code
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {!activeQrSession && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                No active QR session. Please wait for admin to generate QR code or contact your administrator.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Manual Input Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="h-6 w-6" />
                                Submit Attendance
                            </CardTitle>
                            <CardDescription>
                                Use the QR code above or paste token manually
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="qr_token">QR Token</Label>
                                    <Input
                                        id="qr_token"
                                        type="text"
                                        value={data.qr_token}
                                        onChange={(e) => setData('qr_token', e.target.value)}
                                        placeholder="Paste QR token here"
                                        className="font-mono"
                                        disabled={processing}
                                    />
                                    {errors.qr_token && (
                                        <p className="text-sm text-destructive">{errors.qr_token}</p>
                                    )}
                                </div>

                                <Button type="submit" className="w-full" disabled={processing || !data.qr_token}>
                                    {processing ? 'Submitting...' : 'Submit Attendance'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
