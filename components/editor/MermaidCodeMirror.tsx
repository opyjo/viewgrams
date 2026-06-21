'use client';

import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection, placeholder as cmPlaceholder } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';

interface MermaidCodeMirrorProps {
    value: string;
    onChange: (value: string) => void;
    onSave?: () => void;
    onExport?: () => void;
    onNew?: () => void;
    placeholder?: string;
}

const lightTheme = EditorView.theme({
    '&': {
        height: '100%',
        fontSize: '13px',
        backgroundColor: 'transparent',
    },
    '.cm-content': {
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        lineHeight: '1.6',
        padding: '16px',
        caretColor: '#1e293b',
    },
    '.cm-gutters': {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#94a3b8',
    },
    '.cm-lineNumbers .cm-gutterElement': {
        padding: '0 8px 0 16px',
        minWidth: '32px',
    },
    '.cm-activeLine': {
        backgroundColor: 'rgba(59, 130, 246, 0.04)',
    },
    '.cm-activeLineGutter': {
        backgroundColor: 'transparent',
        color: '#475569',
    },
    '.cm-selectionBackground': {
        backgroundColor: 'rgba(59, 130, 246, 0.15) !important',
    },
    '.cm-cursor': {
        borderLeftColor: '#1e293b',
    },
    '&.cm-focused .cm-selectionBackground': {
        backgroundColor: 'rgba(59, 130, 246, 0.15) !important',
    },
    '.cm-scroller': {
        overflow: 'auto',
    },
});

export default function MermaidCodeMirror({
    value,
    onChange,
    onSave,
    onExport,
    onNew,
    placeholder = 'Enter Mermaid code here...',
}: MermaidCodeMirrorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const onChangeRef = useRef(onChange);
    const onSaveRef = useRef(onSave);
    const onExportRef = useRef(onExport);
    const onNewRef = useRef(onNew);

    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
    useEffect(() => { onSaveRef.current = onSave; }, [onSave]);
    useEffect(() => { onExportRef.current = onExport; }, [onExport]);
    useEffect(() => { onNewRef.current = onNew; }, [onNew]);

    useEffect(() => {
        if (!containerRef.current) return;

        const customKeymap = keymap.of([
            {
                key: 'Mod-s',
                run: () => { onSaveRef.current?.(); return true; },
            },
            {
                key: 'Mod-e',
                run: () => { onExportRef.current?.(); return true; },
            },
            {
                key: 'Mod-n',
                run: () => { onNewRef.current?.(); return true; },
            },
        ]);

        const state = EditorState.create({
            doc: value,
            extensions: [
                customKeymap,
                keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
                history(),
                lineNumbers(),
                highlightActiveLine(),
                drawSelection(),
                markdown(),
                lightTheme,
                cmPlaceholder(placeholder),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        onChangeRef.current(update.state.doc.toString());
                    }
                }),
                EditorView.lineWrapping,
            ],
        });

        const view = new EditorView({
            state,
            parent: containerRef.current,
        });

        viewRef.current = view;

        return () => {
            view.destroy();
            viewRef.current = null;
        };
        // Only create editor once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync external value changes
    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;
        const currentValue = view.state.doc.toString();
        if (currentValue !== value) {
            view.dispatch({
                changes: { from: 0, to: currentValue.length, insert: value },
            });
        }
    }, [value]);

    return <div ref={containerRef} className="h-full w-full overflow-hidden" />;
}
