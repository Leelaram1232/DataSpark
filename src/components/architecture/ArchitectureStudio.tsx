"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectStore } from "@/store/projectStore";
import { usePluginStore } from "@/store/pluginRegistry";
import {
  Building2,
  Layers,
  Box,
  Settings,
  AlertTriangle,
  Table2,
  ChevronRight,
  ChevronDown,
  Circle,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Eye,
  EyeOff,
  Sun,
  Hammer,
  Maximize,
  Sparkles,
  Link2,
  Layers3,
  Calendar,
  Sliders,
  FolderOpen,
  Info,
  GitPullRequest,
  CheckCircle,
} from "lucide-react";

// Revit-style ribbon tab definitions
const ribbonTabs = [
  { id: "architecture", label: "Architecture", items: ["Wall", "Door", "Window", "Floor", "Roof", "Ceiling", "Stair", "Ramp", "Grid", "Level"] },
  { id: "structure", label: "Structure", items: ["Beam", "Wall Structural", "Column", "Truss", "Slab", "Foundation", "Rebar"] },
  { id: "mep", label: "MEP", items: ["Duct", "Air Terminal", "Pipe", "Plumbing Fixture", "Cable Tray", "Conduit", "Light Fixture"] },
  { id: "insert", label: "Insert", items: ["Link Revit", "Link IFC", "Link CAD", "Import Image", "Load Family"] },
  { id: "annotate", label: "Annotate", items: ["Aligned Dimension", "Linear Dimension", "Detail Line", "Text Note", "Tag by Category"] },
  { id: "view", label: "View", items: ["3D View", "Section", "Elevation", "Plan View", "Schedule/Quantities", "Sheet"] },
  { id: "manage", label: "Manage", items: ["Materials", "Project Parameters", "Shared Parameters", "Phasing", "Design Options"] },
  { id: "collaborate", label: "Collaborate", items: ["Worksets", "Sync with Central", "Relinquish All", "Show History"] },
  { id: "plugins", label: "Plugins", items: ["Autodesk Bridge", "Clash Detector", "Quantity Pro", "AI Designer"] }
];

