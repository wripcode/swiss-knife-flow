"use client";

import { useTemplatesStore } from "@/store/templates-store";
import { useNotify } from "@/hooks/use-notify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Copy } from "lucide-react";
import type { TemplatesAttribute, Requirement } from "@/lib/attributes/schema";

interface AttributeRowProps {
  attribute: TemplatesAttribute;
}

const REQUIREMENT_STYLES: Record<Requirement, string> = {
  "must-have": "bg-primary border-0",
  optional: "bg-muted border-0",
  logic: "bg-[var(--wf-purple-bg)]/15 text-[var(--wf-purple-bg)] border-0",
};

export function AttributeRow({ attribute }: AttributeRowProps) {
  const { selectedValues, selectValue, applyAttribute } = useTemplatesStore();
  const notify = useNotify();
  const currentValue = selectedValues[attribute.key] ?? attribute.valueOptions?.[0] ?? "";

  const handleAdd = () => {
    applyAttribute(attribute.key, currentValue);
    notify({ type: "Success", message: `Added ${attribute.key}="${currentValue}"` });
  };

  const handleCopyKey = () => {
    try {
      document.execCommand("copy");
    } catch {
      /* noop */
    }
    const el = document.createElement("textarea");
    el.value = attribute.key;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    notify({ type: "Info", message: `Copied "${attribute.key}"` });
  };

  return (
    <div className="flex items-center justify-between gap-2 py-1.5 px-1 group/row hover:bg-accent/40 rounded-md transition-colors">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          onClick={handleCopyKey}
          className="text-xs font-mono  truncate hover:underline cursor-pointer text-left"
          title={attribute.description}
        >
          {attribute.key}
        </button>
        <Badge className={`px-1.5 py-0 rounded-sm font-normal text-[10px] h-4 shrink-0 ${REQUIREMENT_STYLES[attribute.requirement]}`}>
          {attribute.requirement}
        </Badge>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {attribute.valueOptions && attribute.valueOptions.length > 0 && (
          <Select
            value={currentValue}
            onValueChange={(v) => selectValue(attribute.key, v)}
          >
            <SelectTrigger className="h-6 w-[120px] text-md bg-background/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {attribute.valueOptions.map((opt) => (
                <SelectItem key={opt} value={opt} className="text-md">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="size-5 h-5 w-5 text-muted-foreground hover:text-primary opacity-0 group-hover/row:opacity-100 transition-opacity"
          onClick={handleAdd}
          title={`Add ${attribute.key}`}
        >
          <Plus className="size-3" />
        </Button>
      </div>
    </div>
  );
}

interface CopyScriptButtonProps {
  script: string;
}

export function CopyScriptButton({ script }: CopyScriptButtonProps) {
  const notify = useNotify();

  const handleCopy = () => {
    const tag = `<script async src="${script}"></script>`;
    const el = document.createElement("textarea");
    el.value = tag;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    notify({ type: "Success", message: "Script tag copied to clipboard" });
  };

  return (
    <Button
      variant="default"
      className="h-6 text-[10px] gap-1 px-2"
      onClick={handleCopy}
    >
      <Copy className="size-3" />
      Copy Script
    </Button>
  );
}
