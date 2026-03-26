"use client";

import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TemplatesLibrary } from "@/lib/attributes/schema";
import { useTemplatesStore } from "@/store/templates-store";

interface LibraryPickerProps {
  library: TemplatesLibrary;
}

export function LibraryPicker({ library }: LibraryPickerProps) {
  const { clearLibrary } = useTemplatesStore();

  return (
    <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
      <button 
        onClick={clearLibrary}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3" />
        <span>Back</span>
      </button>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-foreground">{library.provider}</span>
        <a href={library.docsUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon-xs">
            <ExternalLink className="size-3 text-muted-foreground" />
          </Button>
        </a>
      </div>
    </div>
  );
}
