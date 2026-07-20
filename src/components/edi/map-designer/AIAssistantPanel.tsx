"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  X,
  ChevronDown,
  MessageSquare,
  FileText,
  BookOpen,
  ArrowRight,
  Calculator,
  GitBranch,
  AlertTriangle,
  Shield,
  Search,
  RefreshCw,
  HelpCircle,
  PieChart,
  CheckCircle2,
} from "lucide-react";
import type { GeneratedMapData } from "./mapGenerator";
import type { WizardState, LogicNodeData } from "./types";

interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGES: AIMessage[] = [
  {
    role: "assistant",
    content: "Hello! I'm your Enterprise EDI AI Assistant. Ask me about any mapping rule, specification detail, or transformation logic.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   AI ASSISTANT PANEL — Right Sidebar matching screenshot
   ═══════════════════════════════════════════════════════════════════════════ */

export function AIAssistantPanel({
  onClose,
  mapData,
  wizardState,
  selectedNode,
  onApplyAIChange,
}: {
  onClose?: () => void;
  mapData?: GeneratedMapData | null;
  wizardState?: WizardState | null;
  selectedNode?: LogicNodeData | null;
  onApplyAIChange?: (changes: { logicNodes?: any[]; functionalMaps?: any[]; rules?: any[] }) => void;
}) {
  const [activeTab, setActiveTab] = useState<"chat" | "spec" | "explanation">("explanation");
  const [chatMessages, setChatMessages] = useState<AIMessage[]>(INITIAL_MESSAGES);
  const [specMessages, setSpecMessages] = useState<AIMessage[]>([
    { role: "assistant", content: "I am your Specification & RAG Assistant powered by Groq & DataSpark Knowledge Base. Ask me anything about your uploaded specification document, field rules, or X12/EDIFACT standards." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [specInput, setSpecInput] = useState("");
  const [explanationInput, setExplanationInput] = useState("");
  const [modelId, setModelId] = useState("GPT-4o");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const specEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === "chat") chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (activeTab === "spec") specEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, specMessages, activeTab]);

  const sendMessage = (type: "chat" | "spec" | "explanation") => {
    const input = type === "chat" ? chatInput : type === "spec" ? specInput : explanationInput;
    if (!input.trim()) return;

    const msgs = type === "chat" ? chatMessages : specMessages;
    const setMsgs = type === "chat" ? setChatMessages : setSpecMessages;
    const setInput = type === "chat" ? setChatInput : type === "spec" ? setSpecInput : setExplanationInput;

    if (type === "explanation") {
      setActiveTab("chat");
      setChatMessages((prev) => [...prev, { role: "user", content: input }]);
    } else {
      setMsgs([...msgs, { role: "user", content: input }]);
    }
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      const lower = input.toLowerCase();
      let reply = `[${modelId}] Analyzed mapping structure against specification document. ` +
        `I can modify transformation rules, add conditions, update lookups, or explain spec sections.`;

      if (lower.includes("condition") || lower.includes("partytype") || lower.includes("if")) {
        reply = `I have updated the **PartyType Condition** logic node on the canvas to check 'SE' (Seller) first before 'BT' (Buyer).\n\nUpdated Rule: IF PartyType = 'SE' THEN 'Seller' ELSE IF PartyType = 'BT' THEN 'Buyer' ELSE 'Other'`;
        if (mapData && onApplyAIChange) {
          const updatedNodes = mapData.logicNodes.map((n) =>
            n.id === "n-if-party"
              ? { ...n, details: "IF PartyType = 'SE' THEN 'Seller'\nELSE IF PartyType = 'BT' THEN 'Buyer'\nELSE 'Other'" }
              : n
          );
          onApplyAIChange({ logicNodes: updatedNodes });
        }
      } else if (lower.includes("upper") || lower.includes("trim") || lower.includes("format")) {
        reply = `Applied string function **UPPER()** to Party.Name mapping node on the canvas.`;
        if (mapData && onApplyAIChange) {
          const updatedNodes = mapData.logicNodes.map((n) =>
            n.id === "n-map-partyname"
              ? { ...n, subtitle: "UPPER(Party.Name)", details: "UPPERCASE Function Applied" }
              : n
          );
          onApplyAIChange({ logicNodes: updatedNodes });
        }
      }

      if (type === "explanation") {
        setChatMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } else {
        setMsgs((prev) => [...prev, { role: "assistant", content: reply }]);
      }
      setIsThinking(false);
    }, 900);
  };

  const tabs = [
    { id: "chat" as const, label: "Chat", icon: MessageSquare },
    { id: "spec" as const, label: "Spec Chat", icon: FileText },
    { id: "explanation" as const, label: "Mapping Explanation", icon: BookOpen },
  ];

  const explanationText = mapData
    ? `This map converts 310 Freight Receipt (X12) to EDIFACT Invoice (XML/EDI) based on the provided specification.`
    : "This map converts 310 Freight Receipt (X12) to EDIFACT Invoice (XML/EDI) based on the provided specification.";

  const functionsUsed = [
    { name: "MAP", count: 56, color: "#10b981" },
    { name: "IF CONDITION", count: 6, color: "#f59e0b" },
    { name: "LOOKUP", count: 4, color: "#a855f7" },
    { name: "CALCULATE", count: 6, color: "#3b82f6" },
    { name: "CONSTANT", count: 4, color: "#f97316" },
  ];

  const keyPoints = [
    "MessageType = 'ORDERS' → map 'PREADV'",
    "Version for ORDERS → '0100'",
    "SenderID constant → 'AUGRFOS'",
    "ReceiverID constant → 'DSV_WMS_RPO1'",
    "Plant based Site_Id logic applied",
    "All totals calculated as per rules",
  ];

  const activeNode = selectedNode || (mapData?.logicNodes && mapData.logicNodes[18]) || {
    sourcePath: "Items.Item.UnitPrice",
    targetPath: "Items.Item.Amount",
    type: "CALCULATE",
    subtitle: "UnitPrice * Quantity",
    confidence: "100%",
    specReference: "Section 5.3 - Calculation",
  };

  return (
    <div
      style={{
        width: "310px",
        minWidth: "290px",
        display: "flex",
        flexDirection: "column",
        background: "#08080d",
        borderLeft: "1px solid #141420",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid #141420",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Sparkles size={13} color="#a855f7" />
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#ececf1" }}>AI Assistant</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "9.5px", color: "#6b7280", cursor: "pointer" }}>Spec Reference</span>
          {onClose && (
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#4b5563", cursor: "pointer", padding: "2px" }}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Model Selector Dropdown */}
      <div style={{ padding: "6px 12px", borderBottom: "1px solid #101018", flexShrink: 0, position: "relative" }}>
        <div
          onClick={() => setShowModelDropdown(!showModelDropdown)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "5px 10px",
            background: "#0d0d14",
            border: "1px solid #1a1a25",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "10px", fontWeight: 600, color: "#9ca3af" }}>{modelId}</span>
          <ChevronDown size={10} color="#4b5563" />
        </div>

        {showModelDropdown && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 2px)",
              left: 12, right: 12,
              zIndex: 100,
              background: "#11111a",
              border: "1px solid #1f1f2e",
              borderRadius: "6px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
              overflow: "hidden",
            }}
          >
            {["GPT-4o", "Llama 3.3 70B (Groq Fast)", "Claude 3.5 Sonnet", "DeepSeek R1"].map((m) => (
              <div
                key={m}
                onClick={() => { setModelId(m); setShowModelDropdown(false); }}
                style={{ padding: "6px 10px", fontSize: "10px", color: m === modelId ? "#10b981" : "#9ca3af", background: m === modelId ? "#10b98110" : "transparent", cursor: "pointer" }}
              >
                {m}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tab Header Bar */}
      <div style={{ display: "flex", borderBottom: "1px solid #141420", flexShrink: 0 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: "7px 4px",
              background: activeTab === tab.id ? "#111118" : "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #10b981" : "2px solid transparent",
              color: activeTab === tab.id ? "#10b981" : "#4b5563",
              fontSize: "9.5px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Body Content */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* ─── Mapping Explanation Tab ─── */}
        {activeTab === "explanation" && (
          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Description Text */}
            <p style={{ fontSize: "10px", color: "#9ca3af", lineHeight: 1.5, margin: 0 }}>
              {explanationText}
            </p>

            {/* Key Points */}
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#ececf1", marginBottom: "6px" }}>
                Key Points
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {keyPoints.map((kp, i) => (
                  <div key={i} style={{ fontSize: "9.5px", color: "#9ca3af", display: "flex", gap: "6px" }}>
                    <span style={{ color: "#4b5563" }}>•</span>
                    <span>{kp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Functions Used */}
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#ececf1", marginBottom: "6px" }}>
                Functions Used
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {functionsUsed.map((fn) => (
                  <div key={fn.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "9.5px" }}>
                    <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: `${fn.color}20`, color: fn.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: 700 }}>
                      ✓
                    </span>
                    <span style={{ color: fn.color, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{fn.name}</span>
                    <span style={{ color: "#6b7280" }}>({fn.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selection Details Box */}
            <div
              style={{
                background: "#0d0d15",
                border: "1px solid #161625",
                borderRadius: "8px",
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
            >
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#ececf1", marginBottom: "4px" }}>
                Selection Details
              </div>
              <div style={{ fontSize: "9.5px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Source Field:</span>
                <span style={{ color: "#60a5fa", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  {activeNode.sourcePath || "Items.Item.UnitPrice"}
                </span>
              </div>
              <div style={{ fontSize: "9.5px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Target Field:</span>
                <span style={{ color: "#c084fc", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  {activeNode.targetPath || "Items.Item.Amount"}
                </span>
              </div>
              <div style={{ fontSize: "9.5px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Transformation:</span>
                <span style={{ color: "#22c55e", fontWeight: 700 }}>
                  {activeNode.type || "CALCULATE"}
                </span>
              </div>
              <div style={{ fontSize: "9.5px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Expression:</span>
                <span style={{ color: "#e5e7eb", fontFamily: "var(--font-mono)" }}>
                  {activeNode.subtitle || (activeNode as any).details || "UnitPrice * Quantity"}
                </span>
              </div>
              <div style={{ fontSize: "9.5px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Confidence:</span>
                <span style={{ color: "#10b981", fontWeight: 700 }}>
                  {activeNode.confidence || "100%"}
                </span>
              </div>
              <div style={{ fontSize: "9.5px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>Spec Reference:</span>
                <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                  {activeNode.specReference || "Section 5.3 - Calculation"}
                </span>
              </div>

              <button
                onClick={() => sendMessage("explanation")}
                style={{
                  marginTop: "8px",
                  padding: "6px",
                  background: "#111118",
                  border: "1px solid #1f1f2e",
                  borderRadius: "6px",
                  color: "#9ca3af",
                  fontSize: "9.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                Explain this mapping
              </button>
            </div>

            {/* ── Mapping Summary Card with Donut Chart ── */}
            <div
              style={{
                background: "#0b0b12",
                border: "1px solid #161625",
                borderRadius: "10px",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#ececf1", display: "flex", justifyContent: "space-between" }}>
                <span>Mapping Summary</span>
              </div>

              {/* Donut Chart and Metric Grid */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                {/* SVG Donut Chart */}
                <div style={{ position: "relative", width: "64px", height: "64px", flexShrink: 0 }}>
                  <svg width="64" height="64" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#1a1a28"
                      strokeWidth="3.8"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.8"
                      strokeDasharray="100, 100"
                    />
                  </svg>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#10b981", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
                      100%
                    </span>
                    <span style={{ fontSize: "7px", color: "#6b7280", textTransform: "uppercase" }}>
                      Mapped
                    </span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px", fontSize: "9.5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6b7280" }}>Total Input Fields</span>
                    <span style={{ color: "#ececf1", fontWeight: 700 }}>23</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6b7280" }}>Total Output Fields</span>
                    <span style={{ color: "#ececf1", fontWeight: 700 }}>23</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6b7280" }}>Mapped Fields</span>
                    <span style={{ color: "#10b981", fontWeight: 700 }}>23</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#6b7280" }}>Unmapped Fields</span>
                    <span style={{ color: "#10b981", fontWeight: 700 }}>0</span>
                  </div>
                </div>
              </div>

              {/* Stats badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", fontSize: "9px", paddingTop: "6px", borderTop: "1px solid #141420" }}>
                {[
                  { label: "Lookups", count: 6, color: "#a855f7" },
                  { label: "Calculations", count: 6, color: "#3b82f6" },
                  { label: "Functions", count: 6, color: "#06b6d4" },
                  { label: "Constants", count: 4, color: "#f97316" },
                  { label: "Validations", count: 4, color: "#10b981" },
                  { label: "Coverage", count: "100%", color: "#10b981" },
                ].map((st) => (
                  <div key={st.label} style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                    <CheckCircle2 size={9} color={st.color} />
                    <span style={{ color: "#6b7280" }}>{st.label}:</span>
                    <span style={{ color: st.color, fontWeight: 700 }}>{st.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Chat Tab ─── */}
        {activeTab === "chat" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "90%",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      background: msg.role === "user" ? "#1a1a30" : "#111118",
                      border: `1px solid ${msg.role === "user" ? "#2a2a45" : "#1a1a25"}`,
                      fontSize: "10px",
                      color: "#ececf1",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div style={{ display: "flex", gap: "4px", padding: "8px 10px" }}>
                  {[0, 1, 2].map((d) => (
                    <div
                      key={d}
                      style={{
                        width: "5px", height: "5px", borderRadius: "50%",
                        background: "#10b981", opacity: 0.5,
                        animation: `pulse 1s ease-in-out ${d * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* ─── Spec Chat Tab ─── */}
        {activeTab === "spec" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
              {specMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "90%",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      background: msg.role === "user" ? "#1a1a30" : "#111118",
                      border: `1px solid ${msg.role === "user" ? "#2a2a45" : "#1a1a25"}`,
                      fontSize: "10px",
                      color: "#ececf1",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={specEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input Box Footer */}
      <div style={{ padding: "8px 10px", borderTop: "1px solid #141420", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 8px", background: "#0d0d14", border: "1px solid #1a1a25", borderRadius: "8px" }}>
          <input
            value={activeTab === "chat" ? chatInput : activeTab === "spec" ? specInput : explanationInput}
            onChange={(e) => activeTab === "chat" ? setChatInput(e.target.value) : activeTab === "spec" ? setSpecInput(e.target.value) : setExplanationInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(activeTab);
              }
            }}
            placeholder="Ask about this mapping..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#ececf1", fontSize: "10px" }}
          />
          <button
            onClick={() => sendMessage(activeTab)}
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <Send size={11} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}
