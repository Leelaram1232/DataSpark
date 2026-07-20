"use client";

import React from "react";
import {
  GitMerge,
  ArrowRight,
  Calculator,
  Search,
  Shield,
  RefreshCw,
  Zap,
  ArrowDownUp,
  FileCode,
  AlertTriangle,
} from "lucide-react";
import type { LogicNodeData, LogicNodeType, LOGIC_NODE_COLORS } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   LOGIC NODE COLORS
   ═══════════════════════════════════════════════════════════════════════════ */

const NODE_STYLES: Record<string, { bg: string; border: string; headerBg: string; accent: string; icon: any }> = {
  IF:         { bg: "#1a0f0f", border: "#5f2020", headerBg: "#2a1515", accent: "#ef4444", icon: AlertTriangle },
  ELSE:       { bg: "#1a100f", border: "#5f3020", headerBg: "#2a1a15", accent: "#f97316", icon: AlertTriangle },
  MAP:        { bg: "#0f1a17", border: "#1a3d2e", headerBg: "#122318", accent: "#10b981", icon: ArrowRight },
  CALCULATE:  { bg: "#0f1a14", border: "#1a4d2e", headerBg: "#12291a", accent: "#22c55e", icon: Calculator },
  LOOKUP:     { bg: "#1a170f", border: "#4d3a1a", headerBg: "#292015", accent: "#f59e0b", icon: Search },
  VALIDATE:   { bg: "#0f171a", border: "#1a3d4d", headerBg: "#152329", accent: "#06b6d4", icon: Shield },
  LOOP:       { bg: "#170f1a", border: "#3d1a4d", headerBg: "#231529", accent: "#a855f7", icon: RefreshCw },
  FUNCTION:   { bg: "#0f141a", border: "#1a2e4d", headerBg: "#152029", accent: "#3b82f6", icon: Zap },
  SORT:       { bg: "#1a1a0f", border: "#4d4d1a", headerBg: "#292915", accent: "#eab308", icon: ArrowDownUp },
  PARSE:      { bg: "#1a0f17", border: "#4d1a3d", headerBg: "#291523", accent: "#ec4899", icon: FileCode },
  CONDITIONS: { bg: "#1a100f", border: "#5f3020", headerBg: "#2a1a15", accent: "#f97316", icon: GitMerge },
  CONSTANT:   { bg: "#150f1a", border: "#3a1a4d", headerBg: "#1e1529", accent: "#a855f7", icon: Zap },
  NONE:       { bg: "#121216", border: "#222230", headerBg: "#181822", accent: "#6b7280", icon: AlertTriangle },
};

/* ═══════════════════════════════════════════════════════════════════════════
   LOGIC NODE — Individual logic card on the canvas
   ═══════════════════════════════════════════════════════════════════════════ */

export function LogicNode({
  node,
  isSelected = false,
  onClick,
}: {
  node: LogicNodeData;
  isSelected?: boolean;
  onClick?: (node: LogicNodeData) => void;
}) {
  const style = NODE_STYLES[node.type] || NODE_STYLES.MAP;
  const Icon = style.icon;
  const width = node.width || 280;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick?.(node); }}
      style={{
        position: "absolute",
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${width}px`,
        background: style.bg,
        border: `1.5px solid ${isSelected ? style.accent : style.border}`,
        borderRadius: "10px",
        boxShadow: isSelected
          ? `0 0 24px ${style.accent}33, 0 8px 30px rgba(0,0,0,0.5)`
          : `0 4px 20px rgba(0,0,0,0.4)`,
        cursor: "pointer",
        userSelect: "none",
        transition: "border-color 150ms ease, box-shadow 150ms ease",
        zIndex: isSelected ? 10 : 1,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          background: style.headerBg,
          borderTopLeftRadius: "9px",
          borderTopRightRadius: "9px",
          borderBottom: `1px solid ${style.border}`,
        }}
      >
        <div
          style={{
            width: "24px", height: "24px", borderRadius: "6px",
            background: `${style.accent}20`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={13} color={style.accent} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "11px", fontWeight: 700, color: style.accent,
              fontFamily: "var(--font-mono)", letterSpacing: "0.3px",
              textTransform: "uppercase",
            }}
          >
            {node.type === "IF" ? "⊘ IF Condition" : node.type}
          </div>
        </div>

        {/* True/False labels for conditions */}
        {(node.type === "IF" || node.type === "CONDITIONS") && (
          <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
            <span
              style={{
                fontSize: "8px", fontWeight: 700, color: "#22c55e",
                background: "#22c55e15", padding: "1px 5px", borderRadius: "3px",
              }}
            >
              True
            </span>
            <span
              style={{
                fontSize: "8px", fontWeight: 700, color: "#ef4444",
                background: "#ef444415", padding: "1px 5px", borderRadius: "3px",
              }}
            >
              False
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "10px 12px" }}>
        {/* Title */}
        <div
          style={{
            fontSize: "12px", fontWeight: 600, color: "#ececf1",
            marginBottom: node.details || node.subtitle ? "6px" : "0",
            lineHeight: 1.4,
          }}
        >
          {node.title}
        </div>

        {/* Condition/formula details */}
        {node.details && (
          <div
            style={{
              fontSize: "10px",
              color: node.type === "IF" || node.type === "CONDITIONS" ? "#f59e0b" : "#9ca3af",
              fontFamily: "var(--font-mono)",
              background: "#07070a",
              padding: "6px 8px",
              borderRadius: "4px",
              border: "1px solid #151520",
              lineHeight: 1.5,
              marginBottom: "6px",
              wordBreak: "break-all",
            }}
          >
            {node.details}
          </div>
        )}

        {/* Source → Target subtitle */}
        {(node.sourceRef || node.targetRef) && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {node.sourceRef && (
              <span style={{ fontSize: "9px", color: "#6b7280" }}>
                Source: <strong style={{ color: "#3b82f6" }}>{node.sourceRef}</strong>
              </span>
            )}
            {node.targetRef && (
              <span style={{ fontSize: "9px", color: "#6b7280" }}>
                Target: <strong style={{ color: "#a855f7" }}>{node.targetRef}</strong>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
