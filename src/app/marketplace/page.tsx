"use client";

import { useState } from "react";
import { usePluginStore, PluginItem } from "@/store/pluginRegistry";
import { AppShell } from "@/components/layout/AppShell";
import {
  Search,
  Check,
  Zap,
  Puzzle,
  Download,
  Info,
  Clock,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categories = [
  "All",
  "Installed",
  "Updates",
  "Featured",
  "Developer",
  "Architecture",
  "Integration",
  "AI",
];

export default function MarketplacePage() {
  const { plugins, installPlugin, uninstallPlugin, togglePluginStatus } = usePluginStore();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlugin, setSelectedPlugin] = useState<PluginItem | null>(null);

  const filteredPlugins = plugins.filter((p) => {
    // Search filter
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    if (activeCategory === "All") return matchesSearch;
    if (activeCategory === "Installed") return p.installed && matchesSearch;
    if (activeCategory === "Updates") return p.installed && matchesSearch; // Simulating updates
    if (activeCategory === "Featured") return matchesSearch;
    if (activeCategory === "Developer") return p.category === "VCS" && matchesSearch;
    if (activeCategory === "Architecture") return p.category === "BIM" && matchesSearch;
    if (activeCategory === "Integration") return p.category === "EDI" && matchesSearch;
    if (activeCategory === "AI") return p.category === "AI" && matchesSearch;
    return matchesSearch;
  });

  return (
    <AppShell workspace="developer">
      <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "var(--bg-base)" }}>
        {/* Marketplace categories sidebar */}
        <div
          style={{
            width: "220px",
            borderRight: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            padding: "16px 8px",
          }}
        >
          <div style={{ padding: "0 8px 12px 8px", borderBottom: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
              DataSpark Extensions
            </span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px", marginTop: "12px" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: activeCategory === cat ? "var(--bg-active)" : "transparent",
                  color: activeCategory === cat ? "var(--text-primary)" : "var(--text-muted)",
                  fontSize: "12px",
                  fontWeight: activeCategory === cat ? 600 : 400,
                  cursor: "pointer",
                  transition: "background 100ms ease",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content workspace area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "24px" }}>
          {/* Top Search bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "8px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
              }}
            >
              <Search size={14} style={{ color: "var(--text-muted)" }} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search extensions, SDKs, and templates..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                }}
              />
            </div>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border-default)",
                background: "transparent",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              <SlidersHorizontal size={12} /> Filters
            </button>
          </div>

          {/* Grid Layout of plugins */}
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: "20px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "14px",
              }}
            >
              {filteredPlugins.map((plugin) => (
                <div
                  key={plugin.id}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px",
                    position: "relative",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: "rgba(99,102,241,0.1)",
                          color: "var(--brand-400)",
                          textTransform: "uppercase",
                        }}
                      >
                        {plugin.category}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>v{plugin.version}</span>
                    </div>

                    <h3
                      onClick={() => setSelectedPlugin(plugin)}
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginTop: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {plugin.name} <ChevronRight size={12} style={{ opacity: 0.5 }} />
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", lineHeight: 1.4 }}>
                      {plugin.description}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                    {plugin.installed ? (
                      <>
                        <button
                          onClick={() => togglePluginStatus(plugin.id)}
                          style={{
                            flex: 1,
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "none",
                            background: plugin.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
                            color: plugin.status === "active" ? "#10b981" : "var(--text-muted)",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {plugin.status === "active" ? "Active" : "Disabled"}
                        </button>
                        <button
                          onClick={() => uninstallPlugin(plugin.id)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-default)",
                            background: "transparent",
                            color: "var(--text-muted)",
                            fontSize: "11px",
                            cursor: "pointer",
                          }}
                        >
                          Uninstall
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => installPlugin(plugin.id)}
                        style={{
                          flex: 1,
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "none",
                          background: "var(--brand-600)",
                          color: "white",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Download size={11} /> Install Extension
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Extension detail Modal */}
      <AnimatePresence>
        {selectedPlugin && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlugin(null)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(6px)",
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "500px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-strong)",
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "var(--shadow-lg)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: "rgba(99,102,241,0.1)",
                    color: "var(--brand-400)",
                    textTransform: "uppercase",
                  }}
                >
                  {selectedPlugin.category}
                </span>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginTop: "8px" }}>
                  {selectedPlugin.name}
                </h2>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  by {selectedPlugin.author} · version {selectedPlugin.version}
                </p>
              </div>

              <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {selectedPlugin.description}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-primary)" }}>Release Notes</span>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", background: "var(--bg-surface)", padding: "8px 12px", borderRadius: "6px" }}>
                  • Fixed visual layout updates loops glitches.<br />
                  • Added full compatibility check with DataSpark v2.4 core SDK.<br />
                  • Memory optimization for visual adapters connection pipelines.
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <button
                  onClick={() => setSelectedPlugin(null)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-default)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
