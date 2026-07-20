"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import {
  ArrowRight, GitMerge, Calculator, Search, Shield,
  RefreshCw, Zap, ArrowDownUp, FileCode, AlertTriangle,
  ChevronDown, ChevronRight, Edit2, Check, X, Info, CheckCircle2,
} from "lucide-react";
import type { LogicNodeData, SourceFieldPill, TargetFieldPill } from "./types";
import { RuleEditorModal } from "./RuleEditorModal";

/* ═══════════════════════════════════════════════════════════════════════════
   NODE TYPE CONFIG
   ═══════════════════════════════════════════════════════════════════════════ */
const NODE_TYPES: Record<string, {
  label: string; color: string; bg: string; border: string; icon: React.ElementType;
}> = {
  MAP:        { label: "MAP",          color: "#10b981", bg: "#0a1f18", border: "#10b98140", icon: ArrowRight    },
  IF:         { label: "IF CONDITION", color: "#f59e0b", bg: "#1f180a", border: "#f59e0b50", icon: GitMerge      },
  ELSE:       { label: "ELSE",         color: "#f97316", bg: "#1f110a", border: "#f9731640", icon: GitMerge      },
  CALCULATE:  { label: "CALCULATE",    color: "#3b82f6", bg: "#0a1525", border: "#3b82f650", icon: Calculator    },
  LOOKUP:     { label: "LOOKUP",       color: "#a855f7", bg: "#1a0f25", border: "#a855f750", icon: Search        },
  CONSTANT:   { label: "CONSTANT",     color: "#f97316", bg: "#1f140a", border: "#f9731650", icon: Zap           },
  VALIDATE:   { label: "VALIDATE",     color: "#06b6d4", bg: "#0a1a1f", border: "#06b6d440", icon: Shield        },
  LOOP:       { label: "LOOP",         color: "#a855f7", bg: "#150a1f", border: "#a855f740", icon: RefreshCw     },
  FUNCTION:   { label: "FUNCTION",     color: "#3b82f6", bg: "#0a101f", border: "#3b82f640", icon: Zap           },
  SORT:       { label: "SORT",         color: "#eab308", bg: "#1f1c0a", border: "#eab30840", icon: ArrowDownUp   },
  PARSE:      { label: "PARSE",        color: "#ec4899", bg: "#1f0a14", border: "#ec489940", icon: FileCode      },
  CONDITIONS: { label: "CONDITIONS",   color: "#f59e0b", bg: "#1f180a", border: "#f59e0b40", icon: GitMerge      },
  NONE:       { label: "NONE",         color: "#6b7280", bg: "#111118", border: "#6b728040", icon: AlertTriangle },
};

const ALL_NODE_TYPES = ["MAP","IF","CALCULATE","LOOKUP","CONSTANT","VALIDATE","LOOP","FUNCTION","NONE"];

const SECTION_ORDER = ["Header", "Party", "Item", "Summary"];
const SECTION_COLORS: Record<string, string> = {
  Header: "#3b82f6", Party: "#a855f7", Item: "#10b981", Summary: "#f59e0b",
};
const SECTION_ICONS: Record<string, string> = {
  Header: "H", Party: "P", Item: "I", Summary: "Σ",
};

function getSection(path: string): string {
  if (!path) return "Other";
  if (path.startsWith("Header"))  return "Header";
  if (path.startsWith("Party"))   return "Party";
  if (path.startsWith("Item"))    return "Item";
  if (path.startsWith("Summary")) return "Summary";
  return "Other";
}

/* ═══════════════════════════════════════════════════════════════════════════
   BEZIER PATH & DOM CONNECTOR MEASUREMENT
   ═══════════════════════════════════════════════════════════════════════════ */

function bezierPath(sx: number, sy: number, ex: number, ey: number): string {
  const dx = Math.max(Math.abs(ex - sx) * 0.45, 45);
  return `M ${sx} ${sy} C ${sx + dx} ${sy}, ${ex - dx} ${ey}, ${ex} ${ey}`;
}

interface PortPoint { x: number; y: number }

