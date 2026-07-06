"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Clock,
  ArrowRight,
  FolderOpen,
  Zap,
  Hash,
} from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { useUIStore } from "@/store/uiStore";

interface SearchResult {
  id: string;
  label: string;
  subtitle?: string;
  category: "recent" | "projects" | "files" | "commands" | "settings" | "navigation";
  icon: React.ElementType;
  accent: string;
  action: () => void;
}

interface GlobalSearchProps {
  onClose: () => void;
}

export function GlobalSearch({ onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { projects, importSampleProject } = useProjectStore();
  const { openCommandPalette, closeSearch } = useUIStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const navigate = useCallback((path: string) => {
    router.push(path);
    onClose();
  }, [router, onClose]);

  const results: SearchResult[] = [];

  // Recent
  if (!query) {
    results.push(
      { id: "r-dev", label: "Developer Studio", subtitle: "Recently opened", category: "recent", icon: Code2, accent: "#6366f1", action: () => navigate("/studio/developer") },
      { id: "r-arch", label: "Architecture Studio", subtitle: "Recently opened", category: "recent", icon: Building2, accent: "#f59e0b", action: () => navigate("/studio/architecture") },
      { id: "r-edi", label: "EDI Automation Studio", subtitle: "Recently opened", category: "recent", icon: Network, accent: "#10b981", action: () => navigate("/studio/edi") },
    );
  }

  // Projects
  projects.filter((p) => !query || p.name.toLowerCase().includes(query.toLowerCase())).forEach((p) => {
    const icons: Record<string, React.ElementType> = { developer: Code2, architecture: Building2, edi: Network };
    const accents: Record<string, string> = { developer: "#6366f1", architecture: "#f59e0b", edi: "#10b981" };
    results.push({ id: `p-${p.id}`, label: p.name, subtitle: `${p.type} project`, category: "projects", icon: icons[p.type] || FolderOpen, accent: accents[p.type] || "#6b7280", action: () => navigate(`/studio/${p.type}`) });
  });

  // Commands
  const commands: SearchResult[] = [
    { id: "c-settings", label: "Open Settings", subtitle: "Ctrl+,", category: "commands", icon: Settings, accent: "#6b7280", action: () => navigate("/settings") },
    { id: "c-marketplace", label: "Open Marketplace", subtitle: "Browse plugins", category: "commands", icon: Zap, accent: "#f59e0b", action: () => navigate("/marketplace") },
    { id: "c-agents", label: "Open AI Agents", subtitle: "Manage agents", category: "commands", icon: Bot, accent: "#a855f7", action: () => navigate("/agents") },
    { id: "c-palette", label: "Command Palette", subtitle: "Ctrl+Shift+P", category: "commands", icon: Hash, accent: "#6366f1", action: () => { openCommandPalette(); onClose(); } },
  ];
  commands.filter((c) => !query || c.label.toLowerCase().includes(query.toLowerCase())).forEach((c) => results.push(c));

  // Navigation
  if (!query || "workspace".includes(query.toLowerCase())) {
    results.push({ id: "n-home", label: "Home — Workspace Selector", subtitle: "Start page", category: "navigation", icon: FolderOpen, accent: "#6b7280", action: () => navigate("/") });
  }

  const filtered = query ? results.filter((r) => r.label.toLowerCase().includes(query.toLowerCase()) || r.subtitle?.toLowerCase().includes(query.toLowerCase())) : results;

  const grouped = filtered.reduce<Record<string, SearchResult[]>>((acc, item) => {
    const key = item.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const allFlat = Object.values(grouped).flat();

  useEffect(() => { setSelectedIdx(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, allFlat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && allFlat[selectedIdx]) { allFlat[selectedIdx].action(); }
  };

  const categoryLabels: Record<string, string> = { recent: "Recent", projects: "Projects", files: "Files", commands: "Commands", settings: "Settings", navigation: "Navigation" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "72px" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.96 }}
        transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
        style={{ position: "relative", width: "100%", maxWidth: "620px", background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", borderRadius: "14px", overflow: "hidden", boxShadow: "0 28px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.12)" }}
      >
        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0 16px", borderBottom: "1px solid var(--border-subtle)" }}>
          <Search size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, files, commands..."
            style={{ flex: 1, height: "52px", background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: "15px", fontFamily: "inherit" }}
          />
          <kbd style={{ padding: "3px 7px", borderRadius: "5px", background: "var(--bg-overlay)", border: "1px solid var(--border-default)", fontSize: "10px", color: "var(--text-muted)", flexShrink: 0 }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: "420px", overflow: "auto" }}>
          {allFlat.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              <Search size={28} style={{ opacity: 0.3, marginBottom: "8px" }} />
              <p>No results for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <div style={{ padding: "8px 16px 4px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-disabled)", display: "flex", alignItems: "center", gap: "6px" }}>
                  {cat === "recent" && <Clock size={10} />}
                  {categoryLabels[cat] || cat}
                </div>
                {items.map((item) => {
                  const Icon = item.icon;
                  const flatIdx = allFlat.indexOf(item);
                  const isSelected = flatIdx === selectedIdx;
                  return (
                    <div
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIdx(flatIdx)}
                      style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 16px", cursor: "pointer", background: isSelected ? "var(--bg-selected)" : "transparent", transition: "background 60ms ease" }}
                    >
                      <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${item.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={14} color={item.accent} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", color: isSelected ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: isSelected ? 500 : 400 }}>{item.label}</p>
                        {item.subtitle && <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>{item.subtitle}</p>}
                      </div>
                      {isSelected && <ArrowRight size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "8px 16px", borderTop: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-disabled)" }}>
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>ESC Close</span>
          <div style={{ flex: 1 }} />
          <span style={{ color: "var(--text-muted)" }}>Quick Open</span>
        </div>
      </motion.div>
    </div>
  );
}
