"use client";

import { useMemo } from "react";
import { useTemplatesStore } from "@/store/templates-store";
import { ChevronRight, Plus, Loader2, CheckCircle, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttributeRow } from "./attribute-row";
import { useNotify } from "@/hooks/use-notify";
import type { TemplatesCategory, TemplatesAttribute, Requirement } from "@/lib/attributes/schema";

const REQUIREMENT_ORDER: Requirement[] = ["must-have", "optional", "logic"];

const REQUIREMENT_LABELS: Record<Requirement, string> = {
  "must-have": "Must Have",
  optional: "Optional",
  logic: "Logic",
};

function groupByRequirement(attrs: TemplatesAttribute[]) {
  const groups = new Map<Requirement, TemplatesAttribute[]>();
  for (const attr of attrs) {
    const list = groups.get(attr.requirement) ?? [];
    list.push(attr);
    groups.set(attr.requirement, list);
  }
  return groups;
}

interface CategoryRowProps {
  category: TemplatesCategory;
  siteId: string | null;
}

function CategoryRow({ category, siteId }: CategoryRowProps) {
  const {
    expandedCategories,
    toggleCategory,
    applyAttribute,
    selectedValues,
    addScriptToSite,
    scriptStatuses,
    library,
  } = useTemplatesStore();
  const notify = useNotify();
  const isExpanded = expandedCategories.has(category.id);
  const grouped = useMemo(() => groupByRequirement(category.attributes), [category.attributes]);

  const scriptStatus = scriptStatuses[category.id] ?? "idle";

  const handleAddAll = () => {
    for (const attr of category.attributes) {
      if (attr.requirement !== "must-have") continue;
      const value = selectedValues[attr.key] ?? attr.valueOptions?.[0] ?? "";
      applyAttribute(attr.key, value);
    }
    notify({ type: "Success", message: `Added must-have attributes for ${category.label}` });
  };

  const handleAddScript = () => {
    if (!siteId) {
      notify({ type: "Error", message: "Site ID not available. Make sure you're inside Webflow." });
      return;
    }
    addScriptToSite(siteId, category.id);
  };

  const scriptIcon = {
    idle: <Download className="size-3" />,
    checking: <Loader2 className="size-3 animate-spin" />,
    adding: <Loader2 className="size-3 animate-spin" />,
    added: <CheckCircle className="size-3 text-green-400" />,
    error: <AlertCircle className="size-3 text-red-400" />,
  }[scriptStatus];

  const cdnLabel = category.cdn?.displayName ?? library?.script.displayName ?? "Script";

  const scriptLabel = {
    idle: `Add ${cdnLabel}`,
    checking: "Checking…",
    adding: "Adding…",
    added: `${cdnLabel} Added`,
    error: "Failed — Retry",
  }[scriptStatus];

  return (
    <div className="group border border-white/5 rounded-xl overflow-hidden bg-white/2 hover:bg-white/4 transition-all duration-300 backdrop-blur-sm">
      <button
        onClick={() => toggleCategory(category.id)}
        className="flex items-center justify-between w-full px-4 py-3 text-left group-hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-1 rounded-md transition-all duration-300 ${isExpanded ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'}`}>
            <ChevronRight
              className={`size-3.5 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground/90 tracking-tight">{category.label}</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-1.5 font-normal py-0 h-4 text-[9px] bg-white/5 text-muted-foreground border-none">
                {category.attributes.length} attributes
              </Badge>
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-white/5 px-4 py-4 space-y-5 bg-linear-to-b from-white/1 to-transparent">
          <div className="flex items-center gap-2">
            <Button
              variant={scriptStatus === "added" ? "default" : "outline"}
              className={`gap-2 h-9 flex-1 transition-all duration-300 ${
                scriptStatus === "added" 
                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30" 
                  : "bg-white/5 hover:bg-white/10 border-white/10"
              }`}
              onClick={handleAddScript}
              disabled={scriptStatus === "checking" || scriptStatus === "adding"}
            >
              {scriptIcon}
              <span className="text-xs font-semibold">{scriptLabel}</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2 h-9 bg-white/5 hover:bg-white/10 border-white/10"
              onClick={handleAddAll}
            >
              <Plus className="size-3.5" />
              <span className="text-xs font-semibold">Add Must-Haves</span>
            </Button>
          </div>

          <div className="space-y-4">
            {REQUIREMENT_ORDER.map((req) => {
              const attrs = grouped.get(req);
              if (!attrs?.length) return null;
              return (
                <div key={req} className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <div className="h-px flex-1 bg-white/5" />
                    <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                      {REQUIREMENT_LABELS[req]}
                    </p>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className="space-y-1">
                    {attrs.map((attr) => (
                      <AttributeRow key={attr.key} attribute={attr} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function CategoryList({ siteId }: { siteId: string | null }) {
  const { library, searchQuery } = useTemplatesStore();
  if (!library) return null;

  const filtered = useMemo(() => {
    if (!searchQuery) return library.categories;
    const q = searchQuery.toLowerCase();
    return library.categories
      .map((cat) => ({
        ...cat,
        attributes: cat.attributes.filter(
          (attr) =>
            attr.key.toLowerCase().includes(q) ||
            attr.description.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.label.toLowerCase().includes(q) || cat.attributes.length > 0);
  }, [library.categories, searchQuery]);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-card/50">
        <p className="text-xs text-muted-foreground">
          No categories match &quot;{searchQuery}&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filtered.map((category) => (
        <CategoryRow key={category.id} category={category} siteId={siteId} />
      ))}
    </div>
  );
}
