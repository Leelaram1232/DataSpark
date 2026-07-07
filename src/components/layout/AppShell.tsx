"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUIStore } from "@/store/uiStore";
import { useProjectStore } from "@/store/projectStore";
import { TopBar } from "./TopBar";
import { LeftSidebar } from "./LeftSidebar";
import { RightPanel } from "./RightPanel";
import { BottomPanel } from "./BottomPanel";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { GitBranch, AlertCircle, Sparkles, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";


interface AppShellProps {
  children: React.ReactNode;
  workspace: "developer" | "architecture" | "edi";
}

export function AppShell({ children, workspace }: AppShellProps) {
  const router = useRouter();
  const {
    sidebarCollapsed,
    sidebarWidth,
    setSidebarWidth,
    activeSidebarTab,
    setActiveSidebarTab,
    toggleSidebar,

    rightPanelOpen,
    rightPanelWidth,
    setRightPanelWidth,
    toggleRightPanel,

    bottomPanelOpen,
    bottomPanelHeight,
    setBottomPanelHeight,
    bottomPanelMaximized,
    toggleBottomPanel,
    toggleBottomMaximize,

    commandPaletteOpen,
    openCommandPalette,
    closeCommandPalette,

    searchOpen,
    openSearch,
    closeSearch,

    notificationPanelOpen,
    toggleNotifications,

    isFullscreen,
    toggleFullscreen,
  } = useUIStore();

  const { activeProject } = useProjectStore();
  const project = activeProject();

  // Resize state refs
  const resizingSidebar = useRef(false);
  const resizingRight = useRef(false);
  const resizingBottom = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startWidth = useRef(0);
  const startHeight = useRef(0);

  // Keyboard shortcut handlers
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+Shift+P: Command Palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toUpperCase() === "P") {
        e.preventDefault();
        commandPaletteOpen ? closeCommandPalette() : openCommandPalette();
      }
      // Ctrl+P: Quick Open / Search
      else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toUpperCase() === "P") {
        e.preventDefault();
        searchOpen ? closeSearch() : openSearch();
      }
      // Ctrl+B: Toggle Sidebar
      else if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === "B") {
        e.preventDefault();
        toggleSidebar();
      }
      // Ctrl+J: Toggle Bottom Console
      else if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === "J") {
        e.preventDefault();
        toggleBottomPanel();
      }
      // Ctrl+Shift+E: Show Project Explorer
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toUpperCase() === "E") {
        e.preventDefault();
        if (sidebarCollapsed) toggleSidebar();
        setActiveSidebarTab("explorer");
      }
      // Ctrl+,: Open Settings
      else if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        router.push("/settings");
      }
      // Ctrl+/: Toggle Right Panel (AI)
      else if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        toggleRightPanel();
      }
      // F11: Fullscreen Mode
      else if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    commandPaletteOpen,
    openCommandPalette,
    closeCommandPalette,
    searchOpen,
    openSearch,
    closeSearch,
    sidebarCollapsed,
    toggleSidebar,
    setActiveSidebarTab,
    toggleBottomPanel,
    toggleRightPanel,
    toggleFullscreen,
    router,
  ]);

  // Mouse move handler for resizing
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (resizingSidebar.current) {
        const delta = e.clientX - startX.current;
        const newWidth = Math.max(160, Math.min(480, startWidth.current + delta));
        setSidebarWidth(newWidth);
      } else if (resizingRight.current) {
        const delta = startX.current - e.clientX;
        const newWidth = Math.max(240, Math.min(600, startWidth.current + delta));
        setRightPanelWidth(newWidth);
      } else if (resizingBottom.current) {
        const delta = startY.current - e.clientY;
        const newHeight = Math.max(80, Math.min(700, startHeight.current + delta));
        setBottomPanelHeight(newHeight);
      }
    },
    [setSidebarWidth, setRightPanelWidth, setBottomPanelHeight]
  );

  const handleMouseUp = useCallback(() => {
    resizingSidebar.current = false;
    resizingRight.current = false;
    resizingBottom.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const startSidebarResize = (e: React.MouseEvent) => {
    e.preventDefault();
    resizingSidebar.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const startRightResize = (e: React.MouseEvent) => {
    e.preventDefault();
    resizingRight.current = true;
    startX.current = e.clientX;
    startWidth.current = rightPanelWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const startBottomResize = (e: React.MouseEvent) => {
    e.preventDefault();
    resizingBottom.current = true;
    startY.current = e.clientY;
    startHeight.current = bottomPanelHeight;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  const effectiveSidebarWidth = sidebarCollapsed ? 48 : sidebarWidth;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-void)",
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <TopBar workspace={workspace} />

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left sidebar */}
        <div
          style={{
            width: effectiveSidebarWidth,
            minWidth: effectiveSidebarWidth,
            transition: sidebarCollapsed ? "width 180ms cubic-bezier(0.4, 0, 0.2, 1), min-width 180ms cubic-bezier(0.4, 0, 0.2, 1)" : "none",
            borderRight: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            display: "flex",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <LeftSidebar workspace={workspace} collapsed={sidebarCollapsed} />
        </div>

        {/* Sidebar resize handle */}
        {!sidebarCollapsed && (
          <div
            onMouseDown={startSidebarResize}
            style={{
              width: "4px",
              cursor: "col-resize",
              background: "transparent",
              flexShrink: 0,
              transition: "background 120ms ease",
              position: "relative",
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "var(--brand-500)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "transparent";
            }}
          />
        )}

        {/* Main content area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {/* Editor + right panel */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* Content area */}
            <div
              style={{
                flex: 1,
                overflow: "hidden",
                background: "var(--bg-base)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {children}
            </div>

            {/* Right panel resize handle */}
            {rightPanelOpen && (
              <div
                onMouseDown={startRightResize}
                style={{
                  width: "4px",
                  cursor: "col-resize",
                  background: "transparent",
                  flexShrink: 0,
                  transition: "background 120ms ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "var(--brand-500)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              />
            )}

            {/* Right panel */}
            {rightPanelOpen && (
              <div
                style={{
                  width: rightPanelWidth,
                  minWidth: rightPanelWidth,
                  borderLeft: "1px solid var(--border-subtle)",
                  background: "var(--bg-surface)",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <RightPanel workspace={workspace} />
              </div>
            )}
          </div>

          {/* Bottom panel resize handle */}
          {bottomPanelOpen && !bottomPanelMaximized && workspace === "developer" && (
            <div
              onMouseDown={startBottomResize}
              style={{
                height: "4px",
                cursor: "row-resize",
                background: "transparent",
                flexShrink: 0,
                transition: "background 120ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "var(--brand-500)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            />
          )}
 
          {/* Bottom panel */}
          {bottomPanelOpen && workspace === "developer" && (
            <div
              style={{
                height: bottomPanelMaximized ? "100%" : bottomPanelHeight,
                minHeight: bottomPanelMaximized ? "100%" : bottomPanelHeight,
                borderTop: bottomPanelMaximized ? "none" : "1px solid var(--border-subtle)",
                background: "var(--bg-surface)",
                flexShrink: 0,
                overflow: "hidden",
                zIndex: bottomPanelMaximized ? 20 : 1,
              }}
            >
              <BottomPanel workspace={workspace} />
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div
        style={{
          height: "22px",
          background: "var(--bg-void)",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          fontSize: "11px",
          color: "var(--text-secondary)",
          flexShrink: 0,
          gap: "16px",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--text-primary)" }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: project ? "#10b981" : "#ef4444",
                boxShadow: project ? "0 0 8px #10b981" : "none",
              }}
            />
            <span style={{ fontWeight: 600 }}>DataSpark</span>
          </div>

          {project && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-secondary)" }}>
              <GitBranch size={11} style={{ opacity: 0.6 }} />
              <span>main</span>
            </div>
          )}

          {project && project.type === "architecture" && project.bimIssues.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#f87171" }}>
              <AlertCircle size={11} />
              <span>{project.bimIssues.length} Clashes</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Sparkles size={11} color="#a855f7" />
            <span>AI: Ready</span>
          </div>
          <span>UTF-8</span>
          <span>TypeScript JSX</span>
          <span>Ln 1, Col 1</span>
        </div>
      </div>

      {/* Command Palette */}
      {commandPaletteOpen && <CommandPalette onClose={closeCommandPalette} />}

      {/* Global Search */}
      {searchOpen && <GlobalSearch onClose={closeSearch} />}

      {/* Notification Drawer */}
      {notificationPanelOpen && (
        <NotificationCenter onClose={toggleNotifications} />
      )}
    </div>
  );
}
