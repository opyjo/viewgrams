'use client';

import React, { useState } from 'react';
import { History, ChevronDown } from 'lucide-react';
import { getVersions, type DiagramVersion } from '@/lib/version-history';

interface VersionHistoryProps {
    diagramId: string | null;
    onRestore: (code: string) => void;
}

export default function VersionHistory({ diagramId, onRestore }: VersionHistoryProps) {
    const [open, setOpen] = useState(false);

    if (!diagramId) return null;

    const versions = getVersions(diagramId);
    if (versions.length === 0) return null;

    const formatTime = (ts: number) => {
        const date = new Date(ts);
        return date.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-200 hover:bg-white/10 rounded-full transition-all text-sm font-medium"
                title="Version history"
            >
                <History size={16} />
                <span className="hidden sm:inline">History</span>
                <ChevronDown size={12} />
            </button>
            {open && (
                <div className="absolute top-full right-0 mt-1 w-64 max-h-64 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-lg z-50">
                    <div className="p-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 px-2">Previous Versions</p>
                    </div>
                    {versions.slice().reverse().map((v: DiagramVersion, i: number) => (
                        <button
                            key={`${v.timestamp}-${i}`}
                            onClick={() => { onRestore(v.code); setOpen(false); }}
                            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                        >
                            <p className="font-medium truncate">{v.title || 'Untitled'}</p>
                            <p className="text-xs text-slate-400">{formatTime(v.timestamp)}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
