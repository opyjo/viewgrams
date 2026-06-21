import { Suspense } from 'react';
import SharedDiagramView from './SharedDiagramView';

export default function SharedDiagramPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-400">Loading...</div>}>
            <SharedDiagramView />
        </Suspense>
    );
}
