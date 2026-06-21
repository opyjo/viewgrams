'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import CodeEditor from '@/components/editor/CodeEditor';
import PreviewPanel from '@/components/editor/PreviewPanel';
import ResizeHandle from '@/components/editor/ResizeHandle';
import ExampleSelector from '@/components/ui/ExampleSelector';
import QuickProjectCreate from '@/components/ui/QuickProjectCreate';
import VersionHistory from '@/components/editor/VersionHistory';
import AuthModal from '@/components/ui/AuthModal';
import { defaultCode } from '@/lib/examples';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useAutoSave } from '@/hooks/useAutoSave';
import { saveVersion } from '@/lib/version-history';
import { CREATE_DIAGRAM, UPDATE_DIAGRAM } from '@/graphql/mutations';
import { GET_DIAGRAM } from '@/graphql/queries';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Diagram, CreateDiagramInput, CreateDiagramResult, GetDiagramResult } from '@/types/diagram';

export default function MermaidApp() {
    const [code, setCode] = useState(defaultCode);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectId, setProjectId] = useState<string | null>(null);
    const [renderedSvg, setRenderedSvg] = useState<string | null>(null);
    const [activeDiagramId, setActiveDiagramId] = useState<string | null>(null);
    const debouncedCode = useDebounce(code, 500);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [lastSavedCode, setLastSavedCode] = useState(defaultCode);
    const [editorWidth, setEditorWidth] = useState(42); // percentage
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileTab, setMobileTab] = useState<'code' | 'preview'>('code');
    const [draftBanner, setDraftBanner] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const diagramParam = searchParams.get('diagram');

    const { session, loading: sessionLoading, authOpen, openAuth, closeAuth, setSession, signOut: handleSignOut } = useAuth();
    const { toast } = useToast();

    const [fetchDiagram] = useLazyQuery<GetDiagramResult, { id: string }>(GET_DIAGRAM, {
        fetchPolicy: 'network-only',
    });

    const [createDiagram] = useMutation<CreateDiagramResult, { input: CreateDiagramInput }>(CREATE_DIAGRAM);
    const [updateDiagram] = useMutation(UPDATE_DIAGRAM);

    const isDirty = code !== lastSavedCode;
    useUnsavedChanges(isDirty);

    const { loadDraft, clearDraft } = useAutoSave(code, title, description, projectId, activeDiagramId);

    // Load draft on mount
    useEffect(() => {
        if (diagramParam) return; // will load from server
        const draft = loadDraft();
        if (draft && draft.code !== defaultCode && Date.now() - draft.timestamp < 86400000) {
            setDraftBanner(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const restoreDraft = () => {
        const draft = loadDraft(activeDiagramId);
        if (draft) {
            setCode(draft.code);
            setTitle(draft.title);
            setDescription(draft.description);
            setProjectId(draft.projectId);
        }
        setDraftBanner(false);
    };

    const dismissDraft = () => {
        setDraftBanner(false);
        clearDraft(activeDiagramId);
    };

    const sanitizeFilename = (name: string) => {
        return name.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '-') || 'diagram';
    };

    const handleExport = useCallback((type: 'svg' | 'png') => {
        const svgElement = document.querySelector('#mermaid-preview svg') as HTMLElement;
        if (!svgElement) return;

        const filename = sanitizeFilename(title || 'diagram');

        if (type === 'svg') {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement('a');
            downloadLink.href = svgUrl;
            downloadLink.download = `${filename}.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(svgUrl);
        } else {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const data = new XMLSerializer().serializeToString(svgElement);
            const img = new Image();
            const blob = new Blob([data], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);

            img.onload = function () {
                canvas.width = img.width * 2;
                canvas.height = img.height * 2;
                ctx?.scale(2, 2);
                ctx?.drawImage(img, 0, 0);
                URL.revokeObjectURL(url);
                const pngUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = `${filename}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            };
            img.src = url;
        }
    }, [title]);

    const handleSave = useCallback(async () => {
        setSaveError(null);

        if (!session) {
            openAuth();
            return;
        }

        if (!code.trim()) {
            setSaveError('Diagram code is empty.');
            return;
        }

        if (!renderedSvg) {
            setSaveError('Fix diagram errors before saving.');
            return;
        }

        setSaving(true);

        try {
            const resolvedTitle = title.trim() || `Untitled Diagram ${new Date().toLocaleString()}`;
            const input = {
                title: resolvedTitle,
                description: description.trim() || null,
                code,
                svgPreview: renderedSvg,
                projectId: projectId || null,
            };

            let diagramId = activeDiagramId;

            if (diagramId) {
                saveVersion(diagramId, code, resolvedTitle);
                await updateDiagram({
                    variables: {
                        input: {
                            id: diagramId,
                            ...input,
                        },
                    },
                });
            } else {
                const result = await createDiagram({ variables: { input } });
                diagramId = result.data?.createDiagram?.id || null;
                setActiveDiagramId(diagramId);
                if (!title.trim()) {
                    setTitle(resolvedTitle);
                }
            }

            setLastSavedCode(code);
            clearDraft(activeDiagramId);
            toast('Diagram saved successfully!');

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save diagram.';
            setSaveError(message);
            toast(message, 'error');
        } finally {
            setSaving(false);
        }
    }, [session, code, renderedSvg, title, description, projectId, activeDiagramId, openAuth, updateDiagram, createDiagram, clearDraft, toast]);

    const handleView = () => {
        if (typeof window !== 'undefined') {
            const resolvedTitle = title.trim() || `Untitled Diagram ${new Date().toLocaleString()}`;
            sessionStorage.setItem('preview:code', code);
            sessionStorage.setItem('preview:title', resolvedTitle);
        }
        if (activeDiagramId) {
            router.push(`/preview?diagram=${activeDiagramId}`);
        } else {
            router.push('/preview');
        }
    };

    const handleNew = useCallback(() => {
        setActiveDiagramId(null);
        setTitle('');
        setDescription('');
        setProjectId(null);
        setCode(defaultCode);
        setRenderedSvg(null);
        setSaveError(null);
        setLastSavedCode(defaultCode);
        router.replace('/');
    }, [router]);

    const handleDuplicate = useCallback(() => {
        setActiveDiagramId(null);
        setTitle(title ? `${title} (copy)` : '');
        setLastSavedCode('');
        router.replace('/');
        toast('Diagram duplicated - save to create a new copy');
    }, [title, router, toast]);

    const handleSelectDiagram = useCallback(async (id: string) => {
        if (!session) return;
        try {
            const result = await fetchDiagram({ variables: { id } });
            const diagram: Diagram | null = result.data?.getDiagram || null;
            if (!diagram) return;
            setActiveDiagramId(diagram.id);
            setTitle(diagram.title || '');
            setDescription(diagram.description || '');
            setProjectId(diagram.projectId || null);
            setCode(diagram.code || '');
            setLastSavedCode(diagram.code || '');
        } catch (error) {
            console.error(error);
        }
    }, [session, fetchDiagram]);

    useEffect(() => {
        if (!diagramParam) return;
        if (sessionLoading) return;
        if (!session) {
            openAuth();
            return;
        }
        if (diagramParam === activeDiagramId) return;
        handleSelectDiagram(diagramParam);
    }, [diagramParam, session, activeDiagramId, sessionLoading, handleSelectDiagram, openAuth]);

    const handleSignOutClick = () => {
        handleSignOut();
        handleNew();
    };

    const handleAuthSuccess = (newSession: typeof session) => {
        if (newSession) setSession(newSession);
        closeAuth();
    };

    const handleResize = useCallback((deltaX: number) => {
        if (!containerRef.current) return;
        const containerWidth = containerRef.current.getBoundingClientRect().width;
        const deltaPercent = (deltaX / containerWidth) * 100;
        setEditorWidth((prev) => Math.min(70, Math.max(25, prev + deltaPercent)));
    }, []);

    const handleRestoreVersion = (versionCode: string) => {
        setCode(versionCode);
        toast('Version restored');
    };

    useKeyboardShortcuts({
        onSave: handleSave,
        onExport: () => handleExport('svg'),
        onNew: handleNew,
    });

    return (
        <div className='relative flex flex-col h-screen overflow-hidden bg-slate-50'>
            <div className='aurora' />
            <Header
                onSave={handleSave}
                onExport={handleExport}
                onNew={handleNew}
                onView={handleView}
                onSignOut={handleSignOutClick}
                onSignIn={openAuth}
                saving={saving}
                userEmail={session?.email || null}
                status={session ? 'connected' : 'offline'}
                saveDisabled={saving}
                activePage='editor'
                onDuplicate={activeDiagramId ? handleDuplicate : undefined}
                diagramId={activeDiagramId}
                onRestoreVersion={handleRestoreVersion}
            />

            {/* Draft restore banner */}
            {draftBanner && (
                <div className="px-6 py-2 bg-blue-50 border-b border-blue-200 flex items-center gap-3 text-sm">
                    <span className="text-blue-700">Unsaved draft found from your last session.</span>
                    <button onClick={restoreDraft} className="text-blue-600 font-semibold hover:text-blue-500">Restore</button>
                    <button onClick={dismissDraft} className="text-slate-500 hover:text-slate-700">Dismiss</button>
                </div>
            )}

            {/* Mobile tab bar */}
            <div className="md:hidden flex border-b border-slate-200 bg-white">
                <button
                    onClick={() => setMobileTab('code')}
                    className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${mobileTab === 'code' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400'}`}
                >
                    Code
                </button>
                <button
                    onClick={() => setMobileTab('preview')}
                    className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${mobileTab === 'preview' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400'}`}
                >
                    Preview
                </button>
            </div>

            <main className='flex flex-1 overflow-hidden px-4 md:px-6 py-4 md:py-6'>
                {/* Sidebar - hidden on mobile */}
                <div className={`hidden md:flex transition-all duration-300 ${sidebarCollapsed ? 'w-12' : 'w-72'} shrink-0`}>
                    {sidebarCollapsed ? (
                        <button
                            onClick={() => setSidebarCollapsed(false)}
                            className="w-12 h-full flex items-center justify-center border border-slate-200 rounded-2xl bg-white/50 hover:bg-white transition-colors"
                            title="Expand sidebar"
                        >
                            <ChevronRight size={16} className="text-slate-400" />
                        </button>
                    ) : (
                        <div className='w-full bg-gradient-to-b from-slate-50 to-blue-50/30 border border-slate-200 rounded-2xl flex flex-col shadow-lg'>
                            <div className="flex items-center justify-between px-3 pt-3">
                                <button
                                    onClick={() => setSidebarCollapsed(true)}
                                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                                    title="Collapse sidebar"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                            </div>
                            {session && (
                                <div className='p-3 border-b border-slate-200 bg-white/40'>
                                    <p className='text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2'>Quick Create</p>
                                    <QuickProjectCreate />
                                </div>
                            )}
                            <div className='p-3 border-b border-slate-200'>
                                <p className='text-[10px] font-semibold text-slate-500 uppercase tracking-wider'>Templates</p>
                                <p className='text-[10px] text-slate-400 mt-0.5'>Pick a starting point</p>
                            </div>
                            <div className='flex-1 overflow-y-auto p-3 custom-scrollbar'>
                                <ExampleSelector onSelect={setCode} />
                            </div>
                            <div className='p-3 border-t border-slate-200 bg-white/40'>
                                {saveError ? (
                                    <div className='rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[10px] text-red-700'>{saveError}</div>
                                ) : (
                                    <div className='text-[10px] text-slate-400'>View saved diagrams on the Saved page.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Editor + Preview */}
                <div ref={containerRef} className='flex-1 flex overflow-hidden gap-4 md:gap-0 md:pl-4'>
                    {/* Desktop: side-by-side with resize. Mobile: tab-based */}
                    <div
                        className={`md:flex md:overflow-hidden ${mobileTab === 'code' ? 'flex flex-1' : 'hidden'} md:!flex`}
                        style={{ width: `${editorWidth}%`, flexShrink: 0 }}
                    >
                        <CodeEditor
                            value={code}
                            onChange={setCode}
                            title={title}
                            description={description}
                            projectId={projectId}
                            onTitleChange={setTitle}
                            onDescriptionChange={setDescription}
                            onProjectIdChange={setProjectId}
                            onSave={handleSave}
                            onExport={() => handleExport('svg')}
                            onNew={handleNew}
                            className='w-full fade-up'
                        />
                    </div>

                    <div className="hidden md:flex">
                        <ResizeHandle onResize={handleResize} />
                    </div>

                    <div className={`md:flex md:flex-1 ${mobileTab === 'preview' ? 'flex flex-1' : 'hidden'} md:!flex`}>
                        <PreviewPanel
                            code={debouncedCode}
                            className='flex-1 fade-up'
                            onRendered={setRenderedSvg}
                            onView={handleView}
                        />
                    </div>
                </div>
            </main>

            <AuthModal
                open={authOpen}
                onClose={closeAuth}
                onAuthSuccess={handleAuthSuccess}
            />
        </div>
    );
}
