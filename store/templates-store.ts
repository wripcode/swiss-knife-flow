import { create } from "zustand";
import { postToExtension } from "@/lib/message-bus";
import { loadLibrary, getAvailableLibraries, type LibraryDescriptor } from "@/lib/attributes";
import type { TemplatesLibrary } from "@/lib/attributes/schema";

type ScriptStatus = "idle" | "checking" | "adding" | "added" | "error";

interface TemplatesStore {
  availableLibraries: LibraryDescriptor[];
  activeLibraryId: string | null;
  library: TemplatesLibrary | null;
  loading: boolean;
  searchQuery: string;
  expandedCategories: Set<string>;
  selectedValues: Record<string, string>;
  scriptStatuses: Record<string, ScriptStatus>;
  installedScripts: any[];

  loadAvailableLibraries: () => Promise<void>;
  load: (id: string) => Promise<void>;
  clearLibrary: () => void;
  setSearch: (query: string) => void;
  toggleCategory: (categoryId: string) => void;
  selectValue: (attributeKey: string, value: string) => void;
  applyAttribute: (key: string, value: string) => void;
  addScriptToSite: (siteId: string) => Promise<void>;
  removeScriptFromSite: (siteId: string, scriptId: string) => Promise<void>;
  fetchInstalledScripts: (siteId: string) => Promise<void>;
}

export const useTemplatesStore = create<TemplatesStore>((set, get) => ({
  availableLibraries: [],
  activeLibraryId: null,
  library: null,
  loading: false,
  searchQuery: "",
  expandedCategories: new Set(),
  selectedValues: {},
  scriptStatuses: {},
  installedScripts: [],

  loadAvailableLibraries: async () => {
    try {
      const libs = await getAvailableLibraries();
      set({ availableLibraries: libs });
    } catch (e) {
      console.error("Failed to load available libraries", e);
    }
  },

  load: async (id: string) => {
    set({ loading: true, activeLibraryId: id });
    try {
      const library = await loadLibrary(id);
      set({ library, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  clearLibrary: () => {
    set({ activeLibraryId: null, library: null });
  },

  setSearch: (query) => set({ searchQuery: query }),

  toggleCategory: (categoryId) => {
    const expanded = new Set(get().expandedCategories);
    if (expanded.has(categoryId)) {
      expanded.delete(categoryId);
    } else {
      expanded.add(categoryId);
    }
    set({ expandedCategories: expanded });
  },

  selectValue: (attributeKey, value) => {
    set({ selectedValues: { ...get().selectedValues, [attributeKey]: value } });
  },

  applyAttribute: (key, value) => {
    postToExtension("SET_ATTRIBUTE", { name: key, value });
  },

  fetchInstalledScripts: async (siteId) => {
    if (!siteId) return;
    try {
      const res = await fetch(`/api/sites/${siteId}/custom-code`);
      const data = await res.json();
      set({ installedScripts: data.data?.scripts || [] });
    } catch (e) {
      console.error("Failed to fetch installed scripts", e);
    }
  },

  removeScriptFromSite: async (siteId, scriptId) => {
    if (!siteId || !scriptId) return;
    try {
      const { installedScripts } = get();
      const updatedScripts = installedScripts.filter((s) => s.id !== scriptId);

      const res = await fetch(`/api/sites/${siteId}/custom-code`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scripts: updatedScripts }),
      });

      if (!res.ok) throw new Error("Failed to remove script");

      set({ installedScripts: updatedScripts });
      postToExtension("NOTIFY", { type: "success", message: "Script removed from site" });
    } catch {
      postToExtension("NOTIFY", { type: "error", message: "Failed to remove script" });
    }
  },

  addScriptToSite: async (siteId) => {
    const { library } = get();
    if (!library?.script || !siteId) return;

    const { hostedLocation, integrityHash, version, displayName } = library.script;
    const statusKey = library.id;

    set({ scriptStatuses: { ...get().scriptStatuses, [statusKey]: "checking" } });

    try {
      // Step 1: Check if already registered
      const listRes = await fetch(`/api/sites/${siteId}/scripts`);
      const listData = await listRes.json();
      const registered: Array<{ id: string; version: string }> =
        listData.data?.registeredScripts ?? [];

      const scriptId = displayName.toLowerCase().replace(/\s+/g, "-");
      const alreadyRegistered = registered.some((s) => s.id === scriptId);

      set({ scriptStatuses: { ...get().scriptStatuses, [statusKey]: "adding" } });

      // Step 2: Register if needed
      if (!alreadyRegistered) {
        const regRes = await fetch(`/api/sites/${siteId}/scripts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostedLocation, integrityHash, version, displayName, canCopy: true }),
        });
        if (!regRes.ok) throw new Error("Script registration failed");
      }

      // Step 3: Get current applied scripts then upsert-merge
      const appliedRes = await fetch(`/api/sites/${siteId}/custom-code`);
      const appliedData = await appliedRes.json();
      const existingScripts: Array<{ id: string; location: string; version: string }> =
        appliedData.data?.scripts ?? [];

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

      set({
        scriptStatuses: { ...get().scriptStatuses, [statusKey]: "added" },
        installedScripts: mergedScripts
      });
      postToExtension("NOTIFY", { type: "success", message: `${displayName} script added to site!` });
    } catch {
      set({ scriptStatuses: { ...get().scriptStatuses, [statusKey]: "error" } });
      postToExtension("NOTIFY", { type: "error", message: "Failed to add script to site." });
    }
  },
}));
