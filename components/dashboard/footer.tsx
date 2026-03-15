"use client";

import { X } from "lucide-react";
import { useFooterStore } from "@/store/footer-store";

/**
 * Sticky bottom status bar that displays contextual guide messages from the footer store.
 * Renders nothing when no message is set. Tool pages drive content via useFooterStore.
 */
export function AppFooter() {
  const { message, clearFooterGuide } = useFooterStore();

  if (!message) return null;

  return (
    <footer className="flex items-center justify-between gap-2 px-3 py-2 border-t bg-card shrink-0">
      <div className="flex items-center min-w-0">
        <p className="text-[10px] leading-none truncate text-muted-foreground">
          {message}
        </p>
      </div>
      <button
        onClick={clearFooterGuide}
        aria-label="Dismiss guide"
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="size-2.5" />
      </button>
    </footer>
  );
}
