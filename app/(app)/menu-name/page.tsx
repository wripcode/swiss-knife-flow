"use client";

import { LayoutGrid } from "lucide-react";

export default function MenuNamePage() {
  return (
    <div className="w-full overflow-y-auto overflow-x-hidden p-4 h-full">
      <div className="mx-auto w-full space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Menu Name
          </h1>
          <p className="text-sm text-muted-foreground">
            Describe what this tool does for your Webflow site.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 gap-4">
          <div className="size-12 rounded-lg bg-muted flex items-center justify-center">
            <LayoutGrid className="size-6 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">Nothing here yet</p>
            <p className="text-xs text-muted-foreground">
              Replace this with your tool's content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
