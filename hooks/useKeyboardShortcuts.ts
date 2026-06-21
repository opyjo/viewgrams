'use client';

import { useEffect } from 'react';

interface ShortcutHandlers {
    onSave?: () => void;
    onExport?: () => void;
    onNew?: () => void;
}

export function useKeyboardShortcuts({ onSave, onExport, onNew }: ShortcutHandlers) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const mod = e.metaKey || e.ctrlKey;
            if (!mod) return;

            if (e.key === 's') {
                e.preventDefault();
                onSave?.();
            } else if (e.key === 'e') {
                e.preventDefault();
                onExport?.();
            } else if (e.key === 'n') {
                e.preventDefault();
                onNew?.();
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onSave, onExport, onNew]);
}
