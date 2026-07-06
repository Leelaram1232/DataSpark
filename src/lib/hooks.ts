/**
 * DataSpark — React Query Hooks
 * All data fetching/mutation hooks for the API.
 * Uses @tanstack/react-query v5.
 */
"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  authApi,
  projectsApi,
  filesApi,
  tokenStorage,
  type ProjectResponse,
  type TokenResponse,
  type FileTree,
} from "@/lib/api";

// ── Query Keys ────────────────────────────────────────────────────────────────

export const queryKeys = {
  user: ["user"] as const,
  projects: (filters?: { workspace_type?: string; page?: number }) =>
    ["projects", filters] as const,
  project: (id: string) => ["projects", id] as const,
  fileTree: (projectId: string) => ["projects", projectId, "files"] as const,
};

// ── Auth Hooks ─────────────────────────────────────────────────────────────────

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => authApi.me(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!tokenStorage.getAccessToken(),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (tokens: TokenResponse) => {
      tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      email,
      password,
      full_name,
    }: {
      email: string;
      password: string;
      full_name?: string;
    }) => authApi.register(email, password, full_name),
    onSuccess: (tokens: TokenResponse) => {
      tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// ── Project Hooks ──────────────────────────────────────────────────────────────

export function useProjects(filters?: { workspace_type?: string; page?: number }) {
  return useQuery({
    queryKey: queryKeys.projects(filters),
    queryFn: () => projectsApi.list(filters),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!tokenStorage.getAccessToken(),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => projectsApi.get(id),
    enabled: !!id && !!tokenStorage.getAccessToken(),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectResponse> }) =>
      projectsApi.update(id, data as any),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.project(id) });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// ── File Hooks ────────────────────────────────────────────────────────────────

export function useFileTree(projectId: string) {
  return useQuery({
    queryKey: queryKeys.fileTree(projectId),
    queryFn: () => projectsApi.getFileTree(projectId),
    enabled: !!projectId && !!tokenStorage.getAccessToken(),
    staleTime: 60 * 1000,
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      path,
      file,
    }: {
      projectId: string;
      path: string;
      file: File;
    }) => filesApi.upload(projectId, path, file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fileTree(result.project_id),
      });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      fileId,
      projectId,
    }: {
      fileId: string;
      projectId: string;
    }) => filesApi.delete(fileId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fileTree(projectId),
      });
    },
  });
}