export function ArchitectureStudio() {
  const { activeProject, importSampleProject, createProject } = useProjectStore();
  const project = activeProject();
  const { plugins } = usePluginStore();

  const [activeRibbonTab, setActiveRibbonTab] = useState("architecture");
  const [selectedRibbonItem, setSelectedRibbonItem] = useState<string | null>(null);
  
  const [activeBrowserTab, setActiveBrowserTab] = useState("browser"); // browser | parameters | worksets
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState("Level 1");
  const [activeWorkset, setActiveWorkset] = useState("Shared Levels and Grids");
  const [activePhase, setActivePhase] = useState("New Construction");
  const [activeDesignOption, setActiveDesignOption] = useState("Option 1 (Primary)");

  // Filter project elements based on the active level
  const levelElements = project?.bimElements.filter((el) => el.level === selectedLevel) || [];
  const selectedElement = project?.bimElements.find((el) => el.id === selectedElementId);

  // SVG representation rooms based on imported metadata
  const roomCoordinates: Record<string, { x: number; y: number; w: number; h: number; color: string }> = {
    "Living Room Loft": { x: 20, y: 20, w: 200, h: 150, color: "rgba(99,102,241,0.08)" },
    "Gourmet Kitchen": { x: 240, y: 20, w: 140, h: 150, color: "rgba(245,158,11,0.08)" },
    "Workspace Studio": { x: 20, y: 190, w: 160, h: 130, color: "rgba(16,185,129,0.08)" },
    "Executive Suite": { x: 200, y: 190, w: 180, h: 130, color: "rgba(239,68,68,0.08)" },
    "Rooftop Observatory": { x: 40, y: 80, w: 320, h: 260, color: "rgba(139,92,246,0.08)" }
  };

  if (!project || project.type !== "architecture") {
    return (
      <div className="empty-state">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--arch-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.8 }}
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
          <path d="M14 9v12" />
          <path d="M3 14h18" />
        </svg>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
            No Active BIM Project
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "340px", margin: "0 auto", lineHeight: 1.5 }}>
            Load a professional Autodesk Revit metadata schedule sheet or construct a fresh multi-level conceptual model to begin layout validation.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => {
              const name = prompt("Enter project name:", "Metropolitan Highrise");
              if (name) createProject(name, "architecture");
            }}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "none",
              background: "var(--arch-accent)",
              color: "var(--bg-void)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
          >
            Create Empty Sheet
          </button>
          <button
            onClick={() => importSampleProject("architecture")}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid var(--border-default)",
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
          >
            Import BIM Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--bg-base)" }}>
      {/* Revit style Command Ribbon */}
      <div
        style={{
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.03)", padding: "0 8px" }}>
          {ribbonTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveRibbonTab(tab.id);
                setSelectedRibbonItem(null);
              }}
              style={{
                padding: "8px 16px",
                fontSize: "11px",
                fontWeight: 600,
                border: "none",
                background: activeRibbonTab === tab.id ? "var(--bg-base)" : "transparent",
                color: activeRibbonTab === tab.id ? "#f59e0b" : "var(--text-muted)",
                cursor: "pointer",
                borderTopLeftRadius: "6px",
                borderTopRightRadius: "6px",
                borderBottom: activeRibbonTab === tab.id ? "2px solid #f59e0b" : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "6px", padding: "6px 12px", overflowX: "auto", minHeight: "44px", alignItems: "center" }}>
          {ribbonTabs
            .find((t) => t.id === activeRibbonTab)
            ?.items.map((item) => {
              const isSelected = selectedRibbonItem === item;
              return (
                <button
                  key={item}
                  onClick={() => setSelectedRibbonItem(isSelected ? null : item)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "4px",
                    border: "1.5px solid",
                    borderColor: isSelected ? "#f59e0b" : "var(--border-default)",
                    background: isSelected ? "rgba(245,158,11,0.12)" : "var(--bg-elevated)",
                    color: isSelected ? "#fbbf24" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                    transition: "all 120ms ease",
                  }}
                >
                  {item}
                </button>
              );
            })}
        </div>
      </div>

      {/* Main Studio Body Split */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Side: Browser / Parameters / Worksets Navigator */}
        <div
          style={{
            width: "260px",
            borderRight: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* Navigator Tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2px", padding: "6px", borderBottom: "1px solid var(--border-subtle)" }}>
            {[
              { id: "browser", label: "Browser", icon: Building2 },
              { id: "parameters", label: "Parameters", icon: Sliders },
              { id: "worksets", label: "Worksets", icon: Layers3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveBrowserTab(tab.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 2px",
                  borderRadius: "5px",
                  border: "none",
                  background: activeBrowserTab === tab.id ? "rgba(245,158,11,0.1)" : "transparent",
                  color: activeBrowserTab === tab.id ? "#fbbf24" : "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "10px",
                }}
              >
                <tab.icon size={12} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Navigator Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {activeBrowserTab === "browser" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* Views Section */}
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>VIEWS</p>
                  {project.levels.map((lvl) => (
                    <div
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      style={{
                        padding: "5px 8px",
                        borderRadius: "5px",
                        fontSize: "12px",
                        color: selectedLevel === lvl ? "#fbbf24" : "var(--text-secondary)",
                        background: selectedLevel === lvl ? "rgba(245,158,11,0.08)" : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Circle size={6} fill={selectedLevel === lvl ? "#f59e0b" : "transparent"} color="var(--text-muted)" />
                      <span>{lvl} Floor Plan</span>
                    </div>
                  ))}
                </div>

                {/* Schedules & Quantities */}
                <div style={{ marginTop: "8px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>SCHEDULES</p>
                  {["Door Schedule", "Room Area Schedule", "Wall Material Takeoff"].map((sched) => (
                    <div key={sched} style={{ padding: "4px 8px", fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Table2 size={12} color="var(--text-muted)" />
                      <span>{sched}</span>
                    </div>
                  ))}
                </div>

                {/* Families */}
                <div style={{ marginTop: "8px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>FAMILIES</p>
                  {["Structural Framing", "Doors (Single Flush)", "Windows (Mullion Block)", "Basic Wall Types"].map((fam) => (
                    <div key={fam} style={{ padding: "4px 8px", fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Box size={12} color="var(--text-muted)" />
                      <span>{fam}</span>
                    </div>
                  ))}
                </div>

                {/* Linked Models */}
                <div style={{ marginTop: "8px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>REVIT LINKS</p>
                  <div style={{ padding: "4px 8px", fontSize: "11px", color: "var(--text-disabled)", fontStyle: "italic" }}>
                    No linked .rvt or .ifc models connected.
                  </div>
                </div>
              </div>
            )}

            {activeBrowserTab === "parameters" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div>
                  <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Project Parameters</p>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "11px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Project Number</span>
                    <span style={{ color: "var(--text-secondary)" }}>DS-2026-BIM</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "11px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Status</span>
                    <span style={{ color: "var(--text-secondary)" }}>Design Development</span>
                  </div>
                </div>
                <div style={{ marginTop: "12px" }}>
                  <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Shared Parameters</p>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "11px" }}>
                    <span style={{ color: "var(--text-muted)" }}>AssetID</span>
                    <span style={{ color: "var(--text-secondary)" }}>GUID-41A-9B8</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "11px" }}>
                    <span style={{ color: "var(--text-muted)" }}>CarbonIndex</span>
                    <span style={{ color: "var(--text-secondary)" }}>BREEAM-A+</span>
                  </div>
                </div>
              </div>
            )}

            {activeBrowserTab === "worksets" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>BIM WORKSETS</p>
                {project.worksets.map((w) => (
                  <div
                    key={w}
                    onClick={() => setActiveWorkset(w)}
                    style={{
                      padding: "6px 8px",
                      borderRadius: "5px",
                      fontSize: "12px",
                      background: activeWorkset === w ? "rgba(245,158,11,0.08)" : "transparent",
                      color: activeWorkset === w ? "#fbbf24" : "var(--text-secondary)",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{w}</span>
                    <span style={{ fontSize: "9px", opacity: 0.6 }}>Editable</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Context Options Footer */}
          <div style={{ padding: "8px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-secondary)" }}>
              <span>Phase:</span>
              <select value={activePhase} onChange={(e) => setActivePhase(e.target.value)} style={{ background: "transparent", border: "none", color: "#f59e0b", outline: "none", cursor: "pointer" }}>
                {project.phases.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-secondary)" }}>
              <span>Design Option:</span>
              <span style={{ color: "#f59e0b" }}>{activeDesignOption}</span>
            </div>
          </div>
        </div>

        {/* Center: Interactive SVG Drawing Viewer & Canvas */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          {/* Canvas Control Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "0 12px",
              height: "36px",
              borderBottom: "1px solid var(--border-subtle)",
              background: "var(--bg-surface)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginRight: "8px" }}>
              {selectedLevel} Layout
            </span>
            <div style={{ height: "14px", width: "1px", background: "var(--border-subtle)", margin: "0 4px" }} />
            {[
              { icon: ZoomIn, label: "Zoom In", onClick: () => setZoom((z) => Math.min(z + 0.2, 3)) },
              { icon: ZoomOut, label: "Zoom Out", onClick: () => setZoom((z) => Math.max(z - 0.2, 0.3)) },
              { icon: RotateCcw, label: "Reset Scale", onClick: () => setZoom(1) },
              { icon: Maximize, label: "Full Viewport", onClick: () => setZoom(1.2) },
            ].map(({ icon: Icon, label, onClick }) => (
              <button
                key={label}
                title={label}
                onClick={onClick}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  border: "none",
                  background: "transparent",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-hover)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                }}
              >
                <Icon size={13} />
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Active Workset: {activeWorkset}</span>
          </div>

          {/* SVG Canvas Area */}
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0d0d10",
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1.5px, transparent 1.5px)",
              backgroundSize: "24px 24px",
            }}
          >
            {levelElements.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-disabled)" }}>
                <Grid size={24} style={{ opacity: 0.1, margin: "0 auto 8px" }} />
                <p style={{ fontSize: "12px", fontWeight: 500 }}>Empty Drawing Sheet</p>
                <p style={{ fontSize: "11px", opacity: 0.6 }}>Use the ribbon tools (Wall, Columns) or Load Metropolitan BIM Model.</p>
              </div>
            ) : (
              <svg
                width={420 * zoom}
                height={460 * zoom}
                viewBox="0 0 420 460"
                style={{ transition: "width 150ms ease, height 150ms ease" }}
              >
                {/* Grid Lines */}
                {project.grids.map((grid, index) => {
                  const x = 50 + index * 60;
                  const y = 50 + index * 60;
                  return (
                    <g key={grid}>
                      {/* Vertical Grid Line */}
                      <line x1={x} y1="20" x2={x} y2="440" stroke="rgba(255,255,255,0.12)" strokeDasharray="5,5" strokeWidth="0.8" />
                      <circle cx={x} cy="15" r="10" fill="var(--bg-elevated)" stroke="var(--border-strong)" strokeWidth="1" />
                      <text x={x} y="18" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="600">{grid}</text>

                      {/* Horizontal Grid Line */}
                      <line x1="20" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.12)" strokeDasharray="5,5" strokeWidth="0.8" />
                      <circle cx="10" cy={y} r="10" fill="var(--bg-elevated)" stroke="var(--border-strong)" strokeWidth="1" />
                      <text x="10" y={y + 3} textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="600">{index + 1}</text>
                    </g>
                  );
                })}

                {/* Rooms/BIM Wall Enclosures */}
                {levelElements.map((el) => {
                  const coord = roomCoordinates[el.name];
                  if (!coord) return null;
                  const isSelected = selectedElementId === el.id;
                  return (
                    <g key={el.id} onClick={() => setSelectedElementId(el.id)} style={{ cursor: "pointer" }}>
                      <rect
                        x={coord.x}
                        y={coord.y}
                        width={coord.w}
                        height={coord.h}
                        fill={isSelected ? "rgba(245,158,11,0.12)" : coord.color}
                        stroke={isSelected ? "#f59e0b" : "rgba(255,255,255,0.2)"}
                        strokeWidth={isSelected ? 2 : 1}
                        rx={4}
                      />
                      <text
                        x={coord.x + coord.w / 2}
                        y={coord.y + coord.h / 2 - 4}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={isSelected ? "#f59e0b" : "var(--text-primary)"}
                        fontSize="10"
                        fontWeight="600"
                      >
                        {el.name}
                      </text>
                      <text
                        x={coord.x + coord.w / 2}
                        y={coord.y + coord.h / 2 + 10}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="var(--text-muted)"
                        fontSize="8"
                        fontFamily="var(--font-mono)"
                      >
                        {el.area}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Right Side: Properties Panel & Object Inspector */}
        <div
          style={{
            width: "250px",
            borderLeft: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <div style={{ padding: "10px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Properties
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {selectedElement ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ padding: "8px", background: "rgba(245,158,11,0.06)", borderRadius: "6px", border: "1px solid rgba(245,158,11,0.15)", marginBottom: "8px" }}>
                  <p style={{ fontSize: "10px", color: "#f59e0b", fontWeight: 700 }}>ELEMENT SELECTED</p>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{selectedElement.name}</p>
                </div>
                {[
                  { label: "Element ID", value: selectedElement.id },
                  { label: "Type", value: selectedElement.type },
                  { label: "Base Level", value: selectedElement.level },
                  { label: "Area Index", value: selectedElement.area },
                  { label: "Volume Index", value: selectedElement.volume },
                  { label: "Material Finish", value: selectedElement.finish },
                  { label: "Function Room", value: selectedElement.occupancy }
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "11px" }}>
                    <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)", fontSize: "12px" }}>
                Select a room/element in the drawing sheet to inspect properties.
              </div>
            )}
          </div>

          {/* Active Issues Panel */}
          <div style={{ height: "180px", borderTop: "1px solid var(--border-subtle)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "8px 10px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>CLASH DETECTIONS ({project.bimIssues.length})</span>
              <AlertTriangle size={11} color="#f59e0b" />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
              {project.bimIssues.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 8px", fontSize: "11px", color: "var(--text-disabled)" }}>
                  Zero clashes detected. Model compliant.
                </div>
              ) : (
                project.bimIssues.map((issue) => (
                  <div
                    key={issue.id}
                    style={{
                      padding: "6px 8px",
                      borderRadius: "5px",
                      background: issue.severity === "high" ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
                      border: `1px solid ${issue.severity === "high" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)"}`,
                      marginBottom: "4px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", fontWeight: 700, color: issue.severity === "high" ? "#ef4444" : "#f59e0b", marginBottom: "2px" }}>
                      <span>{issue.id.toUpperCase()} [{issue.severity.toUpperCase()}]</span>
                      <span style={{ opacity: 0.6 }}>{issue.date}</span>
                    </div>
                    <p style={{ fontSize: "10px", color: "var(--text-secondary)", lineHeight: 1.3 }}>{issue.desc}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
