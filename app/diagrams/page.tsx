import { Suspense } from 'react';
import SavedDiagramsPage from '@/components/SavedDiagramsPage';

export default function SavedPage() {
    return (
        <Suspense fallback={null}>
            <SavedDiagramsPage />
        </Suspense>
    );
}
