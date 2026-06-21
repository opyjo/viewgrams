'use client';

import React from 'react';
import Link from 'next/link';
import { Cloud, Copy, Eye, LogIn, LogOut, Plus, Save, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import ExportDropdown from './ExportDropdown';
import VersionHistory from '@/components/editor/VersionHistory';

interface HeaderProps {
    title?: string;
    onSave?: () => void;
    onExport?: (type: 'svg' | 'png') => void;
    onView?: () => void;
    onNew?: () => void;
    onSignOut?: () => void;
    onSignIn?: () => void;
    onDuplicate?: () => void;
    diagramId?: string | null;
    onRestoreVersion?: (code: string) => void;
    status?: 'connected' | 'offline';
    saving?: boolean;
    userEmail?: string | null;
    saveDisabled?: boolean;
    activePage?: 'editor' | 'diagrams';
    showEditorActions?: boolean;
    className?: string;
}

export default function Header({
    onSave,
    onExport,
    onView,
    onNew,
    onSignOut,
    onSignIn,
    onDuplicate,
    diagramId,
    onRestoreVersion,
    status = 'offline',
    saving,
    userEmail,
    saveDisabled,
    activePage = 'editor',
    showEditorActions = true,
    className,
}: HeaderProps) {
    const showActions = showEditorActions && (onNew || onExport || onSave);
    return (
        <header className={cn('h-16 border-b border-white/10 bg-slate-950/40 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30', className)}>
            <div className='flex items-center gap-3'>
                <div className='w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-200 to-cyan-300 text-slate-950 shadow-lg shadow-amber-500/30 flex items-center justify-center'>
                    <Sparkles size={22} />
                </div>
                <div className="hidden sm:block">
                    <p className='text-[10px] font-semibold text-slate-300 uppercase tracking-[0.35em]'>Mermaid Studio</p>
                    <h1 className='text-lg font-semibold text-slate-100 leading-tight font-[var(--font-display)]'>Diagram Command</h1>
                </div>

                <nav className='flex items-center gap-2 ml-2 sm:ml-6'>
                    <Link
                        href='/'
                        className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                            activePage === 'editor'
                                ? 'bg-white/15 text-white'
                                : 'text-slate-300 hover:text-slate-100 hover:bg-white/5'
                        )}
                    >
                        Editor
                    </Link>
                    <Link
                        href='/diagrams'
                        className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                            activePage === 'diagrams'
                                ? 'bg-white/15 text-white'
                                : 'text-slate-300 hover:text-slate-100 hover:bg-white/5'
                        )}
                    >
                        Diagrams
                    </Link>
                </nav>
            </div>

            <div className='flex items-center gap-1 md:gap-2'>
                <div className='hidden lg:flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-xs text-slate-300'>
                    <span className={`h-2 w-2 rounded-full ${status === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <Cloud size={12} />
                    <span>{status === 'connected' ? 'Cloud synced' : 'Offline mode'}</span>
                </div>

                <div className='hidden md:block h-8 w-[1px] bg-white/10 mx-1' />

                {showActions && (
                    <>
                        {onNew && (
                            <button
                                onClick={onNew}
                                className='flex items-center gap-2 px-3 py-2 text-slate-200 hover:bg-white/10 rounded-full transition-all text-sm font-medium'
                            >
                                <Plus size={16} />
                                <span className='hidden sm:inline'>New</span>
                            </button>
                        )}
                        {onDuplicate && (
                            <button
                                onClick={onDuplicate}
                                className='flex items-center gap-2 px-3 py-2 text-slate-200 hover:bg-white/10 rounded-full transition-all text-sm font-medium'
                                title="Duplicate diagram"
                            >
                                <Copy size={16} />
                                <span className='hidden lg:inline'>Duplicate</span>
                            </button>
                        )}
                        {onView && (
                            <button
                                onClick={onView}
                                className='hidden sm:flex items-center gap-2 px-3 py-2 text-slate-200 hover:bg-white/10 rounded-full transition-all text-sm font-medium'
                            >
                                <Eye size={16} />
                                <span className='hidden lg:inline'>View</span>
                            </button>
                        )}
                        {onRestoreVersion && diagramId && (
                            <VersionHistory
                                diagramId={diagramId}
                                onRestore={onRestoreVersion}
                            />
                        )}
                        {onExport && <ExportDropdown onExport={onExport} />}
                        {onSave && (
                            <button
                                onClick={onSave}
                                disabled={saveDisabled}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-semibold shadow-lg shadow-amber-500/30',
                                    saveDisabled
                                        ? 'bg-amber-200/60 text-slate-700 cursor-not-allowed'
                                        : 'bg-amber-300 hover:bg-amber-200 text-slate-950'
                                )}
                            >
                                <Save size={16} />
                                <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
                            </button>
                        )}
                    </>
                )}

                {userEmail ? (
                    <button
                        onClick={onSignOut}
                        className='flex items-center gap-2 pl-3 pr-4 py-2 border border-white/10 rounded-full text-xs text-slate-200 hover:bg-white/10 transition-all'
                    >
                        <span className='max-w-[80px] md:max-w-[120px] truncate'>{userEmail}</span>
                        <span className='hidden sm:inline text-slate-400'>&#183;</span>
                        <span className='hidden sm:inline'>Sign Out</span>
                        <LogOut size={14} />
                    </button>
                ) : (
                    <button
                        onClick={onSignIn}
                        className='flex items-center gap-2 pl-3 pr-4 py-2 border border-white/10 rounded-full text-xs text-slate-200 hover:bg-white/10 transition-all'
                    >
                        <span>Sign in</span>
                        <LogIn size={14} />
                    </button>
                )}
            </div>
        </header>
    );
}
