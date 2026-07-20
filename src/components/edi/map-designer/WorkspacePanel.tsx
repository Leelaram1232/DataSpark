"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Map,
  Database,
  TestTube,
  ScrollText,
  GitBranch,
  Sparkles,
  Settings,
  RefreshCw,
} from "lucide-react";
import type { WorkspaceFile, ProjectStatus } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   DEMO DATA — Realistic ITX workspace structure
   ═══════════════════════════════════════════════════════════════════════════ */

const DEFAULT_WORKSPACE: WorkspaceFile[] = [
  {
    id: "source", name: "Source", type: "folder", isOpen: true, children: [
      { id: "src-input", name: "Input_Invoice.xsd", type: "file", badge: "XSD" },
      { id: "src-output", name: "Output_Invoice.xsd", type: "file", badge: "XSD" },
    ],
  },
  {
    id: "schemas", name: "Schemas", type: "folder", isOpen: false, children: [
      { id: "sch-input", name: "Input_Schema.xsd", type: "file", badge: "XSD" },
      { id: "sch-output", name: "Output_Schema.xsd", type: "file", badge: "XSD" },
    ],
  },
  {
    id: "specs", name: "Specification", type: "folder", isOpen: true, children: [
      { id: "spec-1", name: "Invoice_Spec.pdf", type: "file", badge: "PDF" },
    ],
  },
  {
    id: "maps", name: "Maps", type: "folder", isOpen: true, children: [
      { id: "map-main", name: "XML_TO_XML_InvoiceMap", type: "file", badge: "MAP" },
      {
        id: "func-maps", name: "Functional Maps", type: "folder", isOpen: true, children: [
          { id: "fm-header", name: "F_Header", type: "file" },
          { id: "fm-party", name: "F_Party", type: "file" },
          { id: "fm-items", name: "F_Items", type: "file" },
          { id: "fm-receipt", name: "F_Receipt", type: "file" },
          { id: "fm-recline", name: "F_ReceiptLine", type: "file" },
          { id: "fm-totals", name: "F_Totals", type: "file" },
          { id: "fm-conds", name: "F_Conditions", type: "file" },
        ],
      },
    ],
  },
  {
    id: "testdata", name: "Test Data", type: "folder", isOpen: false, children: [
      { id: "td-in", name: "Input_Sample.xml", type: "file" },
      { id: "td-out", name: "Output_Expected.xml", type: "file" },
    ],
  },
  { id: "logs", name: "Logs", type: "folder", isOpen: false, children: [] },
];

const DEFAULT_STATUS: ProjectStatus = {
  typeTrees: { done: 2, total: 2 },
  specsParsed: { done: 3, total: 3 },
  mappingRules: 48,
  functionalMaps: { done: 6, total: 6 },
  validations: 0,
};

/* ═══════════════════════════════════════════════════════════════════════════
   BADGE COLORS
   ═══════════════════════════════════════════════════════════════════════════ */

const BADGE_COLORS: Record<string, string> = {
  XSD: "#3b82f6",
  X12: "#10b981",
  EDI: "#f59e0b",
  PDF: "#ef4444",
  MAP: "#10b981",
  JSON: "#a855f7",
  CSV: "#06b6d4",
};

