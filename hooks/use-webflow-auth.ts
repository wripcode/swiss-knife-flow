"use client";

import { useState, useEffect, useCallback } from "react";

interface WebflowAuthState {
    authenticated: boolean;
    loading: boolean;
    error: string | null;
}

/**
 * Hook to check Webflow authentication status
 */
export function useWebflowAuth() {
    const [state, setState] = useState<WebflowAuthState>({
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

    const connectUrl = "/api/auth/webflow";

    return {
        ...state,
        connectUrl,
        refresh: checkAuth,
    };
}
