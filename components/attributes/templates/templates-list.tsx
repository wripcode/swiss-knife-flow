"use client";

import { useEffect } from "react";
import { Loader2, ArrowRight, Box } from "lucide-react";
import { useTemplatesStore } from "@/store/templates-store";

export function TemplatesList() {
  const { availableLibraries, loadAvailableLibraries, load, loading } = useTemplatesStore();

  useEffect(() => {
    if (availableLibraries.length === 0) {
      loadAvailableLibraries();
    }
  }, [availableLibraries, loadAvailableLibraries]);

  if (availableLibraries.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin mr-2" />
        Loading templates...
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="text-xs font-medium text-muted-foreground mb-1 px-1">
        Available Libraries
      </div>
      {availableLibraries.map((lib) => (
        <button
          key={lib.id}
          onClick={() => load(lib.id)}
          disabled={loading}
          className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card hover:bg-accent/50 transition-all text-left group"
        >
          <div className="flex items-center gap-2">
            <Box className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground">
              {lib.provider}
            </span>
          </div>
          <ArrowRight className="size-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
        </button>
      ))}
    </div>
  );
}
