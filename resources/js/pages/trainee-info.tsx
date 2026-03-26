import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';
import { Edit2, Save, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Trainee Information',
        href: '#',
    },
];

interface TraineeData {
    trainee_name: string | null;
    course_qualification: string | null;
    agency_company: string | null;
    on_site_supervisor: string | null;
    ojt_start_date: string | null;
    ojt_end_date: string | null;
    ojt_total_hours: number;
}

export default function TraineeInfo() {
    const page = usePage<any>();
    const user = page.props?.auth?.user as any;
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<TraineeData>({
        trainee_name: user?.trainee_name || '',
        course_qualification: user?.course_qualification || '',
        agency_company: user?.agency_company || '',
        on_site_supervisor: user?.on_site_supervisor || '',
        ojt_start_date: user?.ojt_start_date || '',
        ojt_end_date: user?.ojt_end_date || '',
        ojt_total_hours: user?.ojt_total_hours || 160,
    });

    const [originalData, setOriginalData] = useState(formData);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            const response = await fetch('/api/user/trainee-info', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update trainee information');
            }

            setOriginalData(formData);
            setIsEditing(false);
            
            // Show success message
            window.location.reload();
        } catch (error) {
            console.error('Error saving trainee info:', error);
            alert('Failed to save trainee information');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData(originalData);
        setIsEditing(false);
    };

    const calculateOjtProgress = () => {
        if (!formData.ojt_start_date || !formData.ojt_end_date) return 0;
        
        const start = new Date(formData.ojt_start_date).getTime();
        const end = new Date(formData.ojt_end_date).getTime();
        const now = new Date().getTime();
        
        if (now < start) return 0;
        if (now > end) return 100;
        
        return Math.round(((now - start) / (end - start)) * 100);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trainee Information" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                
                {/* Header with Edit Button */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Trainee Information</h1>
                    {!isEditing && (
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="gap-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </Button>
                    )}
                </div>

                {/* Trainee Info Card */}
                <Card className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Trainee Name */}
                        <div className="space-y-2">
                            <Label htmlFor="trainee_name" className="text-base font-semibold">
                                Name of Trainee
                            </Label>
                            {!isEditing ? (
                                <p className="text-lg text-gray-700 dark:text-gray-300 p-2 rounded bg-gray-50 dark:bg-gray-800">
                                    {formData.trainee_name || 'Not set'}
                                </p>
                            ) : (
                                <Input
                                    id="trainee_name"
                                    name="trainee_name"
                                    value={formData.trainee_name || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                />
                            )}
                        </div>

                        {/* Course/Qualification */}
                        <div className="space-y-2">
                            <Label htmlFor="course_qualification" className="text-base font-semibold">
                                Course / Qualification
                            </Label>
                            {!isEditing ? (
                                <p className="text-lg text-gray-700 dark:text-gray-300 p-2 rounded bg-gray-50 dark:bg-gray-800">
                                    {formData.course_qualification || 'Not set'}
                                </p>
                            ) : (
                                <Input
                                    id="course_qualification"
                                    name="course_qualification"
                                    value={formData.course_qualification || ''}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Bachelor of Science in Computer Engineering"
                                />
                            )}
                        </div>

                        {/* Agency/Company */}
                        <div className="space-y-2">
                            <Label htmlFor="agency_company" className="text-base font-semibold">
                                Agency / Company
                            </Label>
                            {!isEditing ? (
                                <p className="text-lg text-gray-700 dark:text-gray-300 p-2 rounded bg-gray-50 dark:bg-gray-800">
                                    {formData.agency_company || 'Not set'}
                                </p>
                            ) : (
                                <Input
                                    id="agency_company"
                                    name="agency_company"
                                    value={formData.agency_company || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter company name"
                                />
                            )}
                        </div>

                        {/* On-site Supervisor */}
                        <div className="space-y-2">
                            <Label htmlFor="on_site_supervisor" className="text-base font-semibold">
                                On-Site Supervisor
                            </Label>
                            {!isEditing ? (
                                <p className="text-lg text-gray-700 dark:text-gray-300 p-2 rounded bg-gray-50 dark:bg-gray-800">
                                    {formData.on_site_supervisor || 'Not set'}
                                </p>
                            ) : (
                                <Input
                                    id="on_site_supervisor"
                                    name="on_site_supervisor"
                                    value={formData.on_site_supervisor || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter supervisor name"
                                />
                            )}
                        </div>
                    </div>
                </Card>

                {/* OJT Schedule Card */}
                <Card className="p-6 space-y-6">
                    <h2 className="text-xl font-bold">OJT Schedule</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* OJT Start Date */}
                        <div className="space-y-2">
                            <Label htmlFor="ojt_start_date" className="text-base font-semibold">
                                OJT Start Date
                            </Label>
                            {!isEditing ? (
                                <p className="text-lg text-gray-700 dark:text-gray-300 p-2 rounded bg-gray-50 dark:bg-gray-800">
                                    {formData.ojt_start_date 
                                        ? new Date(formData.ojt_start_date).toLocaleDateString()
                                        : 'Not set'}
                                </p>
                            ) : (
                                <Input
                                    id="ojt_start_date"
                                    name="ojt_start_date"
                                    type="date"
                                    value={formData.ojt_start_date || ''}
                                    onChange={handleInputChange}
                                />
                            )}
                        </div>

                        {/* OJT End Date */}
                        <div className="space-y-2">
                            <Label htmlFor="ojt_end_date" className="text-base font-semibold">
                                OJT End Date
                            </Label>
                            {!isEditing ? (
                                <p className="text-lg text-gray-700 dark:text-gray-300 p-2 rounded bg-gray-50 dark:bg-gray-800">
                                    {formData.ojt_end_date 
                                        ? new Date(formData.ojt_end_date).toLocaleDateString()
                                        : 'Not set'}
                                </p>
                            ) : (
                                <Input
                                    id="ojt_end_date"
                                    name="ojt_end_date"
                                    type="date"
                                    value={formData.ojt_end_date || ''}
                                    onChange={handleInputChange}
                                />
                            )}
                        </div>

                        {/* OJT Total Hours */}
                        <div className="space-y-2">
                            <Label htmlFor="ojt_total_hours" className="text-base font-semibold">
                                OJT Total Hours Required
                            </Label>
                            {!isEditing ? (
                                <p className="text-lg text-gray-700 dark:text-gray-300 p-2 rounded bg-gray-50 dark:bg-gray-800">
                                    {formData.ojt_total_hours} hours
                                </p>
                            ) : (
                                <Input
                                    id="ojt_total_hours"
                                    name="ojt_total_hours"
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={formData.ojt_total_hours}
                                    onChange={handleInputChange}
                                />
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">
                                OJT Progress
                            </Label>
                            <div className="space-y-2">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${calculateOjtProgress()}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {calculateOjtProgress()}% Complete
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Action Buttons */}
                {isEditing && (
                    <div className="flex gap-3 justify-end">
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="gap-2"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
