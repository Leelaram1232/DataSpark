"use client";

import { useUIStore } from "@/store/uiStore";
import { useRouter, usePathname } from "next/navigation";
import {
  FolderTree,
  GitBranch,
  Bot,
  Puzzle,
  Store,
  History,
  Settings,
  Search,
  PanelLeft,
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Code2,
  Building2,
  Network,
  Plus,
  RefreshCw,
  Filter,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const devSidebarTabs = [
  { id: "explorer", icon: FolderTree, label: "Explorer", tooltip: "Explorer" },
  { id: "search", icon: Search, label: "Search", tooltip: "Search (Ctrl+Shift+F)" },
  { id: "git", icon: GitBranch, label: "Source Control", tooltip: "Source Control" },
  { id: "agents", icon: Bot, label: "AI Agents", tooltip: "AI Agents" },
  { id: "plugins", icon: Puzzle, label: "Plugins", tooltip: "Plugins" },
  { id: "marketplace", icon: Store, label: "Marketplace", tooltip: "Marketplace" },
  { id: "history", icon: History, label: "History", tooltip: "History" },
];

const mockFiles = [
  {
    name: "src",
    type: "folder",
    open: true,
    children: [
      {
        name: "app",
        type: "folder",
        open: true,
        children: [
          { name: "layout.tsx", type: "file", ext: "tsx" },
          { name: "page.tsx", type: "file", ext: "tsx" },
          { name: "globals.css", type: "file", ext: "css" },
        ],
      },
      {
        name: "components",
        type: "folder",
        open: false,
        children: [
          { name: "Button.tsx", type: "file", ext: "tsx" },
          { name: "Input.tsx", type: "file", ext: "tsx" },
        ],
      },
      {
        name: "lib",
        type: "folder",
        open: false,
        children: [{ name: "utils.ts", type: "file", ext: "ts" }],
      },
    ],
  },
  {
    name: "public",
    type: "folder",
    open: false,
    children: [{ name: "favicon.ico", type: "file", ext: "ico" }],
  },
  { name: "package.json", type: "file", ext: "json" },
  { name: "tsconfig.json", type: "file", ext: "json" },
  { name: "next.config.ts", type: "file", ext: "ts" },
];

const extColors: Record<string, string> = {
  tsx: "#61dafb",
  ts: "#3178c6",
  css: "#f472b6",
  json: "#fbbf24",
  ico: "#a78bfa",
  js: "#f59e0b",
  md: "#6b7280",
};

interface LeftSidebarProps {
  workspace: "developer" | "architecture" | "edi";
  collapsed: boolean;
}

export function LeftSidebar({ workspace, collapsed }: LeftSidebarProps) {
  const { activeSidebarTab, setActiveSidebarTab, toggleSidebar } = useUIStore();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", overflow: "hidden" }}>
      {/* Icon rail */}
      <div
        style={{
          width: "48px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "8px 0",
          borderRight: collapsed ? "none" : "1px solid var(--border-subtle)",
          gap: "2px",
        }}
      >
        {devSidebarTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSidebarTab === tab.id;
          return (
            <SidebarIcon
              key={tab.id}
              icon={Icon}
              tooltip={tab.tooltip}
              active={isActive}
              onClick={() => {
                if (isActive && !collapsed) {
                  toggleSidebar();
                } else {
                  setActiveSidebarTab(tab.id);
                  if (collapsed) toggleSidebar();
                }
              }}
            />
          );
        })}

        <div style={{ flex: 1 }} />

        <SidebarIcon
          icon={Settings}
          tooltip="Settings"
          active={false}
          onClick={() => router.push("/settings")}
        />
        <SidebarIcon
          icon={PanelLeft}
          tooltip="Toggle Sidebar"
          active={false}
          onClick={toggleSidebar}
        />
      </div>

      {/* Panel content */}
      {!collapsed && (
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <AnimatePresence mode="wait">
            {activeSidebarTab === "explorer" && (
              <motion.div
                key="explorer"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                <ExplorerPanel mounted={mounted} />
              </motion.div>
            )}
            {activeSidebarTab === "git" && (
              <motion.div
                key="git"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                <GitPanel mounted={mounted} />
              </motion.div>
            )}
            {activeSidebarTab === "agents" && (
              <motion.div
                key="agents"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                <AgentsPanel mounted={mounted} />
              </motion.div>
            )}
            {!["explorer", "git", "agents"].includes(activeSidebarTab) && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                  fontSize: "12px",
                  gap: "8px",
                }}
              >
                <Puzzle size={24} style={{ opacity: 0.3 }} />
                <span>Coming soon</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function SidebarIcon({
  icon: Icon,
  tooltip,
  active,
  onClick,
}: {
  icon: React.ElementType;
  tooltip: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      title={tooltip}
      onClick={onClick}
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        border: "none",
        background: active ? "rgba(99,102,241,0.15)" : "transparent",
        color: active ? "#818cf8" : "var(--text-muted)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 120ms ease",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.background = "var(--bg-hover)";
          b.style.color = "var(--text-secondary)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.background = "transparent";
          b.style.color = "var(--text-muted)";
        }
      }}
    >
      {active && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "2px",
            height: "16px",
            borderRadius: "0 2px 2px 0",
            background: "#6366f1",
          }}
        />
      )}
      <Icon size={17} />
    </button>
  );
}

