import { Head, usePage, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';
import { Users, Clock, CheckCircle, AlertCircle, BarChart3, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface PageProps {
    props: {
        totalTrainees: number;
        totalAttendanceRecords: number;
        todayTimedIn: number;
        todayTimedOut: number;
        recentAttendance: any[];
        trainees: any[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

export default function AdminDashboard() {
    const page = usePage();
    const props = (page.props as any);

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredTrainees, setFilteredTrainees] = useState<any[]>(props.trainees || []);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const filtered = props.trainees.filter(
            (trainee: any) =>
                trainee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trainee.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTrainees(filtered);
        setCurrentPage(1);
    }, [searchTerm, props.trainees]);

    const totalPages = Math.ceil(filteredTrainees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTrainees = filteredTrainees.slice(startIndex, endIndex);

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-green-500';
        if (percentage >= 75) return 'bg-blue-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getProgressStatus = (percentage: number) => {
        if (percentage >= 100) return 'text-green-600 dark:text-green-400';
        if (percentage >= 75) return 'text-blue-600 dark:text-blue-400';
        if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Admin Navigation */}
                <div className="flex gap-2 mb-2">
                    <a
                        href="/admin/dashboard"
                        className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-200 font-medium text-sm"
                    >
                        Dashboard
                    </a>
                    <a
                        href="/admin/dtr-management"
                        className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm transition-colors"
                    >
                        DTR Management
                    </a>
                </div>

                {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Trainees */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Total Trainees</p>
                                <p className="text-3xl font-bold">{props.totalTrainees}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-500 opacity-50" />
                        </div>
                    </Card>

                    {/* Total Attendance Records */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Total Records</p>
                                <p className="text-3xl font-bold">{props.totalAttendanceRecords}</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-purple-500 opacity-50" />
                        </div>
                    </Card>

                    {/* Today's Time In */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Timed In Today</p>
                                <p className="text-3xl font-bold">{props.todayTimedIn}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                        </div>
                    </Card>

                    {/* Today's Time Out */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Timed Out Today</p>
                                <p className="text-3xl font-bold">{props.todayTimedOut}</p>
                            </div>
                            <Clock className="w-8 h-8 text-orange-500 opacity-50" />
                        </div>
                    </Card>
                </div>

                {/* Trainees with OJT Progress */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Trainees OJT Progress</h3>
                            <Input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64"
                            />
                        </div>

                        {filteredTrainees.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No trainees found</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">Name</th>
                                            <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">Email</th>
                                            <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">Course</th>
                                            <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">Hours Worked</th>
                                            <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">Progress</th>
                                            <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">Status</th>
                                            <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTrainees.map((trainee) => (
                                            <tr key={trainee.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="py-3 px-2 text-sm font-medium">{trainee.name}</td>
                                                <td className="py-3 px-2 text-sm text-muted-foreground">{trainee.email}</td>
                                                <td className="py-3 px-2 text-sm text-muted-foreground">{trainee.course || 'N/A'}</td>
                                                <td className="py-3 px-2 text-sm font-medium">
                                                    {trainee.total_hours_worked} / {trainee.ojt_total_hours} hrs
                                                </td>
                                                <td className="py-3 px-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all ${getProgressColor(trainee.progress_percentage)}`}
                                                                style={{
                                                                    width: `${Math.min(trainee.progress_percentage, 100)}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className={`text-sm font-medium ${getProgressStatus(trainee.progress_percentage)}`}>
                                                            {trainee.progress_percentage.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2">
                                                    {trainee.progress_percentage >= 100 ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-2 py-1 rounded">
                                                            <CheckCircle className="w-3 h-3" /> Completed
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 px-2 py-1 rounded">
                                                            <TrendingUp className="w-3 h-3" /> In Progress
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-2">
                                                    <Link href={`/admin/dtr-management?trainee_id=${trainee.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            View Details
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {filteredTrainees.length > 0 && (
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                        <p className="text-sm text-muted-foreground">
                                            Showing {startIndex + 1} to {Math.min(endIndex, filteredTrainees.length)} of {filteredTrainees.length}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                    <Button
                                                        key={page}
                                                        variant={currentPage === page ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => setCurrentPage(page)}
                                                        className="w-8"
                                                    >
                                                        {page}
                                                    </Button>
                                                ))}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Recent Attendance Records */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Recent Attendance Records</h3>

                        {props.recentAttendance.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No attendance records found</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">Trainee</th>
                                            <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">Date</th>
                                            <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">Time In</th>
                                            <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">Time Out</th>
                                            <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">Hours Worked</th>
                                            <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">Overtime</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {props.recentAttendance.map((record: any) => {
                                            const hoursWorked =
                                                record.time_in && record.time_out
                                                    ? (() => {
                                                          const [inHours, inMinutes] = record.time_in.split(':').map(Number);
                                                          const [outHours, outMinutes] = record.time_out.split(':').map(Number);
                                                          let hours = outHours - inHours;
                                                          let minutes = outMinutes - inMinutes;
                                                          if (minutes < 0) {
                                                              hours--;
                                                              minutes += 60;
                                                          }
                                                          return `${hours}h ${minutes}m`;
                                                      })()
                                                    : '--';

                                            return (
                                                <tr key={record.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <td className="py-3 px-2 text-sm font-medium">{record.user?.trainee_name || record.user?.name}</td>
                                                    <td className="py-3 px-2 text-sm text-muted-foreground">
                                                        {new Date(record.attendance_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 px-2 text-sm">{record.time_in || '--'}</td>
                                                    <td className="py-3 px-2 text-sm">{record.time_out || '--'}</td>
                                                    <td className="py-3 px-2 text-sm font-medium">{hoursWorked}</td>
                                                    <td className="py-3 px-2">
                                                        {record.is_overtime ? (
                                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 px-2 py-1 rounded">
                                                                <AlertCircle className="w-3 h-3" /> Yes
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">No</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
