import { create } from "zustand";

// ── Tab System ──────────────────────────────────────────────────────────────
export interface EditorTab {
  id: string;
  label: string;
  path?: string;
  language?: string;
  pinned?: boolean;
  dirty?: boolean;
  icon?: string;
}

// ── Notifications ────────────────────────────────────────────────────────────
export type NotificationCategory = "system" | "ai" | "plugins" | "workspace" | "updates" | "errors";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  timestamp: string;
  read: boolean;
  action?: { label: string; target: string };
}

// ── Workspace Session ────────────────────────────────────────────────────────
export interface WorkspaceSession {
  activeSidebarTab: string;
  sidebarCollapsed: boolean;
  rightPanelOpen: boolean;
  bottomPanelOpen: boolean;
  activeTabId: string | null;
}

type WorkspaceType = "developer" | "architecture" | "edi";
type SplitMode = "none" | "vertical" | "horizontal";

interface UIStore {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  activeSidebarTab: string;
  toggleSidebar: () => void;
  setSidebarWidth: (w: number) => void;
  setActiveSidebarTab: (tab: string) => void;

  rightPanelOpen: boolean;
  rightPanelWidth: number;
  activeRightTab: string;
  toggleRightPanel: () => void;
  setRightPanelWidth: (w: number) => void;
  setActiveRightTab: (tab: string) => void;

  bottomPanelOpen: boolean;
  bottomPanelHeight: number;
  bottomPanelMaximized: boolean;
  activeBottomTab: string;
  toggleBottomPanel: () => void;
  setBottomPanelHeight: (h: number) => void;
  setActiveBottomTab: (tab: string) => void;
  toggleBottomMaximize: () => void;

  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  notificationPanelOpen: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  toggleNotifications: () => void;
  addNotification: (n: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markAllRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;

  isFullscreen: boolean;
  contentMaximized: boolean;
  toggleFullscreen: () => void;
  toggleContentMaximize: () => void;

  splitMode: SplitMode;
  setSplitMode: (m: SplitMode) => void;

  tabs: Record<WorkspaceType, EditorTab[]>;
  activeTabId: Record<WorkspaceType, string | null>;
  addTab: (workspace: WorkspaceType, tab: Omit<EditorTab, "id">) => void;
  closeTab: (workspace: WorkspaceType, tabId: string) => void;
  pinTab: (workspace: WorkspaceType, tabId: string) => void;
  setActiveTab: (workspace: WorkspaceType, tabId: string) => void;
  reorderTabs: (workspace: WorkspaceType, from: number, to: number) => void;
  markTabDirty: (workspace: WorkspaceType, tabId: string, dirty: boolean) => void;

  theme: "dark" | "darker";
  setTheme: (t: "dark" | "darker") => void;

  workspaceSessions: Record<WorkspaceType, WorkspaceSession>;
  saveWorkspaceSession: (workspace: WorkspaceType) => void;
  restoreWorkspaceSession: (workspace: WorkspaceType) => void;
}

const defaultSession: WorkspaceSession = {
  activeSidebarTab: "explorer",
  sidebarCollapsed: false,
  rightPanelOpen: true,
  bottomPanelOpen: true,
  activeTabId: null,
};

export const useUIStore = create<UIStore>((set, get) => ({
  sidebarCollapsed: false,
  sidebarWidth: 240,
  activeSidebarTab: "explorer",
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarWidth: (w) => set({ sidebarWidth: w }),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),

  rightPanelOpen: true,
  rightPanelWidth: 320,
  activeRightTab: "ai",
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setRightPanelWidth: (w) => set({ rightPanelWidth: w }),
  setActiveRightTab: (tab) => set({ activeRightTab: tab }),

  bottomPanelOpen: true,
  bottomPanelHeight: 220,
  bottomPanelMaximized: false,
  activeBottomTab: "terminal",
  toggleBottomPanel: () => set((s) => ({ bottomPanelOpen: !s.bottomPanelOpen })),
  setBottomPanelHeight: (h) => set({ bottomPanelHeight: h }),
  setActiveBottomTab: (tab) => set({ activeBottomTab: tab }),
  toggleBottomMaximize: () => set((s) => ({ bottomPanelMaximized: !s.bottomPanelMaximized })),

  commandPaletteOpen: false,
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),

  searchOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),