import { useProjectStore, ProjectFile } from "@/store/projectStore";
import { Edit2, Trash2, Copy, FilePlus, FolderPlus } from "lucide-react";

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  node: ProjectFile | null;
}

function ExplorerPanel({ mounted }: { mounted: boolean }) {
  const { activeProject, importSampleProject, createProject } = useProjectStore();
  const project = mounted ? activeProject() : null;

  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [activeNode, setActiveNode] = useState<ProjectFile | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  });

  const handleNodeClick = (node: ProjectFile, e: React.MouseEvent) => {
    setActiveNode(node);
    if (e.ctrlKey || e.metaKey) {
      setSelectedNodes((prev) =>
        prev.includes(node.name)
          ? prev.filter((name) => name !== node.name)
          : [...prev, node.name]
      );
    } else {
      setSelectedNodes([node.name]);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, node: ProjectFile) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      node,
    });
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu((prev) => ({ ...prev, visible: false }));
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid var(--border-subtle)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Explorer
        </span>
        <div style={{ display: "flex", gap: "2px" }}>
          {[Plus, RefreshCw, Filter].map((Icon, i) => (
            <button
              key={i}
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "4px",
                border: "none",
                background: "transparent",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
              <Icon size={12} />
            </button>
          ))}
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      {project && activeNode && (
        <div
          style={{
            padding: "4px 12px",
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            fontSize: "11px",
            color: "var(--text-muted)",
            gap: "4px",
            overflowX: "auto",
            flexShrink: 0,
          }}
        >
          <span className="breadcrumb-segment">{project.name}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-segment" style={{ color: "var(--text-secondary)" }}>
            {activeNode.name}
          </span>
        </div>
      )}

      {/* Project label */}
      <div
        style={{
          padding: "6px 12px",
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <ChevronDown size={12} />
          <span>{project ? project.name.toUpperCase() : "NO PROJECT LOADED"}</span>
        </div>
        <button
          onClick={() => {
            const name = prompt("Enter project name:", "X12 EDI Mapping Workspace");
            if (name) {
              const newProj = createProject(name, "edi");
            }
          }}
          title="Create New EDI Project"
          style={{
            background: "transparent",
            border: "none",
            color: "#10b981",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: "2px",
            borderRadius: "4px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Plus size={12} />
        </button>
      </div>

      {/* File tree or empty state */}
      <div style={{ flex: 1, overflow: "auto", padding: "0 4px" }}>
        {!project ? (
          <div style={{ padding: "20px 12px", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "11px", marginBottom: "12px" }}>
              No active project loaded in this workspace.
            </p>
            <button
              onClick={() => importSampleProject("developer")}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-default)",
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                fontSize: "11px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Import Sample Project
            </button>
          </div>
        ) : project.type === "developer" && project.files.length > 0 ? (
          project.files.map((node) => (
            <FileNode
              key={node.name}
              node={node}
              depth={0}
              selectedNodes={selectedNodes}
              onNodeClick={handleNodeClick}
              onNodeContextMenu={handleContextMenu}
            />
          ))
        ) : (
          <div style={{ padding: "16px 12px", color: "var(--text-muted)", fontSize: "11px", textAlign: "center" }}>
            Empty workspace. Use Settings to load templates or add files.
          </div>
        )}
      </div>

      {/* Right-click Context Menu */}
      <AnimatePresence>
        {contextMenu.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
            className="context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div className="context-menu-item">
              <FilePlus size={13} /> New File
            </div>
            <div className="context-menu-item">
              <FolderPlus size={13} /> New Folder
            </div>
            <div className="context-menu-separator" />
            <div className="context-menu-item">
              <Edit2 size={13} /> Rename
            </div>
            <div className="context-menu-item">
              <Copy size={13} /> Copy Path
            </div>
            <div className="context-menu-separator" />
            <div className="context-menu-item danger">
              <Trash2 size={13} /> Delete File
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FileNodeProps {
  node: ProjectFile;
  depth: number;
  selectedNodes: string[];
  onNodeClick: (node: ProjectFile, e: React.MouseEvent) => void;
  onNodeContextMenu: (e: React.MouseEvent, node: ProjectFile) => void;
}

function FileNode({
  node,
  depth,
  selectedNodes,
  onNodeClick,
  onNodeContextMenu,
}: FileNodeProps) {
  const [open, setOpen] = useState(node.open ?? false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [dragOver, setDragOver] = useState(false);

  const isFolder = node.type === "folder";
  const isSelected = selectedNodes.includes(node.name);
  const color = node.ext ? extColors[node.ext] || "var(--text-muted)" : "var(--text-muted)";

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleRenameSubmit = () => {
    setIsEditing(false);
    node.name = editName;
  };

  return (
    <div>
      <div
        onClick={(e) => {
          if (isFolder) setOpen(!open);
          onNodeClick(node, e);
        }}
        onContextMenu={(e) => onNodeContextMenu(e, node)}
        onDoubleClick={handleDoubleClick}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", node.name);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (isFolder) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 8px",
          paddingLeft: `${8 + depth * 12}px`,
          borderRadius: "4px",
          cursor: "pointer",
          color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
          background: isSelected
            ? "var(--bg-selected)"
            : dragOver
            ? "var(--bg-hover)"
            : "transparent",
          fontSize: "12px",
          userSelect: "none",
          transition: "background 80ms ease, color 80ms ease",
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)";
            (e.currentTarget as HTMLDivElement).style.color = "var(--text-primary)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            (e.currentTarget as HTMLDivElement).style.background = "transparent";
            (e.currentTarget as HTMLDivElement).style.color = "var(--text-secondary)";
          }
        }}
      >
        {isFolder ? (
          <>
            {open ? (
              <ChevronDown size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
            ) : (
              <ChevronRight size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
            )}
            {open ? (
              <FolderOpen size={13} color="#fbbf24" style={{ flexShrink: 0 }} />
            ) : (
              <Folder size={13} color="#fbbf24" style={{ flexShrink: 0 }} />
            )}
          </>
        ) : (
          <>
            <div style={{ width: "11px", flexShrink: 0 }} />
            <File size={13} color={color} style={{ flexShrink: 0 }} />
          </>
        )}

        {isEditing ? (
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameSubmit();
              if (e.key === "Escape") {
                setEditName(node.name);
                setIsEditing(false);
              }
            }}
            autoFocus
            style={{
              flex: 1,
              background: "var(--bg-overlay)",
              border: "1px solid var(--brand-500)",
              borderRadius: "3px",
              color: "var(--text-primary)",
              fontSize: "11px",
              padding: "0 4px",
              outline: "none",
            }}
          />
        ) : (
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {node.name}
          </span>
        )}
      </div>

      {isFolder && open && node.children && (
        <div>
          {node.children.map((child: any) => (
            <FileNode
              key={child.name}
              node={child}
              depth={depth + 1}
              selectedNodes={selectedNodes}
              onNodeClick={onNodeClick}
              onNodeContextMenu={onNodeContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GitPanel({ mounted }: { mounted: boolean }) {
  const { activeProject } = useProjectStore();
  const project = mounted ? activeProject() : null;

  const changes = project
    ? [
        { file: "src/app/page.tsx", status: "M", color: "#f59e0b" },
        { file: "package.json", status: "M", color: "#f59e0b" },
      ]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid var(--border-subtle)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Source Control
        </span>
        {changes.length > 0 && (
          <span
            style={{
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "10px",
              background: "rgba(99,102,241,0.15)",
              color: "#818cf8",
              fontWeight: 700,
            }}
          >
            {changes.length}
          </span>
        )}
      </div>

      {!project ? (
        <div style={{ padding: "24px 12px", textAlign: "center", color: "var(--text-muted)", fontSize: "11px" }}>
          No active project. Repository unavailable.
        </div>
      ) : (
        <>
          <div style={{ padding: "8px 12px", flexShrink: 0 }}>
            <input
              placeholder="Message (Ctrl+Enter to commit)"
              style={{
                width: "100%",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border-default)",
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                fontSize: "12px",
                outline: "none",
              }}
            />
            <button
              style={{
                marginTop: "6px",
                width: "100%",
                padding: "6px",
                borderRadius: "6px",
                border: "none",
                background: "var(--brand-600)",
                color: "white",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ✓ Commit
            </button>
          </div>

          <div
            style={{
              padding: "4px 12px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            Changes ({changes.length})
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            {changes.length === 0 ? (
              <div style={{ padding: "16px 12px", color: "var(--text-disabled)", fontSize: "11px", textAlign: "center" }}>
                No changes detected. Working tree clean.
              </div>
            ) : (
              changes.map((c) => (
                <div
                  key={c.file}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "4px 12px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  <File size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
                  <span
                    style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", color: "var(--text-secondary)" }}
                  >
                    {c.file.split("/").pop()}
                  </span>
                  <span style={{ color: c.color, fontWeight: 700, fontSize: "11px", flexShrink: 0 }}>
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function AgentsPanel({ mounted }: { mounted: boolean }) {
  const { activeProject } = useProjectStore();
  const project = mounted ? activeProject() : null;

  const agents = project
    ? [
        { name: `${project.type.charAt(0).toUpperCase() + project.type.slice(1)} Agent`, status: "running", icon: Bot, color: "#6366f1" },
        { name: "Documentation Agent", status: "idle", icon: Bot, color: "#f59e0b" },
      ]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid var(--border-subtle)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          AI Agents
        </span>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "8px" }}>
        {agents.length === 0 ? (
          <div style={{ padding: "24px 12px", textAlign: "center", color: "var(--text-muted)", fontSize: "11px" }}>
            No agents active. Load a project first.
          </div>
        ) : (
          agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  marginBottom: "4px",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-elevated)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-default)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-subtle)";
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "7px",
                    background: `${agent.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} color={agent.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {agent.name}
                  </p>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                    {agent.status === "running" ? "⚡ Active" : "● Idle"}
                  </p>
                </div>
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: agent.status === "running" ? "#4ade80" : "var(--text-disabled)",
                    flexShrink: 0,
                    animation: agent.status === "running" ? "aiPulse 2s infinite" : "none",
                  }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

