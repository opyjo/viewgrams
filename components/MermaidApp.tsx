'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import CodeEditor from '@/components/editor/CodeEditor';
import PreviewPanel from '@/components/editor/PreviewPanel';
import ExampleSelector from '@/components/ui/ExampleSelector';
import QuickProjectCreate from '@/components/ui/QuickProjectCreate';
import { defaultCode } from '@/lib/examples';
import { useDebounce } from '@/hooks/use-debounce';
import { getCurrentSession, signOut, type AuthSession } from '@/lib/auth';
import AuthModal from '@/components/ui/AuthModal';
import Modal from '@/components/ui/Modal';
import { CREATE_DIAGRAM, UPDATE_DIAGRAM } from '@/graphql/mutations';
import { GET_DIAGRAM } from '@/graphql/queries';

interface Diagram {
    id: string;
    title: string;
    description?: string | null;
    svgPreview?: string | null;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[] | null;
    code: string;
    projectId?: string | null;
}

interface CreateDiagramInput {
    title: string;
    description?: string | null;
    code: string;
    svgPreview?: string | null;
    tags?: string[] | null;
    projectId?: string | null;
}

interface CreateDiagramResult {
    createDiagram: { id: string } | null;
}

interface GetDiagramResult {
    getDiagram: Diagram | null;
}

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
    const router = useRouter();
    const searchParams = useSearchParams();
    const diagramParam = searchParams.get('diagram');

    const [authOpen, setAuthOpen] = useState(false);
    const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);
    const [session, setSession] = useState<AuthSession | null>(null);
    const [sessionLoading, setSessionLoading] = useState(true);

    const [fetchDiagram] = useLazyQuery<GetDiagramResult, { id: string }>(GET_DIAGRAM, {
        fetchPolicy: 'network-only',
    });

    const [createDiagram] = useMutation<CreateDiagramResult, { input: CreateDiagramInput }>(CREATE_DIAGRAM);
    const [updateDiagram] = useMutation(UPDATE_DIAGRAM);

    useEffect(() => {
        let isMounted = true;
        getCurrentSession().then((current) => {
            if (isMounted) {
                setSession(current);
                setSessionLoading(false);
            }
        });
        return () => {
            isMounted = false;
        };
    }, []);

    const openAuth = () => {
        setAuthOpen(true);
    };

    const handleAuthSuccess = (newSession: AuthSession) => {
        setSession(newSession);
        setAuthOpen(false);
    };

    const handleExport = (type: 'svg' | 'png') => {
        const svgElement = document.querySelector('#mermaid-preview svg') as HTMLElement;
        if (!svgElement) return;

        if (type === 'svg') {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement('a');
            downloadLink.href = svgUrl;
            downloadLink.download = 'diagram.svg';
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
                downloadLink.download = 'diagram.png';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            };
            img.src = url;
        }
    };

    const handleSave = async () => {
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

            setSaveSuccessOpen(true);

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save diagram.';
            setSaveError(message);
        } finally {
            setSaving(false);
        }
    };

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

    const handleNew = () => {
        setActiveDiagramId(null);
        setTitle('');
        setDescription('');
        setProjectId(null);
        setCode(defaultCode);
        setRenderedSvg(null);
        setSaveError(null);
        router.replace('/');
    };

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
    }, [diagramParam, session, activeDiagramId, sessionLoading, handleSelectDiagram]);

    const handleSignOut = () => {
        signOut();
        setSession(null);
        handleNew();
    };

    return (
        <div className='relative flex flex-col h-screen overflow-hidden bg-slate-50'>
            <div className='aurora' />
            <Header
                onSave={handleSave}
                onExport={handleExport}
                onNew={handleNew}
                onSignOut={handleSignOut}
                onSignIn={openAuth}
                saving={saving}
                userEmail={session?.email || null}
                status={session ? 'connected' : 'offline'}
                saveDisabled={saving}
                activePage='editor'
            />

            <main className='flex flex-1 overflow-hidden px-6 py-6'>
                <div className='w-72 bg-gradient-to-b from-slate-50 to-blue-50/30 border border-slate-200 rounded-2xl flex flex-col shrink-0 shadow-lg'>
                    {/* Projects Section */}
                    {session && (
                        <div className='p-3 border-b border-slate-200 bg-white/40'>
                            <p className='text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2'>Quick Create</p>
                            <QuickProjectCreate />
                        </div>
                    )}

                    {/* Templates Section */}
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

                <div className='flex-1 flex overflow-hidden gap-6 pl-6'>
                    <CodeEditor
                        value={code}
                        onChange={setCode}
                        title={title}
                        description={description}
                        projectId={projectId}
                        onTitleChange={setTitle}
                        onDescriptionChange={setDescription}
                        onProjectIdChange={setProjectId}
                        className='w-[42%] min-w-[320px] fade-up'
                    />
                    <PreviewPanel
                        code={debouncedCode}
                        className='flex-1 fade-up'
                        onRendered={setRenderedSvg}
                        onView={handleView}
                    />
                </div>
            </main>

            <AuthModal
                open={authOpen}
                onClose={() => setAuthOpen(false)}
                onAuthSuccess={handleAuthSuccess}
            />

            <Modal
                open={saveSuccessOpen}
                onClose={() => setSaveSuccessOpen(false)}
                title="Success"
            >
                <div className="text-center py-4">
                    <div className="text-green-400 text-5xl mb-4">✓</div>
                    <p className="text-slate-300">Your diagram has been saved successfully!</p>
                </div>
            </Modal>
        </div>
    );
}
