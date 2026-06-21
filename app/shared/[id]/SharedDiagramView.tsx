'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

/**
 * Shareable diagram view - STUB
 *
 * Full implementation requires backend changes:
 * 1. Add IAM auth resolver in AppSync for public getDiagram access
 * 2. Add `isPublic` field to diagrams DynamoDB table
 * 3. Create GSI for public diagram lookups
 * 4. Add Terraform resources for the above
 *
 * This page currently shows a placeholder message.
 */
export default function SharedDiagramView() {
    const params = useParams();
    const id = params.id as string;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
            <div className="max-w-md w-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 mx-auto mb-6">
                    <Lock size={32} className="text-slate-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Shared Diagrams</h1>
                <p className="text-sm text-slate-500 mb-2">
                    Diagram ID: <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">{id}</code>
                </p>
                <p className="text-sm text-slate-500 mb-6">
                    Public sharing is not yet available. This feature requires backend infrastructure updates (IAM auth resolver, public flag on diagrams).
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all"
                >
                    <ArrowLeft size={14} />
                    Go to Editor
                </Link>
            </div>
        </div>
    );
}
