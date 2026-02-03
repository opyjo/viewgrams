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
        <div className={cn('flex flex-col gap-2', className)}>
            <h3 className='text-xs font-semibold uppercase tracking-wider text-gray-500 px-1 flex items-center gap-2'>
                <Zap size={14} className='text-yellow-500' />
                Quick Templates
            </h3>
            <div className='grid grid-cols-1 gap-2'>
                {examples.map((example) => (
                    <button
                        key={example.id}
                        onClick={() => onSelect(example.code)}
                        className='text-left px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-medium text-slate-700 shadow-sm overflow-hidden text-ellipsis whitespace-nowrap'
                    >
                        {example.title}
                    </button>
                ))}
            </div>
        </div>
    );
}
