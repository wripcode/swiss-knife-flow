"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTemplatesStore } from "@/store/templates-store";
import { useSiteStore } from "@/store/site-store";
import { Search, Loader2, AlertCircle, ChevronRight, Code } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LibraryPicker } from "./library-picker";
import { CategoryList } from "./category-list";
import { TemplatesList } from "./templates-list";
import { SiteScriptsPanel } from "./site-scripts-panel";

export function TemplatesPanel() {
  const searchParams = useSearchParams();
  const { siteId: storedSiteId, setSiteId } = useSiteStore();
  
  useEffect(() => {
    const siteIdFromParam = searchParams.get("siteId");
    if (siteIdFromParam && siteIdFromParam !== storedSiteId) {
      setSiteId(siteIdFromParam);
    }
  }, [searchParams, storedSiteId, setSiteId]);

  const siteId = searchParams.get("siteId") || storedSiteId;
  const { library, activeLibraryId, loading, load, searchQuery, setSearch } = useTemplatesStore();
  const [showInstalled, setShowInstalled] = useState(false);

  useEffect(() => {
    if (activeLibraryId && !library && !loading) load(activeLibraryId);
  }, [library, activeLibraryId, loading, load]);

  if (!siteId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive/50" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Missing Site ID</h3>
          <p className="text-sm text-muted-foreground max-w-50">
            Please open this extension from within the Webflow Designer sidebar to manage templates.
          </p>
        </div>
      </div>
    );
  }

  if (showInstalled) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <button 
            onClick={() => setShowInstalled(false)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="size-3 rotate-180" />
            <span>Back to Libraries</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 pb-4">
          <SiteScriptsPanel siteId={siteId} />
        </div>
      </div>
    );
  }

  if (activeLibraryId === null) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-1 pb-4">
          <TemplatesList />
        </div>
        
        <div className="pt-4 mt-auto shrink-0 border-t border-white/5 bg-background/50 backdrop-blur-sm pb-2">
          <button
            onClick={() => setShowInstalled(true)}
            className="w-full flex items-center justify-between p-2 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/20 transition-all duration-300 text-left group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <Code className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold tracking-tight">Manage Applied Scripts</span>
                <span className="text-[10px] text-muted-foreground group-hover:text-foreground/70 transition-colors">Review and remove scripts added to this site</span>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="size-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (!library) return null;

  return (
    <div className="flex flex-col gap-3 h-full">
      <LibraryPicker library={library} />

      <div className="relative shrink-0">
        <Search className="absolute left-2.5 top-1.5 size-3 text-muted-foreground" />
        <Input
          placeholder="Search categories or attributes..."
          className="pl-9 bg-background/50"
          size="xl"
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-1 pb-4">
        <CategoryList siteId={siteId} />
      </div>
    </div>
  );
}