function getRightCenter(el: HTMLElement, container: HTMLElement): PortPoint {
  const er = el.getBoundingClientRect();
  const cr = container.getBoundingClientRect();
  const scaleX = cr.width / container.offsetWidth || 1;
  const scaleY = cr.height / container.offsetHeight || 1;
  return {
    x: (er.right - cr.left) / scaleX,
    y: (er.top - cr.top + er.height / 2) / scaleY,
  };
}

function getLeftCenter(el: HTMLElement, container: HTMLElement): PortPoint {
  const er = el.getBoundingClientRect();
  const cr = container.getBoundingClientRect();
  const scaleX = cr.width / container.offsetWidth || 1;
  const scaleY = cr.height / container.offsetHeight || 1;
  return {
    x: (er.left - cr.left) / scaleX,
    y: (er.top - cr.top + er.height / 2) / scaleY,
  };
}

interface ComputedConnector {
  id: string;
  path: string;
  color: string;
  animated: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOGIC CANVAS MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export function LogicCanvas({
  sourcePills,
  targetPills,
  logicNodes,
  selectedNodeId,
  viewMode = "canvas",
  zoom = 100,
  onSelectNode,
  onUpdateNode,
}: {
  sourcePills?: SourceFieldPill[];
  targetPills?: TargetFieldPill[];
  logicNodes?: LogicNodeData[];
  connectors?: unknown;
  selectedNodeId?: string | null;
  viewMode?: "canvas" | "table" | "tree";
  zoom?: number;
  onSelectNode?: (id: string | null) => void;
  onUpdateNode?: (id: string, updated: Partial<LogicNodeData>) => void;
}) {
  const pills    = sourcePills || [];
  const tgtPills = targetPills || [];
  const nodes    = logicNodes  || [];

  const [editingNode, setEditingNode] = useState<LogicNodeData | null>(null);
  const [editingTypeNodeId, setEditingTypeNodeId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [computedConnectors, setComputedConnectors] = useState<ComputedConnector[]>([]);

  /* Recompute SVG Bezier connectors */
  const recomputeConnectors = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const results: ComputedConnector[] = [];

    nodes.forEach((node) => {
      const nodeEl = container.querySelector<HTMLElement>(`[data-node-id="${node.id}"]`);
      if (!nodeEl) return;

      const cfg = NODE_TYPES[node.type] || NODE_TYPES.MAP;

      if (node.sourcePath) {
        const pillEl = container.querySelector<HTMLElement>(`[data-pill-id="${node.sourcePath}"]`);
        if (pillEl) {
          const src = getRightCenter(pillEl, container);
          const tgt = getLeftCenter(nodeEl, container);
          results.push({
            id: `src-${node.id}`,
            path: bezierPath(src.x, src.y, tgt.x, tgt.y),
            color: cfg.color,
            animated: true,
          });
        }
      }

      if (node.targetPath) {
        const suf = node.targetPath.includes(".") ? node.targetPath.split(".").pop()! : node.targetPath;
        const tgtPillEl =
          container.querySelector<HTMLElement>(`[data-target-id="${node.targetPath}"]`) ||
          container.querySelector<HTMLElement>(`[data-target-suffix="${suf}"]`);
        if (tgtPillEl) {
          const src = getRightCenter(nodeEl, container);
          const tgt = getLeftCenter(tgtPillEl, container);
          results.push({
            id: `tgt-${node.id}`,
            path: bezierPath(src.x, src.y, tgt.x, tgt.y),
            color: cfg.color,
            animated: false,
          });
        }
      }
    });

    setComputedConnectors(results);
  }, [nodes]);

  useLayoutEffect(() => {
    const id = setTimeout(recomputeConnectors, 40);
    return () => clearTimeout(id);
  }, [recomputeConnectors, nodes, pills, tgtPills, zoom, viewMode]);

  useEffect(() => {
    window.addEventListener("resize", recomputeConnectors);
    return () => window.removeEventListener("resize", recomputeConnectors);
  }, [recomputeConnectors]);

