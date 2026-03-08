"use client";

import { useState, useEffect, Suspense } from "react";
import { welcomeSummary } from "@/mock-data/dashboard";
import { StatsCards } from "./stats-cards";
import { TodaysTasks } from "./todays-tasks";
import { PerformanceChart } from "./performance-chart";
import { ProjectsTable } from "./projects-table";
import { SitesList } from "@/components/webflow/sites-list";
import { Loader2 } from "lucide-react";

function WelcomeSection() {
  const [userName, setUserName] = useState(welcomeSummary.userName);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const data = await response.json();
          if (data?.user?.firstName) {
            setUserName(data.user.firstName);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    }
    fetchUser();
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-base font-semibold tracking-tight">
        Welcome Back, {userName}! 👋
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
