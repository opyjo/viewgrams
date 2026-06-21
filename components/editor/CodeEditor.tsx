'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import ProjectPicker from '@/components/projects/ProjectPicker';
import MermaidCodeMirror from './MermaidCodeMirror';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    title: string;
    description: string;
    projectId?: string | null;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onProjectIdChange: (value: string | null) => void;
    onSave?: () => void;
    onExport?: () => void;
    onNew?: () => void;
    className?: string;
}

export default function CodeEditor({
    value,
    onChange,
    title,
    description,
    projectId,
    onTitleChange,
    onDescriptionChange,
    onProjectIdChange,
    onSave,
    onExport,
    onNew,
    className,
}: CodeEditorProps) {
    return (
        <div className={cn('flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 text-slate-700 text-sm overflow-hidden border border-slate-200 rounded-2xl shadow-lg', className)}>
            <div className='flex items-center justify-between px-4 py-3 bg-white/50 border-b border-slate-200 shrink-0'>
                <div>
                    <p className='text-[10px] uppercase tracking-wider text-slate-500 font-semibold'>Editor</p>
                    <p className='text-sm font-semibold text-slate-700'>Mermaid source</p>
                </div>
                <span className='text-[10px] text-slate-400'>Ctrl/Cmd+S to save</span>
            </div>
            <div className='px-4 py-3 border-b border-slate-200 bg-white/40 space-y-2.5'>
                <div>
                    <label className='text-[10px] uppercase tracking-wider text-slate-500 font-medium'>Title</label>
                    <input
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className='mt-1 w-full bg-white/80 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'
                        placeholder='Untitled diagram'
                    />
                </div>
                <div>
                    <label className='text-[10px] uppercase tracking-wider text-slate-500 font-medium'>Description</label>
                    <input
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        className='mt-1 w-full bg-white/80 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'
                        placeholder='Optional summary'
                    />
                </div>
                <div>
                    <ProjectPicker
                        selectedProjectId={projectId}
                        onSelectProject={onProjectIdChange}
                    />
                </div>
            </div>
            <div className='flex-1 overflow-hidden'>
                <MermaidCodeMirror
                    value={value}
                    onChange={onChange}
                    onSave={onSave}
                    onExport={onExport}
                    onNew={onNew}
                />
            </div>
        </div>
    );
}
