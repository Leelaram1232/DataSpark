/**
 * DataSpark — API Client
 * Typed HTTP client for the FastAPI backend.
 * All requests go through this single module.
 */

const API_BASE = typeof window !== "undefined"
  ? `${window.location.origin}/api/backend/api/v1`
  : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1");

// ── Types ────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  is_superuser: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description: string | null;
  workspace_type: "developer" | "architecture" | "edi";
  owner_id: string | null;
  organization_id: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface ProjectListResponse {
  items: ProjectResponse[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface FileResponse {
  id: string;
  project_id: string;
  name: string;
  path: string;
  file_type: string | null;
  size_bytes: number;
  is_directory: boolean;
  parent_path: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface FileTree {
  id: string;
  name: string;
  path: string;
  is_directory: boolean;
  children: FileTree[];
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

// ── Token Storage ─────────────────────────────────────────────────────────────

const TOKEN_KEY = "dataspark_access_token";
const REFRESH_KEY = "dataspark_refresh_token";

export const tokenStorage = {
  getAccessToken: () =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  getRefreshToken: () =>
    typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null,
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ── Core Fetch Wrapper ────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authenticated) {
    const token = tokenStorage.getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && authenticated) {
    // Attempt token refresh
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      // Retry with new token
      headers["Authorization"] = `Bearer ${tokenStorage.getAccessToken()}`;
      const retryResponse = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
      });
      if (retryResponse.ok) return retryResponse.json() as Promise<T>;
    }
    tokenStorage.clearTokens();
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new ApiError(response.status, error.detail ?? "Request failed");
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function attemptTokenRefresh(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const tokens: TokenResponse = await response.json();
      tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ── Auth API ──────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string, full_name?: string) =>
    apiFetch<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    }, false),

  login: (email: string, password: string) =>
    apiFetch<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false),

  logout: async () => {
    const refresh_token = tokenStorage.getRefreshToken();
    if (refresh_token) {
      await apiFetch<MessageResponse>("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token }),
      }).catch(() => {});
    }
    tokenStorage.clearTokens();
  },

  me: () => apiFetch<UserResponse>("/auth/me"),
};

// ── Projects API ──────────────────────────────────────────────────────────────

export const projectsApi = {
  list: (params?: {
    workspace_type?: string;
    page?: number;
    page_size?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.workspace_type) query.set("workspace_type", params.workspace_type);
    if (params?.page) query.set("page", String(params.page));
    if (params?.page_size) query.set("page_size", String(params.page_size));
    const qs = query.toString();
    return apiFetch<ProjectListResponse>(`/projects${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => apiFetch<ProjectResponse>(`/projects/${id}`),

  create: (data: {
    name: string;
    description?: string;
    workspace_type: "developer" | "architecture" | "edi";
    is_public?: boolean;
  }) =>
    apiFetch<ProjectResponse>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{ name: string; description: string; is_public: boolean }>) =>
    apiFetch<ProjectResponse>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<MessageResponse>(`/projects/${id}`, { method: "DELETE" }),

  getFileTree: (id: string) =>
    apiFetch<FileTree[]>(`/projects/${id}/files`),

  createFile: (
    projectId: string,
    data: { name: string; path: string; is_directory?: boolean; parent_path?: string },
  ) =>
    apiFetch<FileResponse>(`/projects/${projectId}/files`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── Files API ─────────────────────────────────────────────────────────────────

export const filesApi = {
  upload: async (projectId: string, path: string, file: File) => {
    const token = tokenStorage.getAccessToken();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${API_BASE}/files/upload/${projectId}?path=${encodeURIComponent(path)}`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Upload failed" }));
      throw new ApiError(response.status, error.detail);
    }
    return response.json() as Promise<FileResponse>;
  },

  getSignedUrl: (projectId: string, path: string) =>
    apiFetch<{ url: string; expires_in: number }>(
      `/files/signed-url/${projectId}?path=${encodeURIComponent(path)}`,
    ),

  delete: (fileId: string) =>
    apiFetch<MessageResponse>(`/files/${fileId}`, { method: "DELETE" }),
};

export { ApiError };
