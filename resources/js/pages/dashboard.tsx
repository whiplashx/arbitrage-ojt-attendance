import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FacialRecognitionModal } from '@/components/facial-recognition-modal';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Attendance',
        href: dashboard().url,
    },
];

const WORK_START = 12; // 12 PM
const WORK_END = 20; // 8 PM

interface PageProps {
    auth: {
        user: {
            id: number;
            facial_encoding?: string | null;
        };
    };
    hasFacialEncoding?: boolean;
}

export default function Dashboard() {
    const page = usePage<any>();
    const user = page.props?.auth?.user;
    const hasFacialEncoding = page.props?.hasFacialEncoding || false;
    const isFirstTimeUser = !hasFacialEncoding;

    const [currentTime, setCurrentTime] = useState<string>('');
    const [timeIn, setTimeIn] = useState<string | null>(null);
    const [timeOut, setTimeOut] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'in' | 'out'>('idle');
    const [isOvertime, setIsOvertime] = useState(false);
    const [showFacialModal, setShowFacialModal] = useState(false);
    const [requiresFacialVerification, setRequiresFacialVerification] = useState(false);
    const [verificationMode, setVerificationMode] = useState<'registration' | 'time-in' | 'time-out' | null>(null);
    const [facialVerified, setFacialVerified] = useState(false);

    useEffect(() => {
        // Update current time
        const interval = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleTimeIn = () => {
        // Existing user needs verification
        setVerificationMode('time-in');
        setRequiresFacialVerification(true);
        setShowFacialModal(true);
    };

    const handleTimeOut = () => {
        // Time out also requires facial verification
        setVerificationMode('time-out');
        setRequiresFacialVerification(true);
        setShowFacialModal(true);
    };

    const handleFacialSuccess = async (encoding: number[]) => {
        try {
            // Get CSRF token from meta tag
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            // If this is registration mode
            if (verificationMode === 'registration') {
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
            } else if (verificationMode === 'time-in') {
                // Save time in with facial encoding
                console.log('Saving time in with facial encoding...');
                const response = await fetch('/api/attendance/time-in', {
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
                    throw new Error(error.message || 'Failed to record time in');
                }

                const data = await response.json();
                console.log('Time in recorded successfully:', data);
                
                // Update UI
                setRequiresFacialVerification(false);
                const now = new Date().toLocaleTimeString();
                setTimeIn(now);
                setStatus('in');
            } else if (verificationMode === 'time-out') {
                // Save time out with facial encoding and overtime flag
                console.log('Saving time out with facial encoding...');
                const response = await fetch('/api/attendance/time-out', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-Token': csrfToken,
                    },
                    body: JSON.stringify({
                        encoding: encoding,
                        is_overtime: isOvertime,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to record time out');
                }

                const data = await response.json();
                console.log('Time out recorded successfully:', data);
                
                // Update UI
                setRequiresFacialVerification(false);
                const now = new Date().toLocaleTimeString();
                setTimeOut(now);
                setStatus('out');
            }

            setShowFacialModal(false);
            setFacialVerified(true);
        } catch (error) {
            console.error('Error saving facial data:', error);
            // Show error toast to user
            alert(error instanceof Error ? error.message : 'An error occurred while saving facial data');
        } finally {
            setVerificationMode(null);
        }
    };

    const getWorkingHoursText = () => {
        if (isOvertime) {
            return `Working Hours: 12:00 PM - 8:00 PM + Overtime`;
        }
        return `Working Hours: 12:00 PM - 8:00 PM`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="OJT Attendance" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Facial Recognition Modal */}
                <FacialRecognitionModal
                    isOpen={showFacialModal}
                    onClose={() => {
                        setShowFacialModal(false);
                    }}
                    onSuccess={handleFacialSuccess}
                    isFirstTime={false}
                />

                {/* Current Time Display */}
                <Card className="p-6">
                    <div className="text-center">
                        <h2 className="text-sm font-medium text-muted-foreground">Current Time</h2>
                        <p className="text-4xl font-bold mt-2">{currentTime}</p>
                        <p className="text-sm text-muted-foreground mt-4">{getWorkingHoursText()}</p>
                    </div>
                </Card>

                {/* Attendance Status */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Attendance Status</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Time In */}
                        <div className="border rounded-lg p-4 text-center">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Time In</p>
                            <p className="text-2xl font-bold mb-4">
                                {timeIn ? timeIn : '---'}
                            </p>
                            <Button
                                onClick={handleTimeIn}
                                disabled={status !== 'idle'}
                                className="w-full"
                                variant={status === 'in' ? 'default' : 'outline'}
                            >
                                {status === 'in' ? '✓ Timed In' : 'Time In'}
                            </Button>
                        </div>

                        {/* Time Out */}
                        <div className="border rounded-lg p-4 text-center">
                            <p className="text-sm font-medium text-muted-foreground mb-2">Time Out</p>
                            <p className="text-2xl font-bold mb-4">
                                {timeOut ? timeOut : '---'}
                            </p>
                            <Button
                                onClick={handleTimeOut}
                                disabled={status !== 'in'}
                                className="w-full"
                                variant={status === 'out' ? 'default' : 'outline'}
                            >
                                {status === 'out' ? '✓ Timed Out' : 'Time Out'}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Overtime Option */}
                {status === 'in' && (
                    <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="overtime"
                                checked={isOvertime}
                                onCheckedChange={(checked) => setIsOvertime(checked as boolean)}
                            />
                            <Label htmlFor="overtime" className="text-sm font-medium cursor-pointer">
                                Mark as Overtime
                            </Label>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                            Check this box if you will be working beyond 8:00 PM
                        </p>
                    </Card>
                )}

                {/* Summary */}
                {status !== 'idle' && (
                    <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <p className="text-center text-green-800 dark:text-green-100">
                            {status === 'in' && `You have successfully timed in for the day${isOvertime ? ' (Overtime mode)' : ''}.`}
                            {status === 'out' && `You have successfully timed out for the day${isOvertime ? ' (with Overtime)' : ''}.`}
                        </p>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
