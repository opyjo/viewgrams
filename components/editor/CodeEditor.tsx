'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    title: string;
    description: string;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    className?: string;
}

export default function CodeEditor({
    value,
    onChange,
    title,
    description,
    onTitleChange,
    onDescriptionChange,
    className,
}: CodeEditorProps) {
    return (
        <div className={cn('flex flex-col h-full bg-[var(--panel)] text-slate-100 text-sm overflow-hidden border border-white/10 rounded-2xl shadow-xl shadow-black/30', className)}>
            <div className='flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10 shrink-0'>
                <div>
                    <p className='text-[10px] uppercase tracking-[0.3em] text-slate-400'>Editor</p>
                    <p className='text-sm font-semibold text-slate-100'>Mermaid source</p>
                </div>
                <span className='text-[11px] text-slate-400'>Live render</span>
            </div>
            <div className='px-4 py-3 border-b border-white/10 bg-white/5 space-y-2'>
                <div>
                    <label className='text-[10px] uppercase tracking-[0.3em] text-slate-400'>Title</label>
                    <input
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className='mt-1 w-full bg-slate-950/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-300/30'
                        placeholder='Untitled diagram'
                    />
                </div>
                <div>
                    <label className='text-[10px] uppercase tracking-[0.3em] text-slate-400'>Description</label>
                    <input
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        className='mt-1 w-full bg-slate-950/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-300/30'
                        placeholder='Optional summary'
                    />
                </div>
            </div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className='flex-1 w-full bg-transparent p-4 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300/30 font-mono text-[13px] leading-relaxed'
                spellCheck={false}
                placeholder='Enter Mermaid code here...'
            />
        </div>
    );
}
