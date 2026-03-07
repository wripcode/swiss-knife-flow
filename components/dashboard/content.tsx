"use client";

import { useState, useEffect } from "react";
import { welcomeSummary } from "@/mock-data/dashboard";
import { StatsCards } from "./stats-cards";
import { TodaysTasks } from "./todays-tasks";
import { PerformanceChart } from "./performance-chart";
import { ProjectsTable } from "./projects-table";
import { SitesList } from "@/components/webflow/sites-list";

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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Welcome Back, {userName}! 👋
        </h1>
        {/* <p className="text-sm text-muted-foreground mt-0.5">
          {welcomeSummary.tasksDueToday} Tasks Due Today, {welcomeSummary.overdueTasks} Overdue Tasks,{" "}
          {welcomeSummary.upcomingDeadlines} Upcoming Deadlines (This Week)
        </p> */}
      </div>
      {/* <div className="flex items-center gap-2">
        <ConnectWebflowButton />
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <Download className="size-4" />
          Export
        </Button>
        <Button size="sm" className="h-9 gap-1.5 bg-primary hover:bg-primary/90">
          <Plus className="size-4" />
          New
        </Button>
      </div> */}
    </div>
  );
}

export function DashboardContent() {
  return (
    <main className="w-full overflow-y-auto overflow-x-hidden p-4 h-full">
      <div className="mx-auto w-full space-y-6">
        <WelcomeSection />
        {/* <StatsCards /> */}
        <SitesList />
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
