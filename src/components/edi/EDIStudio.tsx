"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectStore } from "@/store/projectStore";
import { useAIStore, aiProviders } from "@/store/aiStore";
import { MapDesigner } from "./MapDesigner";
import { MapDesignerShell } from "./map-designer/MapDesignerShell";
import { RuleEditor } from "./RuleEditor";
import { FunctionLibrary } from "./FunctionLibrary";
import { TypeTreeManager } from "./TypeTreeManager";
import { SpecCenter } from "./SpecCenter";
import {
  Network,
  FolderOpen,
  Map,
  GitBranch,
  Zap,
  Settings,
  Play,
  Database,
  Activity,
  FileText,
  CheckSquare,
  Server,
  Cable,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Circle,
  AlertCircle,
  CheckCircle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Send,
  BookOpen,
  Sliders,
  Brain,
  Shield,
  FileCode,
  ListTodo,
  Terminal,
  Cpu,
} from "lucide-react";

const ediSections = [
  { id: "maps", label: "Map Designer", icon: Map },
  { id: "rule-editor", label: "Rule Editor", icon: Cable },
  { id: "typetrees", label: "Type Trees", icon: GitBranch },
  { id: "functions", label: "Functions", icon: BookOpen },
  { id: "specs", label: "Spec Center", icon: FileText },
  { id: "intelligence", label: "Project Intelligence", icon: Sliders },
  { id: "training", label: "Training Manager", icon: Brain },
  { id: "ai-chat", label: "AI Chat Assistant", icon: Sparkles },
  { id: "adapters", label: "Adapters", icon: Server },
  { id: "monitoring", label: "Monitoring", icon: Activity },
  { id: "deployments", label: "Deployments", icon: Play },
];

const statusColors = {
  active: "#4ade80",
  warning: "#facc15",
  idle: "#6b7280",
  error: "#f87171",
  connected: "#4ade80",
  disconnected: "#f87171",
};

const EDI_API_BASE = typeof window !== "undefined"
  ? (window.location.origin.includes("vercel.app") ? "/api/backend/api/v1/edi" : "http://localhost:8000/api/v1/edi")
  : "http://localhost:8000/api/v1/edi";

const getAuthHeaders = (headers: Record<string, string> = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("dataspark_access_token") : null;
  if (token) {
    return { ...headers, Authorization: `Bearer ${token}` };
  }
  return headers;
};

