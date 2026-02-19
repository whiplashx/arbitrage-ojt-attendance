import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import FacialRegistration from '@/components/facial-registration';
import { uploadFacialEncoding, disableFacialRecognition, getFacialStatus } from '@/lib/facial-recognition';

interface FacialStatus {
    enabled: boolean;
    registered_at: string | null;
}

export default function FacialRecognitionSettings() {
    const [facialStatus, setFacialStatus] = useState<FacialStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCapture, setShowCapture] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        loadFacialStatus();
        // Get userId from page metadata or user prop
        const userIdElement = document.querySelector('meta[name="user-id"]');
        if (userIdElement) {
            setUserId(parseInt(userIdElement.getAttribute('content') || '0'));
        }
    }, []);

    const loadFacialStatus = async () => {
        try {
            setIsLoading(true);
            const status = await getFacialStatus();
            setFacialStatus(status);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load facial recognition status';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFacialCapture = async (encoding: string) => {
        if (!userId) {
            setError('User ID not found');
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            const result = await uploadFacialEncoding(encoding, userId);
            setSuccess(result.message);
            setShowCapture(false);
            await loadFacialStatus();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to save facial data';
            setError(message);
        }
    };

    const handleDisableFacialRecognition = async () => {
        if (!confirm('Are you sure you want to disable facial recognition? You can re-enable it anytime.')) {
            return;
        }

        try {
            setError(null);
            setSuccess(null);
            const result = await disableFacialRecognition();
            setSuccess(result.message);
            await loadFacialStatus();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to disable facial recognition';
            setError(message);
        }
    };

    if (isLoading) {
        return <div className="text-muted-foreground">Loading facial recognition settings...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">Facial Recognition</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your facial recognition data for faster and more secure login
                </p>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
                    {success}
                </div>
            )}

            {!facialStatus?.enabled && !showCapture && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-800">
                        Facial recognition is not enabled on your account. Enable it to use facial recognition for login.
                    </p>
                    <Button
                        onClick={() => setShowCapture(true)}
                        className="mt-4"
                    >
                        Enable Facial Recognition
                    </Button>
                </div>
            )}

            {showCapture && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                    <FacialRegistration
                        onCapture={handleFacialCapture}
                        isOptional={true}
                    />
                    <Button
                        variant="outline"
                        onClick={() => setShowCapture(false)}
                        className="mt-4 w-full"
                    >
                        Cancel
                    </Button>
                </div>
            )}

            {facialStatus?.enabled && !showCapture && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-900">
                        ✓ Facial recognition is enabled
                    </p>
                    <p className="mt-2 text-sm text-green-800">
                        Registered on:{' '}
                        {facialStatus.registered_at
                            ? new Date(facialStatus.registered_at).toLocaleDateString()
                            : 'Unknown'}
                    </p>

                    <div className="mt-4 flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowCapture(true)}
                        >
                            Update Face
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDisableFacialRecognition}
                        >
                            Disable Facial Recognition
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
