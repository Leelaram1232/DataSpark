"use client";

import React, { useState } from "react";
import { X, Pin, Columns, LayoutGrid, Plus } from "lucide-react";
import { useUIStore, EditorTab } from "@/store/uiStore";

interface TabBarProps {
  workspace: "developer" | "architecture" | "edi";
  onAddTabClick?: () => void;
}

const accentColors = {
  developer: "var(--dev-accent)",
  architecture: "var(--arch-accent)",
  edi: "var(--edi-accent)",
};

export function TabBar({ workspace, onAddTabClick }: TabBarProps) {
  const {
    tabs,
    activeTabId,
    setActiveTab,
    closeTab,
    pinTab,
    reorderTabs,
    splitMode,
    setSplitMode,
  } = useUIStore();

  const workspaceTabs = tabs[workspace] || [];
  const activeId = activeTabId[workspace];
  const accentColor = accentColors[workspace];

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDrop = (idx: number) => {
    if (draggedIdx !== null && draggedIdx !== idx) {
      reorderTabs(workspace, draggedIdx, idx);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  return (
    <div
      style={{
        height: "35px",
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 8px 0 0",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      {/* Tabs list container */}
      <div
        style={{
          display: "flex",
          height: "100%",
          overflowX: "auto",
          scrollbarWidth: "none", // Firefox
          flex: 1,
        }}
      >
        {workspaceTabs.map((tab, idx) => {
          const isActive = tab.id === activeId;
          const isOver = idx === dragOverIdx;

          return (
            <div
              key={tab.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
              onDragEnd={() => {
                setDraggedIdx(null);
                setDragOverIdx(null);
              }}
              onClick={() => setActiveTab(workspace, tab.id)}
              className={`editor-tab ${isActive ? "active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "0 12px",
                height: "100%",
                borderRight: "1px solid var(--border-subtle)",
                background: isActive ? "var(--bg-base)" : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                cursor: "pointer",
                position: "relative",
                borderBottom: isActive ? `2px solid ${accentColor}` : "none",
                boxShadow: isOver ? `inset 2px 0 0 ${accentColor}` : "none",
                transition: "background var(--transition-fast), color var(--transition-fast)",
              }}
            >
              {tab.pinned && <Pin size={10} color={accentColor} style={{ flexShrink: 0 }} />}
              <span style={{ fontSize: "12px", whiteSpace: "nowrap" }}>{tab.label}</span>

              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(workspace, tab.id);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  borderRadius: "4px",
                  color: "inherit",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "2px",
                  opacity: isActive ? 0.8 : 0.4,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.background = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = isActive ? "0.8" : "0.4";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <X size={10} />
              </button>
            </div>
          );
        })}

        {/* Plus tab button */}
        {onAddTabClick && (
          <button
            onClick={onAddTabClick}
            style={{
              padding: "0 10px",
              height: "100%",
              background: "transparent",
              border: "none",
              borderRight: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-hover)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <Plus size={13} />
          </button>
        )}
      </div>

      {/* Editor Layout Split Buttons (Only for code workspace) */}
      {workspace === "developer" && (
        <div style={{ display: "flex", alignItems: "center", gap: "2px", paddingLeft: "8px" }}>
          <button
            onClick={() => setSplitMode(splitMode === "vertical" ? "none" : "vertical")}
            title="Split Editor Vertically"
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "4px",
              border: "none",
              background: splitMode === "vertical" ? "var(--bg-active)" : "transparent",
              color: splitMode === "vertical" ? "var(--text-primary)" : "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Columns size={12} />
          </button>
          <button
            onClick={() => setSplitMode(splitMode === "horizontal" ? "none" : "horizontal")}
            title="Split Editor Horizontally"
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "4px",
              border: "none",
              background: splitMode === "horizontal" ? "var(--bg-active)" : "transparent",
              color: splitMode === "horizontal" ? "var(--text-primary)" : "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LayoutGrid size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
