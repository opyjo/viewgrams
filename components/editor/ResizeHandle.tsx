'use client';

import React, { useCallback, useRef } from 'react';

interface ResizeHandleProps {
    onResize: (deltaX: number) => void;
}

export default function ResizeHandle({ onResize }: ResizeHandleProps) {
    const startXRef = useRef<number>(0);
    const draggingRef = useRef(false);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault();
        draggingRef.current = true;
        startXRef.current = e.clientX;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!draggingRef.current) return;
        const deltaX = e.clientX - startXRef.current;
        startXRef.current = e.clientX;
        onResize(deltaX);
    }, [onResize]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        draggingRef.current = false;
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }, []);

    return (
        <div
            className="w-2 shrink-0 cursor-col-resize flex items-center justify-center group hover:bg-blue-100 transition-colors rounded-full"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            <div className="w-0.5 h-8 bg-slate-300 group-hover:bg-blue-400 rounded-full transition-colors" />
        </div>
    );
}
