'use client';

import { useEffect, useRef, useCallback } from 'react';

const DRAFT_KEY = 'mermaid-draft';
const AUTOSAVE_DELAY = 5000;

interface DraftData {
    code: string;
    title: string;
    description: string;
    projectId: string | null;
    timestamp: number;
}

export function useAutoSave(
    code: string,
    title: string,
    description: string,
    projectId: string | null,
    activeDiagramId: string | null,
) {
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            if (!code.trim()) return;
            const draft: DraftData = { code, title, description, projectId, timestamp: Date.now() };
            const key = activeDiagramId ? `${DRAFT_KEY}:${activeDiagramId}` : DRAFT_KEY;
            try {
                localStorage.setItem(key, JSON.stringify(draft));
            } catch {
                // localStorage full or unavailable
            }
        }, AUTOSAVE_DELAY);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [code, title, description, projectId, activeDiagramId]);

    const loadDraft = useCallback((diagramId?: string | null): DraftData | null => {
        try {
            const key = diagramId ? `${DRAFT_KEY}:${diagramId}` : DRAFT_KEY;
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            return JSON.parse(raw) as DraftData;
        } catch {
            return null;
        }
    }, []);

    const clearDraft = useCallback((diagramId?: string | null) => {
        try {
            const key = diagramId ? `${DRAFT_KEY}:${diagramId}` : DRAFT_KEY;
            localStorage.removeItem(key);
        } catch {
            // ignore
        }
    }, []);

    return { loadDraft, clearDraft };
}
