"use client";

import { useEffect, useState } from "react";
import { useTemplatesStore } from "@/store/templates-store";
import { Loader2, Trash2, Shield, Code, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SiteScriptsPanel({ siteId }: { siteId: string }) {
  const { installedScripts, fetchInstalledScripts, removeScriptFromSite } = useTemplatesStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchInstalledScripts(siteId);
      setLoading(false);
    };
    load();
  }, [siteId, fetchInstalledScripts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (installedScripts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl bg-white/2 border-white/10">
        <div className="p-3 rounded-full bg-white/5 mb-3 text-muted-foreground">
          <Code className="size-6" />
        </div>
        <p className="text-sm font-medium text-foreground/80">No scripts added yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-45">
          Add scripts from the library to unlock advanced functionality.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Shield className="size-3.5 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Applied Site Scripts
          </h3>
        </div>
        <Badge variant="outline" className="text-[10px] h-5 bg-white/5 border-white/10">
          {installedScripts.length} Active
        </Badge>
      </div>

      <div className="grid gap-2">
        {installedScripts.map((script) => (
          <div
            key={script.id}
            className="group flex items-center justify-between p-2 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all duration-300"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-1 rounded-lg bg-primary/80 shrink-0">
                <Code className="size-3" />
              </div>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="text-sm font-medium text-foreground/90 truncate">
                    {script.id.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                  <Badge className="text-[9px] h-3.5 px-1 bg-white/10">
                    v{script.version}
                  </Badge>
                </div>
                
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="capitalize">{script.location} Location</span>
                  {/* <span className="text-white/10">•</span>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="flex items-center gap-1 hover:text-foreground transition-colors cursor-help">
                          <Info className="size-2.5" />
                          <span>Details</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-popover border border-border">
                        ID: {script.id}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider> */}
                  <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
              onClick={() => removeScriptFromSite(siteId, script.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
                </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
