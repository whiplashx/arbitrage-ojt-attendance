import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

let toastId = 0;
const listeners: Set<(toasts: Toast[]) => void> = new Set();
let toasts: Toast[] = [];

export function useToast() {
    const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const listener = (toasts: Toast[]) => {
            setCurrentToasts(toasts);
        };

        listeners.add(listener);
        setCurrentToasts(toasts);

        return () => {
            listeners.delete(listener);
        };
    }, []);

    const notify = (message: string, type: ToastType = 'info') => {
        const id = String(toastId++);
        const newToast: Toast = { id, message, type };

        toasts = [...toasts, newToast];
        listeners.forEach((listener) => listener(toasts));

        // Auto remove after 4 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);

        return id;
    };

    const removeToast = (id: string) => {
        toasts = toasts.filter((t) => t.id !== id);
        listeners.forEach((listener) => listener(toasts));
    };

    return {
        notify,
        success: (message: string) => notify(message, 'success'),
        error: (message: string) => notify(message, 'error'),
        info: (message: string) => notify(message, 'info'),
        warning: (message: string) => notify(message, 'warning'),
        removeToast,
    };
}

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-300 ${
                        toast.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'
                            : toast.type === 'error'
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
                            : toast.type === 'warning'
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                    }`}
                >
                    {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                    {toast.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" />}
                    {toast.type === 'warning' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                    {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
                    <span>{toast.message}</span>
                    <button
                        onClick={() => onRemove(toast.id)}
                        className="ml-2 inline-flex text-opacity-50 hover:text-opacity-75 transition-opacity"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}
