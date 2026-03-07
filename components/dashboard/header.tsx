"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, LayoutGrid, Settings, type LucideIcon } from "lucide-react";

const pageMap: Record<string, { title: string; icon: LucideIcon }> = {
  "/": { title: "Dashboard", icon: LayoutDashboard },
  // Add your tool pages here: "/your-route": { title: "Your Tool", icon: YourIcon }
  "/menu-name": { title: "Menu Name", icon: LayoutGrid },
  "/settings": { title: "Settings", icon: Settings },
};

export function DashboardHeader() {
  const pathname = usePathname();
  const page = pageMap[pathname] ?? { title: "Dashboard", icon: LayoutDashboard };
  const Icon = page.icon;

  return (
    <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-2 border-b bg-card sticky top-0 z-10 w-full shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-2" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4" />
          <span className="text-sm font-medium">{page.title}</span>
        </div>
      </div>
    </header>
  );
}
