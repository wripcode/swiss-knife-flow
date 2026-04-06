import { create } from "zustand";
import { postToExtension } from "@/lib/message-bus";
import { loadLibrary, getAvailableLibraries, type LibraryDescriptor } from "@/lib/attributes";
import type { TemplatesLibrary } from "@/lib/attributes/schema";

interface TemplatesStore {
  availableLibraries: LibraryDescriptor[];
  activeLibraryId: string | null;
  library: TemplatesLibrary | null;
  loading: boolean;
  searchQuery: string;
  expandedCategories: Set<string>;
  selectedValues: Record<string, string>;

  loadAvailableLibraries: () => Promise<void>;
  load: (id: string) => Promise<void>;
  clearLibrary: () => void;
  setSearch: (query: string) => void;
  toggleCategory: (categoryId: string) => void;
  selectValue: (attributeKey: string, value: string) => void;
  applyAttribute: (key: string, value: string) => void;
}

export const useTemplatesStore = create<TemplatesStore>((set, get) => ({
  availableLibraries: [],
  activeLibraryId: null,
  library: null,
  loading: false,
  searchQuery: "",
  expandedCategories: new Set(),
  selectedValues: {},

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
}));
