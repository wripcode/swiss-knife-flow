"use client";

import { useMemo } from "react";

import { useAttributesStore } from "@/store/attributes-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw, LocateFixed, Pencil, Trash2, Box } from "lucide-react";

export function AttributesListPanel() {
  const {
    searchQuery,
    setEditingAttribute,
    editingAttribute,
    selectedElementId,
    elementGroups,
    selectElement,
    removeAttribute,
    fetchAttributes,
  } = useAttributesStore();

  const filteredGroups = useMemo(() => {
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
  }, [elementGroups, searchQuery]);

  const totalCount = useMemo(
    () => elementGroups.reduce((sum, g) => sum + g.attributes.length, 0),
    [elementGroups]
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight">On this page</h2>
          <Badge variant="secondary" className="rounded-full px-2 font-normal py-0 h-4">
            {totalCount}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 h-6 w-6 rounded-md"
          onClick={() => fetchAttributes()}
        >
          <RefreshCcw className="size-3 text-muted-foreground" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-6">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => {
            const isSelected = selectedElementId === group.elementId;
            return (
              <div key={group.elementId} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Box className="size-3 text-muted-foreground shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate">
                      {group.elementType}
                    </span>
                    {isSelected && (
                      <Badge className="px-1.5 py-0 rounded-sm font-normal bg-primary/10 text-primary border-0 text-[10px] h-4 shrink-0">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 pl-4 border-l border-border/50">
                  {group.attributes.map((attr) => {
                    const isEditing =
                      editingAttribute?.name === attr.name &&
                      editingAttribute?.elementId === group.elementId;

                    return (
                      <div
                        key={`${group.elementId}-${attr.name}`}
                        className={`flex flex-col gap-1.5 p-2 rounded-md border bg-card hover:border-border/80 transition-colors group/attr ${
                          isEditing ? "border-primary/50 ring-1 ring-primary/20" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 font-mono text-xs flex-wrap break-all min-w-0">
                            <span className="text-primary font-medium">{attr.name}</span>
                            <span className="text-muted-foreground">=</span>
                            <span className="text-foreground/80">&quot;{attr.value}&quot;</span>
                          </div>

                          <div className="flex items-center gap-0.5 opacity-0 group-hover/attr:opacity-100 transition-opacity shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-5 h-5 w-5"
                              title="Navigate to element"
                              onClick={() => selectElement(group.elementId)}
                            >
                              <LocateFixed className="size-3 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-5 h-5 w-5"
                              onClick={() =>
                                setEditingAttribute({
                                  name: attr.name,
                                  value: attr.value,
                                  elementId: group.elementId,
                                })
                              }
                            >
                              <Pencil className="size-3 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-5 h-5 w-5 hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeAttribute(attr.name, group.elementId)}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 flex-wrap min-w-0">
                            {group.classNames.length > 0 ? (
                              group.classNames.map((cls) => (
                                <span
                                  key={cls}
                                  className="inline-flex items-center px-1.5 py-0 rounded-[3px] text-[10px] font-medium h-4 bg-primary text-white leading-none"
                                >
                                  .{cls}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-muted-foreground">No classes</span>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className="px-1.5 py-0 rounded-sm font-normal text-[10px] h-4 shrink-0 border-border/50"
                          >
                            {group.elementType}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-card/50">
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? `No attributes found matching "${searchQuery}"`
                : "No custom attributes on this page"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
