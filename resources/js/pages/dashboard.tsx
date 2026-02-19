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
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [goalHours, setGoalHours] = useState<number>(8);
    const [showGoalInput, setShowGoalInput] = useState(false);
    const [tempGoalInput, setTempGoalInput] = useState<string>('8');
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [monthlyAttendance, setMonthlyAttendance] = useState<Record<string, any>>({});
    const [ojtStartDate, setOjtStartDate] = useState<Date | null>(null);
    const [ojtEndDate, setOjtEndDate] = useState<Date | null>(null);
    const [totalHoursWorked, setTotalHoursWorked] = useState<number>(0);
    const [ojtTotalHours, setOjtTotalHours] = useState<number>(160); // Default 160 hours (4 weeks * 40 hours/week)

    useEffect(() => {
        // Update current time only (for live clock display) in 12-hour format
        const formatTime12Hour = (date: Date) => {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            });
        };

        const interval = setInterval(() => {
            setCurrentTime(formatTime12Hour(new Date()));
        }, 1000);

        // Set initial time immediately
        setCurrentTime(formatTime12Hour(new Date()));

        return () => clearInterval(interval);
    }, []);

    // Fetch today's attendance record on component mount ONLY ONCE
    useEffect(() => {
        const convertTo12Hour = (time24: string) => {
            // Convert 24-hour format (HH:MM:SS) to 12-hour format (H:MM:SS AM/PM)
            const [hours, minutes, seconds] = time24.split(':');
            let hour = parseInt(hours, 10);
            const period = hour >= 12 ? 'PM' : 'AM';
            if (hour > 12) {
                hour -= 12;
            } else if (hour === 0) {
                hour = 12;
            }
            return `${hour}:${minutes}:${seconds} ${period}`;
        };

        const fetchTodayAttendance = async () => {
            try {
                const response = await fetch('/api/attendance/today');
                if (response.ok) {
                    const data = await response.json();
                    if (data.data) {
                        // Set time in and time out from database
                        if (data.data.time_in) {
                            // Extract just the time part (HH:MM:SS) from the database
                            const timeInValue = data.data.time_in;
                            setTimeIn(convertTo12Hour(timeInValue));
                            setStatus('in');
                        }
                        if (data.data.time_out) {
                            // Extract just the time part (HH:MM:SS) from the database
                            const timeOutValue = data.data.time_out;
                            setTimeOut(convertTo12Hour(timeOutValue));
                            setStatus('out');
                        }
                        // Set overtime status
                        if (data.data.is_overtime) {
                            setIsOvertime(data.data.is_overtime);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching attendance:', error);
            }
        };

        fetchTodayAttendance();
    }, []); // Empty dependency array = run only on mount

    const handleTimeIn = () => {
        // If first time user, ask them to register face first
        if (isFirstTimeUser) {
            setErrorMessage('Please register your face first before timing in');
            setVerificationMode('registration');
            setShowFacialModal(true);
        } else {
            // Existing user needs verification
            setErrorMessage(null);
            setVerificationMode('time-in');
            setRequiresFacialVerification(true);
            setShowFacialModal(true);
        }
    };

    const handleTimeOut = () => {
        // Time out also requires facial verification
        setErrorMessage(null);
        setVerificationMode('time-out');
        setRequiresFacialVerification(true);
        setShowFacialModal(true);
    };

    const handleFacialSuccess = async (encoding: number[]) => {
        const convertTo12Hour = (time24: string) => {
            // Convert 24-hour format (HH:MM:SS) to 12-hour format (H:MM:SS AM/PM)
            const [hours, minutes, seconds] = time24.split(':');
            let hour = parseInt(hours, 10);
            const period = hour >= 12 ? 'PM' : 'AM';
            if (hour > 12) {
                hour -= 12;
            } else if (hour === 0) {
                hour = 12;
            }
            return `${hour}:${minutes}:${seconds} ${period}`;
        };

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
                
                // After successful registration, show message and clear error
                setErrorMessage(null);
                setShowFacialModal(false);
                alert('Face registered successfully! You can now time in.');
                return; // Exit early to prevent catch block
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

                const data = await response.json();
                
                if (!response.ok) {
                    // If already timed in, that's not an error - just show info
                    if (response.status === 400 && data.message && data.message.includes('already timed in')) {
                        console.log('Already timed in today:', data.message);
                        setErrorMessage(null);
                        setShowFacialModal(false);
                        setFacialVerified(true);
                        throw new Error(''); // Throw empty error to skip catch block alert
                    }
                    throw new Error(data.message || 'Failed to record time in');
                }

                console.log('Time in recorded successfully:', data);
                
                // Update UI with server response data
                setErrorMessage(null);
                setRequiresFacialVerification(false);
                // Use the time from the server response, not client time
                if (data.data && data.data.time_in) {
                    // Extract only the time part (HH:MM:SS) and convert to 12-hour format
                    const timeValue = data.data.time_in.split(' ').pop() || data.data.time_in;
                    setTimeIn(convertTo12Hour(timeValue));
                } else {
                    setTimeIn(new Date().toLocaleTimeString('en-US', { hour12: true }));
                }
                setStatus('in');
                setShowFacialModal(false);
                setFacialVerified(true);
                return; // Exit early to prevent double modal close
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

                const data = await response.json();
                
                if (!response.ok) {
                    // If already timed out, that's not an error - just show info
                    if (response.status === 400 && data.message && data.message.includes('already timed out')) {
                        console.log('Already timed out today:', data.message);
                        setErrorMessage(null);
                        setShowFacialModal(false);
                        setFacialVerified(true);
                        throw new Error(''); // Throw empty error to skip catch block alert
                    }
                    throw new Error(data.message || 'Failed to record time out');
                }

                console.log('Time out recorded successfully:', data);
                
                // Update UI with server response data
                setErrorMessage(null);
                setRequiresFacialVerification(false);
                // Use the time from the server response, not client time
                if (data.data && data.data.time_out) {
                    // Extract only the time part (HH:MM:SS) and convert to 12-hour format
                    const timeValue = data.data.time_out.split(' ').pop() || data.data.time_out;
                    setTimeOut(convertTo12Hour(timeValue));
                } else {
                    setTimeOut(new Date().toLocaleTimeString('en-US', { hour12: true }));
                }
                setStatus('out');
                setShowFacialModal(false);
                setFacialVerified(true);
                return; // Exit early to prevent double modal close
            }

            setShowFacialModal(false);
            setFacialVerified(true);
        } catch (error) {
            console.error('Error saving facial data:', error);
            const errorMsg = error instanceof Error ? error.message : 'An error occurred while saving facial data';
            // Only show alert if there's an actual error message
            if (errorMsg) {
                setErrorMessage(errorMsg);
                alert(errorMsg);
            }
        } finally {
            setVerificationMode(null);
            // Make sure modal is closed
            setShowFacialModal(false);
        }
    };

    const getWorkingHoursText = () => {
        if (isOvertime) {
            return `Working Hours: 12:00 PM - 8:00 PM + Overtime`;
        }
        return `Working Hours: 12:00 PM - 8:00 PM`;
    };

    const calculateWorkedHours = () => {
        if (!timeIn || !timeOut) return 0;
        
        try {
            // Parse 12-hour format time back to minutes
            const parseTime = (time12: string) => {
                const [time, period] = time12.split(' ');
                const [hours, minutes] = time.split(':');
                let hour = parseInt(hours, 10);
                if (period === 'PM' && hour !== 12) {
                    hour += 12;
                } else if (period === 'AM' && hour === 12) {
                    hour = 0;
                }
                return hour * 60 + parseInt(minutes, 10);
            };

            const inMinutes = parseTime(timeIn);
            const outMinutes = parseTime(timeOut);
            
            let diffMinutes = outMinutes - inMinutes;
            if (diffMinutes < 0) {
                diffMinutes += 24 * 60; // Handle day wraparound
            }
            
            return parseFloat((diffMinutes / 60).toFixed(2));
        } catch (error) {
            console.error('Error calculating worked hours:', error);
            return 0;
        }
    };

    const handleSaveGoalHours = () => {
        const newGoal = parseFloat(tempGoalInput);
        if (!isNaN(newGoal) && newGoal > 0) {
            setGoalHours(newGoal);
            setShowGoalInput(false);
            localStorage.setItem('goalHours', newGoal.toString());
        }
    };

    // Load goal hours from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('goalHours');
        if (saved) {
            setGoalHours(parseFloat(saved));
            setTempGoalInput(saved);
        }
    }, []);

    // Fetch OJT dates and total hours worked from user profile
    useEffect(() => {
        const fetchOjtData = async () => {
            try {
                const response = await fetch('/api/user/ojt-info');
                if (response.ok) {
                    const data = await response.json();
                    if (data.data) {
                        if (data.data.ojt_start_date) {
                            setOjtStartDate(new Date(data.data.ojt_start_date));
                        }
                        if (data.data.ojt_end_date) {
                            setOjtEndDate(new Date(data.data.ojt_end_date));
                        }
                        if (data.data.ojt_total_hours) {
                            setOjtTotalHours(data.data.ojt_total_hours);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching OJT data:', error);
            }
        };

        fetchOjtData();
    }, []);

    // Fetch total hours worked across all attendance records
    useEffect(() => {
        const fetchTotalHours = async () => {
            try {
                const response = await fetch('/api/attendance/total-hours');
                if (response.ok) {
                    const data = await response.json();
                    if (data.data && data.data.total_hours !== undefined) {
                        setTotalHoursWorked(data.data.total_hours);
                    }
                }
            } catch (error) {
                console.error('Error fetching total hours:', error);
            }
        };

        fetchTotalHours();
    }, [status]); // Recalculate when status changes (after time-in/out)

    // Fetch monthly attendance data
    useEffect(() => {
        const fetchMonthlyAttendance = async () => {
            try {
                const year = currentMonth.getFullYear();
                const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
                const response = await fetch(`/api/attendance/monthly?month=${month}&year=${year}`);
                if (response.ok) {
                    const data = await response.json();
                    // Create a map of dates with attendance info
                    const attendanceMap: Record<string, any> = {};
                    if (data.data && Array.isArray(data.data)) {
                        data.data.forEach((record: any) => {
                            const date = record.attendance_date;
                            attendanceMap[date] = {
                                timeIn: record.time_in,
                                timeOut: record.time_out,
                                isOvertime: record.is_overtime,
                            };
                        });
                    }
                    setMonthlyAttendance(attendanceMap);
                }
            } catch (error) {
                console.error('Error fetching monthly attendance:', error);
            }
        };

        fetchMonthlyAttendance();
    }, [currentMonth]);

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const formatDateKey = (year: number, month: number, day: number) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
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

                {/* Error Message */}
                {errorMessage && (
                    <Card className="p-4 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                        <p className="text-center text-red-800 dark:text-red-100">
                            {errorMessage}
                        </p>
                    </Card>
                )}

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

                {/* Progress - Overall OJT Progress */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">OJT Progress</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">Total Hours Completed</p>
                            <p className="text-3xl font-bold">{totalHoursWorked.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground mt-1">Target: {ojtTotalHours} hours</p>
                        </div>

                        {ojtStartDate && ojtEndDate && (
                            <div className="grid grid-cols-2 gap-4 text-center text-sm">
                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                    <p className="text-muted-foreground mb-1">Start Date</p>
                                    <p className="font-semibold">{ojtStartDate.toLocaleDateString()}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                    <p className="text-muted-foreground mb-1">End Date</p>
                                    <p className="font-semibold">{ojtEndDate.toLocaleDateString()}</p>
                                </div>
                            </div>
                        )}

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full transition-all ${
                                    totalHoursWorked >= ojtTotalHours
                                        ? 'bg-green-500'
                                        : totalHoursWorked >= (ojtTotalHours * 0.75)
                                        ? 'bg-blue-500'
                                        : 'bg-yellow-500'
                                }`}
                                style={{
                                    width: `${Math.min((totalHoursWorked / ojtTotalHours) * 100, 100)}%`,
                                }}
                            />
                        </div>

                        <div className="text-center text-sm">
                            {totalHoursWorked >= ojtTotalHours ? (
                                <p className="text-green-600 dark:text-green-400 font-medium">
                                    ✓ OJT Target Achieved! ({((totalHoursWorked / ojtTotalHours) * 100).toFixed(0)}%)
                                </p>
                            ) : (
                                <p className="text-muted-foreground">
                                    {(ojtTotalHours - totalHoursWorked).toFixed(2)} hours remaining ({((totalHoursWorked / ojtTotalHours) * 100).toFixed(1)}%)
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Calendar */}
                <Card className="p-6">
                    <div className="space-y-4">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={previousMonth}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <h3 className="text-lg font-semibold">
                                {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={nextMonth}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div
                                    key={day}
                                    className="text-center text-sm font-semibold text-muted-foreground p-2"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({
                                length: getFirstDayOfMonth(currentMonth) + getDaysInMonth(currentMonth),
                            }).map((_, index) => {
                                const dayNum = index - getFirstDayOfMonth(currentMonth) + 1;
                                const isCurrentMonth = dayNum > 0 && dayNum <= getDaysInMonth(currentMonth);
                                const dateKey = isCurrentMonth
                                    ? formatDateKey(
                                          currentMonth.getFullYear(),
                                          currentMonth.getMonth(),
                                          dayNum
                                      )
                                    : '';
                                const attendance = monthlyAttendance[dateKey];
                                const today = new Date();
                                const isToday =
                                    isCurrentMonth &&
                                    dayNum === today.getDate() &&
                                    currentMonth.getMonth() === today.getMonth() &&
                                    currentMonth.getFullYear() === today.getFullYear();

                                return (
                                    <div
                                        key={index}
                                        className={`p-3 text-center rounded-lg text-sm h-16 flex flex-col items-center justify-center transition-colors ${
                                            !isCurrentMonth
                                                ? 'bg-gray-100 dark:bg-gray-800 text-muted-foreground'
                                                : isToday
                                                ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                                                : attendance
                                                ? 'bg-green-100 dark:bg-green-900 border border-green-500'
                                                : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        {isCurrentMonth && (
                                            <>
                                                <span className="font-semibold">{dayNum}</span>
                                                {attendance && (
                                                    <span className="text-xs text-green-700 dark:text-green-300 mt-1">
                                                        ✓
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex gap-4 text-xs mt-4 pt-4 border-t">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 rounded" />
                                <span className="text-muted-foreground">Today</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-100 dark:bg-green-900 border border-green-500 rounded" />
                                <span className="text-muted-foreground">Timed In/Out</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
