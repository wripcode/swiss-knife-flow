import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { AppFooter } from "@/components/dashboard/footer";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="bg-sidebar">
      <DashboardSidebar />
      <div className="h-svh overflow-hidden p-2 w-full min-w-0">
        <div className="border rounded-md overflow-hidden flex flex-col h-full w-full bg-background min-w-0">
          <DashboardHeader />
          <main className="w-full flex-1 overflow-auto min-w-0">
            {children}
          </main>
          <AppFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