  notificationPanelOpen: false,
  notifications: [
    { id: "n-001", title: "DataSpark v2.4.0 Released", message: "New features: EDI visual map designer improvements, Revit connector v1.1, and performance boosts.", category: "updates", timestamp: "2 min ago", read: false, action: { label: "View Changelog", target: "/marketplace" } },
    { id: "n-002", title: "AI Provider Not Connected", message: "Configure an AI provider API key in Settings → AI & Models to enable intelligent assistance.", category: "ai", timestamp: "5 min ago", read: false, action: { label: "Open Settings", target: "/settings" } },
    { id: "n-003", title: "Plugin SDK Update Available", message: "IBM ITX Execution Adapter v3.2.1 has an update available.", category: "plugins", timestamp: "1 hour ago", read: true, action: { label: "Update Now", target: "/marketplace" } },
  ],
  unreadCount: 2,
  toggleNotifications: () => set((s) => ({ notificationPanelOpen: !s.notificationPanelOpen })),
  addNotification: (n) =>
    set((s) => {
      const newN: AppNotification = { ...n, id: `n-${Date.now()}`, timestamp: "Just now", read: false };
      return { notifications: [newN, ...s.notifications], unreadCount: s.unreadCount + 1 };
    }),
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })), unreadCount: 0 })),
  clearNotification: (id) =>
    set((s) => {
      const n = s.notifications.find((x) => x.id === id);
      return { notifications: s.notifications.filter((x) => x.id !== id), unreadCount: n && !n.read ? Math.max(0, s.unreadCount - 1) : s.unreadCount };
    }),
  clearAllNotifications: () => set({ notifications: [], unreadCount: 0 }),

  isFullscreen: false,
  contentMaximized: false,
  toggleFullscreen: () =>
    set((s) => {
      const next = !s.isFullscreen;
      if (typeof document !== "undefined") {
        if (next) document.documentElement.requestFullscreen?.();
        else document.exitFullscreen?.();
      }
      return { isFullscreen: next };
    }),
  toggleContentMaximize: () => set((s) => ({ contentMaximized: !s.contentMaximized })),

  splitMode: "none",
  setSplitMode: (m) => set({ splitMode: m }),

  tabs: { developer: [], architecture: [], edi: [] },
  activeTabId: { developer: null, architecture: null, edi: null },
  addTab: (workspace, tab) =>
    set((s) => {
      const existing = s.tabs[workspace].find((t) => t.path === tab.path && tab.path);
      if (existing) return { activeTabId: { ...s.activeTabId, [workspace]: existing.id } };
      const newTab: EditorTab = { ...tab, id: `tab-${Date.now()}` };
      return {
        tabs: { ...s.tabs, [workspace]: [...s.tabs[workspace], newTab] },
        activeTabId: { ...s.activeTabId, [workspace]: newTab.id },
      };
    }),
  closeTab: (workspace, tabId) =>
    set((s) => {
      const current = s.tabs[workspace];
      const idx = current.findIndex((t) => t.id === tabId);
      const filtered = current.filter((t) => t.id !== tabId);
      let nextActiveId = s.activeTabId[workspace];
      if (nextActiveId === tabId) {
        nextActiveId = filtered[idx]?.id || filtered[idx - 1]?.id || filtered[0]?.id || null;
      }
      return { tabs: { ...s.tabs, [workspace]: filtered }, activeTabId: { ...s.activeTabId, [workspace]: nextActiveId } };
    }),
  pinTab: (workspace, tabId) =>
    set((s) => ({ tabs: { ...s.tabs, [workspace]: s.tabs[workspace].map((t) => t.id === tabId ? { ...t, pinned: !t.pinned } : t) } })),
  setActiveTab: (workspace, tabId) =>
    set((s) => ({ activeTabId: { ...s.activeTabId, [workspace]: tabId } })),
  reorderTabs: (workspace, from, to) =>
    set((s) => {
      const arr = [...s.tabs[workspace]];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return { tabs: { ...s.tabs, [workspace]: arr } };
    }),
  markTabDirty: (workspace, tabId, dirty) =>
    set((s) => ({ tabs: { ...s.tabs, [workspace]: s.tabs[workspace].map((t) => t.id === tabId ? { ...t, dirty } : t) } })),

  theme: "dark",
  setTheme: (t) => set({ theme: t }),

  workspaceSessions: { developer: { ...defaultSession }, architecture: { ...defaultSession }, edi: { ...defaultSession } },
  saveWorkspaceSession: (workspace) => {
    const s = get();
    set({ workspaceSessions: { ...s.workspaceSessions, [workspace]: { activeSidebarTab: s.activeSidebarTab, sidebarCollapsed: s.sidebarCollapsed, rightPanelOpen: s.rightPanelOpen, bottomPanelOpen: s.bottomPanelOpen, activeTabId: s.activeTabId[workspace] } } });
  },
  restoreWorkspaceSession: (workspace) => {
    const s = get();
    const session = s.workspaceSessions[workspace];
    if (session) {
      set({ activeSidebarTab: session.activeSidebarTab, sidebarCollapsed: session.sidebarCollapsed, rightPanelOpen: session.rightPanelOpen, bottomPanelOpen: session.bottomPanelOpen });
    }
  },
}));
