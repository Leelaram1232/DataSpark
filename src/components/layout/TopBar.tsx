import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import {
  Sparkles,
  Search,
  Bell,
  ChevronDown,
  Code2,
  Building2,
  Network,
  User,
  Settings,
  CreditCard,
  Zap,
  GitBranch,
  Circle,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useProjectStore } from "@/store/projectStore";

const workspaceConfig = {
  developer: { label: "Developer Studio", icon: Code2, accent: "#6366f1" },
  architecture: { label: "Architecture Studio", icon: Building2, accent: "#f59e0b" },
  edi: { label: "EDI Automation Studio", icon: Network, accent: "#10b981" },
};

interface TopBarProps {
  workspace: "developer" | "architecture" | "edi";
}

export function TopBar({ workspace }: TopBarProps) {
  const router = useRouter();
  const { openCommandPalette, toggleNotifications } = useUIStore();
  const { setWorkspace } = useWorkspaceStore();
  const { projects, activeProjectId, setActiveProjectId, createProject, importSampleProject } = useProjectStore();
  
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const ws = workspaceConfig[workspace];
  const WsIcon = ws.icon;

  // Filter projects by current active workspace
  const workspaceProjects = mounted ? projects.filter((p) => p.type === workspace) : [];
  const activeProject = mounted ? projects.find((p) => p.id === activeProjectId && p.type === workspace) : null;

  return (
    <div
      style={{
        height: "44px",
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        gap: "4px",
        flexShrink: 0,
        position: "relative",
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div
        onClick={() => router.push("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "0 8px",
          height: "32px",
          borderRadius: "8px",
          cursor: "pointer",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "transparent";
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "5px",
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles size={11} color="white" />
        </div>
        <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-primary)" }}>
          DataSpark
        </span>
      </div>

      {/* Separator */}
      <div style={{ width: "1px", height: "20px", background: "var(--border-subtle)", margin: "0 4px" }} />

      {/* Workspace selector */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "0 10px",
            height: "32px",
            borderRadius: "8px",
            border: "none",
            background: workspaceMenuOpen ? "var(--bg-hover)" : "transparent",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)";
          }}
          onMouseLeave={(e) => {
            if (!workspaceMenuOpen)
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <WsIcon size={13} color={ws.accent} />
          <span>{ws.label}</span>
          <ChevronDown size={11} style={{ opacity: 0.5 }} />
        </button>

        <AnimatePresence>
          {workspaceMenuOpen && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 40 }}
                onClick={() => setWorkspaceMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute",
                  top: "40px",
                  left: 0,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "10px",
                  padding: "6px",
                  minWidth: "220px",
                  zIndex: 50,
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                {Object.entries(workspaceConfig).map(([id, cfg]) => {
                  const Icon = cfg.icon;
                  const isActive = workspace === id;
                  return (
                    <div
                      key={id}
                      onClick={() => {
                        setWorkspace(id as any);
                        router.push(`/studio/${id}`);
                        setWorkspaceMenuOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 10px",
                        borderRadius: "7px",
                        cursor: "pointer",
                        background: isActive ? "var(--bg-selected)" : "transparent",
                        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive)
                          (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive)
                          (e.currentTarget as HTMLDivElement).style.background = "transparent";
                      }}
                    >
                      <Icon size={15} color={cfg.accent} />
                      <span style={{ fontSize: "13px", fontWeight: 500 }}>{cfg.label}</span>
                      {isActive && (
                        <Circle size={6} fill={cfg.accent} color={cfg.accent} style={{ marginLeft: "auto" }} />
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Separator */}
      <div style={{ width: "1px", height: "20px", background: "var(--border-subtle)", margin: "0 4px" }} />

      {/* Project selector */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setProjectMenuOpen(!projectMenuOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "0 10px",
            height: "32px",
            borderRadius: "8px",
            border: "none",
            background: projectMenuOpen ? "var(--bg-hover)" : "transparent",
            color: activeProject ? "var(--text-primary)" : "var(--text-muted)",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)";
          }}
          onMouseLeave={(e) => {
            if (!projectMenuOpen)
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <FolderOpen size={13} color={activeProject ? ws.accent : "var(--text-muted)"} />
          <span>{activeProject ? activeProject.name : "Select Project..."}</span>
          <ChevronDown size={11} style={{ opacity: 0.5 }} />
        </button>

        <AnimatePresence>
          {projectMenuOpen && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 40 }}
                onClick={() => setProjectMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute",
                  top: "40px",
                  left: 0,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "10px",
                  padding: "6px",
                  minWidth: "240px",
                  zIndex: 50,
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                {workspaceProjects.length === 0 ? (
                  <div style={{ padding: "10px", fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>
                    No Active Projects Yet
                  </div>
                ) : (
                  workspaceProjects.map((p) => {
                    const isActive = p.id === activeProjectId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveProjectId(p.id);
                          setProjectMenuOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "6px 10px",
                          borderRadius: "7px",
                          cursor: "pointer",
                          background: isActive ? "var(--bg-selected)" : "transparent",
                          color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                          fontSize: "12px",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive)
                            (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive)
                            (e.currentTarget as HTMLDivElement).style.background = "transparent";
                        }}
                      >
                        <Circle size={6} fill={isActive ? ws.accent : "transparent"} color={isActive ? ws.accent : "var(--text-muted)"} />
                        <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.name}
                        </span>
                      </div>
                    );
                  })
                )}
                <div style={{ height: "1px", background: "var(--border-subtle)", margin: "4px 0" }} />
                <div
                  onClick={() => {
                    const name = prompt("Enter project name:", `My ${ws.label} Project`);
                    if (name) {
                      createProject(name, workspace);
                    }
                    setProjectMenuOpen(false);
                  }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "7px",
                    cursor: "pointer",
                    fontSize: "11px",
                    color: ws.accent,
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  + Create New Project
                </div>
                <div
                  onClick={() => {
                    importSampleProject(workspace);
                    setProjectMenuOpen(false);
                  }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "7px",
                    cursor: "pointer",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  ⚡ Import Sample Project
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>


      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search bar */}
      <button
        onClick={openCommandPalette}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "0 12px",
          height: "30px",
          borderRadius: "8px",
          border: "1px solid var(--border-default)",
          background: "var(--bg-elevated)",
          color: "var(--text-muted)",
          cursor: "pointer",
          fontSize: "12px",
          minWidth: "200px",
          transition: "all 120ms ease",
        }}
        onMouseEnter={(e) => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.borderColor = "var(--border-strong)";
          b.style.color = "var(--text-secondary)";
        }}
        onMouseLeave={(e) => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.borderColor = "var(--border-default)";
          b.style.color = "var(--text-muted)";
        }}
      >
        <Search size={12} />
        <span>Search or run command...</span>
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: "2px",
            alignItems: "center",
          }}
        >
          <kbd
            style={{
              padding: "1px 4px",
              borderRadius: "4px",
              background: "var(--bg-overlay)",
              border: "1px solid var(--border-default)",
              fontSize: "10px",
              color: "var(--text-muted)",
            }}
          >
            Ctrl
          </kbd>
          <kbd
            style={{
              padding: "1px 4px",
              borderRadius: "4px",
              background: "var(--bg-overlay)",
              border: "1px solid var(--border-default)",
              fontSize: "10px",
              color: "var(--text-muted)",
            }}
          >
            ⇧P
          </kbd>
        </span>
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {/* AI Usage */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "0 10px",
            height: "30px",
            borderRadius: "8px",
            border: "1px solid rgba(99,102,241,0.2)",
            background: "rgba(99,102,241,0.06)",
            fontSize: "11px",
            color: "#818cf8",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <Zap size={11} />
          <span>2.4k / 10k</span>
        </div>

        {/* Git branch */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "0 8px",
            height: "30px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: "11px",
          }}
          onMouseEnter={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = "var(--bg-hover)";
            b.style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = "transparent";
            b.style.color = "var(--text-muted)";
          }}
        >
          <GitBranch size={12} />
          <span>main</span>
        </button>

        {/* Notifications */}
        <button
          onClick={toggleNotifications}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = "var(--bg-hover)";
            b.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = "transparent";
            b.style.color = "var(--text-secondary)";
          }}
        >
          <Bell size={15} />
          <div
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#6366f1",
              border: "1.5px solid var(--bg-surface)",
            }}
          />
        </button>

        {/* User menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0 6px",
              height: "32px",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)";
            }}
            onMouseLeave={(e) => {
              if (!userMenuOpen)
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
                color: "white",
              }}
            >
              DS
            </div>
            <ChevronDown size={11} style={{ color: "var(--text-muted)" }} />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 40 }}
                  onClick={() => setUserMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute",
                    top: "40px",
                    right: 0,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "10px",
                    padding: "6px",
                    minWidth: "200px",
                    zIndex: 50,
                    boxShadow: "var(--shadow-lg)",
                  }}
                >
                  {/* User info */}
                  <div
                    style={{
                      padding: "8px 10px 10px",
                      borderBottom: "1px solid var(--border-subtle)",
                      marginBottom: "4px",
                    }}
                  >
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      DataSpark User
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      user@dataspark.ai
                    </p>
                    <div
                      style={{
                        marginTop: "6px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 7px",
                        borderRadius: "100px",
                        background: "rgba(99,102,241,0.15)",
                        border: "1px solid rgba(99,102,241,0.25)",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "#818cf8",
                      }}
                    >
                      <CreditCard size={9} />
                      Pro Plan
                    </div>
                  </div>
                  {[
                    { icon: User, label: "Profile" },
                    { icon: Settings, label: "Settings" },
                    { icon: CreditCard, label: "Subscription" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "7px 10px",
                        borderRadius: "7px",
                        cursor: "pointer",
                        color: "var(--text-secondary)",
                        fontSize: "13px",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)";
                        (e.currentTarget as HTMLDivElement).style.color = "var(--text-primary)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = "transparent";
                        (e.currentTarget as HTMLDivElement).style.color = "var(--text-secondary)";
                      }}
                    >
                      <Icon size={14} />
                      {label}
                    </div>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
