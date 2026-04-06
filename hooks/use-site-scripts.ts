"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { postToExtension } from "@/lib/message-bus";

interface InstalledScript {
  id: string;
  location: string;
  version: string;
}

interface RegisteredScript {
  id: string;
  version: string;
}

async function fetchInstalledScripts(siteId: string): Promise<InstalledScript[]> {
  const res = await fetch(`/api/sites/${siteId}/custom-code`);
  if (!res.ok) throw new Error("Failed to fetch installed scripts");
  const data = await res.json();
  return data.data?.scripts || [];
}

export function useSiteScriptsQuery(siteId: string | null) {
  return useQuery({
    queryKey: queryKeys.sites.customCode(siteId ?? ""),
    queryFn: () => fetchInstalledScripts(siteId!),
    enabled: !!siteId,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useRemoveScript(siteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scriptId: string) => {
      const existing = queryClient.getQueryData<InstalledScript[]>(
        queryKeys.sites.customCode(siteId)
      ) ?? [];
      const updated = existing.filter((s) => s.id !== scriptId);
      const res = await fetch(`/api/sites/${siteId}/custom-code`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scripts: updated }),
      });
      if (!res.ok) throw new Error("Failed to remove script");
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.customCode(siteId) });
      postToExtension("NOTIFY", { type: "success", message: "Script removed from site" });
    },
    onError: () => {
      postToExtension("NOTIFY", { type: "error", message: "Failed to remove script" });
    },
  });
}

interface AddScriptPayload {
  hostedLocation: string;
  integrityHash: string;
  version: string;
  displayName: string;
  canCopy: boolean;
}

export function useAddScript(siteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddScriptPayload) => {
      const { hostedLocation, integrityHash, version, displayName, canCopy } = payload;
      const scriptId = displayName.toLowerCase().replace(/\s+/g, "-");

      const listRes = await fetch(`/api/sites/${siteId}/scripts`);
      const listData = await listRes.json();
      const registered: RegisteredScript[] = listData.data?.registeredScripts ?? [];

      if (!registered.some((s) => s.id === scriptId)) {
        const regRes = await fetch(`/api/sites/${siteId}/scripts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostedLocation, integrityHash, version, displayName, canCopy }),
        });
        if (!regRes.ok) throw new Error("Script registration failed");
      }

      const appliedRes = await fetch(`/api/sites/${siteId}/custom-code`);
      const appliedData = await appliedRes.json();
      const existingScripts: InstalledScript[] = appliedData.data?.scripts ?? [];
      const mergedScripts = [
        ...existingScripts.filter((s) => s.id !== scriptId),
        { id: scriptId, location: "header", version },
      ];

      const upsertRes = await fetch(`/api/sites/${siteId}/custom-code`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scripts: mergedScripts }),
      });
      if (!upsertRes.ok) throw new Error("Failed to apply script");

      return { scriptId, mergedScripts };
    },
    onSuccess: (_result, { displayName }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sites.customCode(siteId) });
      postToExtension("NOTIFY", { type: "success", message: `${displayName} script added to site!` });
    },
    onError: () => {
      postToExtension("NOTIFY", { type: "error", message: "Failed to add script to site." });
    },
  });
}
