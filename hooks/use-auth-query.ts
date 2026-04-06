"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryKeys } from "@/lib/query-keys";

async function fetchAuthStatus(): Promise<{ authenticated: boolean }> {
  const response = await fetch("/api/auth/status");
  if (!response.ok) throw new Error("Failed to check authentication status");
  return response.json();
}

export function useAuthQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.auth.status(),
    queryFn: fetchAuthStatus,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    select: (data) => data.authenticated,
  });

  useEffect(() => {
    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.status() });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "auth_complete") invalidate();
    };
    window.addEventListener("storage", handleStorage);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("auth_channel");
      bc.onmessage = (e) => {
        if (e.data === "auth_complete") invalidate();
      };
    } catch {}

    return () => {
      window.removeEventListener("storage", handleStorage);
      bc?.close();
    };
  }, [queryClient]);

  return {
    authenticated: query.data ?? false,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    connectUrl: "/api/auth/connect",
    refresh: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.status() }),
  };
}
