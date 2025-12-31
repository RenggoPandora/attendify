import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Clock, RefreshCw } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

interface QrSessionData {
    token: string;
    type: string;
    valid_from: string;
    valid_until: string;
    generated_at: string;
}

interface Props {
    activeQrSession: QrSessionData | null;
}

export default function AdminQrDisplay({ activeQrSession }: Props) {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (!activeQrSession) return;

        const calculateTimeLeft = () => {
            const validUntil = new Date(activeQrSession.valid_until).getTime();
            const now = Date.now();
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

    // Auto-refresh every 10 seconds to get new QR
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            router.reload({ only: ['activeQrSession'] });
        }, 10000);

        return () => clearInterval(refreshInterval);
    }, []);

    return (
        <AppLayout>
            <Head title="Active QR Code Display" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <QrCode className="h-8 w-8" />
                            Active QR Code Display
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Display this QR code for employee attendance scanning (auto-generates on-demand)
                        </p>
                    </div>

                    {activeQrSession ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* QR Code Display */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Scan This QR Code</CardTitle>
                                    <CardDescription>
                                        Auto-generates on page load, rotates every 30 seconds
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center p-8">
                                    <div className="bg-white p-6 rounded-lg shadow-lg">
                                        <QRCodeSVG
                                            value={activeQrSession.token}
                                            size={300}
                                            level="H"
                                            includeMargin={true}
                                        />
                                    </div>
                                    <div className="mt-6 text-center">
                                        <div className="flex items-center gap-2 justify-center mb-2">
                                            <Clock className="h-5 w-5" />
                                            <span className={`text-2xl font-bold ${timeLeft < 5 ? 'text-destructive' : ''}`}>
                                                {timeLeft}s
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Time remaining
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* QR Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>QR Code Information</CardTitle>
                                    <CardDescription>
                                        Current session details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Token (Preview)
                                        </label>
                                        <p className="font-mono text-sm mt-1 p-2 bg-muted rounded">
                                            {activeQrSession.token.substring(0, 16)}...
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Type
                                        </label>
                                        <p className="mt-1 capitalize">{activeQrSession.type}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Valid From
                                        </label>
                                        <p className="mt-1">
                                            {new Date(activeQrSession.valid_from).toLocaleTimeString('id-ID')}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Valid Until
                                        </label>
                                        <p className="mt-1">
                                            {new Date(activeQrSession.valid_until).toLocaleTimeString('id-ID')}
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            <span>Auto-refreshing...</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Active QR Code</h3>
                                <p className="text-muted-foreground text-center">
                                    Failed to generate QR code. Please refresh the page.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
