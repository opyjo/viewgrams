'use client';

import React, { useEffect, useState, useRef } from 'react';
import { renderMermaid } from '@/lib/mermaid-utils';
import { cn } from '@/lib/utils';
import { AlertCircle, Eye, Loader2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface PreviewPanelProps {
    code: string;
    className?: string;
    onRendered?: (svg: string | null) => void;
    onView?: () => void;
}

export default function PreviewPanel({ code, className, onRendered, onView }: PreviewPanelProps) {
    const [svg, setSvg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateDiagram = async () => {
            if (!code.trim()) {
                setSvg(null);
                setError(null);
                return;
            }

            setLoading(true);
            const { svg: renderedSvg, error: renderError } = await renderMermaid(code);

            if (renderError) {
                setError(renderError);
                onRendered?.(null);
            } else {
                setSvg(renderedSvg);
                setError(null);
                onRendered?.(renderedSvg);
            }
            setLoading(false);
        };

        updateDiagram();
    }, [code, onRendered]);

    const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
    const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));
    const handleResetZoom = () => setZoom(1);

    return (
        <div className={cn('flex flex-col h-full bg-white/5 relative overflow-hidden border border-white/10 rounded-2xl shadow-xl shadow-black/30', className)}>
            {/* Toolbar */}
            <div className='absolute bottom-6 right-6 flex items-center gap-2 z-10'>
                <div className='flex items-center bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-lg shadow-lg overflow-hidden'>
                    {onView ? (
                        <>
                            <button
                                onClick={onView}
                                className='p-2 hover:bg-white/10 transition-colors text-slate-200'
                                title='Open focus view'
                            >
                                <Eye size={18} />
                            </button>
                            <div className='w-[1px] h-4 bg-white/10' />
                        </>
                    ) : null}
                    <button
                        onClick={handleZoomOut}
                        className='p-2 hover:bg-white/10 transition-colors text-slate-200'
                        title='Zoom Out'
                    >
                        <ZoomOut size={18} />
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
                <div className='absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-[1px] z-20'>
                    <Loader2 className='animate-spin text-amber-300' size={32} />
                </div>
            )}

            <div
                ref={containerRef}
                className='flex-1 overflow-auto p-6 flex items-center justify-center'
            >
                {error ? (
                    <div className='max-w-md w-full bg-red-950/40 border border-red-500/40 rounded-2xl p-6 flex items-start gap-4'>
                        <AlertCircle className='text-red-400 shrink-0 mt-1' size={24} />
                        <div>
                            <h3 className='font-semibold text-red-200 mb-1'>Syntax Error</h3>
                            <p className='text-sm text-red-200/80 font-mono whitespace-pre-wrap'>{error}</p>
                        </div>
                    </div>
                ) : svg ? (
                    <div
                        id='mermaid-preview'
                        style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out' }}
                        dangerouslySetInnerHTML={{ __html: svg }}
                        className='w-full h-full flex items-center justify-center bg-white/95 rounded-2xl p-4 shadow-2xl shadow-black/30 min-h-[360px]'
                    />
                ) : (
                    <div className='text-slate-300 flex flex-col items-center gap-3'>
                        <div className='w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10'>
                            <AlertCircle size={32} className='text-slate-400' />
                        </div>
                        <p className='text-sm text-slate-300'>Start typing to render your diagram.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
