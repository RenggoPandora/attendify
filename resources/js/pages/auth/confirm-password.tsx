import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/confirm';
import { Form, Head } from '@inertiajs/react';

export default function ConfirmPassword() {
    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <Head title="Confirm password" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <Form {...store.form()} resetOnSuccess={['password']}>
                    {({ processing, errors }) => (
                        <div className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    autoFocus
                                />

                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center">
                                <Button
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 h-11 font-medium"
                                    disabled={processing}
                                    data-test="confirm-password-button"
                                >
                                    {processing && <Spinner />}
                                    Confirm password
                                </Button>
                            </div>
                        </div>
                    )}
                </Form>
            </div>
        </AuthLayout>
    );
}
