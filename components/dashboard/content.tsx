"use client";

import { Suspense } from "react";
import { SitesList } from "@/components/dashboard/sites-list";
import { Loader2 } from "lucide-react";
import { useAuthQuery } from "@/hooks/use-auth-query";
import { useUserQuery } from "@/hooks/use-user-query";

function WelcomeSection() {
  const { authenticated } = useAuthQuery();
  const { data: user } = useUserQuery(authenticated);

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-base font-semibold tracking-tight">
        {user?.firstName ? `Welcome back, ${user.firstName}! 👋` : "Welcome"}
      </h1>
    </div>
  );
}

export function DashboardContent() {
  return (
    <main className="w-full overflow-y-auto overflow-x-hidden p-4 h-full">
      <div className="mx-auto w-full space-y-6">
        <WelcomeSection />
        <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="size-4 animate-spin text-muted-foreground" /></div>}>
          <SitesList />
        </Suspense>
        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <TodaysTasks />
          </div>
          <div>
            <PerformanceChart />
          </div>
        </div>
        <ProjectsTable /> */}
      </div>
    </main>
  );
}
