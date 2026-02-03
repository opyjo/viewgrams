'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/ui/Header';
import CodeEditor from '@/components/editor/CodeEditor';
import PreviewPanel from '@/components/editor/PreviewPanel';
import ExampleSelector from '@/components/ui/ExampleSelector';
import { defaultCode } from '@/lib/examples';
import { useDebounce } from '@/hooks/use-debounce';
import { Files, Clock, Trash2, Search, ExternalLink } from 'lucide-react';

export default function MermaidApp() {
    const [code, setCode] = useState(defaultCode);
    const debouncedCode = useDebounce(code, 500);
    const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');

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
        } else {
            // PNG Export implementation
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const data = new XMLSerializer().serializeToString(svgElement);
            const win = window.URL || window.webkitURL || window;
            const img = new Image();
            const blob = new Blob([data], { type: 'image/svg+xml' });
            const url = win.createObjectURL(blob);

            img.onload = function () {
                canvas.width = img.width * 2; // High DPI
                canvas.height = img.height * 2;
                ctx?.scale(2, 2);
                ctx?.drawImage(img, 0, 0);
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

    const handleSave = () => {
        alert('Save functionality will be connected to AWS!');
    };

    return (
        <div className='flex flex-col h-screen overflow-hidden bg-slate-50'>
            <Header onSave={handleSave} onExport={handleExport} />

            <main className='flex flex-1 overflow-hidden'>
                {/* Sidebar */}
                <div className='w-64 border-r border-slate-200 bg-white flex flex-col shrink-0'>
                    <div className='p-4 border-b border-slate-100 flex gap-1'>
                        <button
                            onClick={() => setActiveTab('editor')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'editor' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Files size={14} />
                            Editor
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'history' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Clock size={14} />
                            Saved
                        </button>
                    </div>

                    <div className='flex-1 overflow-y-auto p-4 custom-scrollbar'>
                        {activeTab === 'editor' ? (
                            <ExampleSelector onSelect={setCode} />
                        ) : (
                            <div className='flex flex-col gap-4'>
                                <div className='relative'>
                                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={14} />
                                    <input
                                        type='text'
                                        placeholder='Search diagrams...'
                                        className='w-full pl-9 pr-3 py-2 bg-slate-100 border-none rounded-lg text-xs focus:ring-1 focus:ring-blue-500/20 outline-none'
                                    />
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <div className='p-3 border border-slate-100 rounded-xl hover:border-blue-200 cursor-pointer group transition-all'>
                                        <div className='flex justify-between items-start mb-2'>
                                            <h4 className='text-xs font-bold text-slate-800 line-clamp-1'>Authentication Flow</h4>
                                            <Trash2 size={12} className='text-slate-300 hover:text-red-500 transition-colors' />
                                        </div>
                                        <div className='h-20 bg-slate-50 rounded-lg mb-2 flex items-center justify-center border border-slate-100 overflow-hidden'>
                                            <div className='scale-[0.2] opacity-40'>
                                                {/* Placeholder for SVG preview */}
                                                <Files size={48} />
                                            </div>
                                        </div>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-[10px] text-slate-400'>2 mins ago</span>
                                            <ExternalLink size={10} className='text-slate-300 group-hover:text-blue-500' />
                                        </div>
                                    </div>

                                    <p className='text-center text-[10px] text-slate-400 mt-4'>No other diagrams found</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='p-4 border-t border-slate-100 bg-slate-50/50'>
                        <div className='bg-blue-50 rounded-xl p-3 border border-blue-100'>
                            <p className='text-[10px] font-bold text-blue-600 uppercase mb-1 tracking-wider'>Cloud Sync</p>
                            <p className='text-[11px] text-blue-900/70 mb-2'>Connect your AWS backend to persist diagrams across devices.</p>
                            <button className='w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all'>
                                Configure Setup
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className='flex-1 flex overflow-hidden'>
                    <CodeEditor
                        value={code}
                        onChange={setCode}
                        className='w-[40%] min-w-[300px]'
                    />
                    <PreviewPanel
                        code={debouncedCode}
                        className='flex-1'
                    />
                </div>
            </main>
        </div>
    );
}
