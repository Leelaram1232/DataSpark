"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, Check } from "lucide-react";
import type { TreeNodeData } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   TREE NODE — Recursive expandable node for type tree panels
   ═══════════════════════════════════════════════════════════════════════════ */

const TYPE_COLORS: Record<string, string> = {
  element: "#10b981",
  attribute: "#f59e0b",
  segment: "#3b82f6",
  loop: "#a855f7",
  composite: "#06b6d4",
  group: "#ec4899",
  root: "#6366f1",
};

const TYPE_ICONS: Record<string, string> = {
  element: "◆",
  attribute: "@",
  segment: "▸",
  loop: "↻",
  composite: "◇",
  group: "▣",
  root: "◉",
};

export function TreeNode({
  node,
  depth = 0,
  accentColor = "#10b981",
  onFieldClick,
  selectedFieldId,
  expandedNodes,
  onToggleExpand,
}: {
  node: TreeNodeData;
  depth?: number;
  accentColor?: string;
  onFieldClick?: (node: TreeNodeData) => void;
  selectedFieldId?: string | null;
  expandedNodes?: Record<string, boolean>;
  onToggleExpand?: (id: string) => void;
}) {
  const [localExpanded, setLocalExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes ? expandedNodes[node.id] !== false : localExpanded;
  const isSelected = selectedFieldId === node.id;
  const isAttribute = node.type === "attribute";
  const typeColor = TYPE_COLORS[node.type] || "#6b7280";

  const toggle = () => {
    if (onToggleExpand) onToggleExpand(node.id);
    else setLocalExpanded(!localExpanded);
  };

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (hasChildren) toggle();
          onFieldClick?.(node);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
          padding: "2px 6px",
          paddingLeft: `${6 + depth * 14}px`,
          cursor: "pointer",
          minHeight: "22px",
          background: isSelected ? `${accentColor}12` : "transparent",
          borderLeft: isSelected ? `2px solid ${accentColor}` : "2px solid transparent",
          transition: "background 100ms ease",
        }}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.02)";
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.background = "transparent";
        }}
      >
        {/* Expand/collapse chevron */}
        {hasChildren ? (
          <span style={{ width: "12px", display: "flex", alignItems: "center", flexShrink: 0 }}>
            {isExpanded ? (
              <ChevronDown size={10} color="#4b5563" />
            ) : (
              <ChevronRight size={10} color="#4b5563" />
            )}
          </span>
        ) : (
          <span style={{ width: "12px", flexShrink: 0 }} />
        )}

        {/* Mapped checkmark */}
        {node.isMapped && (
          <Check size={10} color={accentColor} style={{ flexShrink: 0 }} />
        )}

        {/* Type indicator */}
        <span
          style={{
            fontSize: "9px",
            color: typeColor,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            flexShrink: 0,
            width: "10px",
            textAlign: "center",
          }}
        >
          {TYPE_ICONS[node.type] || "·"}
        </span>

        {/* Node name */}
        <span
          style={{
            fontSize: "11px",
            color: isAttribute ? "#f59e0b" : node.isMapped ? "#ececf1" : "#9ca3af",
            fontFamily: "var(--font-mono)",
            fontWeight: isAttribute ? 400 : hasChildren ? 600 : 400,
            fontStyle: isAttribute ? "italic" : "normal",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            letterSpacing: "0.2px",
          }}
        >
          {isAttribute ? `@${node.name}` : node.name}
        </span>

        {/* Data type */}
        {node.dataType && (
          <span
            style={{
              fontSize: "8px",
              color: "#4b5563",
              fontFamily: "var(--font-mono)",
              flexShrink: 0,
            }}
          >
            {node.dataType}
          </span>
        )}

        {/* Occurrence badge */}
        {node.occurrence && (
          <span
            style={{
              fontSize: "8px",
              color: "#4b5563",
              fontFamily: "var(--font-mono)",
              padding: "0 3px",
              background: "#111118",
              borderRadius: "2px",
              flexShrink: 0,
            }}
          >
            {node.occurrence}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && node.children!.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          accentColor={accentColor}
          onFieldClick={onFieldClick}
          selectedFieldId={selectedFieldId}
          expandedNodes={expandedNodes}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </>
  );
}
