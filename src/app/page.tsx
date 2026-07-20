"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWorkspaceStore, WorkspaceId } from "@/store/workspaceStore";
import {
  Code2,
  Building2,
  Network,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Bell,
  Search,
  Settings,
  ChevronDown,
  User,
} from "lucide-react";

const workspaces = [
  {
    id: "developer" as WorkspaceId,
    label: "Developer Studio",
    tagline: "AI-Powered IDE",
    description:
      "Full-featured IDE with Monaco Editor, Git integration, multi-model AI assistance, and intelligent code generation. Built for modern development teams.",
    icon: Code2,
    accent: "#6366f1",
    accentGlow: "rgba(99, 102, 241, 0.15)",
    accentBorder: "rgba(99, 102, 241, 0.3)",
    features: ["Monaco Editor", "AI Code Gen", "Git Integration", "Multi-Model AI", "Debugger", "Extensions"],
    badge: "Pro",
    badgeColor: "#6366f1",
    gradient: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 100%)",
  },
  {
    id: "architecture" as WorkspaceId,
    label: "Architecture Studio",
    tagline: "BIM & Design Platform",
    description:
      "Professional BIM workspace with model explorer, drawing viewer, property inspector, and AI design assistant. Revit-compatible workflow.",
    icon: Building2,
    accent: "#f59e0b",
    accentGlow: "rgba(245, 158, 11, 0.15)",
    accentBorder: "rgba(245, 158, 11, 0.3)",
    features: ["Model Explorer", "Drawing Viewer", "AI Design", "Clash Detection", "Schedules", "Revit Connector"],
    badge: "Pro",
    badgeColor: "#f59e0b",
    gradient: "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(234,88,12,0.06) 100%)",
  },
  {
    id: "edi" as WorkspaceId,
    label: "EDI Automation Studio",
    tagline: "Enterprise Integration Platform",
    description:
      "IBM ITX-inspired enterprise integration platform with AI companion. Map, transform, and orchestrate EDI transactions across X12, EDIFACT, XML, JSON and more.",
    icon: Network,
    accent: "#10b981",
    accentGlow: "rgba(16, 185, 129, 0.15)",
    accentBorder: "rgba(16, 185, 129, 0.3)",
    features: ["AI Map Builder", "X12 / EDIFACT", "Adapters", "Monitoring", "Test Cases", "Deployments"],
    badge: "Enterprise",
    badgeColor: "#10b981",
    gradient: "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.06) 100%)",
  },
];

import { useState, useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { setWorkspace } = useWorkspaceStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const token = localStorage.getItem("dataspark_access_token");
    // if (!token) {
    //   router.push("/auth/login");
    // } else {
    //   setLoading(false);
    // }
    setLoading(false); // Bypass auth
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#060609", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "12px", fontFamily: "monospace" }}>
        Authenticating DataSpark session...
      </div>
    );
  }

  const handleSelect = (id: WorkspaceId) => {
    setWorkspace(id);
    router.push(`/studio/${id}`);
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "var(--bg-void)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Minimal top bar */}
      <div
        style={{
          height: "44px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          background: "var(--bg-surface)",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={12} color="white" />
          </div>
          <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>
            DataSpark
          </span>
          <span
            style={{
              fontSize: "10px",
              padding: "1px 6px",
              borderRadius: "4px",
              background: "rgba(99,102,241,0.15)",
              color: "#818cf8",
              fontWeight: 600,
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            BETA
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {[Search, Bell, Settings].map((Icon, i) => (
            <button
              key={i}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                border: "none",
                background: "transparent",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 120ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
              }}
            >
              <Icon size={15} />
            </button>
          ))}
          <div
            style={{
              marginLeft: "4px",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <User size={13} color="white" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          gap: "40px",
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ textAlign: "center" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "100px",
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.2)",
              marginBottom: "20px",
              fontSize: "11px",
              color: "#818cf8",
              fontWeight: 500,
            }}
          >
            <Zap size={11} />
            AI-Powered Professional Platform
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.1,
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            Choose your{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #818cf8 0%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              workspace
            </span>
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "var(--text-secondary)",
              maxWidth: "520px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Three professional studios. One unified platform. Select a workspace to begin.
          </p>
        </motion.div>

        {/* Workspace cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "16px",
            width: "100%",
            maxWidth: "1100px",
          }}
        >
          {workspaces.map((ws, i) => (
            <WorkspaceCard key={ws.id} workspace={ws} index={i} onSelect={handleSelect} />
          ))}
        </div>

        {/* Bottom links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            color: "var(--text-muted)",
            fontSize: "12px",
          }}
        >
          {["Documentation", "Changelog", "Community", "Status"].map((link) => (
            <span
              key={link}
              style={{ cursor: "pointer", transition: "color 120ms" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLSpanElement).style.color = "var(--text-secondary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLSpanElement).style.color = "var(--text-muted)";
              }}
            >
              {link}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function WorkspaceCard({
  workspace,
  index,
  onSelect,
}: {
  workspace: (typeof workspaces)[0];
  index: number;
  onSelect: (id: WorkspaceId) => void;
}) {
  const Icon = workspace.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(workspace.id)}
      style={{
        background: workspace.gradient,
        border: `1px solid ${workspace.accentBorder}`,
        borderRadius: "14px",
        padding: "28px",
        cursor: "pointer",
        transition: "box-shadow 200ms ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 40px ${workspace.accentGlow}, 0 0 0 1px ${workspace.accentBorder}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Badge */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          padding: "3px 8px",
          borderRadius: "100px",
          background: `${workspace.badgeColor}20`,
          border: `1px solid ${workspace.badgeColor}40`,
          fontSize: "10px",
          fontWeight: 700,
          color: workspace.badgeColor,
          letterSpacing: "0.05em",
        }}
      >
        {workspace.badge}
      </div>

      {/* Icon */}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: `${workspace.accent}20`,
          border: `1px solid ${workspace.accent}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <Icon size={24} color={workspace.accent} />
      </div>

      {/* Text */}
      <div style={{ marginBottom: "8px" }}>
        <p style={{ fontSize: "11px", color: workspace.accent, fontWeight: 600, marginBottom: "4px", letterSpacing: "0.05em" }}>
          {workspace.tagline}
        </p>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          {workspace.label}
        </h2>
      </div>

      <p
        style={{
          fontSize: "13px",
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          marginBottom: "24px",
        }}
      >
        {workspace.description}
      </p>

      {/* Features */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          marginBottom: "24px",
        }}
      >
        {workspace.features.map((f) => (
          <span
            key={f}
            style={{
              padding: "3px 8px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              fontSize: "11px",
              color: "var(--text-muted)",
              fontWeight: 500,
            }}
          >
            {f}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: workspace.accent,
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        Open Studio
        <ArrowRight size={14} />
      </div>
    </motion.div>
  );
}