export function EDIStudio() {
  const { activeProject, importSampleProject, createProject } = useProjectStore();
  const project = activeProject();
  const { activeProviderId, activeModelName, setProviderAndModel } = useAIStore();

  const [activeSection, setActiveSection] = useState("maps");
  const [aiInput, setAiInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string; sources?: any[]; arch?: any }>>([
    {
      role: "assistant",
      content: "Hello! I'm your EDI AI Companion. I can inspect your specifications, loop structures, and design map flows.",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Dashboard & RAG datasets
  const [intelligenceData, setIntelligenceData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);
  const [loadingIntel, setLoadingIntel] = useState(false);

  // AI training states
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState("");
  const [trainingEpoch, setTrainingEpoch] = useState(0);
  const [trainBaseModel, setTrainBaseModel] = useState("gpt-4o");
  const [trainEpochs, setTrainEpochs] = useState(10);
  const [trainLR, setTrainLR] = useState(2e-5);

  useEffect(() => {
    if (project) {
      setLoadingIntel(true);
      // Fetch Project Intelligence
      fetch(`${EDI_API_BASE}/intelligence/${project.id}`, {
        headers: getAuthHeaders()
      })
        .then((res) => res.json())
        .then((data) => setIntelligenceData(data))
        .catch(() => {});

      // Fetch Dashboard
      fetch(`${EDI_API_BASE}/model-dashboard/${project.id}`, {
        headers: getAuthHeaders()
      })
        .then((res) => res.json())
        .then((data) => setDashboardData(data))
        .catch(() => {});

      // Fetch Training history
      fetch(`${EDI_API_BASE}/training/${project.id}`, {
        headers: getAuthHeaders()
      })
        .then((res) => res.json())
        .then((data) => {
          setTrainingHistory(data);
          setLoadingIntel(false);
        })
        .catch(() => setLoadingIntel(false));
    }
  }, [project]);

  const sendAiMessage = () => {
    if (!aiInput.trim() || !project) return;
    const userMsg = { role: "user", content: aiInput };
    setMessages((prev) => [...prev, userMsg]);
    setAiInput("");
    setChatLoading(true);

    fetch(`${EDI_API_BASE}/chat/${project.id}`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        message: aiInput,
        model_provider: activeProviderId,
        model_name: activeModelName,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply, sources: data.rag_sources, arch: data.architecture_summary },
        ]);
        setChatLoading(false);
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Failed to fetch response from RAG RAG service." },
        ]);
        setChatLoading(false);
      });
  };

  const handleApproveDataset = (id: string, approve: boolean) => {
    fetch(`${EDI_API_BASE}/training/approve/${id}?approve=${approve}`, {
      method: "POST",
      headers: getAuthHeaders()
    })
      .then((res) => res.json())
      .then((updated) => {
        setTrainingHistory((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: updated.status } : item))
        );
      })
      .catch(() => {});
  };

  const handleTrainModel = () => {
    if (!project) return;
    setIsTraining(true);
    setTrainingEpoch(0);
    
    const steps = [
      "🔄 Initializing training workspace...",
      "📂 Compiling approved type trees and specifications...",
      "🧠 Indexing document vectors...",
      "🚀 Beginning fine-tuning run...",
    ];
    
    let stepIdx = 0;
    const runSteps = () => {
      if (stepIdx < steps.length) {
        setTrainingProgress(steps[stepIdx]);
        stepIdx++;
        setTimeout(runSteps, 1200);
      } else {
        // Run epochs simulation in progress bar
        let epoch = 1;
        const runEpochs = () => {
          if (epoch <= trainEpochs) {
            setTrainingProgress(`🎯 Executing Fine-Tuning Epoch ${epoch}/${trainEpochs}...`);
            setTrainingEpoch(epoch);
            epoch++;
            setTimeout(runEpochs, 400);
          } else {
            setTrainingProgress("💾 Saving fine-tuned weights to Supabase database...");
            
            // Call backend API
            fetch(`${EDI_API_BASE}/training/${project.id}/train`, {
              method: "POST",
              headers: getAuthHeaders({ "Content-Type": "application/json" }),
              body: JSON.stringify({
                base_model: trainBaseModel,
                epochs: trainEpochs,
                learning_rate: trainLR,
              }),
            })
              .then((res) => res.json())
              .then(() => {
                setIsTraining(false);
                // Reload dashboard metrics & history
                fetch(`${EDI_API_BASE}/model-dashboard/${project.id}`, { headers: getAuthHeaders() })
                  .then((r) => r.json())
                  .then((dbData) => setDashboardData(dbData));
                  
                fetch(`${EDI_API_BASE}/training/${project.id}`, { headers: getAuthHeaders() })
                  .then((r) => r.json())
                  .then((hist) => setTrainingHistory(hist));
              })
              .catch(() => setIsTraining(false));
          }
        };
        runEpochs();
      }
    };
    runSteps();
  };

  if (!project || project.type !== "edi") {
    return (
      <div className="empty-state">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--edi-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.8 }}
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
          <circle cx="12" cy="12" r="3" />
          <circle cx="5" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
            No Active EDI Project
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "340px", margin: "0 auto", lineHeight: 1.5 }}>
            Load an IBM ITX retail integration template or construct a visual mapping layout to configure partner adapter loops.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => {
              const name = prompt("Enter project name:", "X12 EDI Mapping Workspace");
              if (name) createProject(name, "edi");
            }}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "none",
              background: "var(--edi-accent)",
              color: "var(--bg-void)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
          >
            Create Empty Workspace
          </button>
          <button
            onClick={() => importSampleProject("edi")}
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
            Import EDI Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left nav rail */}
      <div
        style={{
          width: "180px",
          flexShrink: 0,
          borderRight: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "10px 8px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "5px",
                background: "rgba(16,185,129,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Network size={11} color="#10b981" />
            </div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
              EDI Studio Menu
            </span>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "6px" }}>
          {ediSections.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 8px",
                  borderRadius: "7px",
                  border: "none",
                  background: isActive ? "rgba(16,185,129,0.1)" : "transparent",
                  color: isActive ? "#10b981" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: isActive ? 600 : 400,
                  textAlign: "left",
                  marginBottom: "2px",
                }}
              >
                <Icon size={14} style={{ flexShrink: 0 }} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center workspace canvas area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <AnimatePresence mode="wait">
          {activeSection === "maps" && (
            <motion.div key="maps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <MapDesignerShell />
            </motion.div>
          )}
          {activeSection === "rule-editor" && (
            <motion.div key="rules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <RuleEditor />
            </motion.div>
          )}
          {activeSection === "typetrees" && (
            <motion.div key="typetrees" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <TypeTreeManager />
            </motion.div>
          )}
          {activeSection === "functions" && (
            <motion.div key="functions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <FunctionLibrary />
            </motion.div>
          )}
          {activeSection === "specs" && (
            <motion.div key="specs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <SpecCenter />
            </motion.div>
          )}
          {activeSection === "adapters" && (
            <motion.div key="adapters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              <AdaptersPanel adapters={project.adapters} />
            </motion.div>
          )}
          {activeSection === "monitoring" && (
            <motion.div key="monitoring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              <MonitoringPanel maps={project.ediMaps} />
            </motion.div>
          )}

          {activeSection === "intelligence" && (
            <motion.div
              key="intelligence"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ flex: 1, overflowY: "auto", padding: "20px", background: "var(--bg-void)", color: "var(--text-primary)" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#10b981" }}>Project Intelligence Graph</h2>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Visualizes components inventory, map flow summaries, and dependencies.</p>
                </div>

                {intelligenceData ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "16px" }}>
                      <h3 style={{ fontSize: "12px", fontWeight: 700, marginBottom: "12px", color: "var(--text-secondary)" }}>Transformation Flow Diagram</h3>
                      <div dangerouslySetInnerHTML={{ __html: intelligenceData.transformation_flow_svg }} />
                    </div>

                    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "16px" }}>
                      <h3 style={{ fontSize: "12px", fontWeight: 700, marginBottom: "12px", color: "var(--text-secondary)" }}>Dependency Tree Graph</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {intelligenceData.dependency_graph.links.map((link: any, idx: number) => (
                          <div key={idx} style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                            {link.source} ──▶ {link.target}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "16px" }}>
                      <h3 style={{ fontSize: "12px", fontWeight: 700, marginBottom: "12px", color: "var(--text-secondary)" }}>Reusable Components Inventory</h3>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                            <th style={{ textAlign: "left", padding: "6px" }}>Component Name</th>
                            <th style={{ textAlign: "left", padding: "6px" }}>Type</th>
                            <th style={{ textAlign: "right", padding: "6px" }}>Usage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {intelligenceData.reusable_components.map((comp: any, idx: number) => (
                            <tr key={idx} style={{ borderBottom: "1px dashed var(--border-subtle)" }}>
                              <td style={{ padding: "6px", fontWeight: 600 }}>{comp.name}</td>
                              <td style={{ padding: "6px", color: "var(--text-muted)" }}>{comp.type}</td>
                              <td style={{ padding: "6px", textAlign: "right", color: "#10b981", fontWeight: 600 }}>{comp.usage_count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "16px" }}>
                      <h3 style={{ fontSize: "12px", fontWeight: 700, marginBottom: "12px", color: "var(--text-secondary)" }}>AI Architectural Documentation</h3>
                      <div style={{ fontSize: "11px", color: "var(--text-secondary)", whiteSpace: "pre-line", lineHeight: "1.6" }}>
                        {intelligenceData.ai_architecture_doc}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>Loading project intelligence blueprints...</div>
                )}
              </div>
            </motion.div>
          )}

          {activeSection === "training" && (
            <motion.div
              key="training"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ flex: 1, overflowY: "auto", padding: "20px", background: "var(--bg-void)", color: "var(--text-primary)" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#10b981" }}>Model Training Manager</h2>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Validate files, approve dataset training sets, configure hyperparameters, and trigger AI engine runs.</p>
                  </div>
                  {/* Provider settings switcher */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Active Engine:</span>
                    <select
                      value={`${activeProviderId}:${activeModelName}`}
                      onChange={(e) => {
                        const [p, m] = e.target.value.split(":");
                        setProviderAndModel(p, m);
                      }}
                      style={{
                        padding: "4px 8px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "6px",
                        color: "var(--text-primary)",
                        fontSize: "11px",
                      }}
                    >
                      {aiProviders.map((provider) =>
                        provider.models.map((model) => (
                          <option key={`${provider.id}:${model}`} value={`${provider.id}:${model}`}>
                            {provider.name} ({model})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Dashboard Metrics */}
                {dashboardData && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                    {[
                      { label: "Accuracy Metric", val: `${(dashboardData.accuracy_metrics.accuracy * 100).toFixed(2)}%` },
                      { label: "F1 Score Evaluation", val: dashboardData.accuracy_metrics.f1_score.toFixed(4) },
                      { label: "Precision Rate", val: `${(dashboardData.accuracy_metrics.precision * 100).toFixed(2)}%` },
                      { label: "Recall Rate", val: `${(dashboardData.accuracy_metrics.recall * 100).toFixed(2)}%` },
                      { label: "Hallucination Rate", val: `${(dashboardData.accuracy_metrics.hallucination_rate * 100).toFixed(3)}%` },
                      { label: "Response Time", val: `${dashboardData.accuracy_metrics.response_time_ms}ms` },
                      { label: "Confidence Score", val: dashboardData.accuracy_metrics.confidence_score.toFixed(4) },
                      { label: "Doc Coverage", val: `${(dashboardData.accuracy_metrics.knowledge_coverage * 100).toFixed(1)}%` },
                    ].map((item, idx) => (
                      <div key={idx} style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>{item.label}</div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#10b981" }}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Fine-Tuning Setup Panel */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
                  
                  {/* Left: Hyperparameters Form */}
                  <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#ececf1", display: "flex", alignItems: "center", gap: "6px" }}>
                      ⚙️ Fine-Tuning Parameters configuration
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>BASE MODEL</label>
                        <select
                          value={trainBaseModel}
                          onChange={(e) => setTrainBaseModel(e.target.value)}
                          style={{ width: "100%", padding: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "11px" }}
                        >
                          <option value="gpt-4o">GPT-4o (Base)</option>
                          <option value="deepseek-coder">DeepSeek Coder v2</option>
                          <option value="llama-3.1-itx">Llama 3.1 ITX Specialist</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>TRAINING EPOCHS</label>
                        <input
                          type="number"
                          value={trainEpochs}
                          onChange={(e) => setTrainEpochs(Math.max(1, parseInt(e.target.value) || 1))}
                          style={{ width: "100%", padding: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "11px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "10px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>LEARNING RATE</label>
                        <select
                          value={trainLR}
                          onChange={(e) => setTrainLR(parseFloat(e.target.value))}
                          style={{ width: "100%", padding: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "11px" }}
                        >
                          <option value={1e-5}>1e-5</option>
                          <option value={2e-5}>2e-5 (Recommended)</option>
                          <option value={5e-5}>5e-5</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right: Training Action Call */}
                  <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h4 style={{ fontSize: "11px", fontWeight: 700, color: "#ececf1", marginBottom: "4px" }}>Dataset Readiness</h4>
                      <p style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                        Approved files: {trainingHistory.filter(h => h.status === "approved" && h.metadata?.type !== "model_run").length} specs/trees/maps. Ready to fine-tune the selected base model.
                      </p>
                    </div>
                    <button
                      onClick={handleTrainModel}
                      style={{
                        width: "100%", padding: "10px", background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                      }}
                    >
                      🚀 Run Model Fine-Tuning
                    </button>
                  </div>
                </div>

                {/* Training run history records */}
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "16px" }}>
                  <h3 style={{ fontSize: "12px", fontWeight: 700, marginBottom: "12px", color: "#fbbf24" }}>🤖 Fine-Tuned Model Runs</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textAlign: "left" }}>
                        <th style={{ padding: "8px" }}>Model Version Name</th>
                        <th style={{ padding: "8px" }}>Base Engine</th>
                        <th style={{ padding: "8px" }}>Epochs / Learning Rate</th>
                        <th style={{ padding: "8px" }}>Accuracy</th>
                        <th style={{ padding: "8px" }}>Loss Value</th>
                        <th style={{ padding: "8px", textAlign: "right" }}>Completed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainingHistory.filter(h => h.metadata?.type === "model_run").length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)" }}>
                            No fine-tuned runs recorded yet. Click Run Model Fine-Tuning above to train your first model engine.
                          </td>
                        </tr>
                      ) : (
                        trainingHistory.filter(h => h.metadata?.type === "model_run").map((item) => (
                          <tr key={item.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                            <td style={{ padding: "8px", fontWeight: 600, color: "#10b981" }}>{item.name}</td>
                            <td style={{ padding: "8px" }}>{item.metadata.base_model}</td>
                            <td style={{ padding: "8px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                              {item.metadata.epochs} epochs / {item.metadata.learning_rate}
                            </td>
                            <td style={{ padding: "8px", fontWeight: 700, color: "#10b981" }}>
                              {(item.metadata.accuracy * 100).toFixed(2)}%
                            </td>
                            <td style={{ padding: "8px", fontFamily: "var(--font-mono)" }}>
                              {item.metadata.loss_history && item.metadata.loss_history.length > 0
                                ? item.metadata.loss_history[item.metadata.loss_history.length - 1].loss.toFixed(4)
                                : "0.024"}
                            </td>
                            <td style={{ padding: "8px", textAlign: "right", color: "var(--text-muted)" }}>
                              {item.metadata.completed_at ? new Date(item.metadata.completed_at).toLocaleString() : new Date(item.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Datasets Table */}
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "16px" }}>
                  <h3 style={{ fontSize: "12px", fontWeight: 700, marginBottom: "12px" }}>Imported Training Datasets Approval</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", textAlign: "left" }}>
                        <th style={{ padding: "8px" }}>File Name</th>
                        <th style={{ padding: "8px" }}>Duplicates Found</th>
                        <th style={{ padding: "8px" }}>Status</th>
                        <th style={{ padding: "8px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainingHistory.filter(h => h.metadata?.type !== "model_run").map((item) => (
                        <tr key={item.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "8px", fontWeight: 600 }}>{item.name}</td>
                          <td style={{ padding: "8px", color: item.metadata.duplicates_found > 0 ? "#f87171" : "var(--text-muted)" }}>
                            {item.metadata.duplicates_found || 0} duplicates
                          </td>
                          <td style={{ padding: "8px" }}>
                            <span
                              style={{
                                fontSize: "9px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                background:
                                  item.status === "approved"
                                    ? "rgba(74,222,128,0.1)"
                                    : item.status === "rejected"
                                    ? "rgba(248,113,113,0.1)"
                                    : "rgba(250,204,21,0.1)",
                                color:
                                  item.status === "approved"
                                    ? "#4ade80"
                                    : item.status === "rejected"
                                    ? "#f87171"
                                    : "#facc15",
                                textTransform: "uppercase",
                                fontWeight: 700,
                              }}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td style={{ padding: "8px", textAlign: "right" }}>
                            <button
                              onClick={() => handleApproveDataset(item.id, true)}
                              disabled={item.status === "approved"}
                              style={{
                                padding: "3px 8px",
                                background: "#10b98115",
                                border: "1px solid #10b98133",
                                borderRadius: "4px",
                                color: "#10b981",
                                cursor: "pointer",
                                marginRight: "4px",
                                fontSize: "9px",
                                opacity: item.status === "approved" ? 0.5 : 1,
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproveDataset(item.id, false)}
                              disabled={item.status === "rejected"}
                              style={{
                                padding: "3px 8px",
                                background: "#f8717115",
                                border: "1px solid #f8717133",
                                borderRadius: "4px",
                                color: "#f87171",
                                cursor: "pointer",
                                fontSize: "9px",
                                opacity: item.status === "rejected" ? 0.5 : 1,
                              }}
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Training Run Active Overlay Dialog */}
                {isTraining && (
                  <div style={{
                    position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)",
                    zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center",
                    backdropFilter: "blur(6px)"
                  }}>
                    <div style={{
                      width: "400px", background: "#0f0f18", border: "1px solid #222230",
                      borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column",
                      alignItems: "center", gap: "16px", textAlign: "center"
                    }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid #10b98122", borderTopColor: "#10b981", animation: "spin 1s linear infinite" }} />
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#ececf1" }}>Fine-Tuning Active Engine</span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{trainingProgress}</span>
                      </div>
                      
                      {trainingEpoch > 0 && (
                        <div style={{ width: "100%", background: "#1c1c28", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${(trainingEpoch / trainEpochs) * 100}%`, height: "100%", background: "#10b981", transition: "width 0.3s ease" }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSection === "ai-chat" && (
            <motion.div
              key="ai-chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-void)" }}
            >
              {/* Chat messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      maxWidth: "80%",
                      alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <span style={{ fontSize: "10px", fontWeight: 700, color: m.role === "user" ? "var(--text-muted)" : "#10b981" }}>
                      {m.role === "user" ? "YOU" : "ITX AI COMPANION"}
                    </span>
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        background: m.role === "user" ? "var(--bg-elevated)" : "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        lineHeight: 1.5,
                        whiteSpace: "pre-line",
                      }}
                    >
                      {m.content}

                      {/* Display blueprint info */}
                      {m.arch && (
                        <div style={{ marginTop: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#f59e0b" }}>AI Blueprint Blueprint</span>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "6px", fontSize: "11px" }}>
                            <div>Complexity: <span style={{ color: "#f87171" }}>{m.arch.complexity}</span></div>
                            <div>Effort: <span style={{ color: "#10b981" }}>{m.arch.estimated_effort_hours}h</span></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sources cards */}
                    {m.sources && m.sources.length > 0 && (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                        {m.sources.map((src, sIdx) => (
                          <div key={sIdx} style={{ fontSize: "9px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "4px", padding: "2px 6px", color: "#10b981" }}>
                            {src.source}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: "flex", gap: "4px", padding: "8px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", animation: "aiPulse 1s infinite" }} />
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", animation: "aiPulse 1s infinite 0.2s" }} />
                  </div>
                )}
              </div>

              {/* Chat input */}
              <div style={{ padding: "12px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", padding: "6px 12px" }}>
                  <input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendAiMessage();
                    }}
                    placeholder="Ask about maps, tree configurations, or type validation..."
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: "13px" }}
                  />
                  <button onClick={sendAiMessage} style={{ padding: "6px 12px", background: "#10b981", border: "none", borderRadius: "6px", color: "var(--bg-void)", fontWeight: 600, cursor: "pointer", fontSize: "11px" }}>
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "deployments" && (
            <motion.div
              key="deployments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ flex: 1, overflowY: "auto", padding: "20px", background: "var(--bg-void)", color: "var(--text-primary)" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#10b981" }}>Environments & Deployments</h2>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Manage active translation pipelines, view server logs, and monitor deployments.</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {/* Server status cards */}
                  <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "16px" }}>
                    <h3 style={{ fontSize: "12px", fontWeight: 700, marginBottom: "12px" }}>Active Deployments</h3>
                    {[
                      { env: "Staging QA Gateway", status: "active", version: "v2.1.0", maps: 4 },
                      { env: "Dev Sandbox Loop", status: "active", version: "v2.1.2-beta", maps: 2 },
                      { env: "Production Cloud Cluster", status: "warning", version: "v2.0.8", maps: 12 },
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", borderBottom: "1px solid var(--border-subtle)" }}>
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: 600 }}>{item.env}</div>
                          <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Active maps: {item.maps} · Version: {item.version}</div>
                        </div>
                        <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", background: item.status === "active" ? "rgba(74,222,128,0.1)" : "rgba(250,204,21,0.1)", color: item.status === "active" ? "#4ade80" : "#facc15", textTransform: "uppercase", fontWeight: 700 }}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Logs terminal console */}
                  <div style={{ background: "#060608", border: "1px solid #1a1a24", borderRadius: "8px", padding: "16px", fontFamily: "monospace", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Terminal size={12} /> Execution Server Logs
                      </div>
                      <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>Live stream active</span>
                    </div>
                    <div style={{ flex: 1, minHeight: "140px", fontSize: "10px", color: "#a1a1aa", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
                      <div>[2026-07-06 20:20:12] [INFO] Adapter Acme AS2 Listener started on port 9042</div>
                      <div>[2026-07-06 20:20:15] [INFO] Loaded binary map segment X12_850_to_SAP_ORDERS05.mms</div>
                      <div>[2026-07-06 20:21:02] [SUCCESS] Mapped inbound file partner_po_850.edi to SAPORDERS.xml (Time: 84ms)</div>
                      <div style={{ color: "#fbbf24" }}>[2026-07-06 20:21:05] [WARNING] Validation check: Quantity 0 on line item 4 normalized to 0</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AdaptersPanel({ adapters }: { adapters: any[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>PARTNER ADAPTER CONFLICT DETECTION</p>
      {adapters.length === 0 ? (
        <div style={{ padding: "20px", textAlign: "center", color: "var(--text-disabled)", fontSize: "12px" }}>
          No adapters registered yet.
        </div>
      ) : (
        adapters.map((a) => (
          <div key={a.name} style={{ padding: "12px", borderRadius: "6px", border: "1px solid var(--border-subtle)", background: "var(--bg-surface)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{a.name}</p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Type: {a.type} · Partner: {a.partner}</p>
            </div>
            <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "100px", background: a.status === "connected" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: a.status === "connected" ? "#34d399" : "#fbbf24", fontWeight: 600 }}>
              {a.status.toUpperCase()}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

function MonitoringPanel({ maps }: { maps: any[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>LIVE TRANSACTION PERFORMANCE</p>
      </div>
      {maps.length === 0 ? (
        <div style={{ padding: "20px", textAlign: "center", color: "var(--text-disabled)", fontSize: "12px" }}>
          No active maps reporting metrics.
        </div>
      ) : (
        maps.map((m) => (
          <div key={m.id} style={{ padding: "12px", borderRadius: "6px", border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{m.name}</span>
              <span style={{ fontSize: "10px", color: "#10b981", fontWeight: 600 }}>Running fine</span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Mapped Format: {m.format} · Records processed: {m.records} · Latency: 142ms</p>
          </div>
        ))
      )}
    </div>
  );
}
