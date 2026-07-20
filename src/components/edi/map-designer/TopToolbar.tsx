"use client";

import React from "react";
import {
  Cable,
  Save,
  Sparkles,
  MessageSquare,
  BookOpen,
  Shield,
  Zap,
  ChevronDown,
  LayoutGrid,
  ListFilter,
  Layers,
  CheckCircle2,
  Minus,
  Plus,
  Maximize2,
  Search,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   TOP TOOLBAR — ITX-style header bar + metrics sub-bar
   ═══════════════════════════════════════════════════════════════════════════ */

export function TopToolbar({
  currentMapName = "XML_TO_XML_InvoiceMap",
  projectName = "DSV_Project",
  viewMode = "canvas",
  onViewModeChange,
  onSave,
  onValidate,
  onGenerateMap,
  onToggleAIChat,
  onToggleSpecChat,
  onToggleFunctionLibrary,
  showAIChat = false,
  showSpecChat = false,
  isSaving = false,
  zoom = 100,
  onZoomChange,
  metrics = {
    mappings: 156,
    conditions: 28,
    lookups: 12,
    calculations: 18,
    functions: 25,
    validations: 25,
  },
}: {
  currentMapName?: string;
  projectName?: string;
  viewMode?: "canvas" | "table" | "tree";
  onViewModeChange?: (mode: "canvas" | "table" | "tree") => void;
  onSave?: () => void;
  onValidate?: () => void;
  onGenerateMap?: () => void;
  onToggleAIChat?: () => void;
  onToggleSpecChat?: () => void;
  onToggleFunctionLibrary?: () => void;
  showAIChat?: boolean;
  showSpecChat?: boolean;
  isSaving?: boolean;
  zoom?: number;
  onZoomChange?: (newZoom: number) => void;
  metrics?: {
    mappings: number;
    conditions: number;
    lookups: number;
    calculations: number;
    functions: number;
    validations: number;
  };
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flexShrink: 0, zIndex: 30 }}>
      {/* ── Main Top Bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "40px",
          background: "#08080d",
          borderBottom: "1px solid #141420",
          padding: "0 14px",
          gap: "10px",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px", flexShrink: 0 }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 10px rgba(16, 185, 129, 0.4)",
            }}
          >
            <Cable size={14} color="#fff" />
          </div>
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#f3f4f6", letterSpacing: "0.2px" }}>
            DataSpark
          </span>
          <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: 500 }}>
            EDI AI Mapping Studio
          </span>
        </div>

        <div style={{ height: "16px", width: "1px", background: "#1a1a28", flexShrink: 0 }} />

        {/* Breadcrumb Workspace > Project > Map */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#9ca3af", flexShrink: 0 }}>
          <span style={{ color: "#4b5563" }}>Workspace</span>
          <span style={{ color: "#374151" }}>&gt;</span>
          <span style={{ color: "#9ca3af", fontWeight: 600 }}>{projectName}</span>
          <span style={{ color: "#374151" }}>&gt;</span>
          <span style={{ color: "#10b981", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
            {currentMapName}
          </span>
        </div>

        <div style={{ height: "16px", width: "1px", background: "#1a1a28", flexShrink: 0 }} />

        {/* Center Pill Badge: AI Mapping Completed ✓ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "3px 10px",
            background: "#10b98115",
            border: "1px solid #10b98133",
            borderRadius: "12px",
            color: "#10b981",
            fontSize: "10px",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          <CheckCircle2 size={12} color="#10b981" />
          <span>AI Mapping Completed ✓</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Action Buttons Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          {/* Validate Map */}
          <button
            onClick={onValidate}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 12px",
              background: "#0d1a15",
              border: "1px solid #10b98144",
              borderRadius: "6px",
              color: "#10b981",
              fontSize: "10px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            <Shield size={12} color="#10b981" />
            Validate Map
          </button>

          {/* AI Chat */}
          <button
            onClick={onToggleAIChat}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px 10px",
              background: showAIChat ? "#a855f718" : "#111118",
              border: `1px solid ${showAIChat ? "#a855f744" : "#1e1e2e"}`,
              borderRadius: "6px",
              color: showAIChat ? "#c084fc" : "#9ca3af",
              fontSize: "10px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Sparkles size={12} color="#a855f7" />
            AI Chat
          </button>

          {/* Spec Chat */}
          <button
            onClick={onToggleSpecChat}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px 10px",
              background: showSpecChat ? "#3b82f618" : "#111118",
              border: `1px solid ${showSpecChat ? "#3b82f644" : "#1e1e2e"}`,
              borderRadius: "6px",
              color: showSpecChat ? "#60a5fa" : "#9ca3af",
              fontSize: "10px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <MessageSquare size={12} color="#3b82f6" />
            Spec Chat
          </button>

          {/* Function Library */}
          <button
            onClick={onToggleFunctionLibrary}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px 10px",
              background: "#111118",
              border: "1px solid #1e1e2e",
              borderRadius: "6px",
              color: "#9ca3af",
              fontSize: "10px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <BookOpen size={12} color="#f59e0b" />
            Function Library
          </button>

          {/* Save */}
          <button
            onClick={onSave}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px 12px",
              background: "#111118",
              border: "1px solid #1e1e2e",
              borderRadius: "6px",
              color: "#3b82f6",
              fontSize: "10px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Save size={12} color="#3b82f6" />
            {isSaving ? "Saving..." : "Save"}
          </button>

          {/* Generate Map */}
          <button
            onClick={onGenerateMap}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 14px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 0 14px rgba(16, 185, 129, 0.35)",
            }}
          >
            <Zap size={12} color="#fff" />
            Generate Map
          </button>
        </div>
      </div>

      {/* ── Sub-Toolbar Metrics & View Control Bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "32px",
          background: "#0b0b12",
          borderBottom: "1px solid #151522",
          padding: "0 14px",
          gap: "14px",
          fontSize: "10px",
        }}
      >
        {/* Metric Items */}
        {[
          { label: "Mappings", value: metrics.mappings, color: "#10b981" },
          { label: "Conditions", value: metrics.conditions, color: "#f59e0b" },
          { label: "Lookups", value: metrics.lookups, color: "#a855f7" },
          { label: "Calculations", value: metrics.calculations, color: "#22c55e" },
          { label: "Functions", value: metrics.functions, color: "#3b82f6" },
          { label: "Validations", value: metrics.validations, color: "#06b6d4" },
        ].map((m, i) => (
          <React.Fragment key={m.label}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ color: "#6b7280" }}>{m.label}:</span>
              <span style={{ fontWeight: 700, color: m.color, fontFamily: "var(--font-mono)" }}>
                {m.value}
              </span>
            </div>
            {i < 5 && <div style={{ width: "1px", height: "10px", background: "#1a1a28" }} />}
          </React.Fragment>
        ))}

        <div style={{ flex: 1 }} />

        {/* View Mode Switcher */}
        <div style={{ display: "flex", background: "#06060a", padding: "2px", borderRadius: "5px", border: "1px solid #151522", gap: "2px" }}>
          {[
            { id: "canvas" as const, label: "Mapping Canvas", icon: LayoutGrid },
            { id: "table" as const, label: "Table View", icon: ListFilter },
          ].map((mode) => {
            const active = viewMode === mode.id;
            const MIcon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => onViewModeChange?.(mode.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2px 8px",
                  background: active ? "#10b98118" : "transparent",
                  border: active ? "1px solid #10b98133" : "1px solid transparent",
                  borderRadius: "4px",
                  color: active ? "#10b981" : "#4b5563",
                  fontSize: "9px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <MIcon size={10} color={active ? "#10b981" : "#4b5563"} />
                {mode.label}
              </button>
            );
          })}
        </div>

        <div style={{ width: "1px", height: "12px", background: "#1a1a28" }} />

        {/* Zoom Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            onClick={() => onZoomChange?.(Math.max(50, zoom - 10))}
            style={{ background: "#111118", border: "1px solid #1a1a28", borderRadius: "3px", padding: "2px 4px", color: "#9ca3af", cursor: "pointer", display: "flex" }}
            title="Zoom Out"
          >
            <Minus size={10} />
          </button>
          <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "#9ca3af", width: "34px", textAlign: "center" }}>
            {zoom}%
          </span>
          <button
            onClick={() => onZoomChange?.(Math.min(150, zoom + 10))}
            style={{ background: "#111118", border: "1px solid #1a1a28", borderRadius: "3px", padding: "2px 4px", color: "#9ca3af", cursor: "pointer", display: "flex" }}
            title="Zoom In"
          >
            <Plus size={10} />
          </button>
          <button
            onClick={() => onZoomChange?.(100)}
            style={{ background: "#111118", border: "1px solid #1a1a28", borderRadius: "3px", padding: "2px 4px", color: "#9ca3af", cursor: "pointer", display: "flex", marginLeft: "2px" }}
            title="Reset Zoom"
          >
            <Maximize2 size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
