"use client";

import { useState, useEffect, useCallback } from "react";

interface AuthState {
    authenticated: boolean;
    loading: boolean;
    error: string | null;
}

/**
 * Hook to check authentication status.
 * Listens for the `auth_complete` localStorage signal set by /auth/done
 * (the OAuth self-closing page) to reload auth state without a page refresh.
 */
export function useAuth() {
    const [state, setState] = useState<AuthState>({
        authenticated: false,
        loading: true,
        error: null,
    });

    const checkAuth = useCallback(async () => {
        try {
            setState((prev) => ({ ...prev, loading: true, error: null }));
            const response = await fetch("/api/auth/status");
            const data = await response.json();
            setState({
                authenticated: data.authenticated,
                loading: false,
                error: null,
            });
        } catch {
            setState({
                authenticated: false,
                loading: false,
                error: "Failed to check authentication status",
            });
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "auth_complete") checkAuth();
        };
        window.addEventListener("storage", handleStorage);

        let bc: BroadcastChannel | null = null;
        try {
            bc = new BroadcastChannel("auth_channel");
            bc.onmessage = (e) => {
                if (e.data === "auth_complete") checkAuth();
            };
        } catch {}

        const handleVisibility = () => {
            if (document.visibilityState === "visible") checkAuth();
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            window.removeEventListener("storage", handleStorage);
            document.removeEventListener("visibilitychange", handleVisibility);
            bc?.close();
        };
    }, [checkAuth]);

    const connectUrl = "/api/auth/connect";

    return {
        ...state,
        connectUrl,
        refresh: checkAuth,
    };
}

