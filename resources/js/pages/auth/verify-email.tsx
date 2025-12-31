// Components
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Form, Head } from '@inertiajs/react';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Verify email"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-center text-sm font-medium text-green-700">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <Form {...send.form()} className="space-y-6 text-center">
                    {({ processing }) => (
                        <>
                            <Button
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 h-11 font-medium"
                            >
                                {processing && <Spinner />}
                                Resend verification email
                            </Button>

                            <TextLink
                                href={logout()}
                                className="mx-auto block text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Log out
                            </TextLink>
                        </>
                    )}
                </Form>
            </div>
        </AuthLayout>
    );
}
