'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import Header from '@/components/ui/Header';
import Modal from '@/components/ui/Modal';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import AuthModal from '@/components/ui/AuthModal';
import { sanitizeSvg } from '@/lib/sanitize';
import { CREATE_DIAGRAM, DELETE_DIAGRAM } from '@/graphql/mutations';
import { LIST_DIAGRAMS, SEARCH_DIAGRAMS } from '@/graphql/queries';
import { LIST_PROJECTS } from '@/graphql/projectQueries';
import { Copy, ExternalLink, FilePlus2, Files, Loader2, Search, Trash2 } from 'lucide-react';
import ProjectSidebar from '@/components/projects/ProjectSidebar';
import type { DiagramSummary, ListDiagramsResult, SearchDiagramsResult, CreateDiagramInput, CreateDiagramResult } from '@/types/diagram';
import type { Project } from '@/types/project';

interface ListProjectsResult {
    listProjects: {
        items: Project[];
    };
}

export default function SavedDiagramsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 400);

    const { session, authOpen, openAuth, closeAuth, setSession, signOut } = useAuth();
    const { toast } = useToast();

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [diagramToDelete, setDiagramToDelete] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    useEffect(() => {
        const projectParam = searchParams.get('project');
        if (projectParam) {
            setSelectedProjectId(projectParam);
        }
    }, [searchParams]);

    // Projects query for color/name display on cards
    const { data: projectsData } = useQuery<ListProjectsResult>(LIST_PROJECTS, {
        skip: !session,
    });

    const projectMap = useMemo(() => {
        const map: Record<string, { name: string; color: string | null }> = {};
        if (projectsData?.listProjects?.items) {
            projectsData.listProjects.items.forEach((p) => {
                map[p.projectId] = { name: p.name, color: p.color || null };
            });
        }
        return map;
    }, [projectsData]);

    const { data: allDiagramsData } = useQuery<ListDiagramsResult, { limit: number }>(LIST_DIAGRAMS, {
        variables: { limit: 200 },
        skip: !session,
        fetchPolicy: 'cache-and-network',
    });

    const { data: listData, loading: listLoading, refetch: refetchList, fetchMore } = useQuery<ListDiagramsResult, { limit: number; nextToken?: string | null; projectId?: string | null }>(LIST_DIAGRAMS, {
        variables: {
            limit: 24,
            projectId: selectedProjectId && selectedProjectId !== 'uncategorized' ? selectedProjectId : undefined
        },
        skip: !session || debouncedSearch.trim().length > 0,
        fetchPolicy: 'network-only',
    });

    const { data: searchData, loading: searchLoading, refetch: refetchSearch } = useQuery<SearchDiagramsResult, { searchTerm: string; projectId?: string | null }>(SEARCH_DIAGRAMS, {
        variables: {
            searchTerm: debouncedSearch.trim(),
            projectId: selectedProjectId && selectedProjectId !== 'uncategorized' ? selectedProjectId : undefined
        },
        skip: !session || debouncedSearch.trim().length === 0,
        fetchPolicy: 'network-only',
    });

    const [deleteDiagram] = useMutation(DELETE_DIAGRAM);
    const [createDiagram] = useMutation<CreateDiagramResult, { input: CreateDiagramInput }>(CREATE_DIAGRAM);

    const nextToken = listData?.listDiagrams?.nextToken || null;

    const diagrams = useMemo<DiagramSummary[]>(() => {
        let allDiagrams: DiagramSummary[] = [];

        if (debouncedSearch.trim().length > 0) {
            allDiagrams = searchData?.searchDiagrams ?? [];
        } else {
            allDiagrams = listData?.listDiagrams?.items ?? [];
        }

        if (selectedProjectId === 'uncategorized') {
            return allDiagrams.filter(d => !d.projectId);
        }

        return allDiagrams;
    }, [debouncedSearch, listData, searchData, selectedProjectId]);

    const handleAuthSuccess = (newSession: typeof session) => {
        if (newSession) setSession(newSession);
        closeAuth();
    };

    const formatTimestamp = (value?: string) => {
        if (!value) return '\u2014';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString();
    };

    const handleDelete = (id: string) => {
        if (!session) return;
        setDiagramToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!session || !diagramToDelete) return;

        setDeleteConfirmOpen(false);

        try {
            setActionError(null);
            await deleteDiagram({ variables: { id: diagramToDelete } });
            if (debouncedSearch.trim().length > 0) {
                await refetchSearch();
            } else {
                await refetchList();
            }
            toast('Diagram deleted');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete diagram.';
            setActionError(message);
            toast(message, 'error');
        } finally {
            setDiagramToDelete(null);
        }
    };

    const handleSignOut = () => {
        signOut();
    };

    const handleOpenDiagram = (id: string) => {
        router.push(`/?diagram=${id}`);
    };

    const handleDuplicate = async (diagram: DiagramSummary) => {
        if (!session) return;
        try {
            const input: CreateDiagramInput = {
                title: `${diagram.title} (copy)`,
                description: diagram.description || null,
                code: '', // we don't have code in summary; user will edit
                svgPreview: diagram.svgPreview || null,
                projectId: diagram.projectId || null,
            };
            await createDiagram({ variables: { input } });
            toast('Diagram duplicated');
            await refetchList();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to duplicate diagram.';
            toast(message, 'error');
        }
    };

    const handleLoadMore = () => {
        if (!nextToken) return;
        fetchMore({
            variables: { nextToken },
        });
    };

    const handleSelectProject = (projectId: string | null) => {
        setSelectedProjectId(projectId);
        const params = new URLSearchParams();
        if (projectId) {
            params.set('project', projectId);
        }
        const query = params.toString();
        router.push(`/diagrams${query ? `?${query}` : ''}`);
    };

    const diagramCounts = useMemo(() => {
        const allDiagrams = allDiagramsData?.listDiagrams?.items || [];
        const counts: Record<string, number> = {};

        allDiagrams.forEach((diagram) => {
            if (!diagram.projectId) {
                counts['uncategorized'] = (counts['uncategorized'] || 0) + 1;
            } else {
                counts[diagram.projectId] = (counts[diagram.projectId] || 0) + 1;
            }
        });

        return counts;
    }, [allDiagramsData]);

    return (
        <div className='relative flex flex-col min-h-screen bg-slate-50'>
            <div className='aurora' />
            <Header
                onSignOut={handleSignOut}
                onSignIn={openAuth}
                userEmail={session?.email || null}
                status={session ? 'connected' : 'offline'}
                activePage='diagrams'
                showEditorActions={false}
            />

            <div className='flex flex-1 overflow-hidden'>
                {session && (
                    <div className="hidden md:block">
                        <ProjectSidebar
                            selectedProjectId={selectedProjectId}
                            onSelectProject={handleSelectProject}
                            diagramCounts={diagramCounts}
                        />
                    </div>
                )}
                <main className='flex-1 px-4 md:px-8 py-8 md:py-12 overflow-y-auto'>
                <div className='mx-auto max-w-6xl'>
                    <div className='flex flex-col gap-2 mb-8 fade-up'>
                        <span className='text-xs font-semibold uppercase tracking-[0.4em] text-slate-400'>Library</span>
                        <h2 className='text-3xl md:text-4xl font-bold text-slate-900'>My Diagrams</h2>
                        <p className='text-sm text-slate-600'>Browse and manage your Mermaid diagrams</p>
                    </div>

                    {/* Mobile project filter */}
                    {session && (
                        <div className="md:hidden mb-4">
                            <select
                                value={selectedProjectId || ''}
                                onChange={(e) => handleSelectProject(e.target.value || null)}
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                            >
                                <option value="">All Diagrams</option>
                                <option value="uncategorized">Uncategorized</option>
                                {projectsData?.listProjects?.items?.map((p) => (
                                    <option key={p.projectId} value={p.projectId}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className='flex flex-col gap-4'>
                        <div className='relative fade-up'>
                            <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
                            <input
                                type='text'
                                placeholder='Search diagrams...'
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className='w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all'
                            />
                        </div>

                        {actionError && (
                            <div className='rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700'>
                                {actionError}
                            </div>
                        )}

                        {!session ? (
                            <div className='rounded-2xl border border-slate-200 bg-slate-50 p-8 text-sm text-slate-600 flex items-center justify-between'>
                                <span>Sign in to see your saved diagrams.</span>
                                <button
                                    onClick={openAuth}
                                    className='px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm'
                                >
                                    Sign in
                                </button>
                            </div>
                        ) : (
                            <>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 fade-up'>
                                {(listLoading || searchLoading) && (
                                    <div className='flex items-center justify-center gap-2 text-xs text-slate-400 py-6 sm:col-span-2 lg:col-span-3'>
                                        <Loader2 size={14} className='animate-spin' />
                                        Loading diagrams...
                                    </div>
                                )}

                                {!listLoading && !searchLoading && diagrams.length === 0 && (
                                    <div className='rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center sm:col-span-2 lg:col-span-3'>
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
                                                <FilePlus2 size={32} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700 mb-1">No diagrams yet</p>
                                                <p className="text-sm text-slate-500 mb-4">Create your first diagram to get started</p>
                                            </div>
                                            <button
                                                onClick={() => router.push('/')}
                                                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm"
                                            >
                                                Create your first diagram
                                            </button>
                                        </div>
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
                                        className='group p-4 border border-slate-200 rounded-2xl bg-white hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer'
                                    >
                                        <div className='flex items-start justify-between gap-3 mb-3'>
                                            <div className='flex-1 min-w-0'>
                                                <h3 className='text-sm font-semibold text-slate-900 line-clamp-1 mb-1'>{diagram.title}</h3>
                                                {diagram.description ? (
                                                    <p className='text-xs text-slate-500 line-clamp-2'>{diagram.description}</p>
                                                ) : null}
                                            </div>
                                            <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleDuplicate(diagram);
                                                    }}
                                                    className='p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors'
                                                    title='Duplicate diagram'
                                                >
                                                    <Copy size={14} />
                                                </button>
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleOpenDiagram(diagram.id);
                                                    }}
                                                    className='p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors'
                                                    title='Open diagram'
                                                >
                                                    <ExternalLink size={14} />
                                                </button>
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleDelete(diagram.id);
                                                    }}
                                                    className='p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors'
                                                    title='Delete diagram'
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className='h-28 bg-slate-50 rounded-xl mb-3 flex items-center justify-center border border-slate-200 overflow-hidden'>
                                            {diagram.svgPreview ? (
                                                <div
                                                    className='w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full [&>svg]:max-w-full'
                                                    dangerouslySetInnerHTML={{ __html: sanitizeSvg(diagram.svgPreview) }}
                                                />
                                            ) : (
                                                <div className='opacity-30'>
                                                    <Files size={48} strokeWidth={1.5} />
                                                </div>
                                            )}
                                        </div>
                                        <div className='flex items-center justify-between text-xs text-slate-400'>
                                            <span>{formatTimestamp(diagram.updatedAt || diagram.createdAt)}</span>
                                            {diagram.projectId && projectMap[diagram.projectId] && (
                                                <span className="flex items-center gap-1.5">
                                                    <span
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: projectMap[diagram.projectId].color || '#94a3b8' }}
                                                    />
                                                    <span className="truncate max-w-[100px]">{projectMap[diagram.projectId].name}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Load More */}
                            {nextToken && !searchLoading && debouncedSearch.trim().length === 0 && (
                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={handleLoadMore}
                                        className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-all"
                                    >
                                        Load More
                                    </button>
                                </div>
                            )}
                            </>
                        )}
                    </div>
                </div>
            </main>
            </div>

            <AuthModal
                open={authOpen}
                onClose={closeAuth}
                onAuthSuccess={handleAuthSuccess}
            />

            <Modal
                open={deleteConfirmOpen}
                onClose={() => {
                    setDeleteConfirmOpen(false);
                    setDiagramToDelete(null);
                }}
                title="Delete Diagram"
            >
                <div className="space-y-4">
                    <p className="text-slate-600 text-sm">
                        Are you sure you want to delete this diagram? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => {
                                setDeleteConfirmOpen(false);
                                setDiagramToDelete(null);
                            }}
                            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
