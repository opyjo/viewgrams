'use client';

import React from 'react';
import { examples } from '@/lib/examples';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

interface ExampleSelectorProps {
    onSelect: (code: string) => void;
    className?: string;
}

export default function ExampleSelector({ onSelect, className }: ExampleSelectorProps) {
    return (
        <div className={cn('flex flex-col gap-3', className)}>
            <h3 className='text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 px-1 flex items-center gap-2'>
                <Zap size={14} className='text-amber-400' />
                Templates
            </h3>
            <div className='grid grid-cols-1 gap-2'>
                {examples.map((example) => (
                    <button
                        key={example.id}
                        onClick={() => onSelect(example.code)}
                        className='text-left px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300/70 hover:bg-white transition-all text-sm font-medium text-slate-700 shadow-sm overflow-hidden text-ellipsis whitespace-nowrap'
                    >
                        {example.title}
                    </button>
                ))}
            </div>
        </div>
    );
}
