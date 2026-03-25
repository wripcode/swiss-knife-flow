"use client";

import { useEffect } from "react";
import { onExtensionMessage } from "@/lib/message-bus";
import { useFooterStore } from "@/store/footer-store";
import { useAttributesStore } from "@/store/attributes-store";
import { ToolLayout } from "@/components/dashboard/tool-layout";
import { AttributesManagePanel } from "@/components/attributes/attributes-manage-panel";
import { AttributesListPanel } from "@/components/attributes/attributes-list-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplatesPanel } from "@/components/attributes/templates/templates-panel";

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
    <ToolLayout
      title="Custom Attributes"
      description="Manage custom attributes for your Webflow elements"
    >
      <Tabs defaultValue="manage" className="h-full flex flex-col min-h-0 relative z-10">
        <TabsList className="w-full flex justify-start rounded-none h-auto p-0 gap-6 border-b border-white/10 mb-3">
          <TabsTrigger value="manage" className="rounded-none px-0 py-2 data-[state=active]:bg-transparent -mb-px">Manage</TabsTrigger>
          <TabsTrigger value="templates" className="rounded-none px-0 py-2 data-[state=active]:bg-transparent -mb-px">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="mt-0 h-full flex-1 min-h-0 flex flex-col outline-none data-[state=inactive]:hidden border-none p-0">
          <div className="grid grid-cols-[250px_1fr] gap-8 h-full min-h-0 flex-1">
            <div className="h-full min-h-0 overflow-y-auto">
              <AttributesManagePanel />
            </div>

            <div className="min-h-0 h-full overflow-hidden relative border rounded-lg px-4 pt-4 pb-1 bg-background/50 flex flex-col">
              <AttributesListPanel />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-0 h-full flex-1 min-h-0 flex flex-col outline-none data-[state=inactive]:hidden border-none p-0">
          <TemplatesPanel />
        </TabsContent>
      </Tabs>
    </ToolLayout>
  );
}
