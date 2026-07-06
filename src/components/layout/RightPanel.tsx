"use client";

import React, { useState, useEffect } from "react";
import { useUIStore } from "@/store/uiStore";
import {
  Bot,
  FileText,
  Info,
  Settings,
  Sparkles,
  Send,
  Paperclip,
  Copy,
  RefreshCw,
  ChevronDown,
  Cpu,
  Plus,
  Trash2,
  Lock,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIStore } from "@/store/aiStore";
import { useProjectStore } from "@/store/projectStore";

const rightTabs = [
  { id: "ai", icon: Bot, label: "AI Assistant" },
  { id: "context", icon: Info, label: "Context" },
  { id: "docs", icon: FileText, label: "Docs" },
];

const models = [
  { id: "gpt-4o", label: "GPT-4o", provider: "OpenAI", color: "#4ade80" },
  { id: "claude-3-7", label: "Claude 3.7", provider: "Anthropic", color: "#f59e0b" },
  { id: "gemini-2", label: "Gemini 2.0", provider: "Google", color: "#60a5fa" },
  { id: "local", label: "Llama 3.1", provider: "Local", color: "#a78bfa" },
];

interface ChatSession {
  id: string;
  name: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

interface RightPanelProps {
  workspace: "developer" | "architecture" | "edi";
}

export function RightPanel({ workspace }: RightPanelProps) {
  const { activeRightTab, setActiveRightTab } = useUIStore();
  const { activeModelName, setProviderAndModel } = useAIStore();
  const { activeProject } = useProjectStore();
  const project = activeProject();

  const selectedModel = models.find((m) => m.id === activeModelName) || models[0];
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");

  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "session-1",
      name: "BIM Layout Query",
      messages: [
        { role: "assistant", content: "Hello! I can help you inspect Revit layouts or rules. How can I assist you?" },
      ],
    },
  ]);
  const [activeSessionId, setActiveSessionId] = useState("session-1");
  const [showSessions, setShowSessions] = useState(false);

  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      name: `New Session ${sessions.length + 1}`,
      messages: [{ role: "assistant", content: "AI session initiated. Write a prompt to begin." }],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length === 1) return;
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id) {
      setActiveSessionId(remaining[0].id);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setInput("");

    // Add user message to current session
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, { role: "user", content: userText }] }
          : s
      )
    );

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: [
                  ...s.messages,
                  {
                    role: "assistant",
                    content: "AI Provider Not Connected\nPlease configure an API Key for your AI provider under Settings -> AI & Models.",
                  },
                ],
              }
            : s
        )
      );
    }, 900);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)",
          height: "36px",
          flexShrink: 0,
        }}
      >
        {rightTabs.map((tab) => {
          const isActive = activeRightTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveRightTab(tab.id)}
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
                padding: "0 10px",
                height: "100%",
                border: "none",
                background: "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: isActive ? 600 : 400,
                borderBottom: isActive ? "1.5px solid var(--brand-500)" : "1.5px solid transparent",
                transition: "all 120ms ease",
              }}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeRightTab === "ai" && (
          <motion.div
            key="ai"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            {/* Header controls: Model & session managers */}
            <div
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "6px",
                background: "var(--bg-surface)",
                flexShrink: 0,
              }}
            >
              {/* Model selection trigger */}
              <div style={{ position: "relative", flex: 1 }}>
                <button
                  onClick={() => setModelMenuOpen(!modelMenuOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-default)",
                    background: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    fontSize: "11px",
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  <Cpu size={12} color={selectedModel.color} />
                  <span style={{ flex: 1 }}>{selectedModel.label}</span>
                  <ChevronDown size={11} />
                </button>

                <AnimatePresence>
                  {modelMenuOpen && (
                    <>
                      <div
                        onClick={() => setModelMenuOpen(false)}
                        style={{ position: "fixed", inset: 0, zIndex: 100 }}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        style={{
                          position: "absolute",
                          top: "28px",
                          left: 0,
                          right: 0,
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-strong)",
                          borderRadius: "8px",
                          padding: "4px",
                          zIndex: 101,
                          boxShadow: "var(--shadow-md)",
                        }}
                      >
                        {models.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setProviderAndModel(m.provider.toLowerCase(), m.id);
                              setModelMenuOpen(false);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "6px 8px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "11px",
                              background: m.id === selectedModel.id ? "var(--bg-selected)" : "transparent",
                            }}
                          >
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: m.color }} />
                            <span>{m.label} ({m.provider})</span>
                          </div>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Sessions Drawer trigger */}
              <button
                onClick={() => setShowSessions(!showSessions)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-default)",
                  background: showSessions ? "var(--bg-active)" : "var(--bg-elevated)",
                  color: "var(--text-secondary)",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                Chats ({sessions.length})
              </button>

              <button
                onClick={handleNewChat}
                style={{
                  padding: "5px",
                  borderRadius: "6px",
                  background: "var(--brand-600)",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Collapsible sessions side panel */}
            <AnimatePresence>
              {showSessions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{
                    background: "var(--bg-surface)",
                    borderBottom: "1px solid var(--border-subtle)",
                    maxHeight: "150px",
                    overflowY: "auto",
                    padding: "6px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setActiveSessionId(s.id);
                        setShowSessions(false);
                      }}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        background: s.id === activeSessionId ? "var(--bg-active)" : "transparent",
                        color: s.id === activeSessionId ? "var(--text-primary)" : "var(--text-secondary)",
                        fontSize: "11px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.name}
                      </span>
                      <button
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--text-disabled)",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Prompt templates chips */}
            <div
              style={{
                padding: "6px 8px",
                display: "flex",
                gap: "4px",
                overflowX: "auto",
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--bg-base)",
              }}
            >
              {[
                "Explain selection",
                "Optimize grid layout",
                "Parse EDIFACT rules",
                "Scan active files",
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setInput(chip)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "100px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-secondary)",
                    fontSize: "10px",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat history */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>
                    {m.role === "assistant" ? (
                      <>
                        <Sparkles size={11} color="var(--brand-400)" />
                        <span>DataSpark Assistant</span>
                      </>
                    ) : (
                      <span>You</span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      lineHeight: 1.5,
                      color: "var(--text-secondary)",
                      background: m.role === "user" ? "var(--bg-elevated)" : "transparent",
                      padding: m.role === "user" ? "8px 10px" : "0",
                      borderRadius: "6px",
                      border: m.role === "user" ? "1px solid var(--border-subtle)" : "none",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={{ display: "flex", gap: "4px", padding: "4px 0" }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "var(--brand-500)",
                        animation: `aiPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Input area */}
            <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
              {/* Context and status indicators */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                  fontSize: "10px",
                  color: "var(--text-muted)",
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={includeContext}
                    onChange={(e) => setIncludeContext(e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  Include project files context
                </label>
                <span>84 / 128k tokens</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 8px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-elevated)",
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  placeholder="Ask assistant anything..."
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "var(--text-primary)",
                    fontSize: "12px",
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background: input.trim() ? "var(--brand-600)" : "transparent",
                    color: input.trim() ? "white" : "var(--text-disabled)",
                    border: "none",
                    cursor: input.trim() ? "pointer" : "default",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeRightTab === "context" && (
          <motion.div
            key="context"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1, overflow: "auto", padding: "16px" }}
          >
            <ContextPanel workspace={workspace} project={project} />
          </motion.div>
        )}

        {activeRightTab === "docs" && (
          <motion.div
            key="docs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1, overflow: "auto", padding: "16px" }}
          >
            <DocsPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContextPanel({ workspace, project }: { workspace: string; project: any }) {
  const fileDetails = [
    { label: "Active Project", value: project ? project.name : "None Loaded" },
    { label: "Studio Environment", value: workspace.toUpperCase() },
    { label: "Active File Path", value: "src/app/page.tsx" },
    { label: "File Language type", value: "TypeScript TSX" },
    { label: "File Lines Count", value: "320 lines" },
    { label: "File Disk Size", value: "12.8 KB" },
  ];

  return (
    <div>
      <h3 style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>
        Active Workspace Context
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {fileDetails.map((f) => (
          <div
            key={f.label}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{f.label}</span>
            <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>
              {f.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocsPanel() {
  const docs = [
    { title: "Getting Started Guide", desc: "Learn to use the workspace picker, sidebar rails, and tabs.", link: "/" },
    { title: "EDI X12 Mapping standard", desc: "Syntax and lookup trees structure constraints.", link: "/studio/edi" },
    { title: "Autodesk Revit Families", desc: "Parameters mapping rules for levels, grids, and worksets.", link: "/studio/architecture" },
    { title: "Command Palette actions", desc: "Full list of workspace shortcuts and layout commands.", link: "/" },
  ];

  return (
    <div>
      <h3 style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>
        Documentation Indexes
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {docs.map((d) => (
          <div
            key={d.title}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
          >
            <h4 style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{d.title}</h4>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.3 }}>{d.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
