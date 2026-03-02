"use client";

import { useState, useEffect, useCallback } from "react";

interface WebflowSite {
    id: string;
    displayName: string;
    shortName: string;
    previewUrl?: string;
    timeZone?: string;
    createdOn?: string;
    lastUpdated?: string;
    lastPublished?: string;
}

interface SitesState {
    sites: WebflowSite[];
    loading: boolean;
    error: string | null;
}

/**
 * Hook to fetch Webflow sites from /api/sites
 */
export function useSites(authenticated: boolean) {
    const [state, setState] = useState<SitesState>({
        sites: [],
        loading: false,
        error: null,
    });

    const fetchSites = useCallback(async () => {
        if (!authenticated) return;

        try {
            setState((prev) => ({ ...prev, loading: true, error: null }));
            const response = await fetch("/api/sites");

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch sites");
            }

            const data = await response.json();
            // Webflow SDK returns { sites: [...] } from sites.list()
            const sites = data.data?.sites || data.data || [];
            setState({ sites, loading: false, error: null });
        } catch (err) {
            setState({
                sites: [],
                loading: false,
                error: err instanceof Error ? err.message : "Failed to fetch sites",
            });
        }
    }, [authenticated]);

    useEffect(() => {
        fetchSites();
    }, [fetchSites]);

    return {
        ...state,
        refresh: fetchSites,
    };
}
