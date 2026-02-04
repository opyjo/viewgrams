import { Suspense } from 'react';
import PreviewOnlyPage from '@/components/PreviewOnlyPage';

export default function PreviewPage() {
    return (
        <Suspense fallback={null}>
            <PreviewOnlyPage />
        </Suspense>
    );
}
