'use client';

import React from 'react';
import { Share2, Download, Moon, Sun, Save, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
    title?: string;
    onSave?: () => void;
    onExport?: (type: 'svg' | 'png') => void;
    className?: string;
}

export default function Header({ onSave, onExport, className }: HeaderProps) {
    return (
        <header className={cn('h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-30', className)}>
            <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200'>
                    <LayoutGrid size={24} />
                </div>
                <div>
                    <h1 className='text-lg font-bold text-slate-900 leading-tight'>Mermaid Studio</h1>
                    <p className='text-[10px] font-medium text-slate-500 uppercase tracking-[0.1em]'>Pro Generator</p>
                </div>
            </div>

            <div className='flex items-center gap-2'>
                <div className='bg-slate-100 p-1 rounded-lg flex gap-1 items-center mr-2'>
                    <button className='p-1.5 rounded-md bg-white shadow-sm text-blue-600'>
                        <Sun size={16} />
                    </button>
                    <button className='p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-all'>
                        <Moon size={16} />
                    </button>
                </div>

                <div className='h-8 w-[1px] bg-slate-200 mx-2' />

                <button
                    onClick={() => onExport?.('svg')}
                    className='flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all text-sm font-medium'
                >
                    <Download size={18} />
                    <span>Export</span>
                </button>

                <button
                    onClick={onSave}
                    className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-semibold shadow-md shadow-blue-100'
                >
                    <Save size={18} />
                    <span>Save Diagram</span>
                </button>
            </div>
        </header>
    );
}
