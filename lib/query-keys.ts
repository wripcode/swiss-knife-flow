export const queryKeys = {
  auth: {
    status: () => ["auth", "status"] as const,
  },
  user: {
    profile: () => ["user", "profile"] as const,
  },
  sites: {
    list: () => ["sites", "list"] as const,
    scripts: (siteId: string) => ["sites", siteId, "scripts"] as const,
    customCode: (siteId: string) => ["sites", siteId, "custom-code"] as const,
  },
  libraries: {
    available: () => ["libraries", "available"] as const,
    detail: (id: string) => ["libraries", id] as const,
  },
} as const;