  /* Group by section for table view */
  const grouped = useMemo(() => {
    const m: Record<string, LogicNodeData[]> = {};
    nodes.forEach((n) => {
      const s = getSection(n.sourcePath || "");
      if (!m[s]) m[s] = [];
      m[s].push(n);
    });
    return m;
  }, [nodes]);

  const sections = useMemo(() => {
    const known = SECTION_ORDER.filter((s) => grouped[s]);
    const other = Object.keys(grouped).filter((s) => !SECTION_ORDER.includes(s));
    return [...known, ...other];
  }, [grouped]);

  const scale = zoom / 100;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#07070a", position: "relative" }}>

      <style>{`
        @keyframes dash-flow { to { stroke-dashoffset: -20; } }
      `}</style>

      {/* ── CANVAS VIEW MODE (Matching ITX screenshot) ── */}
      {viewMode === "canvas" ? (
        <div
          ref={canvasRef}
          style={{
            flex: 1, position: "relative", overflow: "auto",
            backgroundImage: "radial-gradient(circle, #141420 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          onClick={() => { onSelectNode?.(null); setEditingTypeNodeId(null); }}
        >
          {/* Header Title Floating Bar */}
          <div
            style={{
              position: "sticky", top: "10px", left: "50%", transform: "translateX(-50%)",
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "4px 14px", background: "#0a0a10aa", border: "1px solid #1a1a28",
              borderRadius: "6px", zIndex: 30, backdropFilter: "blur(8px)", pointerEvents: "none",
            }}
          >
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.5px" }}>
              AI Mapping Canvas (1-to-1 Element Level)
            </span>
            <span style={{ fontSize: "10px", color: "#10b981", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
              {zoom}%
            </span>
          </div>

          {/* Canvas Zoom Container */}
          <div
            ref={containerRef}
            style={{
              position: "relative",
              width: "1280px",
              minHeight: "1350px",
              padding: "30px 20px 100px",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {/* ── SVG Connector Lines ── */}
            <svg
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                pointerEvents: "none", zIndex: 2, overflow: "visible",
              }}
            >
              <defs>
                {Object.entries(NODE_TYPES).map(([k, cfg]) => (
                  <marker
                    key={k} id={`arr-${k}`} viewBox="0 0 8 6" refX="7" refY="3"
                    markerWidth="5" markerHeight="4" orient="auto"
                  >
                    <path d="M 0 0 L 8 3 L 0 6 z" fill={cfg.color} />
                  </marker>
                ))}
              </defs>

              {computedConnectors.map((conn) => (
                <path
                  key={conn.id}
                  d={conn.path}
                  fill="none"
                  stroke={conn.color}
                  strokeWidth="1.6"
                  strokeOpacity="0.75"
                  strokeDasharray={conn.animated ? "6 4" : "none"}
                  markerEnd={`url(#arr-MAP)`}
                  style={conn.animated ? { animation: "dash-flow 1s linear infinite" } : undefined}
                />
              ))}
            </svg>

            {/* ── 3 Column Grid ── */}
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 5 }}>

              {/* ── Left Column: Source Field Pills ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "240px" }}>
                {pills.map((pill) => (
                  <div
                    key={pill.id}
                    data-pill-id={pill.label}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "7px 12px", background: "#0a1224",
                      border: "1px solid #1e3a8a55", borderRadius: "18px",
                      color: "#60a5fa", fontSize: "11px", fontWeight: 700,
                      fontFamily: "var(--font-mono)", boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      userSelect: "none", zIndex: 5,
                    }}
                  >
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{pill.label}</span>
                  </div>
                ))}
              </div>

              {/* ── Center Column: Transformation Nodes ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px" }}>
                {nodes.map((node) => {
                  const cfg = NODE_TYPES[node.type] || NODE_TYPES.MAP;
                  const Icon = cfg.icon;
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <div
                      key={node.id}
                      data-node-id={node.id}
                      onClick={(e) => { e.stopPropagation(); onSelectNode?.(node.id); }}
                      onDoubleClick={(e) => { e.stopPropagation(); setEditingNode(node); }}
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "7px 12px",
                        background: cfg.bg,
                        border: `1.5px solid ${isSelected ? cfg.color : cfg.border}`,
                        borderRadius: "8px",
                        color: "#ececf1",
                        fontSize: "11px",
                        boxShadow: isSelected ? `0 0 16px ${cfg.color}35` : "0 2px 10px rgba(0,0,0,0.4)",
                        cursor: "pointer",
                        userSelect: "none",
                        position: "relative",
                        zIndex: isSelected ? 10 : 5,
                        transition: "all 150ms ease",
                      }}
                    >
                      <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: cfg.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={12} color={cfg.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "10px", fontWeight: 800, color: cfg.color, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                          {cfg.label}
                        </div>
                        <div style={{ fontSize: "10px", color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {node.subtitle || node.title}
                        </div>
                      </div>

                      {/* True/False for IF */}
                      {(node.type === "IF" || node.type === "CONDITIONS") && (
                        <div style={{ display: "flex", gap: "3px", flexShrink: 0 }}>
                          <span style={{ fontSize: "8px", color: "#22c55e", background: "#22c55e15", padding: "1px 4px", borderRadius: "3px", fontWeight: 700 }}>True</span>
                          <span style={{ fontSize: "8.8px", color: "#ef4444", background: "#ef444415", padding: "1px 4px", borderRadius: "3px", fontWeight: 700 }}>False</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Right Column: Target Field Pills with 100% Badges ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "240px" }}>
                {tgtPills.map((pill) => {
                  const suffix = pill.label.includes(".") ? pill.label.split(".").pop()! : pill.label;
                  return (
                    <div
                      key={pill.id}
                      data-target-id={pill.label}
                      data-target-suffix={suffix}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px",
                        padding: "7px 12px", background: "#1c0d27",
                        border: "1px solid #581c8755", borderRadius: "18px",
                        color: "#c084fc", fontSize: "11px", fontWeight: 700,
                        fontFamily: "var(--font-mono)", boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                        whiteSpace: "nowrap", userSelect: "none", zIndex: 5,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, overflow: "hidden" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a855f7", flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{pill.label}</span>
                      </div>

                      {/* Confidence Pill */}
                      <span style={{ fontSize: "8.5px", fontWeight: 800, color: "#10b981", background: "#10b98118", border: "1px solid #10b98133", padding: "1px 5px", borderRadius: "8px", flexShrink: 0 }}>
                        ✓ 100%
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* ── TABLE VIEW MODE ── */
        <div style={{ flex: 1, overflow: "auto", padding: "14px 16px" }}>
          {sections.map((sec) => (
            <div key={sec} style={{ marginBottom: "16px" }}>
              <div style={{ padding: "6px 12px", background: SECTION_COLORS[sec] + "15", border: `1px solid ${SECTION_COLORS[sec]}30`, borderRadius: "6px", fontSize: "11px", fontWeight: 700, color: SECTION_COLORS[sec], marginBottom: "6px" }}>
                {sec} Fields ({grouped[sec]?.length || 0})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {grouped[sec]?.map((node) => (
                  <div key={node.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "#0c0c14", border: "1px solid #161622", borderRadius: "6px", fontSize: "11px" }}>
                    <span style={{ color: "#60a5fa", fontFamily: "var(--font-mono)", flex: 1 }}>{node.sourcePath || "—"}</span>
                    <ArrowRight size={12} color="#10b981" />
                    <span style={{ color: "#10b981", fontWeight: 700 }}>{node.type}</span>
                    <span style={{ color: "#9ca3af", fontSize: "10px", flex: 1 }}>{node.subtitle || node.details || "—"}</span>
                    <ArrowRight size={12} color="#a855f7" />
                    <span style={{ color: "#c084fc", fontFamily: "var(--font-mono)", flex: 1 }}>{node.targetPath || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rule Editor Modal on double click */}
      <RuleEditorModal
        node={editingNode}
        onClose={() => setEditingNode(null)}
        onSave={(updated) => {
          if (editingNode) {
            onUpdateNode?.(editingNode.id, updated);
            setEditingNode(null);
          }
        }}
      />
    </div>
  );
}
