'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import { confirmSignUp, signIn, signUp, type AuthSession } from '@/lib/auth';

export type AuthMode = 'signIn' | 'signUp' | 'confirm';

interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    onAuthSuccess: (session: AuthSession) => void;
    initialMode?: AuthMode;
}

export default function AuthModal({ open, onClose, onAuthSuccess, initialMode = 'signIn' }: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmCode, setConfirmCode] = useState('');

    const resetForm = () => {
        setPassword('');
        setConfirmCode('');
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleModeSwitch = (newMode: AuthMode) => {
        resetForm();
        setMode(newMode);
    };

    const handleSignIn = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const session = await signIn(email, password);
            resetForm();
            onAuthSuccess(session);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to sign in.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await signUp(email, password);
            setMode('confirm');
            setPassword('');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to sign up.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await confirmSignUp(email, confirmCode);
            setMode('signIn');
            setConfirmCode('');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to confirm sign up.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        switch (mode) {
            case 'signIn':
                return 'Sign in';
            case 'signUp':
                return 'Create account';
            case 'confirm':
                return 'Confirm sign up';
        }
    };

    return (
        <Modal open={open} onClose={handleClose} title={getTitle()}>
            {error && (
                <div className='mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600'>
                    {error}
                </div>
            )}

            {mode !== 'confirm' && (
                <form onSubmit={mode === 'signIn' ? handleSignIn : handleSignUp} className='space-y-3'>
                    <div>
                        <label className='text-[10px] uppercase tracking-[0.3em] text-slate-500'>Email</label>
                        <input
                            type='email'
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'
                            placeholder='you@example.com'
                        />
                    </div>
                    <div>
                        <label className='text-[10px] uppercase tracking-[0.3em] text-slate-500'>Password</label>
                        <input
                            type='password'
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'
                            placeholder='********'
                        />
                    </div>
                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60'
                    >
                        {loading ? 'Working...' : mode === 'signIn' ? 'Sign in' : 'Create account'}
                    </button>
                    <div className='text-center text-xs text-slate-500'>
                        {mode === 'signIn' ? (
                            <button
                                type='button'
                                onClick={() => handleModeSwitch('signUp')}
                                className='text-blue-600 hover:text-blue-500'
                            >
                                Need an account? Sign up
                            </button>
                        ) : (
                            <button
                                type='button'
                                onClick={() => handleModeSwitch('signIn')}
                                className='text-blue-600 hover:text-blue-500'
                            >
                                Have an account? Sign in
                            </button>
                        )}
                    </div>
                </form>
            )}

            {mode === 'confirm' && (
                <form onSubmit={handleConfirm} className='space-y-3'>
                    <div>
                        <label className='text-[10px] uppercase tracking-[0.3em] text-slate-500'>Confirmation code</label>
                        <input
                            type='text'
                            required
                            value={confirmCode}
                            onChange={(e) => setConfirmCode(e.target.value)}
                            className='mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'
                            placeholder='123456'
                        />
                    </div>
                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60'
                    >
                        {loading ? 'Working...' : 'Confirm'}
                    </button>
                    <button
                        type='button'
                        onClick={() => handleModeSwitch('signIn')}
                        className='text-center text-xs text-blue-600 hover:text-blue-500 w-full'
                    >
                        Back to sign in
                    </button>
                </form>
            )}
        </Modal>
    );
}