/* ═══════════════════════════════════════════════════════════════════════════
   FILE TREE NODE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

function FileTreeNode({
  node,
  depth = 0,
  selectedId,
  onSelect,
  onToggle,
}: {
  node: WorkspaceFile;
  depth?: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const isFolder = node.type === "folder";
  const isOpen = node.isOpen;
  const isSelected = selectedId === node.id;
  const hasChildren = isFolder && node.children && node.children.length > 0;

  const getFileIcon = () => {
    if (isFolder) return isOpen ? FolderOpen : Folder;
    if (node.badge === "MAP") return Map;
    if (node.badge === "PDF") return FileText;
    if (node.badge === "XSD" || node.badge === "X12" || node.badge === "EDI") return FileCode;
    if (node.name.startsWith("F_")) return GitBranch;
    return File;
  };

  const Icon = getFileIcon();
  const badgeColor = node.badge ? BADGE_COLORS[node.badge] || "#6b7280" : null;

  return (
    <>
      <div
        onClick={() => {
          if (isFolder) onToggle(node.id);
          onSelect(node.id);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "3px 8px",
          paddingLeft: `${8 + depth * 14}px`,
          cursor: "pointer",
          background: isSelected ? "rgba(16, 185, 129, 0.08)" : "transparent",
          borderLeft: isSelected ? "2px solid #10b981" : "2px solid transparent",
          transition: "all 120ms ease",
          minHeight: "26px",
        }}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.background = "transparent";
        }}
      >
        {isFolder ? (
          <span style={{ width: "12px", display: "flex", alignItems: "center", flexShrink: 0 }}>
            {hasChildren && (isOpen ? <ChevronDown size={10} color="#6b7280" /> : <ChevronRight size={10} color="#6b7280" />)}
          </span>
        ) : (
          <span style={{ width: "12px", flexShrink: 0 }} />
        )}

        <Icon size={13} color={isFolder ? "#f59e0b" : badgeColor || "#6b7280"} style={{ flexShrink: 0 }} />

        <span
          style={{
            fontSize: "11px",
            color: isSelected ? "#ececf1" : "#9ca3af",
            fontFamily: "var(--font-mono)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            letterSpacing: "0.2px",
          }}
        >
          {node.name}
        </span>

        {node.badge && (
          <span
            style={{
              fontSize: "8px",
              fontWeight: 700,
              color: badgeColor || "#6b7280",
              background: `${badgeColor || "#6b7280"}15`,
              padding: "1px 4px",
              borderRadius: "3px",
              letterSpacing: "0.5px",
              flexShrink: 0,
            }}
          >
            {node.badge}
          </span>
        )}
      </div>

      {isFolder && isOpen && node.children && (
        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {node.children.map((child) => (
              <FileTreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedId={selectedId}
                onSelect={onSelect}
                onToggle={onToggle}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}

import type { GeneratedMapData } from "./mapGenerator";
import type { WizardState } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   WORKSPACE PANEL — Main Export
   ═══════════════════════════════════════════════════════════════════════════ */

