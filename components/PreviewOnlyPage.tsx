'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import { renderMermaid } from '@/lib/mermaid-utils';
import { sanitizeSvg } from '@/lib/sanitize';
import { useAuth } from '@/hooks/useAuth';
import { GET_DIAGRAM } from '@/graphql/queries';
import { ArrowLeft, Hand, Loader2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type { Diagram, GetDiagramResult } from '@/types/diagram';

export default function PreviewOnlyPage() {
    const searchParams = useSearchParams();
    const diagramId = searchParams.get('diagram');
    const [code, setCode] = useState('');
    const [title, setTitle] = useState('Preview');
    const [svg, setSvg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [panMode, setPanMode] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { session, loading: sessionLoading } = useAuth();

    const [fetchDiagram] = useLazyQuery<GetDiagramResult, { id: string }>(GET_DIAGRAM, {
        fetchPolicy: 'network-only',
    });

    useEffect(() => {
        const storedCode = typeof window !== 'undefined' ? sessionStorage.getItem('preview:code') : null;
        const storedTitle = typeof window !== 'undefined' ? sessionStorage.getItem('preview:title') : null;
        if (storedCode) {
            setCode(storedCode);
        }
        if (storedTitle) {
            setTitle(storedTitle);
        }
    }, []);

    useEffect(() => {
        if (!diagramId) return;
        if (sessionLoading) return;
        if (!session) return;
        if (code) return;

        fetchDiagram({ variables: { id: diagramId } })
            .then((result) => {
                const diagram: Diagram | null = result.data?.getDiagram || null;
                if (!diagram) return;
                setCode(diagram.code || '');
                setTitle(diagram.title || 'Preview');
            })
            .catch((err) => {
                const message = err instanceof Error ? err.message : 'Unable to load diagram.';
                setError(message);
            });
    }, [diagramId, sessionLoading, session, code, fetchDiagram]);

    useEffect(() => {
        if (!code.trim()) {
            setSvg(null);
            return;
        }
        setLoading(true);
        renderMermaid(code).then(({ svg: rendered, error: renderError }) => {
            if (renderError) {
                setError(renderError);
                setSvg(null);
            } else {
                setError(null);
                setSvg(rendered ? sanitizeSvg(rendered) : null);
            }
            setLoading(false);
        });
    }, [code]);

    const handleZoomIn = () => setZoom((current) => Math.min(current + 0.2, 3));
    const handleZoomOut = () => setZoom((current) => Math.max(current - 0.2, 0.5));
    const handleResetZoom = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const handlePanToggle = () => {
        setPanMode((current) => !current);
        setIsPanning(false);
        panStart.current = null;
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!panMode) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setIsPanning(true);
        panStart.current = {
            x: event.clientX,
            y: event.clientY,
            panX: pan.x,
            panY: pan.y,
        };
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!panMode || !panStart.current) return;
        const deltaX = event.clientX - panStart.current.x;
        const deltaY = event.clientY - panStart.current.y;
        setPan({
            x: panStart.current.panX + deltaX,
            y: panStart.current.panY + deltaY,
        });
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!panMode) return;
        event.currentTarget.releasePointerCapture(event.pointerId);
        setIsPanning(false);
        panStart.current = null;
    };

    // Ctrl+Scroll zoom
    const handleWheel = useCallback((e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom((z) => Math.min(3, Math.max(0.5, z + delta)));
        }
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    return (
        <div className='relative min-h-screen bg-slate-50'>
            <div className='aurora' />
            <Header
                activePage='editor'
                showEditorActions={false}
                status={session ? 'connected' : 'offline'}
                userEmail={session?.email || null}
            />
            <main className='relative px-4 md:px-6 py-8'>
                <div className='mx-auto max-w-6xl'>
                    <div className='flex items-center justify-between mb-6'>
                        <div>
                            <p className='text-xs uppercase tracking-[0.35em] text-slate-400'>Focus view</p>
                            <h1 className='text-2xl font-semibold text-slate-900'>{title}</h1>
                        </div>
                        <Link
                            href={diagramId ? `/?diagram=${diagramId}` : '/'}
                            className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all'
                        >
                            <ArrowLeft size={14} />
                            Back to editor
                        </Link>
                    </div>

                    {!session && diagramId && !sessionLoading && !code && (
                        <div className='rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500'>
                            Sign in to view this saved diagram.
                        </div>
                    )}

                    <div ref={containerRef} className='relative min-h-[70vh] rounded-[28px] border border-slate-200 bg-white shadow-xl overflow-hidden'>
                        <div className='absolute bottom-6 right-6 flex items-center gap-2 z-10'>
                            <div className='flex items-center bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-lg shadow-lg overflow-hidden'>
                                <button
                                    onClick={handleZoomOut}
                                    className='p-2 hover:bg-white/10 transition-colors text-slate-200'
                                    title='Zoom Out'
                                >
                                    <ZoomOut size={18} />
                                </button>
                                <div className='w-[1px] h-4 bg-white/10' />
                                <button
                                    onClick={handlePanToggle}
                                    className={`p-2 transition-colors text-slate-200 ${panMode ? 'bg-white/10' : 'hover:bg-white/10'}`}
                                    title='Pan mode'
                                >
                                    <Hand size={18} />
                                </button>
                                <div className='w-[1px] h-4 bg-white/10' />
                                <button
                                    onClick={handleResetZoom}
                                    className='px-2 py-1 text-xs font-medium hover:bg-white/10 transition-colors text-slate-200'
                                    title='Reset Zoom'
                                >
                                    {Math.round(zoom * 100)}%
                                </button>
                                <div className='w-[1px] h-4 bg-white/10' />
                                <button
                                    onClick={handleZoomIn}
                                    className='p-2 hover:bg-white/10 transition-colors text-slate-200'
                                    title='Zoom In'
                                >
                                    <ZoomIn size={18} />
                                </button>
                                <div className='w-[1px] h-4 bg-white/10' />
                                <button
                                    onClick={handleResetZoom}
                                    className='p-2 hover:bg-white/10 transition-colors text-slate-200'
                                    title='Reset'
                                >
                                    <RotateCcw size={18} />
                                </button>
                            </div>
                        </div>
                        {loading && (
                            <div className='absolute inset-0 flex items-center justify-center bg-white/70'>
                                <Loader2 className='animate-spin text-slate-400' size={28} />
                            </div>
                        )}
                        {error ? (
                            <div className='flex items-center justify-center min-h-[70vh] text-sm text-red-500'>
                                {error}
                            </div>
                        ) : svg ? (
                            <div
                                className='w-full h-full flex items-center justify-center p-8'
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerLeave={handlePointerUp}
                                style={{
                                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                    transition: isPanning ? 'none' : 'transform 0.2s ease-out',
                                    cursor: panMode ? (isPanning ? 'grabbing' : 'grab') : 'default',
                                }}
                                dangerouslySetInnerHTML={{ __html: svg }}
                            />
                        ) : (
                            <div className='flex items-center justify-center min-h-[70vh] text-sm text-slate-400'>
                                Nothing to preview yet.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
