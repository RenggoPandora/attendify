import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, AlertCircle, Camera, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { FormEventHandler, useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

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
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
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
            onSuccess: () => {
                setData('qr_token', '');
                if (isScanning) {
                    stopScanner();
                }
            },
        });
    };

    const startScanner = () => {
        setIsScanning(true);
        
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner(
                "qr-reader",
                { 
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                false
            );

            scanner.render(
                (decodedText) => {
                    // QR code successfully scanned
                    console.log('QR Code scanned:', decodedText);
                    scanner.clear();
                    setIsScanning(false);
                    
                    // Set data dan auto-submit
                    router.post(
                        route('employee.attendance.submit') as string,
                        { qr_token: decodedText },
                        {
                            onSuccess: () => {
                                alert('Absensi berhasil dicatat!');
                            },
                            onError: (errors) => {
                                console.error('Submit error:', errors);
                                alert('Gagal mencatat absensi: ' + (errors.qr_token || 'Unknown error'));
                            },
                        }
                    );
                },
                (error) => {
                    // Scan error (can be ignored for continuous scanning)
                    console.log('Scan error (normal):', error);
                }
            );

            scannerRef.current = scanner;
        }, 100);
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear();
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear();
            }
        };
    }, []);

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
                    {/* QR Scanner Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="h-6 w-6" />
                                Scan QR Code dengan Kamera
                            </CardTitle>
                            <CardDescription>
                                Arahkan kamera ke QR code yang ditampilkan di layar display
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isScanning ? (
                                <Button onClick={startScanner} className="w-full" size="lg">
                                    <Camera className="h-5 w-5 mr-2" />
                                    Buka Kamera untuk Scan
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    <div id="qr-reader" className="w-full"></div>
                                    <Button onClick={stopScanner} variant="destructive" className="w-full">
                                        <X className="h-5 w-5 mr-2" />
                                        Tutup Kamera
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

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
