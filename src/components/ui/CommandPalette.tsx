"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search,
  Code2,
  Building2,
  Network,
  Settings,
  FileText,
  Bot,
  Zap,
  GitBranch,
  Store,
  ChevronRight,
  Command,
  ArrowRight,
  Hash,
  PanelLeft,
  PanelRight,
  Maximize2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";

interface CommandPaletteProps {
  onClose: () => void;
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    toggleSidebar,
    toggleRightPanel,
    toggleBottomPanel,
    toggleFullscreen,
    theme,
    setTheme,
  } = useUIStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const commands = [
    {
      category: "Workspaces",
      items: [
        { id: "ws-dev", label: "Open Developer Studio", icon: Code2, shortcut: "", action: "nav", target: "/studio/developer", accent: "#6366f1" },
        { id: "ws-arch", label: "Open Architecture Studio", icon: Building2, shortcut: "", action: "nav", target: "/studio/architecture", accent: "#f59e0b" },
        { id: "ws-edi", label: "Open EDI Automation Studio", icon: Network, shortcut: "", action: "nav", target: "/studio/edi", accent: "#10b981" },
      ],
    },
    {
      category: "View Layout",
      items: [
        { id: "view-sidebar", label: "Toggle Left Sidebar", icon: PanelLeft, shortcut: "Ctrl+B", action: "callback", target: toggleSidebar, accent: "#818cf8" },
        { id: "view-right", label: "Toggle AI & Properties Panel", icon: PanelRight, shortcut: "Ctrl+/", action: "callback", target: toggleRightPanel, accent: "#c084fc" },
        { id: "view-bottom", label: "Toggle Bottom Console Panel", icon: FileText, shortcut: "Ctrl+J", action: "callback", target: toggleBottomPanel, accent: "#38bdf8" },
        { id: "view-fullscreen", label: "Toggle Fullscreen Mode", icon: Maximize2, shortcut: "F11", action: "callback", target: toggleFullscreen, accent: "#10b981" },
      ],
    },
    {
      category: "Settings & Personalization",
      items: [
        { id: "settings-theme", label: `Toggle Theme (Current: ${theme})`, icon: Settings, shortcut: "", action: "callback", target: () => setTheme(theme === "dark" ? "darker" : "dark"), accent: "#a855f7" },
        { id: "nav-settings", label: "Open Application Settings", icon: Settings, shortcut: "Ctrl+,", action: "nav", target: "/settings", accent: "#6b7280" },
        { id: "nav-marketplace", label: "Open Extensions Marketplace", icon: Store, shortcut: "", action: "nav", target: "/marketplace", accent: "#f59e0b" },
        { id: "nav-agents", label: "Open Configure AI Agents", icon: Bot, shortcut: "", action: "nav", target: "/agents", accent: "#a855f7" },
      ],
    },
  ];

  const allItems = commands.flatMap((c) => c.items);
  const filtered =
    query.trim() === ""
      ? allItems
      : allItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  const groupedFiltered = query.trim() === ""
    ? commands
    : [{ category: "Results", items: filtered }];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (filtered[selectedIndex]) {
        executeCommand(filtered[selectedIndex]);
      }
    }
  };

  const executeCommand = (cmd: typeof allItems[0]) => {
    if (cmd.action === "nav") {
      router.push(cmd.target as string);
    } else if (cmd.action === "callback") {
      (cmd.target as () => void)();
    }
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "80px",
      }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Palette */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "580px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-strong)",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1)",
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "0 16px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <Search size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, workspaces, settings..."
            style={{
              flex: 1,
              height: "50px",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "14px",
              fontFamily: "inherit",
            }}
          />
          <kbd
            style={{
              padding: "3px 6px",
              borderRadius: "5px",
              background: "var(--bg-overlay)",
              border: "1px solid var(--border-default)",
              fontSize: "11px",
              color: "var(--text-muted)",
              flexShrink: 0,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: "400px", overflow: "auto", padding: "6px" }}>
          {filtered.length === 0 && (
            <div
              style={{
                padding: "32px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "13px",
              }}
            >
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {groupedFiltered.map((group) => (
            <div key={group.category}>
              <div
                style={{
                  padding: "6px 10px 4px",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-disabled)",
                }}
              >
                {group.category}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const flatIndex = filtered.indexOf(item);
                const isSelected = flatIndex === selectedIndex;

                return (
                  <div
                    key={item.id}
                    onClick={() => executeCommand(item)}
                    onMouseEnter={() => setSelectedIndex(flatIndex)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: isSelected ? "var(--bg-selected)" : "transparent",
                      transition: "background 80ms ease",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "7px",
                        background: `${item.accent}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={14} color={item.accent} />
                    </div>
                    <span
                      style={{
                        flex: 1,
                        fontSize: "13px",
                        color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                        fontWeight: isSelected ? 500 : 400,
                      }}
                    >
                      {item.label}
                    </span>
                    {item.shortcut && (
                      <kbd
                        style={{
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "var(--bg-overlay)",
                          border: "1px solid var(--border-default)",
                          fontSize: "10px",
                          color: "var(--text-muted)",
                          flexShrink: 0,
                        }}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <ArrowRight size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "8px 16px",
            borderTop: "1px solid var(--border-subtle)",
            fontSize: "11px",
            color: "var(--text-disabled)",
          }}
        >
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Command size={10} />
            <span>DataSpark Palette</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
