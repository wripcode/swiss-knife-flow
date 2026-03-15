import { create } from "zustand";

interface FooterStore {
  message: string | null;
  setFooterGuide: (message: string) => void;
  clearFooterGuide: () => void;
}

export const useFooterStore = create<FooterStore>((set) => ({
  message: null,
  setFooterGuide: (message) => set({ message }),
  clearFooterGuide: () => set({ message: null }),
}));
