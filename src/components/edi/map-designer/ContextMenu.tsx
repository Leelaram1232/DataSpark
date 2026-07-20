"use client";

import React from "react";
import { Copy, Trash2, EyeOff, Edit3, GitMerge, Search, Calculator, Zap } from "lucide-react";

export interface ContextMenuPosition {
  x: number;
  y: number;
  nodeId: string;
}

export function ContextMenu({
  position,
  onClose,
  onAction,
}: {
  position: ContextMenuPosition | null;
  onClose: () => void;
  onAction: (action: string, nodeId: string) => void;
}) {
  if (!position) return null;

  const items = [
    { id: "edit", label: "Edit Rule Properties", icon: Edit3 },
    { id: "duplicate", label: "Duplicate Node", icon: Copy },
    { id: "disable", label: "Disable Mapping", icon: EyeOff },
    { id: "convert-if", label: "Convert to Condition (IF)", icon: GitMerge },
    { id: "convert-lookup", label: "Convert to Lookup Table", icon: Search },
    { id: "convert-calc", label: "Convert to Calculation", icon: Calculator },
    { id: "convert-constant", label: "Convert to Constant", icon: Zap },
    { id: "delete", label: "Delete Node", icon: Trash2, danger: true },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
      }}
      onClick={onClose}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div
        style={{
          position: "absolute",
          top: `${position.y}px`,
          left: `${position.x}px`,
          width: "200px",
          background: "#0d0d14",
          border: "1px solid #1f1f2e",
          borderRadius: "8px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(0,0,0,0.5)",
          padding: "4px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                onAction(item.id, position.nodeId);
                onClose();
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                background: "transparent",
                border: "none",
                borderRadius: "4px",
                color: item.danger ? "#ef4444" : "#d1d5db",
                fontSize: "11px",
                fontWeight: 500,
                textAlign: "left",
                cursor: "pointer",
                transition: "background 100ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = item.danger ? "#ef444420" : "#1a1a28";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon size={13} color={item.danger ? "#ef4444" : "#9ca3af"} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
