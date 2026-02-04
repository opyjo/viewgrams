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
            <div className='grid grid-cols-1 gap-1.5'>
                {examples.map((example) => (
                    <button
                        key={example.id}
                        onClick={() => onSelect(example.code)}
                        className='text-left px-3 py-2 rounded-lg bg-white/60 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-xs font-medium text-slate-700 shadow-sm hover:shadow overflow-hidden text-ellipsis whitespace-nowrap'
                    >
                        {example.title}
                    </button>
                ))}
            </div>
        </div>
    );
}
