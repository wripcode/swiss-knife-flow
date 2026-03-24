"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Package,
  Variable,
  Layers,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const topNavItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
];

const toolItems = [
  { title: "Attributes", href: "/attributes", icon: Package },
  { title: "Variables", href: "/variables", icon: Variable },
  { title: "Components", href: "/components", icon: Layers },
];

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const siteId = searchParams.get("siteId");

  const getHrefWithSiteId = (href: string) => {
    if (!siteId) return href;
    const url = new URL(href, "http://localhost");
    url.searchParams.set("siteId", siteId);
    return `${url.pathname}${url.search}`;
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-r-0!" {...props}>
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center w-full">
          <span className="font-semibold text-sidebar-foreground truncate text-base">
            Swiss Knife Flow
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {topNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="h-9"
                  >
                    <Link href={getHrefWithSiteId(item.href)}>
                      <item.icon
                        className={`size-4 shrink-0 ${
                          pathname === item.href
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span className="text-xs">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Tools
              </div>
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="h-9"
                  >
                    <Link href={getHrefWithSiteId(item.href)}>
                      <item.icon
                        className={`size-4 shrink-0 ${
                          pathname === item.href
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span className="text-xs">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-3 group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/settings"}
              className="h-9"
            >
              <Link href={getHrefWithSiteId("/settings")}>
                <Settings className={`size-4 shrink-0 ${pathname === "/settings" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
