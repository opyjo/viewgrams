'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { getCurrentSession, signOut as cognitoSignOut, type AuthSession } from '@/lib/auth';

interface AuthContextValue {
    session: AuthSession | null;
    loading: boolean;
    authOpen: boolean;
    openAuth: () => void;
    closeAuth: () => void;
    setSession: (session: AuthSession | null) => void;
    signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
    session: null,
    loading: true,
    authOpen: false,
    openAuth: () => {},
    closeAuth: () => {},
    setSession: () => {},
    signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [authOpen, setAuthOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;
        getCurrentSession().then((current) => {
            if (isMounted) {
                setSession(current);
                setLoading(false);
            }
        });
        return () => {
            isMounted = false;
        };
    }, []);

    const openAuth = useCallback(() => setAuthOpen(true), []);
    const closeAuth = useCallback(() => setAuthOpen(false), []);

    const handleSignOut = useCallback(() => {
        cognitoSignOut();
        setSession(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                session,
                loading,
                authOpen,
                openAuth,
                closeAuth,
                setSession,
                signOut: handleSignOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
