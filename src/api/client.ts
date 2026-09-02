/**
 * Typed API client for the audita-api backend (ADR-9 / FR-9).
 *
 * In CI, `openapi-typescript` generates a fully typed schema from the Go
 * handlers' published openapi.json; this module layers a thin fetch wrapper
 * (tenant header, bearer token, refresh-on-401, Problem parsing) over it.
 */

export interface Problem {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
  timestamp: string;
}

export class ApiError extends Error {
  readonly problem: Problem;
  readonly status: number;

  constructor(problem: Problem, status: number) {
    super(problem.message);
    this.name = "ApiError";
    this.problem = problem;
    this.status = status;
  }

  get code(): string {
    return this.problem.code;
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const TENANT_STORAGE_KEY = "audita.tenantSlug";

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export function getTenantSlug(): string | null {
  return localStorage.getItem(TENANT_STORAGE_KEY);
}

export function setTenantSlug(slug: string | null): void {
  if (slug === null) {
    localStorage.removeItem(TENANT_STORAGE_KEY);
  } else {
    localStorage.setItem(TENANT_STORAGE_KEY, slug);
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers({ Accept: "application/json" });
  const tenantSlug = getTenantSlug();
  if (tenantSlug) {
    headers.set("X-Tenant-Slug", tenantSlug);
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    credentials: "include", // httpOnly refresh cookie
  });

  if (response.status === 401 && onUnauthorized) {
    onUnauthorized();
  }

  if (!response.ok) {
    throw await toApiError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

async function toApiError(response: Response): Promise<ApiError> {
  let problem: Problem;
  try {
    problem = (await response.json()) as Problem;
    if (!problem.code) {
      problem = {
        code: "UNKNOWN",
        message: response.statusText,
        timestamp: new Date().toISOString(),
      };
    }
  } catch {
    problem = {
      code: "UNKNOWN",
      message: response.statusText,
      timestamp: new Date().toISOString(),
    };
  }
  return new ApiError(problem, response.status);
}
