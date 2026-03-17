import { create } from "zustand";
import { postToExtension } from "@/lib/message-bus";

export interface Attribute {
  name: string;
  value: string;
}

export interface ElementAttributeGroup {
  elementId: string;
  elementType: string;
  classNames: string[];
  attributes: Attribute[];
}

interface AttributesStore {
  elementGroups: ElementAttributeGroup[];
  searchQuery: string;
  editingAttribute: (Attribute & { elementId: string }) | null;
  bulkRenameEnabled: boolean;
  bulkDeleteEnabled: boolean;
  selectedElementId: string | null;

  setSearchQuery: (query: string) => void;
  setEditingAttribute: (attr: (Attribute & { elementId: string }) | null) => void;
  toggleBulkRename: () => void;
  toggleBulkDelete: () => void;
  setElementGroups: (groups: ElementAttributeGroup[]) => void;
  setSelectedElementId: (id: string | null) => void;

  fetchAttributes: () => void;
  saveAttribute: (oldName: string | null, name: string, value: string, elementId?: string) => void;
  removeAttribute: (name: string, elementId: string) => void;
  selectElement: (elementId: string) => void;

  getFilteredGroups: () => ElementAttributeGroup[];
  getTotalAttributeCount: () => number;
}

export const useAttributesStore = create<AttributesStore>((set, get) => ({
  elementGroups: [],
  searchQuery: "",
  editingAttribute: null,
  bulkRenameEnabled: false,
  bulkDeleteEnabled: false,
  selectedElementId: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setEditingAttribute: (attr) => set({ editingAttribute: attr }),
  toggleBulkRename: () => set((state) => ({ bulkRenameEnabled: !state.bulkRenameEnabled })),
  toggleBulkDelete: () => set((state) => ({ bulkDeleteEnabled: !state.bulkDeleteEnabled })),
  setElementGroups: (groups) => set({ elementGroups: groups }),
  setSelectedElementId: (id) => set({ selectedElementId: id }),

  fetchAttributes: () => {
    postToExtension("GET_ATTRIBUTES");
  },

  saveAttribute: (oldName, name, value, elementId?) => {
    if (oldName && oldName !== name) {
      postToExtension("REMOVE_ATTRIBUTE", { name: oldName, elementId });
    }
    postToExtension("SET_ATTRIBUTE", { name, value, elementId });
    set({ editingAttribute: null });
  },

  removeAttribute: (name, elementId) => {
    postToExtension("REMOVE_ATTRIBUTE", { name, elementId });
  },

  selectElement: (elementId) => {
    postToExtension("SELECT_ELEMENT", { elementId });
  },

  getFilteredGroups: () => {
    const { elementGroups, searchQuery } = get();
    if (!searchQuery) return elementGroups;

    const q = searchQuery.toLowerCase();
    return elementGroups
      .map((group) => ({
        ...group,
        attributes: group.attributes.filter(
          (attr) =>
            attr.name.toLowerCase().includes(q) ||
            attr.value.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.attributes.length > 0);
  },

  getTotalAttributeCount: () => {
    return get().elementGroups.reduce((sum, g) => sum + g.attributes.length, 0);
  },
}));
