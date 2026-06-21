'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';

interface ExportDropdownProps {
    onExport: (type: 'svg' | 'png') => void;
}

export default function ExportDropdown({ onExport }: ExportDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-200 hover:bg-white/10 rounded-full transition-all text-sm font-medium"
            >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown size={12} />
            </button>
            {open && (
                <div className="absolute top-full right-0 mt-1 w-36 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50">
                    <button
                        onClick={() => { onExport('svg'); setOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Export SVG
                    </button>
                    <button
                        onClick={() => { onExport('png'); setOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100"
                    >
                        Export PNG
                    </button>
                </div>
            )}
        </div>
    );
}
