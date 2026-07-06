import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WorkspaceId = "developer" | "architecture" | "edi";

interface WorkspaceStore {
  activeWorkspace: WorkspaceId | null;
  previousWorkspace: WorkspaceId | null;
  setWorkspace: (id: WorkspaceId) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      activeWorkspace: null,
      previousWorkspace: null,
      setWorkspace: (id) =>
        set((state) => ({
          previousWorkspace: state.activeWorkspace,
          activeWorkspace: id,
        })),
      clearWorkspace: () =>
        set({ activeWorkspace: null, previousWorkspace: null }),
    }),
    { name: "dataspark-workspace" }
  )
);
