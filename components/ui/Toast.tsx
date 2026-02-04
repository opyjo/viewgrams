'use client';

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
        error: <XCircle className="w-5 h-5 text-red-400" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    };

    const backgrounds = {
        success: 'border-emerald-500/30 bg-emerald-500/10',
        error: 'border-red-500/30 bg-red-500/10',
        warning: 'border-amber-500/30 bg-amber-500/10',
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-sm ${backgrounds[type]}`}>
                {icons[type]}
                <span className="text-sm text-slate-100">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
