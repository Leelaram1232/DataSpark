"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Bot,
  Plus,
  Cpu,
  Trash2,
  Settings,
  Sparkles,
  Sliders,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AgentItem {
  id: string;
  name: string;
  description: string;
  model: string;
  temperature: number;
  status: "idle" | "active";
  contextSize: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentItem[]>([
    {
      id: "agent-1",
      name: "Code Refactoring Agent",
      description: "Optimizes typescript algorithms and formats functions templates dynamically.",
      model: "Claude 3.7 Sonnet",
      temperature: 0.2,
      status: "active",
      contextSize: "128k tokens",
    },
    {
      id: "agent-2",
      name: "BIM Interference Clash Agent",
      description: "Scans levels, grids, and worksets for spatial element overlaps.",
      model: "GPT-4o",
      temperature: 0.0,
      status: "idle",
      contextSize: "64k tokens",
    },
    {
      id: "agent-3",
      name: "EDIFACT / X12 Loop Validations Agent",
      description: "Inspects validation qualifiers loops and compiles rules structures.",
      model: "Local Llama 3.1 70B",
      temperature: 0.1,
      status: "active",
      contextSize: "32k tokens",
    },
  ]);

  const [activeAgentId, setActiveAgentId] = useState("agent-1");
  const selectedAgent = agents.find((a) => a.id === activeAgentId) || agents[0];

  const handleAddAgent = () => {
    const name = prompt("Enter Agent name:");
    if (!name) return;
    const newAgent: AgentItem = {
      id: `agent-${Date.now()}`,
      name,
      description: "Custom AI Agent workspace orchestrator.",
      model: "Claude 3.7 Sonnet",
      temperature: 0.5,
      status: "idle",
      contextSize: "64k tokens",
    };
    setAgents((prev) => [...prev, newAgent]);
    setActiveAgentId(newAgent.id);
  };

  const handleDeleteAgent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (agents.length === 1) return;
    const remaining = agents.filter((a) => a.id !== id);
    setAgents(remaining);
    if (activeAgentId === id) {
      setActiveAgentId(remaining[0].id);
    }
  };

  const handleToggleStatus = (id: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === "active" ? "idle" : "active" } : a
      )
    );
  };

  return (
    <AppShell workspace="developer">
      <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "var(--bg-base)" }}>
        {/* Agents sidebar */}
        <div
          style={{
            width: "240px",
            borderRight: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            padding: "16px 8px",
          }}
        >
          <div
            style={{
              padding: "0 8px 12px 8px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
              AI Agents Manager
            </span>
            <button
              onClick={handleAddAgent}
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "4px",
                background: "var(--brand-600)",
                color: "white",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={12} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "3px", marginTop: "12px" }}>
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => setActiveAgentId(agent.id)}
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: agent.id === activeAgentId ? "var(--bg-active)" : "transparent",
                  color: agent.id === activeAgentId ? "var(--text-primary)" : "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: agent.id === activeAgentId ? 600 : 400,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "background 100ms ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <Bot size={13} color={agent.status === "active" ? "#10b981" : "var(--text-disabled)"} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {agent.name}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteAgent(agent.id, e)}
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
          </div>
        </div>

        {/* Detailed configuration panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {selectedAgent ? (
            <div style={{ maxWidth: "600px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {selectedAgent.name}
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Configure agent execution limits and targeting scopes.
                  </p>
                </div>
                <button
                  onClick={() => handleToggleStatus(selectedAgent.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "none",
                    background: selectedAgent.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
                    color: selectedAgent.status === "active" ? "#10b981" : "var(--text-muted)",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {selectedAgent.status === "active" ? "● Active Status" : "○ Offline / Paused"}
                </button>
              </div>

              {/* Agent Settings Details Card */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Description
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {selectedAgent.description}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "8px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Model Engine
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Cpu size={12} color="var(--brand-400)" /> {selectedAgent.model}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Context Allocation Limit
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>
                      {selectedAgent.contextSize}
                    </span>
                  </div>
                </div>
              </div>

              {/* Execution parameter configurations */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <h3 style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Agent Parameters Sliders
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Temperature</span>
                    <span style={{ color: "var(--text-muted)" }}>{selectedAgent.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedAgent.temperature}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setAgents((prev) =>
                        prev.map((a) => (a.id === selectedAgent.id ? { ...a, temperature: val } : a))
                      );
                    }}
                    style={{ width: "100%", accentColor: "var(--brand-500)" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Top P</span>
                    <span style={{ color: "var(--text-muted)" }}>0.9</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue="0.9"
                    style={{ width: "100%", accentColor: "var(--brand-500)" }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: "var(--text-disabled)", fontSize: "12px" }}>No agent selected.</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
