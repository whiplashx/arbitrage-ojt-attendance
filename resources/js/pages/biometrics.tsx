import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FacialRecognitionModal } from '@/components/facial-recognition-modal';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Biometrics',
        href: '#',
    },
];

interface PageProps {
    auth: {
        user: {
            id: number;
            facial_encoding?: string | null;
        };
    };
    hasFacialEncoding?: boolean;
}

export default function BiometricsPage() {
    const page = usePage<any>();
    const user = page.props?.auth?.user;
    const hasFacialEncoding = page.props?.hasFacialEncoding || false;

    const [showFacialModal, setShowFacialModal] = useState(false);
    const [facialRegistered, setFacialRegistered] = useState(hasFacialEncoding);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Update facialRegistered when page prop changes
    useEffect(() => {
        setFacialRegistered(hasFacialEncoding);
    }, [hasFacialEncoding]);

    const handleFacialSuccess = async (encoding: number[]) => {
        try {
            setShowFacialModal(false);
            
            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            // Send facial encoding to backend
            console.log('Saving facial encoding to database...');
            const response = await fetch('/api/attendance/store-facial-encoding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                body: JSON.stringify({
                    encoding: encoding,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save facial encoding');
            }

            const data = await response.json();
            console.log('Facial encoding saved successfully:', data);
            
            setFacialRegistered(true);
            setSuccessMessage('Facial recognition registered successfully! You can now use it for attendance.');
            
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
        } catch (error) {
            console.error('Error saving facial encoding:', error);
            setSuccessMessage(null);
            alert(error instanceof Error ? error.message : 'An error occurred while saving facial encoding');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Biometrics" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Facial Recognition Modal */}
                <FacialRecognitionModal
                    isOpen={showFacialModal}
                    onClose={() => setShowFacialModal(false)}
                    onSuccess={handleFacialSuccess}
                    isFirstTime={true}
                />

                {/* Page Title */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Biometric Registration</h1>
                    <p className="text-muted-foreground mt-2">
                        Register your biometric data for enhanced security and attendance tracking.
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-800 dark:text-green-100">
                            {successMessage}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Facial Recognition Card */}
                <Card className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold mb-2">Facial Recognition</h2>
                            <p className="text-muted-foreground mb-4">
                                Register your face for secure attendance verification. Your facial data will be encrypted and stored securely.
                            </p>
                            
                            {facialRegistered ? (
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-medium">Facial recognition registered</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                    <AlertCircle className="h-5 w-5" />
                                    <span className="font-medium">Facial recognition not set up</span>
                                </div>
                            )}
                        </div>
                        
                        <Button
                            onClick={() => setShowFacialModal(true)}
                            className="ml-4"
                        >
                            {facialRegistered ? 'Update Face' : 'Register Face'}
                        </Button>
                    </div>
                </Card>

                {/* Information Card */}
                <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How it works</h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                        <li className="flex items-center gap-2">
                            <span className="font-bold">1.</span>
                            <span>Click "Register Face" to start the facial recognition setup</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="font-bold">2.</span>
                            <span>Position your face clearly in the camera frame</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="font-bold">3.</span>
                            <span>Click "Capture Face" when your face is properly detected</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="font-bold">4.</span>
                            <span>Your facial data will be saved securely for attendance verification</span>
                        </li>
                    </ul>
                </Card>
            </div>
        </AppLayout>
    );
}
