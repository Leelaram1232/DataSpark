"use client";

import { useState } from "react";
import { useUIStore } from "@/store/uiStore";
import { useProjectStore } from "@/store/projectStore";
import {
  Terminal as TerminalIcon,
  AlertCircle,
  List,
  CheckSquare,
  FileText,
  Maximize2,
  Minimize2,
  Play,
  Activity,
  History,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const bottomTabs = [
  { id: "terminal", label: "Terminal", icon: TerminalIcon },
  { id: "problems", label: "Problems", icon: AlertCircle },
  { id: "output", label: "Output", icon: FileText },
  { id: "logs", label: "Logs", icon: List },
  { id: "execution", label: "Execution", icon: Play },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "ai-activity", label: "AI Activity", icon: Activity },
];

interface BottomPanelProps {
  workspace: "developer" | "architecture" | "edi";
}

export function BottomPanel({ workspace }: BottomPanelProps) {
  const {
    activeBottomTab,
    setActiveBottomTab,
    toggleBottomPanel,
    bottomPanelMaximized,
    toggleBottomMaximize,
  } = useUIStore();

  const { activeProject } = useProjectStore();
  const project = activeProject();

  const [terminalLines, setTerminalLines] = useState([
    { text: "$ dataspark watch", type: "cmd" },
    { text: "  ▲ Next.js Turbopack compiler listener ready", type: "info" },
    { text: "  - Local:    http://localhost:3000", type: "success" },
    { text: "✓ Compiling completed in 184ms", type: "success" },
    { text: "$ ", type: "prompt" },
  ]);
  const [termInput, setTermInput] = useState("");

  const [executionLogs, setExecutionLogs] = useState([
    "[12:04:12] Webpack Dev Server started successfully on port 3000",
    "[12:04:15] Loaded active Project Files structure.",
    "[12:04:16] HMR Hot Module Replacement connection established.",
    "[12:05:01] Watch triggered: src/components/layout/BottomPanel.tsx saved.",
    "[12:05:02] Recompiled client assets in 48ms.",
  ]);

  const [structuredLogs, setStructuredLogs] = useState([
    { level: "info", time: "12:04:12", msg: "Telemetry logger initialized." },
    { level: "warning", time: "12:04:15", msg: "AI model Gemini 2.0 requires active API key configuration." },
    { level: "info", time: "12:05:02", msg: "Hot module reload synchronized." },
  ]);

  const [aiActivities, setAiActivities] = useState([
    { action: "Prompt input analysis", target: "RightPanel.tsx", status: "Provider Not Connected" },
    { action: "Model key token query", target: "Settings.tsx", status: "Success (Local mode fallback)" },
  ]);

  const submitCommand = (cmd: string) => {
    if (!cmd.trim()) return;
    setTerminalLines((prev) => [
      ...prev.slice(0, -1),
      { text: `$ ${cmd}`, type: "cmd" },
      { text: `Command completed: code 0`, type: "success" },
      { text: "$ ", type: "prompt" },
    ]);
    setTermInput("");
  };

  const handleClearTab = () => {
    if (activeBottomTab === "terminal") {
      setTerminalLines([{ text: "$ ", type: "prompt" }]);
    } else if (activeBottomTab === "execution") {
      setExecutionLogs([]);
    } else if (activeBottomTab === "logs") {
      setStructuredLogs([]);
    } else if (activeBottomTab === "ai-activity") {
      setAiActivities([]);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)",
          flexShrink: 0,
          padding: "0 8px",
        }}
      >
        <div style={{ display: "flex", overflowX: "auto", flex: 1, scrollbarWidth: "none" }}>
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeBottomTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveBottomTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "0 10px",
                  height: "32px",
                  border: "none",
                  background: "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: isActive ? 600 : 400,
                  borderBottom: isActive ? "1.5px solid var(--brand-500)" : "1.5px solid transparent",
                  transition: "all 120ms ease",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab actions: Clear & Maximize */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <button
            onClick={handleClearTab}
            title="Clear Panel Output"
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "4px",
              border: "none",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trash2 size={12} />
          </button>
          <button
            onClick={toggleBottomMaximize}
            title={bottomPanelMaximized ? "Restore Layout" : "Maximize Panel"}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "4px",
              border: "none",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {bottomPanelMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      {/* Pane Content */}
      <div style={{ flex: 1, overflow: "hidden", background: "var(--bg-base)" }}>
        <AnimatePresence mode="wait">
          {activeBottomTab === "terminal" && (
            <motion.div
              key="terminal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                height: "100%",
                padding: "8px 12px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                overflow: "auto",
              }}
            >
              {terminalLines.map((line, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {line.type === "prompt" ? (
                    <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
                      <span style={{ color: "#818cf8" }}>$ </span>
                      <input
                        value={termInput}
                        onChange={(e) => setTermInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitCommand(termInput);
                        }}
                        style={{
                          flex: 1,
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          color: "var(--text-primary)",
                          fontFamily: "inherit",
                          fontSize: "inherit",
                          paddingLeft: "4px",
                        }}
                        placeholder="Type standard command..."
                      />
                    </div>
                  ) : (
                    <span
                      style={{
                        color:
                          line.type === "cmd"
                            ? "var(--text-primary)"
                            : line.type === "success"
                            ? "#34d399"
                            : "var(--text-muted)",
                      }}
                    >
                      {line.text}
                    </span>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {activeBottomTab === "problems" && (
            <motion.div
              key="problems"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ height: "100%", overflow: "auto", padding: "12px" }}
            >
              {project && project.type === "architecture" && project.bimIssues.length > 0 ? (
                project.bimIssues.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      marginBottom: "2px",
                      fontSize: "12px",
                    }}
                  >
                    <AlertCircle size={13} color="#f87171" style={{ flexShrink: 0, marginTop: "1px" }} />
                    <div>
                      <span style={{ color: "var(--text-primary)" }}>{p.desc}</span>
                      <span style={{ color: "var(--text-muted)", marginLeft: "8px" }}>
                        Level 1 Grid B-4
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "var(--text-disabled)", fontSize: "12px", padding: "12px" }}>
                  No problems have been detected in the workspace.
                </div>
              )}
            </motion.div>
          )}

          {activeBottomTab === "output" && (
            <motion.div
              key="output"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                height: "100%",
                overflow: "auto",
                padding: "8px 12px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              No active output console stream connected.
            </motion.div>
          )}

          {activeBottomTab === "logs" && (
            <motion.div
              key="logs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                height: "100%",
                overflow: "auto",
                padding: "8px 12px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {structuredLogs.length === 0 ? (
                <span style={{ color: "var(--text-disabled)" }}>Log viewer clean.</span>
              ) : (
                structuredLogs.map((log, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "var(--text-muted)" }}>[{log.time}]</span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: log.level === "warning" ? "#fbbf24" : "var(--brand-400)",
                        textTransform: "uppercase",
                      }}
                    >
                      {log.level}
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>{log.msg}</span>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeBottomTab === "execution" && (
            <motion.div
              key="execution"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                height: "100%",
                overflow: "auto",
                padding: "8px 12px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {executionLogs.length === 0 ? (
                <span style={{ color: "var(--text-disabled)" }}>No build pipelines active.</span>
              ) : (
                executionLogs.map((log, idx) => (
                  <span key={idx} style={{ color: "var(--text-secondary)" }}>
                    {log}
                  </span>
                ))
              )}
            </motion.div>
          )}

          {activeBottomTab === "tasks" && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                height: "100%",
                overflow: "auto",
                padding: "12px",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input type="checkbox" checked readOnly /> Run Type Tree Schemas validations tests
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input type="checkbox" checked readOnly /> Inspect model clash interferences checks
                </label>
              </div>
            </motion.div>
          )}

          {activeBottomTab === "ai-activity" && (
            <motion.div
              key="ai-activity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                height: "100%",
                overflow: "auto",
                padding: "8px 12px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {aiActivities.length === 0 ? (
                <span style={{ color: "var(--text-disabled)" }}>No AI actions recorded.</span>
              ) : (
                aiActivities.map((act, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: "1px solid var(--border-subtle)",
                      paddingBottom: "4px",
                    }}
                  >
                    <span>
                      {act.action} &rarr; <span style={{ color: "var(--text-muted)" }}>{act.target}</span>
                    </span>
                    <span style={{ color: "#ef4444", fontWeight: 600 }}>{act.status}</span>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
