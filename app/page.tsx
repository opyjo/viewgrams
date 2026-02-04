import { Suspense } from 'react';
import MermaidApp from '@/components/MermaidApp';

export default function Home() {
    return (
        <Suspense fallback={null}>
            <MermaidApp />
        </Suspense>
    );
}
