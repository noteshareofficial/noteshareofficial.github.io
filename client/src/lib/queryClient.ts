import { QueryClient, QueryFunction } from "@tanstack/react-query";
import staticApiService, { isGitHubPages } from "./staticApiService";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Use static data for GitHub Pages deployment
  if (isGitHubPages()) {
    console.log(`GitHub Pages mode: ${method} ${url}`);
    // Mock response for GitHub Pages
    const mockResponse = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    return mockResponse;
  }

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

// Helper function to handle GitHub Pages static data
function handleGitHubPagesQuery<DataType>(queryKey: unknown[]): DataType | null {
  console.log(`GitHub Pages mode query: ${queryKey[0]}`);
  const endpoint = queryKey[0] as string;
  
  // Route the request to the right static data handler
  if (endpoint.includes('/api/users/me')) {
    return staticApiService.getCurrentUser() as unknown as DataType;
  } else if (endpoint.includes('/api/tracks/trending')) {
    return staticApiService.getTrendingTracks() as unknown as DataType;
  } else if (endpoint.match(/\/api\/tracks\/\d+/)) {
    const id = parseInt(endpoint.split('/').pop() || '0');
    return staticApiService.getTrackById(id) as unknown as DataType;
  } else if (endpoint.includes('/api/tracks')) {
    return staticApiService.getTracks() as unknown as DataType;
  } else if (endpoint.match(/\/api\/users\/\d+/)) {
    const id = parseInt(endpoint.split('/').pop() || '0');
    return staticApiService.getUserById(id) as unknown as DataType;
  } else if (endpoint.includes('/api/users')) {
    return staticApiService.getUsers() as unknown as DataType;
  } else if (endpoint.match(/\/api\/comments\/track\/\d+/)) {
    const id = parseInt(endpoint.split('/').pop() || '0');
    return staticApiService.getCommentsByTrackId(id) as unknown as DataType;
  }
  
  // Default return empty data
  return [] as unknown as DataType;
}

// Query function factory
export function createQueryFn<T>(options: { on401: UnauthorizedBehavior }): QueryFunction<T> {
  return async ({ queryKey }) => {
    // Handle GitHub Pages mode with static data
    if (isGitHubPages()) {
      return handleGitHubPagesQuery<T>(queryKey);
    }
    
    // Standard API call for normal operation
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (options.on401 === "returnNull" && res.status === 401) {
      return null as unknown as T;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };
}

// Type-safe getQueryFn
export const getQueryFn = createQueryFn;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
