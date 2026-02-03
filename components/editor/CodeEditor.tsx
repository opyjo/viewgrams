'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function CodeEditor({ value, onChange, className }: CodeEditorProps) {
    return (
        <div className={cn('flex flex-col h-full bg-[#1e1e1e] text-gray-300 font-mono text-sm overflow-hidden border-r border-[#333]', className)}>
            <div className='flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333] shrink-0'>
                <span className='text-xs font-semibold uppercase tracking-wider text-gray-500'>Mermaid Code</span>
            </div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className='flex-1 w-full bg-transparent p-4 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/30'
                spellCheck={false}
                placeholder='Enter Mermaid code here...'
            />
        </div>
    );
}
