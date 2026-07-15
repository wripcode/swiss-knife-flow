"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/lib/api-error";

interface UserProfile {
  firstName?: string;
  email?: string;
}

async function fetchUserProfile(): Promise<{ user: UserProfile }> {
  const response = await fetch("/api/user");
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.message || "Failed to fetch user profile", response.status);
  }
  return response.json();
}

export const selectUserProfile = (data: { user: UserProfile }) => data.user;

export function useUserQuery(authenticated: boolean) {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: fetchUserProfile,
    enabled: authenticated,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: selectUserProfile,
  });
}
