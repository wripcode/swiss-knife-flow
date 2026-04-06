"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

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

async function fetchSites(): Promise<WebflowSite[]> {
  const response = await fetch("/api/sites");
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch sites");
  }
  const data = await response.json();
  return data.data?.sites || data.data || [];
}

export function useSitesQuery(authenticated: boolean) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.sites.list(),
    queryFn: fetchSites,
    enabled: authenticated,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    sites: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refresh: () => queryClient.invalidateQueries({ queryKey: queryKeys.sites.list() }),
  };
}
