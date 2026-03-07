"use client";

import { Tags } from "lucide-react";

export default function CustomAttributesPage() {
  return (
    <div className="w-full overflow-y-auto overflow-x-hidden p-4 h-full">
      <div className="mx-auto w-full space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Custom Attributes
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage custom attributes for your Webflow elements.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 gap-4">
          <div className="size-12 rounded-lg bg-muted flex items-center justify-center">
            <Tags className="size-6 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">No attributes configured yet</p>
            <p className="text-xs text-muted-foreground">
              Connect a Webflow site to start managing custom attributes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
