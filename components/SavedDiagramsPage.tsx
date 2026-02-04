'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import Header from '@/components/ui/Header';
import { useDebounce } from '@/hooks/use-debounce';
import { confirmSignUp, getCurrentSession, signIn, signOut, signUp, type AuthSession } from '@/lib/auth';
import { DELETE_DIAGRAM } from '@/graphql/mutations';
import { LIST_DIAGRAMS, SEARCH_DIAGRAMS } from '@/graphql/queries';
import { ExternalLink, Files, Loader2, Search, Trash2 } from 'lucide-react';

interface DiagramSummary {
    id: string;
    title: string;
    description?: string | null;
    svgPreview?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

interface ListDiagramsResult {
    listDiagrams: {
        items: DiagramSummary[];
    };
}

interface SearchDiagramsResult {
    searchDiagrams: DiagramSummary[];
}

export default function SavedDiagramsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 400);
    const [session, setSession] = useState<AuthSession | null>(null);

    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'signIn' | 'signUp' | 'confirm'>('signIn');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [confirmCode, setConfirmCode] = useState('');
    const [actionError, setActionError] = useState<string | null>(null);

    const { data: listData, loading: listLoading, refetch: refetchList } = useQuery<ListDiagramsResult, { limit: number }>(LIST_DIAGRAMS, {
        variables: { limit: 50 },
        skip: !session || debouncedSearch.trim().length > 0,
        fetchPolicy: 'network-only',
    });

    const { data: searchData, loading: searchLoading, refetch: refetchSearch } = useQuery<SearchDiagramsResult, { searchTerm: string }>(SEARCH_DIAGRAMS, {
        variables: { searchTerm: debouncedSearch.trim() },
        skip: !session || debouncedSearch.trim().length === 0,
        fetchPolicy: 'network-only',
    });

    const [deleteDiagram] = useMutation(DELETE_DIAGRAM);

    useEffect(() => {
        let isMounted = true;
        getCurrentSession().then((current) => {
            if (isMounted) {
                setSession(current);
            }
        });
        return () => {
            isMounted = false;
        };
    }, []);

    const diagrams = useMemo<DiagramSummary[]>(() => {
        if (debouncedSearch.trim().length > 0) {
            return searchData?.searchDiagrams ?? [];
        }
        return listData?.listDiagrams?.items ?? [];
    }, [debouncedSearch, listData, searchData]);

    const openAuth = (mode: 'signIn' | 'signUp' | 'confirm') => {
        setAuthMode(mode);
        setAuthError(null);
        setAuthOpen(true);
    };

    const formatTimestamp = (value?: string) => {
        if (!value) return '—';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString();
    };

    const handleDelete = async (id: string) => {
        if (!session) return;
        const confirmed = window.confirm('Delete this diagram? This action cannot be undone.');
        if (!confirmed) return;

        try {
            setActionError(null);
            await deleteDiagram({ variables: { id } });
            if (debouncedSearch.trim().length > 0) {
                await refetchSearch();
            } else {
                await refetchList();
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete diagram.';
            setActionError(message);
        }
    };

    const handleSignIn = async (event: React.FormEvent) => {
        event.preventDefault();
        setAuthLoading(true);
        setAuthError(null);

        try {
            const nextSession = await signIn(authEmail, authPassword);
            setSession(nextSession);
            setAuthOpen(false);
            setAuthPassword('');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to sign in.';
            setAuthError(message);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        setAuthLoading(true);
        setAuthError(null);

        try {
            await signUp(authEmail, authPassword);
            setAuthMode('confirm');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to sign up.';
            setAuthError(message);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleConfirm = async (event: React.FormEvent) => {
        event.preventDefault();
        setAuthLoading(true);
        setAuthError(null);

        try {
            await confirmSignUp(authEmail, confirmCode);
            setAuthMode('signIn');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to confirm sign up.';
            setAuthError(message);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleSignOut = () => {
        signOut();
        setSession(null);
    };

    const handleOpenDiagram = (id: string) => {
        router.push(`/?diagram=${id}`);
    };

    return (
        <div className='relative flex flex-col min-h-screen bg-slate-50'>
            <div className='aurora' />
            <Header
                onSignOut={handleSignOut}
                onSignIn={() => openAuth('signIn')}
                userEmail={session?.email || null}
                status={session ? 'connected' : 'offline'}
                activePage='saved'
                showEditorActions={false}
            />

            <main className='flex-1 px-6 py-10'>
                <div className='mx-auto max-w-5xl'>
                    <div className='flex flex-col gap-2 mb-6 fade-up'>
                        <span className='text-xs font-semibold uppercase tracking-[0.4em] text-slate-400'>Library</span>
                        <h2 className='text-3xl font-semibold text-slate-900'>Saved diagrams</h2>
                        <p className='text-sm text-slate-500'>Browse your saved Mermaid diagrams and jump back into editing.</p>
                    </div>

                    <div className='flex flex-col gap-4'>
                        <div className='relative fade-up'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={14} />
                            <input
                                type='text'
                                placeholder='Search diagrams...'
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className='w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm'
                            />
                        </div>

                        {actionError && (
                            <div className='rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700'>
                                {actionError}
                            </div>
                        )}

                        {!session ? (
                            <div className='rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 flex items-center justify-between shadow-sm'>
                                <span>Sign in to see your saved diagrams.</span>
                                <button
                                    onClick={() => openAuth('signIn')}
                                    className='px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all'
                                >
                                    Sign in
                                </button>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 fade-up'>
                                {(listLoading || searchLoading) && (
                                    <div className='flex items-center justify-center gap-2 text-xs text-slate-400 py-6 sm:col-span-2 lg:col-span-3'>
                                        <Loader2 size={14} className='animate-spin' />
                                        Loading diagrams…
                                    </div>
                                )}

                                {!listLoading && !searchLoading && diagrams.length === 0 && (
                                    <div className='rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400 sm:col-span-2 lg:col-span-3'>
                                        No saved diagrams yet.
                                    </div>
                                )}

                                {diagrams.map((diagram) => (
                                    <div
                                        key={diagram.id}
                                        onClick={() => handleOpenDiagram(diagram.id)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                handleOpenDiagram(diagram.id);
                                            }
                                        }}
                                        role='button'
                                        tabIndex={0}
                                        className='p-3 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all card-sheen'
                                    >
                                        <div className='flex items-start justify-between gap-3 mb-2'>
                                            <div>
                                                <h3 className='text-[13px] font-semibold text-slate-800 line-clamp-1'>{diagram.title}</h3>
                                                {diagram.description ? (
                                                    <p className='text-[10px] text-slate-500 line-clamp-2 mt-1'>{diagram.description}</p>
                                                ) : null}
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleOpenDiagram(diagram.id);
                                                    }}
                                                    className='p-1.5 rounded-md text-slate-300 hover:text-blue-500 hover:bg-slate-50 transition-colors'
                                                    title='Open diagram'
                                                >
                                                    <ExternalLink size={12} />
                                                </button>
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleDelete(diagram.id);
                                                    }}
                                                    className='p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors'
                                                    title='Delete diagram'
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className='h-24 bg-slate-50 rounded-xl mb-2 flex items-center justify-center border border-slate-100 overflow-hidden'>
                                            {diagram.svgPreview ? (
                                                <div
                                                    className='w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full [&>svg]:max-w-full'
                                                    dangerouslySetInnerHTML={{ __html: diagram.svgPreview }}
                                                />
                                            ) : (
                                                <div className='opacity-40'>
                                                    <Files size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <div className='flex items-center justify-between text-[10px] text-slate-400'>
                                            <span>{formatTimestamp(diagram.updatedAt || diagram.createdAt)}</span>
                                            <span className='px-2 py-1 rounded-full bg-slate-100 text-slate-500'>Saved</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {authOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4'>
                    <div className='w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-6 text-slate-100 shadow-2xl'>
                        <div className='flex items-center justify-between mb-4'>
                            <h2 className='text-lg font-semibold'>
                                {authMode === 'signIn' && 'Sign in'}
                                {authMode === 'signUp' && 'Create account'}
                                {authMode === 'confirm' && 'Confirm sign up'}
                            </h2>
                            <button
                                onClick={() => setAuthOpen(false)}
                                className='text-slate-400 hover:text-slate-200'
                            >
                                ✕
                            </button>
                        </div>

                        {authError && (
                            <div className='mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200'>
                                {authError}
                            </div>
                        )}

                        {authMode !== 'confirm' && (
                            <form onSubmit={authMode === 'signIn' ? handleSignIn : handleSignUp} className='space-y-3'>
                                <div>
                                    <label className='text-[10px] uppercase tracking-[0.3em] text-slate-400'>Email</label>
                                    <input
                                        type='email'
                                        required
                                        value={authEmail}
                                        onChange={(event) => setAuthEmail(event.target.value)}
                                        className='mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-300/30'
                                        placeholder='you@example.com'
                                    />
                                </div>
                                <div>
                                    <label className='text-[10px] uppercase tracking-[0.3em] text-slate-400'>Password</label>
                                    <input
                                        type='password'
                                        required
                                        value={authPassword}
                                        onChange={(event) => setAuthPassword(event.target.value)}
                                        className='mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-300/30'
                                        placeholder='••••••••'
                                    />
                                </div>
                                <button
                                    type='submit'
                                    disabled={authLoading}
                                    className='w-full rounded-lg bg-amber-300 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60'
                                >
                                    {authLoading ? 'Working…' : authMode === 'signIn' ? 'Sign in' : 'Create account'}
                                </button>
                                <div className='text-center text-xs text-slate-400'>
                                    {authMode === 'signIn' ? (
                                        <button
                                            type='button'
                                            onClick={() => setAuthMode('signUp')}
                                            className='text-amber-200 hover:text-amber-100'
                                        >
                                            Need an account? Sign up
                                        </button>
                                    ) : (
                                        <button
                                            type='button'
                                            onClick={() => setAuthMode('signIn')}
                                            className='text-amber-200 hover:text-amber-100'
                                        >
                                            Have an account? Sign in
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}

                        {authMode === 'confirm' && (
                            <form onSubmit={handleConfirm} className='space-y-3'>
                                <div>
                                    <label className='text-[10px] uppercase tracking-[0.3em] text-slate-400'>Confirmation code</label>
                                    <input
                                        type='text'
                                        required
                                        value={confirmCode}
                                        onChange={(event) => setConfirmCode(event.target.value)}
                                        className='mt-1 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-300/30'
                                        placeholder='123456'
                                    />
                                </div>
                                <button
                                    type='submit'
                                    disabled={authLoading}
                                    className='w-full rounded-lg bg-amber-300 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60'
                                >
                                    {authLoading ? 'Confirming…' : 'Confirm account'}
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setAuthMode('signIn')}
                                    className='w-full text-xs text-slate-400 hover:text-slate-200'
                                >
                                    Back to sign in
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
