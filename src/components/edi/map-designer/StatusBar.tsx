"use client";

import React from "react";
import {
  GitBranch,
  Cable,
  AlertTriangle,
  Search,
  Calculator,
  Zap,
  Shield,
  Clock,
  RotateCcw,
  RotateCw,
  CheckCircle2,
} from "lucide-react";
import type { MappingSummary } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   STATUS BAR — Bottom Status Bar matching reference screenshot
   ═══════════════════════════════════════════════════════════════════════════ */

export function StatusBar({
  projectName = "DSV_Project",
  mapName = "XML_TO_XML_InvoiceMap",
  mapType = "XML -> XML",
  lastSaved = "22/08/2025 10:45 AM",
  status = "Valid",
  mode = "Design",
  version = "1.0.0",
  onUndo,
  onRedo,
}: {
  projectName?: string;
  mapName?: string;
  mapType?: string;
  lastSaved?: string;
  status?: string;
  mode?: string;
  version?: string;
  onUndo?: () => void;
  onRedo?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: "26px",
        background: "#06060a",
        borderTop: "1px solid #141420",
        padding: "0 12px",
        gap: "10px",
        flexShrink: 0,
        fontSize: "10px",
        color: "#6b7280",
        userSelect: "none",
      }}
    >
      {/* Project Info Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span>Project: <strong style={{ color: "#ececf1" }}>{projectName}</strong></span>
      </div>

      <div style={{ width: "1px", height: "12px", background: "#1a1a28" }} />

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span>Map: <strong style={{ color: "#10b981", fontFamily: "var(--font-mono)" }}>{mapName}</strong></span>
      </div>

      <div style={{ width: "1px", height: "12px", background: "#1a1a28" }} />

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span>Type: <strong style={{ color: "#9ca3af" }}>{mapType}</strong></span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Right Details */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span>Last Saved: <strong style={{ color: "#9ca3af", fontFamily: "var(--font-mono)" }}>{lastSaved}</strong></span>

        <div style={{ width: "1px", height: "12px", background: "#1a1a28" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span>Status:</span>
          <span style={{ color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: "3px" }}>
            <CheckCircle2 size={10} color="#10b981" /> {status}
          </span>
        </div>

        <div style={{ width: "1px", height: "12px", background: "#1a1a28" }} />

        <span>Mode: <strong style={{ color: "#ececf1" }}>{mode}</strong></span>

        <div style={{ width: "1px", height: "12px", background: "#1a1a28" }} />

        {/* Undo / Redo */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            onClick={onUndo}
            style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", fontSize: "9.5px" }}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={10} /> Undo
          </button>
          <button
            onClick={onRedo}
            style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", fontSize: "9.5px" }}
            title="Redo (Ctrl+Y)"
          >
            <RotateCw size={10} /> Redo
          </button>
        </div>

        <div style={{ width: "1px", height: "12px", background: "#1a1a28" }} />

        <span>Version: <strong style={{ color: "#9ca3af", fontFamily: "var(--font-mono)" }}>{version}</strong></span>
      </div>
    </div>
  );
}
