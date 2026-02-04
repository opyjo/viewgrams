'use client';

import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
}

export default function Modal({ open, onClose, title, children, showCloseButton = true }: ModalProps) {
    const handleEscape = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        },
        [onClose]
    );

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [open, handleEscape]);

    if (!open) return null;

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4'
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role='dialog'
            aria-modal='true'
            aria-labelledby={title ? 'modal-title' : undefined}
        >
            <div className='w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 text-slate-100 shadow-2xl'>
                {(title || showCloseButton) && (
                    <div className='flex items-center justify-between mb-4'>
                        {title && (
                            <h2 id='modal-title' className='text-lg font-semibold'>
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className='text-slate-400 hover:text-slate-200 ml-auto'
                                aria-label='Close modal'
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
