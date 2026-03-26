"use client";

import { useAttributesStore } from "@/store/attributes-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNotify } from "@/hooks/use-notify";

export function AttributesManagePanel() {
  const {
    searchQuery,
    setSearchQuery,
    editingAttribute,
    setEditingAttribute,
    bulkRenameEnabled,
    bulkDeleteEnabled,
    toggleBulkRename,
    toggleBulkDelete,
    saveAttribute,
    selectedElementId,
  } = useAttributesStore();

  const notify = useNotify();

  const [attrName, setAttrName] = useState("");
  const [attrValue, setAttrValue] = useState("");

  useEffect(() => {
    if (editingAttribute) {
      setAttrName(editingAttribute.name);
      setAttrValue(editingAttribute.value);
    } else {
      setAttrName("");
      setAttrValue("");
    }
  }, [editingAttribute]);

  const handleSave = () => {
    if (!attrName) return;

    if (editingAttribute) {
      saveAttribute(editingAttribute.name, attrName, attrValue, editingAttribute.elementId);
      notify({ type: "Success", message: `Attribute '${attrName}' updated` });
    } else {
      saveAttribute(null, attrName, attrValue, selectedElementId || undefined);
      notify({ type: "Success", message: `Attribute '${attrName}' added` });
    }

    setEditingAttribute(null);
    setAttrName("");
    setAttrValue("");
  };

  const handleCancel = () => {
    setEditingAttribute(null);
  };

  const isEditing = !!editingAttribute;

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* Search Block */}
      <div className="flex flex-col gap-2 relative">
        <Search className="absolute left-2.5 top-1.5 size-3 text-muted-foreground" />
        <Input
          placeholder="Search attributes..."
          className="pl-9 bg-background/50 h-9 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Create / Edit Block */}
      <div className="flex flex-col gap-2 rounded-lg border bg-card p-2 shadow-sm">
        <h3 className="text-sm font-medium">
          {isEditing ? "Edit Attribute" : "Add Attribute"}
        </h3>

        {isEditing && (
          <p className="text-[10px] text-muted-foreground -mt-1">
            Editing on selected element
          </p>
        )}

        <div className="flex items-center gap-1">
          <Input
            placeholder="Name (data-*)"
            value={attrName}
            onChange={(e) => setAttrName(e.target.value)}
            className="flex-1 h-8 text-xs bg-background/50"
          />
          <span className="text-muted-foreground text-sm">=</span>
          <Input
            placeholder="Value"
            value={attrValue}
            onChange={(e) => setAttrValue(e.target.value)}
            className="flex-1 h-8 text-xs bg-background/50"
          />
        </div>

        <div className="flex gap-2 mt-1">
          <Button onClick={handleSave} className="flex-1" variant="default">
            {isEditing ? "Save Changes" : "Create"}
          </Button>
          {isEditing && (
            <Button variant="outline" className="px-3" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Options Block */}
      <div className="flex flex-col gap-2 rounded-lg border bg-card p-2 shadow-sm">
        <h3 className="text-sm font-medium">Bulk Options</h3>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="bulk-rename"
            checked={bulkRenameEnabled}
            onCheckedChange={toggleBulkRename}
          />
          <label
            htmlFor="bulk-rename"
            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground"
          >
            Enable Bulk Rename
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="bulk-delete"
            checked={bulkDeleteEnabled}
            onCheckedChange={toggleBulkDelete}
          />
          <label
            htmlFor="bulk-delete"
            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground"
          >
            Enable Bulk Delete
          </label>
        </div>
      </div>
    </div>
  );
}
