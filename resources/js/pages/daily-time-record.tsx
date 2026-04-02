import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types';
import { Download } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Daily Time Record',
        href: '#',
    },
];

interface AttendanceRecord {
    id: number;
    attendance_date: string;
    time_in: string;
    time_out: string;
    is_overtime: boolean;
    daily_task: string | null;
}

export default function DailyTimeRecord() {
    const page = usePage<any>();
    const user = page.props?.auth?.user as any;
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string>(
        new Date().toISOString().substring(0, 7)
    );

    useEffect(() => {
        fetchAttendanceRecords();
    }, [selectedMonth]);

    const fetchAttendanceRecords = async () => {
        try {
            const response = await fetch(`/api/attendance/month/${selectedMonth}`);
            if (response.ok) {
                const data = await response.json();
                setAttendanceRecords(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching attendance records:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateHoursWorked = (timeIn: string, timeOut: string): number => {
        try {
            const parseTime = (timeStr: string): Date => {
                const [hours, minutes, seconds] = timeStr.split(':').map(Number);
                const date = new Date();
                date.setHours(hours, minutes, seconds || 0, 0);
                return date;
            };

            const timeInDate = parseTime(timeIn);
            const timeOutDate = parseTime(timeOut);
            let diffMs = timeOutDate.getTime() - timeInDate.getTime();
            
            if (diffMs < 0) {
                diffMs += 24 * 60 * 60 * 1000;
            }
            
            const hours = diffMs / (1000 * 60 * 60);
            return hours;
        } catch (error) {
            return 0;
        }
    };

    const formatHours = (hours: number): string => {
        const hoursStr = Math.floor(hours).toString();
        const minutes_val = Math.floor((hours % 1) * 60).toString();
        return `${hoursStr}:${minutes_val.padStart(2, '0')}:00 hrs.`;
    };

    const calculateOvertime = (timeIn: string, timeOut: string): string => {
        const hours = calculateHoursWorked(timeIn, timeOut);
        const NORMAL_SHIFT = 8;
        
        if (hours > NORMAL_SHIFT) {
            const overtimeHours = hours - NORMAL_SHIFT;
            return formatHours(overtimeHours);
        }
        return '';
    };

    const calculateTotalHours = (): number => {
        let total = 0;
        attendanceRecords.forEach(record => {
            if (record.time_in && record.time_out) {
                const hours = calculateHoursWorked(record.time_in, record.time_out);
                total += hours;
            }
        });
        return total;
    };

    const getMonthYear = () => {
        const [year, month] = selectedMonth.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
    };

    const handleExportCsv = () => {
        if (attendanceRecords.length === 0) {
            alert('No records to export for this month');
            return;
        }

        try {
            const headers = ['Date', 'Time In', 'Time Out', 'Overtime', 'Daily Task'];
            
            const rows = attendanceRecords.map((record) => {
                const date = new Date(record.attendance_date);
                const dateStr = date.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                });

                const overtime = calculateOvertime(record.time_in, record.time_out);

                return [
                    dateStr,
                    record.time_in,
                    record.time_out,
                    overtime,
                    record.daily_task || ''
                ];
            });

            const csvContent = [
                `Name of Trainee: ${user?.trainee_name || 'Not Set'}`,
                `Course/Qualification: ${user?.course_qualification || 'Not Set'}`,
                `Agency/Company: ${user?.agency_company || 'Not Set'}`,
                `On-Site Supervisor: ${user?.on_site_supervisor || 'Not Set'}`,
                `for the month of ${getMonthYear()}`,
                '',
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
                '',
                `Total Hours: ${calculateTotalHours().toFixed(2)}`
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `daily-time-record-${selectedMonth}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Failed to export records');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daily Time Record" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                
                {/* Header with Controls */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Daily Time Record</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                            for the month of {getMonthYear()}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                        />
                        <Button onClick={handleExportCsv} className="gap-2">
                            <Download className="w-4 h-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Time Record */}
                <Card className="p-6 overflow-x-auto">
                    <div className="space-y-4">
                        {/* Trainee Info Section */}
                        <div className="border border-gray-300 dark:border-gray-600">
                            <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-gray-300 dark:divide-gray-600">
                                <div className="p-3 border-r border-b border-gray-300 dark:border-gray-600">
                                    <p className="text-xs font-bold uppercase">Name of Trainee:</p>
                                </div>
                                <div className="p-3 border-b border-gray-300 dark:border-gray-600">
                                    <p className="text-sm font-semibold">{user?.trainee_name || 'Not Set'}</p>
                                </div>
                                <div className="p-3 border-r border-b border-gray-300 dark:border-gray-600">
                                    <p className="text-xs font-bold uppercase">Course / Qualification:</p>
                                </div>
                                <div className="p-3 border-b border-gray-300 dark:border-gray-600">
                                    <p className="text-sm font-semibold">{user?.course_qualification || 'Not Set'}</p>
                                </div>
                                <div className="p-3 border-r border-b border-gray-300 dark:border-gray-600">
                                    <p className="text-xs font-bold uppercase">Agency / Company:</p>
                                </div>
                                <div className="p-3 border-b border-gray-300 dark:border-gray-600">
                                    <p className="text-sm font-semibold">{user?.agency_company || 'Not Set'}</p>
                                </div>
                                <div className="p-3 border-r border-gray-300 dark:border-gray-600">
                                    <p className="text-xs font-bold uppercase">On-Site Supervisor:</p>
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-semibold">{user?.on_site_supervisor || 'Not Set'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Month Info */}
                        <div className="text-center py-2 border border-gray-300 dark:border-gray-600">
                            <p className="font-semibold">for the month of {getMonthYear()}</p>
                        </div>

                        {/* Attendance Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-gray-800">
                                        <th className="border border-gray-300 dark:border-gray-600 p-2 text-xs font-bold text-center">Date</th>
                                        <th className="border border-gray-300 dark:border-gray-600 p-2 text-xs font-bold text-center">Time In</th>
                                        <th className="border border-gray-300 dark:border-gray-600 p-2 text-xs font-bold text-center">Time Out</th>
                                        <th className="border border-gray-300 dark:border-gray-600 p-2 text-xs font-bold text-center">Overtime</th>
                                        <th className="border border-gray-300 dark:border-gray-600 p-2 text-xs font-bold text-center">Daily Task</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="border border-gray-300 dark:border-gray-600 p-4 text-center">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : attendanceRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="border border-gray-300 dark:border-gray-600 p-4 text-center text-gray-500">
                                                No records for this month
                                            </td>
                                        </tr>
                                    ) : (
                                        attendanceRecords.map((record, index) => {
                                            const date = new Date(record.attendance_date);
                                            const dateStr = date.toLocaleDateString('en-US', {
                                                month: '2-digit',
                                                day: '2-digit',
                                                year: 'numeric'
                                            });
                                            const hoursWorked = record.time_in && record.time_out 
                                                ? formatHours(calculateHoursWorked(record.time_in, record.time_out))
                                                : '';
                                            const overtime = record.time_in && record.time_out 
                                                ? calculateOvertime(record.time_in, record.time_out)
                                                : '';

                                            return (
                                                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-sm">{dateStr}</td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-sm text-center">{record.time_in}</td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-sm text-center">{record.time_out}</td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-sm text-center">{overtime || 'N/A'}</td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-sm">{record.daily_task || ''}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Total Hours */}
                        <div className="border border-gray-300 dark:border-gray-600 p-4">
                            <p className="font-semibold">Total No. of Hours: <span className="text-lg">{calculateTotalHours().toFixed(2)}</span></p>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
