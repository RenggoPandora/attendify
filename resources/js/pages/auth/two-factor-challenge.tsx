import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/two-factor/login';
import { Form, Head } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useMemo, useState } from 'react';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Recovery Code',
                description:
                    'Please confirm access to your account by entering one of your emergency recovery codes.',
                toggleText: 'login using an authentication code',
            };
        }

        return {
            title: 'Authentication Code',
            description:
                'Enter the authentication code provided by your authenticator application.',
            toggleText: 'login using a recovery code',
        };
    }, [showRecoveryInput]);

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <AuthLayout
            title={authConfigContent.title}
            description={authConfigContent.description}
        >
            <Head title="Two-Factor Authentication" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="space-y-6">
                    <Form
                        {...store.form()}
                        className="space-y-4"
                        resetOnError
                        resetOnSuccess={!showRecoveryInput}
                    >
                        {({ errors, processing, clearErrors }) => (
                            <>
                                {showRecoveryInput ? (
                                    <>
                                        <Input
                                            name="recovery_code"
                                            type="text"
                                            placeholder="Enter recovery code"
                                            autoFocus={showRecoveryInput}
                                            required
                                        />
                                        <InputError
                                            message={errors.recovery_code}
                                        />
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                        <div className="flex w-full items-center justify-center">
                                            <InputOTP
                                                name="code"
                                                maxLength={OTP_MAX_LENGTH}
                                                value={code}
                                                onChange={(value) => setCode(value)}
                                                disabled={processing}
                                                pattern={REGEXP_ONLY_DIGITS}
                                            >
                                                <InputOTPGroup>
                                                    {Array.from(
                                                        { length: OTP_MAX_LENGTH },
                                                        (_, index) => (
                                                            <InputOTPSlot
                                                                key={index}
                                                                index={index}
                                                            />
                                                        ),
                                                    )}
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>
                                        <InputError message={errors.code} />
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 h-11 font-medium"
                                    disabled={processing}
                                >
                                    Continue
                                </Button>

                                <div className="text-center text-sm text-gray-600">
                                    <span>or you can </span>
                                    <button
                                        type="button"
                                        className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4 transition-colors"
                                        onClick={() =>
                                            toggleRecoveryMode(clearErrors)
                                        }
                                    >
                                        {authConfigContent.toggleText}
                                    </button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </AuthLayout>
    );
}