export function WorkspacePanel({
  projectName = "DSV_Project",
  files,
  status,
  mapData,
  wizardState,
}: {
  projectName?: string;
  files?: WorkspaceFile[];
  status?: ProjectStatus;
  mapData?: GeneratedMapData | null;
  wizardState?: WizardState | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const projectStatus = status || DEFAULT_STATUS;

  const dynamicTree = React.useMemo(() => {
    if (files) return files;
    if (!mapData) return DEFAULT_WORKSPACE;

    return [
      {
        id: "source", name: "Source", type: "folder" as const, isOpen: true, children: [
          { id: "src-input", name: mapData.sourceFileName, type: "file" as const, badge: mapData.sourceBadge },
          { id: "src-output", name: mapData.targetFileName, type: "file" as const, badge: mapData.targetBadge },
        ],
      },
      {
        id: "schemas", name: "Schemas", type: "folder" as const, isOpen: false, children: [
          { id: "sch-input", name: mapData.sourceFileName.replace(/^Input:\s*/, ""), type: "file" as const, badge: mapData.sourceBadge },
          { id: "sch-output", name: mapData.targetFileName.replace(/^Output:\s*/, ""), type: "file" as const, badge: mapData.targetBadge },
        ],
      },
      {
        id: "specs", name: "Specification", type: "folder" as const, isOpen: true, children: [
          { id: "spec-1", name: wizardState?.specFileName || "Invoice_Spec.pdf", type: "file" as const, badge: "PDF" },
        ],
      },
      {
        id: "maps", name: "Maps", type: "folder" as const, isOpen: true, children: [
          { id: "map-main", name: mapData.mapName, type: "file" as const, badge: "MAP" },
          {
            id: "func-maps", name: "Functional Maps", type: "folder" as const, isOpen: true, children: mapData.functionalMaps.map((fm) => ({
              id: fm.id, name: fm.name, type: "file" as const,
            })),
          },
        ],
      },
    ];
  }, [files, mapData, wizardState]);

  const [tree, setTree] = useState<WorkspaceFile[]>(dynamicTree);

  React.useEffect(() => {
    setTree(dynamicTree);
  }, [dynamicTree]);

  const toggleNode = (id: string) => {
    const toggle = (nodes: WorkspaceFile[]): WorkspaceFile[] =>
      nodes.map((n) => {
        if (n.id === id) return { ...n, isOpen: !n.isOpen };
        if (n.children) return { ...n, children: toggle(n.children) };
        return n;
      });
    setTree(toggle(tree));
  };

  if (collapsed) {
    return (
      <div
        style={{
          width: "36px",
          background: "#0a0a10",
          borderRight: "1px solid #151520",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "12px",
          gap: "8px",
        }}
      >
        <button
          onClick={() => setCollapsed(false)}
          style={{
            background: "transparent", border: "none", color: "#6b7280",
            cursor: "pointer", padding: "4px",
          }}
          title="Expand workspace"
        >
          <ChevronRight size={14} />
        </button>
        <Folder size={14} color="#6b7280" />
        <Map size={14} color="#10b981" />
        <Database size={14} color="#6b7280" />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "220px",
        minWidth: "220px",
        background: "#0a0a10",
        borderRight: "1px solid #151520",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 10px",
          borderBottom: "1px solid #151520",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Folder size={12} color="#f59e0b" />
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.8px" }}>
            WORKSPACE
          </span>
        </div>
        <div style={{ display: "flex", gap: "2px" }}>
          <button
            onClick={() => setCollapsed(true)}
            style={{
              background: "transparent", border: "none", color: "#4b5563",
              cursor: "pointer", padding: "2px", display: "flex", alignItems: "center",
            }}
          >
            <Settings size={11} />
          </button>
          <button
            style={{
              background: "transparent", border: "none", color: "#4b5563",
              cursor: "pointer", padding: "2px", display: "flex", alignItems: "center",
            }}
          >
            <RefreshCw size={11} />
          </button>
        </div>
      </div>

      {/* Project Name */}
      <div style={{ padding: "6px 10px", borderBottom: "1px solid #111118" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: "#10b981", flexShrink: 0,
              boxShadow: "0 0 6px #10b98166",
            }}
          />
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#ececf1", fontFamily: "var(--font-mono)" }}>
            {projectName}
          </span>
        </div>
      </div>

      {/* File Tree */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        {tree.map((node) => (
          <FileTreeNode
            key={node.id}
            node={node}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onToggle={toggleNode}
          />
        ))}
      </div>

      {/* Project Status */}
      <div
        style={{
          borderTop: "1px solid #151520",
          padding: "8px 10px",
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: "9px", fontWeight: 700, color: "#4b5563", letterSpacing: "0.6px", marginBottom: "6px" }}>
          PROJECT STATUS
        </div>
        {[
          { label: "Type Trees", value: `${projectStatus.typeTrees.done}/${projectStatus.typeTrees.total}`, color: "#10b981" },
          { label: "Specs Parsed", value: `${projectStatus.specsParsed.done}/${projectStatus.specsParsed.total}`, color: "#3b82f6" },
          { label: "Mapping Rules", value: `${projectStatus.mappingRules}`, color: "#f59e0b" },
          { label: "Functional Maps", value: `${projectStatus.functionalMaps.done}/${projectStatus.functionalMaps.total}`, color: "#a855f7" },
          { label: "Validations", value: `${projectStatus.validations} Issues`, color: projectStatus.validations > 0 ? "#ef4444" : "#10b981" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "2px 0",
            }}
          >
            <span style={{ fontSize: "10px", color: "#6b7280" }}>{item.label}</span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: item.color, fontFamily: "var(--font-mono)" }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* User Profile */}
      <div
        style={{
          borderTop: "1px solid #151520",
          padding: "8px 10px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px", fontWeight: 700, color: "#fff",
            flexShrink: 0,
          }}
        >
          RK
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#ececf1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            Rama Krishna
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "9px", color: "#6b7280" }}>Admin</span>
            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#10b981" }} />
            <span style={{ fontSize: "9px", color: "#10b981" }}>Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
