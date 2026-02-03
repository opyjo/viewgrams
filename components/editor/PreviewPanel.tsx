'use client';

import React, { useEffect, useState, useRef } from 'react';
import { renderMermaid } from '@/lib/mermaid-utils';
import { cn } from '@/lib/utils';
import { AlertCircle, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface PreviewPanelProps {
    code: string;
    className?: string;
}

export default function PreviewPanel({ code, className }: PreviewPanelProps) {
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
            } else {
                setSvg(renderedSvg);
                setError(null);
            }
            setLoading(false);
        };

        updateDiagram();
    }, [code]);

    const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
    const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));
    const handleResetZoom = () => setZoom(1);

    return (
        <div className={cn('flex flex-col h-full bg-slate-50 relative overflow-hidden', className)}>
            {/* Toolbar */}
            <div className='absolute bottom-6 right-6 flex items-center gap-2 z-10'>
                <div className='flex items-center bg-white/80 backdrop-blur-md border border-slate-200 rounded-lg shadow-lg overflow-hidden'>
                    <button
                        onClick={handleZoomOut}
                        className='p-2 hover:bg-slate-100 transition-colors text-slate-600'
                        title='Zoom Out'
                    >
                        <ZoomOut size={18} />
                    </button>
                    <div className='w-[1px] h-4 bg-slate-200' />
                    <button
                        onClick={handleResetZoom}
                        className='px-2 py-1 text-xs font-medium hover:bg-slate-100 transition-colors text-slate-600'
                        title='Reset Zoom'
                    >
                        {Math.round(zoom * 100)}%
                    </button>
                    <div className='w-[1px] h-4 bg-slate-200' />
                    <button
                        onClick={handleZoomIn}
                        className='p-2 hover:bg-slate-100 transition-colors text-slate-600'
                        title='Zoom In'
                    >
                        <ZoomIn size={18} />
                    </button>
                    <div className='w-[1px] h-4 bg-slate-200' />
                    <button
                        onClick={handleResetZoom}
                        className='p-2 hover:bg-slate-100 transition-colors text-slate-600'
                        title='Reset'
                    >
                        <RotateCcw size={18} />
                    </button>
                </div>
            </div>

            {loading && (
                <div className='absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-20'>
                    <Loader2 className='animate-spin text-blue-500' size={32} />
                </div>
            )}

            <div
                ref={containerRef}
                className='flex-1 overflow-auto p-8 flex items-center justify-center'
            >
                {error ? (
                    <div className='max-w-md w-full bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4'>
                        <AlertCircle className='text-red-500 shrink-0 mt-1' size={24} />
                        <div>
                            <h3 className='font-semibold text-red-900 mb-1'>Syntax Error</h3>
                            <p className='text-sm text-red-700 font-mono whitespace-pre-wrap'>{error}</p>
                        </div>
                    </div>
                ) : svg ? (
                    <div
                        id='mermaid-preview'
                        style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out' }}
                        dangerouslySetInnerHTML={{ __html: svg }}
                        className='w-full h-full flex items-center justify-center bg-white rounded-lg p-4 shadow-sm min-h-[400px]'
                    />
                ) : (
                    <div className='text-slate-400 italic flex flex-col items-center gap-3'>
                        <div className='w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center'>
                            <AlertCircle size={32} />
                        </div>
                        <p>Waiting for code input...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
