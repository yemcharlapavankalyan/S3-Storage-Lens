
/**
 * S3 Storage Optimizer - Centralized API Service Layer
 *
 * Connects the React UI to the Express backend (http://localhost:5001/api).
 * Live-data services surface errors rather than substituting sample inventory.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

// When false, always attempts to query the real backend REST API
export const IS_MOCK_ENABLED = false;

let backendConnectionStatus: "connected" | "disconnected" | "checking" = "checking";

export function getBackendStatus() {
  return backendConnectionStatus;
}

/**
 * Standard HTTP client with graceful fallback support
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
  fallbackData?: T
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(url, {
      ...options,
      // Keep live inventory reads fresh and avoid cached 304 responses being
      // treated as API failures by the fallback handler.
      cache: options?.cache ?? 'no-store',
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error [${response.status}]: ${errorText || response.statusText}`);
    }

    backendConnectionStatus = "connected";
    return (await response.json()) as T;
  } catch (error: any) {
    backendConnectionStatus = "disconnected";
    console.warn(`[API Client] Error fetching ${endpoint} (${error.message}).`);

    if (fallbackData !== undefined) {
      console.info(`[API Client] Falling back to configured project data for ${endpoint}`);
      return fallbackData;
    }

    throw error;
  }
}

/**
 * Check backend health & live AWS connectivity
 */
export async function checkBackendHealth(): Promise<{
  status: string;
  awsConnected: boolean;
  accountId?: string;
  region?: string;
}> {
  return apiClient<{
    status: string;
    awsConnected: boolean;
    accountId?: string;
    region?: string;
  }>("/health", undefined, {
    status: "fallback",
    awsConnected: false,
  });
}
