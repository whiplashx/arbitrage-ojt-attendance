import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';
import { Download, Edit2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Attendance Records',
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
    notes: string | null;
}

export default function AttendanceRecords() {
    const page = usePage<any>();
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingTask, setEditingTask] = useState<string>('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [filterMonth, setFilterMonth] = useState<string>('');
    const [totalHours, setTotalHours] = useState<number>(0);

    useEffect(() => {
        fetchAttendanceRecords();
    }, []);

    const fetchAttendanceRecords = async () => {
        try {
            const response = await fetch('/api/attendance/all');
            if (response.ok) {
                const data = await response.json();
                setAttendanceRecords(data.data || []);
                calculateTotalHours(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching attendance records:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalHours = (records: AttendanceRecord[]) => {
        let total = 0;
        records.forEach(record => {
            if (record.time_in && record.time_out) {
                const hours = calculateHoursWorked(record.time_in, record.time_out);
                total += parseFloat(hours);
            }
        });
        setTotalHours(total);
    };

    const calculateHoursWorked = (timeIn: string, timeOut: string): string => {
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
                diffMs += 24 * 60 * 60 * 1000; // Handle day wraparound
            }
            
            const hours = diffMs / (1000 * 60 * 60);
            return (Math.round(hours * 100) / 100).toFixed(2);
        } catch (error) {
            console.error('Error calculating hours:', error);
            return '0.00';
        }
    };

    const handleEditTask = (record: AttendanceRecord) => {
        setEditingId(record.id);
        setEditingTask(record.daily_task || '');
    };

    const handleSaveTask = async () => {
        if (editingId === null) return;

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            const response = await fetch(`/api/attendance/${editingId}/task`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                body: JSON.stringify({
                    daily_task: editingTask,
                }),
            });

            if (response.ok) {
                setAttendanceRecords(prev =>
                    prev.map(record =>
                        record.id === editingId
                            ? { ...record, daily_task: editingTask }
                            : record
                    )
                );
                setEditingId(null);
                setEditingTask('');
            } else {
                alert('Failed to save daily task');
            }
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Error saving daily task');
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditingTask('');
    };

    const exportToCsv = () => {
        if (attendanceRecords.length === 0) {
            alert('No records to export');
            return;
        }

        try {
            const headers = ['Date', 'Time In', 'Time Out', 'Hours Worked', 'Overtime', 'Daily Task'];
            
            const rows = attendanceRecords.map((record) => {
                const hours = calculateHoursWorked(record.time_in, record.time_out);
                const date = new Date(record.attendance_date);
                const dateStr = date.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                });

                return [
                    dateStr,
                    record.time_in,
                    record.time_out,
                    hours,
                    record.is_overtime ? 'Yes' : 'No',
                    record.daily_task || ''
                ];
            });

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `attendance-records-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Failed to export records');
        }
    };

    const filteredRecords = filterMonth
        ? attendanceRecords.filter(record => record.attendance_date.startsWith(filterMonth))
        : attendanceRecords;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance Records" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Attendance Records</h1>
                    <Button
                        onClick={exportToCsv}
                        disabled={attendanceRecords.length === 0}
                        className="gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Summary Card */}
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {attendanceRecords.length}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hours Worked</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {totalHours.toFixed(2)}h
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overtime Records</p>
                            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                {attendanceRecords.filter(r => r.is_overtime).length}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Filter */}
                <div className="flex gap-2">
                    <Label className="text-base font-semibold self-center">Filter by Month:</Label>
                    <Input
                        type="month"
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="w-40"
                    />
                    {filterMonth && (
                        <Button
                            onClick={() => setFilterMonth('')}
                            variant="outline"
                        >
                            Clear Filter
                        </Button>
                    )}
                </div>

                {/* Records List */}
                <div className="space-y-3">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading records...</p>
                    ) : filteredRecords.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No attendance records found</p>
                    ) : (
                        filteredRecords.map((record) => {
                            const hours = calculateHoursWorked(record.time_in, record.time_out);
                            const date = new Date(record.attendance_date);
                            const dateStr = date.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            });
                            const isExpanded = expandedId === record.id;

                            return (
                                <Card key={record.id} className="overflow-hidden">
                                    <div
                                        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        onClick={() => setExpandedId(isExpanded ? null : record.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-semibold text-lg">{dateStr}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {record.time_in} - {record.time_out}
                                                </p>
                                            </div>
                                            <div className="text-right mr-4">
                                                <p className="font-bold text-green-600 dark:text-green-400">
                                                    {hours}h
                                                </p>
                                                {record.is_overtime && (
                                                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                                        Overtime
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-gray-400">
                                                {isExpanded ? (
                                                    <ChevronUp className="w-5 h-5" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                                            {/* Daily Task */}
                                            <div className="space-y-2">
                                                <Label className="text-base font-semibold">Daily Task</Label>
                                                {editingId === record.id ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            value={editingTask}
                                                            onChange={(e) => setEditingTask(e.target.value)}
                                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 min-h-24"
                                                            placeholder="Enter daily task description..."
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button
                                                                onClick={handleSaveTask}
                                                                size="sm"
                                                                className="gap-2"
                                                            >
                                                                <Save className="w-4 h-4" />
                                                                Save
                                                            </Button>
                                                            <Button
                                                                onClick={handleCancel}
                                                                variant="outline"
                                                                size="sm"
                                                                className="gap-2"
                                                            >
                                                                <X className="w-4 h-4" />
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-gray-700 dark:text-gray-300 p-3 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 min-h-20">
                                                            {record.daily_task || <span className="text-gray-400 italic">No task recorded</span>}
                                                        </p>
                                                        <Button
                                                            onClick={() => handleEditTask(record)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-2 mt-2"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                            Edit Task
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Notes */}
                                            {record.notes && (
                                                <div className="space-y-2">
                                                    <Label className="text-base font-semibold">Notes</Label>
                                                    <p className="text-gray-700 dark:text-gray-300 p-3 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                        {record.notes}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Details */}
                                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Hours Worked</p>
                                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{hours} hours</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">Status</p>
                                                    <p className={`text-lg font-bold ${record.is_overtime ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                        {record.is_overtime ? 'Overtime' : 'Regular'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
