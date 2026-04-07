import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';
import { Download, Search, Loader, Printer, ChevronLeft, ChevronRight } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'DTR Management',
        href: '/admin/dtr-management',
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

interface TraineeData {
    id: number;
    name: string;
    trainee_name: string;
    email: string;
    course_qualification: string;
    agency_company: string;
    on_site_supervisor: string;
}

export default function AdminDTRManagement() {
    const page = usePage<any>();
    const [trainees, setTrainees] = useState<TraineeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredTrainees, setFilteredTrainees] = useState<TraineeData[]>([]);
    const [selectedTrainee, setSelectedTrainee] = useState<TraineeData | null>(null);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>(
        new Date().toISOString().substring(0, 7)
    );
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [showAllRecords, setShowAllRecords] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch all trainees on mount
    useEffect(() => {
        fetchTrainees();
    }, []);

    // Check if trainee_id is in URL params and auto-select
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const traineeId = params.get('trainee_id');
        if (traineeId && trainees.length > 0) {
            const traineeToSelect = trainees.find(t => t.id === parseInt(traineeId));
            if (traineeToSelect) {
                setSelectedTrainee(traineeToSelect);
                // Remove query param from URL for cleaner navigation
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, [trainees]);

    // Fetch attendance records when trainee or month changes
    useEffect(() => {
        if (selectedTrainee) {
            fetchAttendanceRecords();
        }
    }, [selectedTrainee, selectedMonth, showAllRecords]);

    const fetchTrainees = async () => {
        try {
            const response = await fetch('/admin/api/trainees');
            if (response.ok) {
                const data = await response.json();
                setTrainees(data.data || []);
                setFilteredTrainees(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching trainees:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceRecords = async () => {
        if (!selectedTrainee) return;
        
        setLoadingRecords(true);
        try {
            const endpoint = showAllRecords 
                ? '/api/attendance/all' 
                : `/api/attendance/month/${selectedMonth}`;
            
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'X-Trainee-ID': selectedTrainee.id.toString(),
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                setAttendanceRecords(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching attendance records:', error);
        } finally {
            setLoadingRecords(false);
        }
    };

    // Filter trainees based on search
    useEffect(() => {
        const filtered = trainees.filter(
            (trainee) =>
                (trainee.trainee_name?.toLowerCase() || trainee.name.toLowerCase()).includes(searchTerm.toLowerCase()) ||
                trainee.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTrainees(filtered);
        setCurrentPage(1);
    }, [searchTerm, trainees]);

    const totalPages = Math.ceil(filteredTrainees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTrainees = filteredTrainees.slice(startIndex, endIndex);

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
        return `${hoursStr}:${minutes_val.padStart(2, '0')}`;
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

    const formatTimeShort = (timeStr: string): string => {
        if (!timeStr) return '--';
        try {
            // Format is HH:MM:SS, we want HH:MM
            const parts = timeStr.split(':');
            return `${parts[0]}:${parts[1]}`;
        } catch (error) {
            return timeStr;
        }
    };

    const calculateTotalHours = (): number => {
        let total = 0;
        attendanceRecords.forEach((record) => {
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
        if (!selectedTrainee || attendanceRecords.length === 0) {
            alert('Please select a trainee and ensure there are records for this month');
            return;
        }

        try {
            const headers = ['Date', 'Time In', 'Time Out', 'Overtime', 'Daily Task'];

            const rows = attendanceRecords.map((record) => {
                const date = new Date(record.attendance_date);
                const dateStr = date.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                });

                const overtime = calculateOvertime(record.time_in, record.time_out);

                return [dateStr, record.time_in, record.time_out, overtime, record.daily_task || ''];
            });

            const csvContent = [
                `Name of Trainee: ${selectedTrainee.trainee_name || selectedTrainee.name}`,
                `Course/Qualification: ${selectedTrainee.course_qualification || 'Not Set'}`,
                `Agency/Company: ${selectedTrainee.agency_company || 'Not Set'}`,
                `On-Site Supervisor: ${selectedTrainee.on_site_supervisor || 'Not Set'}`,
                `for the month of ${getMonthYear()}`,
                '',
                headers.join(','),
                ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
                '',
                `Total Hours: ${calculateTotalHours().toFixed(2)}`,
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `dtr-${selectedTrainee.trainee_name || selectedTrainee.name}-${selectedMonth}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Error exporting CSV');
        }
    };

    const handlePrint = () => {
        if (!selectedTrainee || attendanceRecords.length === 0) {
            alert('Please select a trainee and ensure there are records for this month');
            return;
        }

        // Create print HTML content
        const generatePrintContent = () => {
            const RECORDS_PER_PAGE = 20;
            const totalPages = Math.ceil(attendanceRecords.length / RECORDS_PER_PAGE);
            const pages = Array.from({ length: totalPages }, (_, i) =>
                attendanceRecords.slice(i * RECORDS_PER_PAGE, (i + 1) * RECORDS_PER_PAGE)
            );

            return `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>DTR - ${selectedTrainee.trainee_name || selectedTrainee.name}</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                        }
                        
                        body {
                            font-family: Arial, sans-serif;
                            background: white;
                            padding: 0;
                        }
                        
                        .page {
                            page-break-after: always;
                            padding: 0.5in;
                            width: 8.5in;
                            height: 11in;
                            box-sizing: border-box;
                            background: white;
                        }
                        
                        .page:last-child {
                            page-break-after: avoid;
                        }
                        
                        .letterhead {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 0.3in;
                            border-bottom: 3px solid #0052cc;
                            padding-bottom: 0.3in;
                            margin-bottom: 0.4in;
                        }
                        
                        .letterhead img {
                            height: 0.8in;
                            width: auto;
                        }
                        
                        .letterhead-text {
                            text-align: center;
                        }
                        
                        .letterhead-text h2 {
                            font-size: 18px;
                            font-weight: bold;
                            color: #0052cc;
                            margin: 0;
                        }
                        
                        .letterhead-text p {
                            font-size: 11px;
                            color: #666;
                            margin: 2px 0 0 0;
                        }
                        
                        .header {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            gap: 0.5in;
                            border-bottom: 2px solid black;
                            padding-bottom: 0.2in;
                            margin-bottom: 0.2in;
                        }
                        
                        .header img {
                            height: 1.2in;
                            width: auto;
                            flex-shrink: 0;
                        }
                        
                        .header-content {
                            font-size: 11px;
                            line-height: 1.1;
                            color: #333;
                            text-align: right;
                            flex-shrink: 0;
                        }
                        
                        .header-content p {
                            margin: 0;
                            padding: 0;
                        }
                        
                        .header h1 {
                            font-size: 24px;
                            font-weight: bold;
                            margin-bottom: 0.1in;
                        }
                        
                        .header p {
                            font-size: 12px;
                            margin-bottom: 0.1in;
                        }
                        
                        .trainee-info {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 0.3in;
                            font-size: 12px;
                            margin-bottom: 0.2in;
                        }
                        
                        .trainee-info div {
                            display: flex;
                            flex-direction: column;
                            gap: 0.05in;
                        }
                        
                        .trainee-info p {
                            line-height: 1.4;
                        }
                        
                        .trainee-info strong {
                            font-weight: bold;
                        }
                        
                        .page-indicator {
                            font-size: 12px;
                            color: #666;
                            margin-bottom: 0.2in;
                        }
                        
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 12px;
                            margin-bottom: 0.2in;
                        }
                        
                        thead {
                            display: table-header-group;
                            background-color: #f3f3f3;
                        }
                        
                        th {
                            border: 1px solid black;
                            padding: 8px;
                            text-align: left;
                            font-weight: bold;
                            background-color: #f3f3f3;
                            font-size: 12px;
                        }
                        
                        td {
                            border: 1px solid #ccc;
                            padding: 6px;
                            text-align: left;
                        }
                        
                        tr {
                            page-break-inside: avoid;
                        }
                        
                        td:nth-child(2),
                        td:nth-child(3),
                        td:nth-child(4),
                        td:nth-child(5) {
                            text-align: center;
                        }
                        
                        th:nth-child(2),
                        th:nth-child(3),
                        th:nth-child(4),
                        th:nth-child(5) {
                            text-align: center;
                        }
                        
                        .footer {
                            margin-top: 0.2in;
                            padding-top: 0.2in;
                            border-top: 1px solid #ccc;
                            font-size: 12px;
                        }
                        
                        @media print {
                            body {
                                margin: 0;
                                padding: 0;
                            }
                            .page {
                                padding: 0.5in;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${pages.map((pageRecords, pageIndex) => {
                        const recordsHTML = pageRecords.map((record) => {
                            const date = new Date(record.attendance_date);
                            const dateStr = date.toLocaleDateString('en-US', {
                                month: '2-digit',
                                day: '2-digit',
                                year: 'numeric',
                            });
                            const hoursWorked = calculateHoursWorked(record.time_in, record.time_out);
                            const overtime = calculateOvertime(record.time_in, record.time_out);
                            return `
                                <tr>
                                    <td>${dateStr}</td>
                                    <td>${formatTimeShort(record.time_in)}</td>
                                    <td>${formatTimeShort(record.time_out)}</td>
                                    <td>${formatHours(hoursWorked)}</td>
                                    <td>${overtime}</td>
                                    <td>${record.daily_task || ''}</td>
                                </tr>
                            `;
                        }).join('');

                        return `
                            <div class="page">
                                ${pageIndex === 0 ? `
                                    <div class="header">
                                        <img src="/logo/ArbitrageIncc.png" alt="Arbitrage Incorporated Logo" />
                                        <div class="header-content">
                                            <p>193 Heroes Bldg E. Beltran St.<br/>Bgy Katipunan<br/>Quezon City, Philippines<br/><br/>Email: info@arbitrage.com.ph</p>
                                        </div>
                                    </div>
                                    
                                    <div class="trainee-info">
                                        <div>
                                            <p><strong>Name of Trainee:</strong> ${selectedTrainee.trainee_name || selectedTrainee.name}</p>
                                            <p><strong>Course/Qualification:</strong> ${selectedTrainee.course_qualification || 'Not Set'}</p>
                                        </div>
                                        <div>
                                            <p><strong>Agency/Company:</strong> ${selectedTrainee.agency_company || 'Not Set'}</p>
                                            <p><strong>On-Site Supervisor:</strong> ${selectedTrainee.on_site_supervisor || 'Not Set'}</p>
                                        </div>
                                    </div>
                                ` : ''}
                                
                                ${totalPages > 1 ? `<div class="page-indicator">Page ${pageIndex + 1} of ${totalPages}</div>` : ''}
                                
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Time In</th>
                                            <th>Time Out</th>
                                            <th>Hours Worked</th>
                                            <th>Overtime</th>
                                            <th>Daily Task</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${recordsHTML}
                                    </tbody>
                                </table>
                                
                                ${pageIndex === pages.length - 1 ? `
                                    <div class="footer">
                                        <p><strong>Total Hours :</strong> ${formatHours(calculateTotalHours())}</p>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </body>
                </html>
            `;
        };

        // Create iframe for printing
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write(generatePrintContent());
            printWindow.document.close();
            printWindow.focus();
            
            // Print after content is loaded
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="DTR Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold mb-2">Daily Time Record Management</h1>
                    <p className="text-sm text-muted-foreground">
                        Select a trainee to view and export their daily time records
                    </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
                    {/* Left Column: Trainee List */}
                    <Card className="lg:col-span-1 p-6 flex flex-col">
                        <h2 className="text-lg font-semibold mb-4">Trainees</h2>

                        <div className="mb-4">
                            <Input
                                type="text"
                                placeholder="Search trainee..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredTrainees.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No trainees found</p>
                        ) : (
                            <div className="space-y-2 overflow-y-auto flex-1">
                                {paginatedTrainees.map((trainee) => (
                                    <button
                                        key={trainee.id}
                                        onClick={() => setSelectedTrainee(trainee)}
                                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                            selectedTrainee?.id === trainee.id
                                                ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <p className="font-medium text-sm">{trainee.trainee_name || trainee.name}</p>
                                        <p className="text-xs text-muted-foreground">{trainee.email}</p>
                                    </button>
                                ))}

                                {filteredTrainees.length > 0 && (
                                    <div className="mt-4 pt-4 border-t space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="flex-1"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                            <span className="text-xs text-muted-foreground text-center">
                                                {currentPage} / {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className="flex-1"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground text-center">
                                            {startIndex + 1}-{Math.min(endIndex, filteredTrainees.length)} of {filteredTrainees.length}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* Right Column: Records */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        {selectedTrainee ? (
                            <>
                                {/* Trainee Details Card */}
                                <Card className="p-6">
                                    <h3 className="font-semibold text-lg mb-4">
                                        {selectedTrainee.trainee_name || selectedTrainee.name}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Email</p>
                                            <p className="font-medium">{selectedTrainee.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Course</p>
                                            <p className="font-medium">{selectedTrainee.course_qualification || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Agency</p>
                                            <p className="font-medium">{selectedTrainee.agency_company || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Supervisor</p>
                                            <p className="font-medium">{selectedTrainee.on_site_supervisor || 'N/A'}</p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Month Selection and Export */}
                                <Card className="p-6">
                                    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={showAllRecords}
                                                onChange={(e) => setShowAllRecords(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                                            />
                                            <span className="text-sm font-medium">Show all attendances (ignore month selection)</span>
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex-1">
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Select Month
                                            </label>
                                            <input
                                                type="month"
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                                disabled={showAllRecords}
                                                className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-sm disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-400"
                                            />
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <Button
                                                onClick={handlePrint}
                                                disabled={loadingRecords || attendanceRecords.length === 0}
                                                className="gap-2"
                                                variant="outline"
                                            >
                                                <Printer className="w-4 h-4" />
                                                Print Preview
                                            </Button>
                                            <Button
                                                onClick={handleExportCsv}
                                                disabled={loadingRecords || attendanceRecords.length === 0}
                                                className="gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                Export CSV
                                            </Button>
                                        </div>
                                    </div>
                                </Card>

                                {/* Records Table */}
                                <Card className="p-6 flex-1">
                                    <h3 className="font-semibold text-lg mb-4">
                                        Records {showAllRecords ? '(All Time)' : `for ${getMonthYear()}`}
                                    </h3>

                                    {loadingRecords ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : attendanceRecords.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            {showAllRecords ? 'No attendance records found' : 'No records found for this month'}
                                        </p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed' }}>
                                                <colgroup>
                                                    <col style={{ width: '90px' }} />
                                                    <col style={{ width: '80px' }} />
                                                    <col style={{ width: '80px' }} />
                                                    <col style={{ width: '100px' }} />
                                                    <col style={{ width: '90px' }} />
                                                    <col style={{ width: 'auto' }} />
                                                </colgroup>
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left font-medium text-muted-foreground py-3 px-2 whitespace-nowrap">
                                                            Date
                                                        </th>
                                                        <th className="text-left font-medium text-muted-foreground py-3 px-2 whitespace-nowrap">
                                                            Time In
                                                        </th>
                                                        <th className="text-left font-medium text-muted-foreground py-3 px-2 whitespace-nowrap">
                                                            Time Out
                                                        </th>
                                                        <th className="text-left font-medium text-muted-foreground py-3 px-2 whitespace-nowrap">
                                                            Hours Worked
                                                        </th>
                                                        <th className="text-left font-medium text-muted-foreground py-3 px-2 whitespace-nowrap">
                                                            Overtime
                                                        </th>
                                                        <th className="text-left font-medium text-muted-foreground py-3 px-2">
                                                            Daily Task
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {attendanceRecords && attendanceRecords.length > 0 ? (
                                                        attendanceRecords.map((record, recordIndex) => {
                                                            // Format date
                                                            const date = new Date(record.attendance_date);
                                                            const dateStr = date.toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            });

                                                            // Calculate hours and overtime
                                                            const hoursWorked = record.time_in && record.time_out 
                                                                ? formatHours(calculateHoursWorked(record.time_in, record.time_out))
                                                                : '--';

                                                            const overtime = record.time_in && record.time_out 
                                                                ? calculateOvertime(record.time_in, record.time_out)
                                                                : '--';

                                                            // Render overtime badge or placeholder
                                                            const renderOvertimeBadge = () => {
                                                                if (overtime && overtime !== '--') {
                                                                    return (
                                                                        <span className="text-xs bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 px-2 py-1 rounded inline-block whitespace-nowrap">
                                                                            {overtime}
                                                                        </span>
                                                                    );
                                                                }
                                                                return (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {overtime === '--' ? '--' : 'None'}
                                                                    </span>
                                                                );
                                                            };

                                                            return (
                                                                <tr
                                                                    key={`record-${record.id}-${recordIndex}`}
                                                                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                                >
                                                                    <td className="py-3 px-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis">{dateStr}</td>
                                                                    <td className="py-3 px-2 text-sm font-mono whitespace-nowrap overflow-hidden text-ellipsis">{formatTimeShort(record.time_in)}</td>
                                                                    <td className="py-3 px-2 text-sm font-mono whitespace-nowrap overflow-hidden text-ellipsis">{formatTimeShort(record.time_out)}</td>
                                                                    <td className="py-3 px-2 font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">{hoursWorked}</td>
                                                                    <td className="py-3 px-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                                                        {renderOvertimeBadge()}
                                                                    </td>
                                                                    <td className="py-3 px-2 text-muted-foreground text-sm" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                                                                        {record.daily_task ? (
                                                                            <span>{record.daily_task}</span>
                                                                        ) : (
                                                                            <span className="text-gray-400 italic">--</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : null}
                                                </tbody>
                                            </table>

                                            {/* Summary */}
                                            <div className="mt-6 pt-4 border-t">
                                                <div className="text-right">
                                                    <p className="text-sm text-muted-foreground">
                                                        Total Hours Worked:
                                                    </p>
                                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                        {calculateTotalHours().toFixed(2)} hours
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </>
                        ) : (
                            <Card className="p-6 flex items-center justify-center text-center h-full">
                                <div>
                                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <p className="text-muted-foreground">Select a trainee to view their records</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Print-Only Document Container - No longer needed with window.open approach */}
            {/* Removed - using window.open() for printing instead */}
        </AdminLayout>
    );
}
