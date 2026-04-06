"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface UserProfile {
  firstName?: string;
  email?: string;
}

async function fetchUserProfile(): Promise<{ user: UserProfile }> {
  const response = await fetch("/api/user");
  if (!response.ok) throw new Error("Failed to fetch user profile");
  return response.json();
}

export function useUserQuery(authenticated: boolean) {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: fetchUserProfile,
    enabled: authenticated,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (data) => data.user,
  });
}
