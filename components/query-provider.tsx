"use client";

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import { isAuthError } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    let client: QueryClient;

    client = new QueryClient({
      queryCache: new QueryCache({
        onError: (error) => {
          if (isAuthError(error)) {
            client.invalidateQueries({ queryKey: queryKeys.auth.status() });
          }
        },
      }),
      mutationCache: new MutationCache({
        onError: (error) => {
          if (isAuthError(error)) {
            client.invalidateQueries({ queryKey: queryKeys.auth.status() });
          }
        },
      }),
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          gcTime: 5 * 60 * 1000,
          retry: (failureCount, error) => {
            if (isAuthError(error)) return false;
            return failureCount < 1;
          },
          refetchOnWindowFocus: true,
        },
      },
    });

    return client;
  });

  const [devtoolsOpen, setDevtoolsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key === "D") {
        setDevtoolsOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {devtoolsOpen && <ReactQueryDevtools initialIsOpen />}
    </QueryClientProvider>
  );
}
