"use client";

import { useEffect } from "react";
import { onExtensionMessage } from "@/lib/message-bus";
import { useFooterStore } from "@/store/footer-store";
import { useAttributesStore } from "@/store/attributes-store";
import { AttributesManagePanel } from "@/components/attributes/attributes-manage-panel";
import { AttributesListPanel } from "@/components/attributes/attributes-list-panel";

export default function CustomAttributesPage() {
  const { setFooterGuide, clearFooterGuide } = useFooterStore();
  const { setElementGroups, setSelectedElementId, fetchAttributes } = useAttributesStore();

  useEffect(() => {
    setFooterGuide("Select an element to view or add custom attributes");
    fetchAttributes();

    const unsubAttributes = onExtensionMessage<{
      elementId: string | null;
      elementGroups: any[];
    }>("ATTRIBUTES_UPDATED", (payload) => {
      setSelectedElementId(payload.elementId);
      setElementGroups(payload.elementGroups || []);
      setFooterGuide(
        payload.elementId
          ? "Manage element custom attributes"
          : "Select an element to view or add custom attributes"
      );
    });

    const unsubDeselected = onExtensionMessage("ELEMENT_DESELECTED", () => {
      setSelectedElementId(null);
      setFooterGuide("Select an element to view or add custom attributes");
    });

    return () => {
      unsubAttributes();
      unsubDeselected();
      clearFooterGuide();
    };
  }, [setFooterGuide, clearFooterGuide, setElementGroups, setSelectedElementId, fetchAttributes]);

  return (
    <div className="w-full overflow-hidden p-4 h-full flex flex-col">
      <div className="flex flex-col gap-1 mb-4">
        <h1 className="text-base font-semibold tracking-tight">
          Custom Attributes
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage custom attributes for your Webflow elements.
        </p>
      </div>

      <div className="grid grid-cols-[300px_1fr] gap-8 h-full min-h-0">
        <div className="h-full">
          <AttributesManagePanel />
        </div>

        <div className="min-h-0 overflow-hidden relative border rounded-lg p-4 bg-background/50">
          <AttributesListPanel />
        </div>
      </div>
    </div>
  );
}
