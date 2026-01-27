import { QueryClient } from '@tanstack/react-query';

/**
 * Create a new QueryClient instance
 * Called once per request on server, once per app on client
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SSR-friendly defaults
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
        // Don't refetch on mount if data is fresh
        refetchOnMount: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

// Singleton for client-side
let browserQueryClient: QueryClient | undefined;

/**
 * Get QueryClient for client-side use
 * Creates singleton on first call
 */
export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create new client
    return createQueryClient();
  }

  // Browser: use singleton
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
}
