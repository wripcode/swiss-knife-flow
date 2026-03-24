import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SiteState {
  siteId: string | null;
  setSiteId: (siteId: string | null) => void;
}

export const useSiteStore = create<SiteState>()(
  persist(
    (set) => ({
      siteId: null,
      setSiteId: (siteId) => set({ siteId }),
    }),
    {
      name: "site-storage",
    }
  )
);
