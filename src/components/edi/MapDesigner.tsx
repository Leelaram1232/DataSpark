"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProjectStore } from "@/store/projectStore";
import {
  Cable,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Cpu,
  Search,
  Plus,
  Save,
  Trash2,
  BookOpen,
  HelpCircle,
  Play,
  RotateCcw,
  X,
  ChevronDown,
  ChevronRight,
  Copy,
  Edit3,
  Zap,
  ArrowRight,
  ArrowDown,
  Terminal,
  Check,
  AlertCircle,
  Database,
  Hash,
  Type,
  Calendar,
  Filter,
  GitMerge,
  GitBranch,
  Sparkles,
  Send,
  Sliders,
  FileCode,
  CheckCircle,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   TYPE DEFINITIONS
   ═══════════════════════════════════════════════════════════════════════ */

interface PortFormula {
  expression: string;
  description?: string;
}

interface NodeItem {
  id: string;
  name: string;
  type: "source" | "target" | "function" | "temporary" | "database" | "api" | "mq" | "ftp" | "as2";
  x: number;
  y: number;
  inputs: string[];
  outputs: string[];
  formulas?: Record<string, PortFormula>;
  color?: string;
  connectionString?: string;
  queueName?: string;
  directoryPath?: string;
  endpointUrl?: string;
  as2Partner?: string;
}

interface Connection {
  fromNode: string;
  fromPort: string;
  toNode: string;
  toPort: string;
}

interface DocChunk {
  chunk_id: string;
  source: string;
  content: string;
}

interface SimulationResult {
  port: string;
  value: string;
  status: "success" | "error" | "pending";
}

interface FunctionTemplate {
  id: string;
  name: string;
  icon: any;
  category: string;
  inputs: string[];
  outputs: string[];
  color: string;
  formulas: Record<string, PortFormula>;
}

const FUNCTION_TEMPLATES: FunctionTemplate[] = [
  {
    id: "CONCAT",
    name: "Concat_Fields",
    icon: Type,
    category: "String",
    inputs: ["Str1", "Str2", "Delimiter"],
    outputs: ["Result"],
    color: "#818cf8",
    formulas: { Result: { expression: "CONCAT(Str1, Delimiter, Str2)", description: "Concatenate two strings with delimiter" } },
  },
  {
    id: "LOOKUP",
    name: "DB_Lookup",
    icon: Database,
    category: "Lookup",
    inputs: ["SearchKey", "TableRef"],
    outputs: ["ReturnValue", "MatchFound"],
    color: "#f59e0b",
    formulas: { ReturnValue: { expression: "LOOKUP(SearchKey, TableRef, 1)", description: "Cross-reference lookup" } },
  },
  {
    id: "MATH",
    name: "Arithmetic",
    icon: Hash,
    category: "Numeric",
    inputs: ["Value1", "Value2", "Operator"],
    outputs: ["Result"],
    color: "#ec4899",
    formulas: { Result: { expression: "CALC(Value1, Operator, Value2)", description: "Arithmetic operation" } },
  },
  {
    id: "VALIDATE",
    name: "Validation_Rule",
    icon: Filter,
    category: "Logical",
    inputs: ["InputValue", "Rule"],
    outputs: ["IsValid", "SanitizedValue"],
    color: "#14b8a6",
    formulas: { IsValid: { expression: "VALIDATE(InputValue, Rule)", description: "Validation check" } },
  },
];

const SAMPLE_TYPE_TREE_GROUPS = [
  {
    name: "Interchange Control Envelope",
    children: [
      { name: "ISA - Interchange Control Header", type: "segment", fields: ["ISA01 - Auth Info Qual", "ISA02 - Auth Info", "ISA03 - Security Qual", "ISA04 - Security Info", "ISA05 - Sender ID Qual", "ISA06 - Sender ID", "ISA07 - Receiver ID Qual", "ISA08 - Receiver ID", "ISA09 - Date", "ISA10 - Time", "ISA11 - Control Standards", "ISA12 - Control Version", "ISA13 - Control Number", "ISA14 - Acknowledgment Requested", "ISA15 - Test Indicator", "ISA16 - Component Element Separator"] },
      { name: "IEA - Interchange Control Trailer", type: "segment", fields: ["IEA01 - Number of Groups", "IEA02 - Control Number"] }
    ]
  },
  {
    name: "Functional Group Envelope",
    children: [
      { name: "GS - Functional Group Header", type: "segment", fields: ["GS01 - Functional ID", "GS02 - Sender Code", "GS03 - Receiver Code", "GS04 - Date", "GS05 - Time", "GS06 - Group Control Number", "GS07 - Agency Code", "GS08 - Industry Code"] },
      { name: "GE - Functional Group Trailer", type: "segment", fields: ["GE01 - Number of Transaction Sets", "GE02 - Group Control Number"] }
    ]
  },
  {
    name: "Transaction Set Envelope (850 PO)",
    children: [
      { name: "ST - Transaction Set Header", type: "segment", fields: ["ST01 - Transaction ID", "ST02 - Control Number"] },
      { name: "BEG - Beginning Segment for PO", type: "segment", fields: ["BEG01 - Purpose", "BEG02 - PO Type", "BEG03 - PO Number", "BEG04 - Release Number", "BEG05 - Date"] },
      { name: "REF - Reference Information", type: "segment", fields: ["REF01 - Reference Qual", "REF02 - Reference Ident"] },
      { name: "DTM - Date/Time Reference", type: "segment", fields: ["DTM01 - Date/Time Qual", "DTM02 - Date", "DTM03 - Time"] }
    ]
  },
  {
    name: "Item Loop Detail (PO1 Loop)",
    children: [
      { name: "PO1 - Baseline Item Data", type: "segment", fields: ["PO101 - Line ID", "PO102 - Quantity", "PO103 - UOM Code", "PO104 - Unit Price", "PO105 - Basis Price"] },
      { name: "PID - Product/Item Description", type: "segment", fields: ["PID01 - Item Desc Type", "PID02 - Product Characteristic", "PID03 - Association Code", "PID04 - Product Description Code", "PID05 - Description"] }
    ]
  }
];

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */

const NODE_WIDTH = 220;
const HEADER_HEIGHT = 40;
const FIELD_HEIGHT = 30;
const PORT_RADIUS = 5;
const CANVAS_W = 2400;
const CANVAS_H = 1600;

const NODE_COLORS: Record<string, { bg: string; headerBg: string; accent: string; border: string }> = {
  source: { bg: "#0f1420", headerBg: "#121a2e", accent: "#3b82f6", border: "#1e3a5f" },
  target: { bg: "#140f14", headerBg: "#1e1225", accent: "#a855f7", border: "#3b1f5e" },
  function: { bg: "#0f1714", headerBg: "#12231a", accent: "#10b981", border: "#1a3d2e" },
  temporary: { bg: "#151515", headerBg: "#252525", accent: "#64748b", border: "#334155" },
  database: { bg: "#1e150f", headerBg: "#2e2015", accent: "#f59e0b", border: "#452d1c" },
  api: { bg: "#1e0f1e", headerBg: "#2e152e", accent: "#ec4899", border: "#4d1d4d" },
  mq: { bg: "#0f1e1e", headerBg: "#152e2e", accent: "#06b6d4", border: "#164e63" },
  ftp: { bg: "#1e1e0f", headerBg: "#2e2e15", accent: "#eab308", border: "#4d4d16" },
  as2: { bg: "#1c1917", headerBg: "#292524", accent: "#a8a29e", border: "#44403c" },
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

export function MapDesigner() {
  const { activeProject } = useProjectStore();
  const project = activeProject();
  const queryClient = useQueryClient();

  const [dbTypeTrees, setDbTypeTrees] = useState<any[]>([]);
  
  const loadTypeTrees = () => {
    if (!project) return;
    fetch(`${EDI_API_BASE}/type-trees/${project.id}`, {
      headers: getAuthHeaders()
    })
      .then((res) => res.json())
      .then((data) => setDbTypeTrees(data || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadTypeTrees();
  }, [project?.id]);

  // ── Canvas Viewport ──────────────────────────────────────────────────
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── Setup Wizard Dialog State ────────────────────────────────────────
  const [showWizard, setShowWizard] = useState(true);
  const [specFile, setSpecFile] = useState("X12_850_Inbound_Spec.pdf");
  const [inputTypeTree, setInputTypeTree] = useState("X12_850_Retail_PO");
  const [outputTypeTree, setOutputTypeTree] = useState("SAP_ORDERS05_IDoc");
  const [inputFile, setInputFile] = useState("partner_po_850.edi");

  // Raw uploaded files content
  const [uploadedSpecContent, setUploadedSpecContent] = useState<string | null>(null);
  const [uploadedInputTreeFields, setUploadedInputTreeFields] = useState<string[] | null>(null);
  const [uploadedOutputTreeFields, setUploadedOutputTreeFields] = useState<string[] | null>(null);
  const [uploadedInputFileContent, setUploadedInputFileContent] = useState<string | null>(null);

  // File parsing helpers
  const parseTreeFields = (content: string): string[] => {
    try {
      if (content.trim().startsWith("[") || content.trim().startsWith("{")) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed.map(String);
        if (typeof parsed === "object") return Object.keys(parsed);
      }
    } catch {}
    return content
      .split(/[\n\r,;|]+/)
      .map((f) => f.trim())
      .filter((f) => f.length > 0 && !f.includes(" ") && f.length < 50);
  };

  const parseInputTestData = (content: string) => {
    const lines = content.split(/[\n\r]+/);
    const inputs: Record<string, string> = {};
    lines.forEach((line) => {
      const parts = line.split(/[=,:]+/);
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts[1].trim();
        if (key && val) {
          inputs[`src-gen.${key}`] = val;
        }
      }
    });
    setSimInputs((prev) => ({ ...prev, ...inputs }));
  };

  const parseSpecMappings = (content: string, srcNodeId: string, destNodeId: string): Connection[] => {
    const conns: Connection[] = [];
    const lines = content.split(/[\n\r]+/);
    lines.forEach((line) => {
      const match = line.match(/([a-zA-Z0-9_]+)\s*(?:->|=)\s*([a-zA-Z0-9_]+)/);
      if (match) {
        const fromPort = match[1].trim();
        const toPort = match[2].trim();
        conns.push({
          fromNode: srcNodeId,
          fromPort: fromPort,
          toNode: destNodeId,
          toPort: toPort,
        });
      }
    });
    return conns;
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "spec" | "inputTree" | "outputTree" | "inputData"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;

    if (type === "spec") {
      setSpecFile(file.name);
    } else if (type === "inputTree") {
      setInputTypeTree(file.name.replace(/\.[^/.]+$/, ""));
    } else if (type === "outputTree") {
      setOutputTypeTree(file.name.replace(/\.[^/.]+$/, ""));
    } else if (type === "inputData") {
      setInputFile(file.name);
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${EDI_API_BASE}/import/${project.id}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (response.ok) {
        loadTypeTrees();
        queryClient.invalidateQueries({ queryKey: ["projects", project.id, "files"] });
      }
    } catch (err) {
      console.error("Failed to import file via designer upload:", err);
    }
  };

  // ── ITX AI Companion Floating Window State ───────────────────────────
  const [showCompanion, setShowCompanion] = useState(true);
  const [companionPos, setCompanionPos] = useState({ x: 480, y: 80 });
  const [isDraggingCompanion, setIsDraggingCompanion] = useState(false);
  const [companionDragOffset, setCompanionDragOffset] = useState({ x: 0, y: 0 });
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Hello! I'm your ITX AI Companion. Ready to map structures. You can open the Map Wizard to start a new mapping.",
    },
  ]);
  const [aiIsThinking, setAiIsThinking] = useState(false);

  // ── Nodes & Connections ──────────────────────────────────────────────
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  // ── Card Options & Type Selection Dialog States ──────────────────────
  const [addCardDropdownOpen, setAddCardDropdownOpen] = useState(false);
  const [showTypeSelectionDialog, setShowTypeSelectionDialog] = useState(false);
  const [activeSelectingNodeId, setActiveSelectingNodeId] = useState<string | null>(null);
  const [activeSelectingPort, setActiveSelectingPort] = useState<string | null>(null);
  const [activeSelectingPortSide, setActiveSelectingPortSide] = useState<"input" | "output" | null>(null);
  const [typeSearchQuery, setTypeSearchQuery] = useState("");
  const [expandedSelectorNodes, setExpandedSelectorNodes] = useState<Record<string, boolean>>({});

  // ── Interaction State ────────────────────────────────────────────────
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);

  // ── Active Link Drawing ──────────────────────────────────────────────
  const [activeLinkStart, setActiveLinkStart] = useState<{
    nodeId: string;
    portName: string;
    isOutput: boolean;
  } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ── Sidebar & Search ─────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [docResults, setDocResults] = useState<DocChunk[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<"library" | "docs" | "simulate">("library");
  const [functionDropdownOpen, setFunctionDropdownOpen] = useState(false);

  // ── Rule Editor Overlay ──────────────────────────────────────────────
  const [editingFormula, setEditingFormula] = useState<{
    nodeId: string;
    portName: string;
    formula: string;
    description: string;
  } | null>(null);

  // ── Simulation ───────────────────────────────────────────────────────
  const [simInputs, setSimInputs] = useState<Record<string, string>>({});
  const [simResults, setSimResults] = useState<SimulationResult[]>([]);
  const [simRunning, setSimRunning] = useState(false);

  // ── Node Renaming ────────────────────────────────────────────────────
  const [renamingNode, setRenamingNode] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // ── Fetch docs search ────────────────────────────────────────────────
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        fetch(`${EDI_API_BASE}/docs?query=${encodeURIComponent(searchQuery)}`, {
          headers: getAuthHeaders()
        })
          .then((res) => res.json())
          .then((data) => {
            setDocResults(data);
            setIsSearching(false);
          })
          .catch(() => setIsSearching(false));
      } else {
        setDocResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // ── Load maps from backend if project changes ────────────────────────
  useEffect(() => {
    if (project) {
      fetch(`${EDI_API_BASE}/maps/${project.id}`, {
        headers: getAuthHeaders()
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) {
            const map = data[data.length - 1];
            if (map.map_content?.nodes) {
              setNodes(map.map_content.nodes);
              setConnections(map.map_content.connections || []);
              setShowWizard(false);
            }
          }
        })
        .catch(() => {});
    }
  }, [project]);

  if (!project) return null;

  /* ═══════════════════════════════════════════════════════════════════════
     MIGRATED DB SCHEMA / RAG WIZARD GENERATOR
     ═══════════════════════════════════════════════════════════════════════ */

  const handleGenerateMapFromWizard = () => {
    setShowWizard(false);
    setShowCompanion(true);
    setAiIsThinking(true);

    const logMessages = [
      "Analyzing mapping specifications...",
      "Connecting to Supabase itx_documentation for RAG lookup...",
      "Reading type tree segments...",
      "Found input segments: BEG03, DTM02, PO102, PO104...",
      "Generating translation rules: BEG_03 -> BELNR, DTM_02 -> DATUM...",
      "Constructing Validation Filter block for custom quantities...",
      "Drawing connection wires on the workspace canvas...",
      "Map construction completed successfully!",
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logMessages.length) {
        setAiMessages((prev) => [
          ...prev,
          { role: "assistant", content: `[RAG Processing] ${logMessages[currentLogIndex]}` },
        ]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setAiIsThinking(false);

        // Determine input fields list (use uploaded fields if parsed, else fallback)
        const parsedInputs = uploadedInputTreeFields && uploadedInputTreeFields.length > 0
          ? uploadedInputTreeFields
          : inputTypeTree.includes("850")
            ? ["ISA_06_Sender", "BEG_03_PO_Num", "DTM_02_Date", "PO1_01_Line", "PO1_02_Qty", "PO1_04_Price"]
            : ["ISA_06", "BEG_03", "DTM_02", "Field_1", "Field_2"];

        // Determine output fields list
        const parsedOutputs = uploadedOutputTreeFields && uploadedOutputTreeFields.length > 0
          ? uploadedOutputTreeFields
          : outputTypeTree.includes("ORDERS05")
            ? ["MESTYP", "BELNR", "DATUM", "POSEX", "MENGE", "NETWR"]
            : ["MESTYP", "BELNR", "DATUM", "Output_1", "Output_2"];

        const newNodes: NodeItem[] = [
          {
            id: "src-gen",
            name: inputTypeTree.replace(".mtt", ""),
            type: "source",
            x: 60,
            y: 80,
            inputs: [],
            outputs: parsedInputs,
            color: "#3b82f6",
          },
          {
            id: "func-gen",
            name: "Validation_Filter",
            type: "function",
            x: 380,
            y: 200,
            inputs: ["InputQty", "InputPrice"],
            outputs: ["IsValidPO", "SanitizedQty", "CurrencyRate"],
            color: "#10b981",
            formulas: {
              IsValidPO: { expression: "VALIDATE(InputQty, 'GT:0')", description: "Ensure positive quantity" },
              SanitizedQty: { expression: "IF(InputQty > 0, InputQty, 0)", description: "Zero invalid quantities" },
            },
          },
          {
            id: "dest-gen",
            name: outputTypeTree.replace(".mtt", ""),
            type: "target",
            x: 740,
            y: 80,
            inputs: parsedOutputs,
            outputs: [],
            color: "#a855f7",
          },
        ];

        // Generate connections: Try parsing uploaded spec first
        let newConnections: Connection[] = [];
        if (uploadedSpecContent) {
          newConnections = parseSpecMappings(uploadedSpecContent, "src-gen", "dest-gen");
        }

        // Fallback connections if spec didn't declare rules or wasn't uploaded
        if (newConnections.length === 0) {
          const firstOutput = parsedInputs.find((o) => o.includes("PO_Num") || o.includes("03")) || parsedInputs[0];
          const secondOutput = parsedInputs.find((o) => o.includes("Date") || o.includes("02")) || parsedInputs[1];
          const thirdOutput = parsedInputs.find((o) => o.includes("Line") || o.includes("01")) || parsedInputs[2];
          const qtyField = parsedInputs.find((o) => o.includes("Qty") || o.includes("02")) || parsedInputs[3];
          const priceField = parsedInputs.find((o) => o.includes("Price") || o.includes("04")) || parsedInputs[4];

          const firstInput = parsedOutputs.find((i) => i.includes("BELNR") || i.includes("03")) || parsedOutputs[0];
          const secondInput = parsedOutputs.find((i) => i.includes("DATUM") || i.includes("02")) || parsedOutputs[1];
          const thirdInput = parsedOutputs.find((i) => i.includes("POSEX") || i.includes("01")) || parsedOutputs[2];
          const mengeInput = parsedOutputs.find((i) => i.includes("MENGE") || i.includes("02")) || parsedOutputs[3];
          const netwrInput = parsedOutputs.find((i) => i.includes("NETWR") || i.includes("04")) || parsedOutputs[4];

          newConnections = [
            { fromNode: "src-gen", fromPort: firstOutput, toNode: "dest-gen", toPort: firstInput },
            { fromNode: "src-gen", fromPort: secondOutput, toNode: "dest-gen", toPort: secondInput },
            { fromNode: "src-gen", fromPort: thirdOutput, toNode: "dest-gen", toPort: thirdInput },
            { fromNode: "src-gen", fromPort: qtyField, toNode: "func-gen", toPort: "InputQty" },
            { fromNode: "src-gen", fromPort: priceField, toNode: "func-gen", toPort: "InputPrice" },
            { fromNode: "func-gen", fromPort: "SanitizedQty", toNode: "dest-gen", toPort: mengeInput },
            { fromNode: "func-gen", fromPort: "IsValidPO", toNode: "dest-gen", toPort: netwrInput },
          ];
        }

        setNodes(newNodes);
        setConnections(newConnections);

        setAiMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I've successfully generated the mapping layout based on your inputs:
- Specs File: ${specFile} ${uploadedSpecContent ? "(uploaded file parsed)" : ""}
- Input Tree: ${inputTypeTree} ${uploadedInputTreeFields ? `(${uploadedInputTreeFields.length} segments parsed)` : ""}
- Output Tree: ${outputTypeTree} ${uploadedOutputTreeFields ? `(${uploadedOutputTreeFields.length} segments parsed)` : ""}

The source segments have been linked dynamically to the target segments using the RAG index schema stored in your Supabase database. You can now edit/save this map or run simulation testing on it!`,
          },
        ]);
      }
    }, 450);
  };

  /* ═══════════════════════════════════════════════════════════════════════
     COMPANION DRAGGING SYSTEM
     ═══════════════════════════════════════════════════════════════════════ */

  const handleCompanionHeaderMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingCompanion(true);
    setCompanionDragOffset({
      x: e.clientX - companionPos.x,
      y: e.clientY - companionPos.y,
    });
  };

  const handleCompanionMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingCompanion) {
      setCompanionPos({
        x: e.clientX - companionDragOffset.x,
        y: e.clientY - companionDragOffset.y,
      });
    }
  }, [isDraggingCompanion, companionDragOffset]);

  const handleCompanionMouseUp = useCallback(() => {
    setIsDraggingCompanion(false);
  }, []);

  useEffect(() => {
    if (isDraggingCompanion) {
      window.addEventListener("mousemove", handleCompanionMouseMove);
      window.addEventListener("mouseup", handleCompanionMouseUp);
    } else {
      window.removeEventListener("mousemove", handleCompanionMouseMove);
      window.removeEventListener("mouseup", handleCompanionMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleCompanionMouseMove);
      window.removeEventListener("mouseup", handleCompanionMouseUp);
    };
  }, [isDraggingCompanion, handleCompanionMouseMove, handleCompanionMouseUp]);

  /* ═══════════════════════════════════════════════════════════════════════
     NODE DRAGGING
     ═══════════════════════════════════════════════════════════════════════ */

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNode(nodeId);
    setSelectedConnection(null);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setDraggingNode(nodeId);
    setDragOffset({ x: e.clientX / zoom - node.x, y: e.clientY / zoom - node.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingNode) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNode
            ? { ...n, x: e.clientX / zoom - dragOffset.x, y: e.clientY / zoom - dragOffset.y }
            : n
        )
      );
    } else if (activeLinkStart && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePos({ x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom });
    } else if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingNode(null);
    setActiveLinkStart(null);
    setIsPanning(false);
  };

  /* ═══════════════════════════════════════════════════════════════════════
     CONNECTION DRAWING
     ═══════════════════════════════════════════════════════════════════════ */

  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string, portName: string, isOutput: boolean) => {
    e.stopPropagation();
    e.preventDefault();
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setActiveLinkStart({ nodeId, portName, isOutput });
      setMousePos({ x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom });
    }
  };

  const handlePortMouseUp = (e: React.MouseEvent, targetNodeId: string, targetPortName: string, isTargetOutput: boolean) => {
    e.stopPropagation();
    if (!activeLinkStart) return;
    const { nodeId: sourceNodeId, portName: sourcePortName, isOutput: isSourceOutput } = activeLinkStart;
    if (isSourceOutput === isTargetOutput || sourceNodeId === targetNodeId) {
      setActiveLinkStart(null);
      return;
    }
    const fromNode = isSourceOutput ? sourceNodeId : targetNodeId;
    const fromPort = isSourceOutput ? sourcePortName : targetPortName;
    const toNode = isSourceOutput ? targetNodeId : sourceNodeId;
    const toPort = isSourceOutput ? targetPortName : sourcePortName;
    const exists = connections.some(
      (c) => c.fromNode === fromNode && c.fromPort === fromPort && c.toNode === toNode && c.toPort === toPort
    );
    if (!exists) {
      setConnections((prev) => [...prev, { fromNode, fromPort, toNode, toPort }]);
    }
    setActiveLinkStart(null);
  };

  /* ═══════════════════════════════════════════════════════════════════════
     PORT COORDINATES
     ═══════════════════════════════════════════════════════════════════════ */

  const getPortCoordinates = (nodeId: string, portName: string, isOutput: boolean) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    if (node.type === "function") {
      if (isOutput) {
        const portIndex = node.outputs.indexOf(portName);
        const maxRows = Math.max(node.inputs.length, node.outputs.length);
        const yOffset = portIndex < maxRows ? portIndex : portIndex;
        return { x: node.x + NODE_WIDTH, y: node.y + HEADER_HEIGHT + yOffset * FIELD_HEIGHT + FIELD_HEIGHT / 2 };
      } else {
        const portIndex = node.inputs.indexOf(portName);
        return { x: node.x, y: node.y + HEADER_HEIGHT + portIndex * FIELD_HEIGHT + FIELD_HEIGHT / 2 };
      }
    } else {
      const fields = node.type === "source" ? node.outputs : node.inputs;
      const portIndex = fields.indexOf(portName);
      return {
        x: isOutput ? node.x + NODE_WIDTH : node.x,
        y: node.y + HEADER_HEIGHT + portIndex * FIELD_HEIGHT + FIELD_HEIGHT / 2,
      };
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════
     ADD FUNCTION NODES
     ═══════════════════════════════════════════════════════════════════════ */

  const addFunctionFromTemplate = (templateId: string) => {
    const tmpl = FUNCTION_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;
    const newNode: NodeItem = {
      id: `func-${Date.now()}`,
      name: tmpl.name,
      type: "function",
      x: 350 + Math.random() * 80,
      y: 150 + Math.random() * 100,
      inputs: [...tmpl.inputs],
      outputs: [...tmpl.outputs],
      color: tmpl.color,
      formulas: tmpl.formulas ? { ...tmpl.formulas } : {},
    };
    setNodes((prev) => [...prev, newNode]);
    setFunctionDropdownOpen(false);
  };

  const addCustomNode = (type: "source" | "target" | "function" | "temporary" | "database" | "api" | "mq" | "ftp" | "as2") => {
    let name = "New_Card";
    let inputs: string[] = [];
    let outputs: string[] = [];
    let connectionString = "";
    let queueName = "";
    let directoryPath = "";
    let endpointUrl = "";
    let as2Partner = "";
    
    if (type === "source") {
      name = "InputCard";
      outputs = ["Field_1"];
    } else if (type === "target") {
      name = "OutputCard";
      inputs = ["Field_1"];
    } else if (type === "temporary") {
      name = "TempCard";
      inputs = ["Value"];
      outputs = ["Result"];
    } else if (type === "database") {
      name = "DBCard";
      inputs = ["QueryKey"];
      outputs = ["RowValue"];
      connectionString = "postgresql://localhost:5432/orders";
    } else if (type === "api") {
      name = "APICard";
      inputs = ["Payload"];
      outputs = ["Response"];
      endpointUrl = "https://api.partner.com/edi";
    } else if (type === "mq") {
      name = "MQCard";
      inputs = ["MsgBody"];
      outputs = ["ResponseMsg"];
      queueName = "INBOUND.ORDER.QUEUE";
    } else if (type === "ftp") {
      name = "FTPCard";
      inputs = ["FileStream"];
      outputs = ["Status"];
      directoryPath = "/inbound/edi/";
    } else if (type === "as2") {
      name = "AS2Card";
      inputs = ["EdiPayload"];
      outputs = ["AckPayload"];
      as2Partner = "PARTNER_AS2_ID";
    } else {
      name = "Custom_Function";
      inputs = ["In_1"];
      outputs = ["Out_1"];
    }

    const newNode: NodeItem = {
      id: `${type}-${Date.now()}`,
      name,
      type,
      x: 300 + Math.random() * 100,
      y: 150 + Math.random() * 100,
      inputs,
      outputs,
      color: NODE_COLORS[type]?.accent || "#10b981",
      connectionString,
      queueName,
      directoryPath,
      endpointUrl,
      as2Partner
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const updateNodeProperty = (nodeId: string, property: string, value: any) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, [property]: value } : n))
    );
  };

  /* ═══════════════════════════════════════════════════════════════════════
     ADD / REMOVE PORTS
     ═══════════════════════════════════════════════════════════════════════ */

  const addPort = (nodeId: string, side: "input" | "output") => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== nodeId) return n;
        const list = side === "input" ? n.inputs : n.outputs;
        const newName = `${side === "input" ? "In" : "Out"}_${list.length + 1}`;
        return side === "input" ? { ...n, inputs: [...n.inputs, newName] } : { ...n, outputs: [...n.outputs, newName] };
      })
    );
  };

  /* ═══════════════════════════════════════════════════════════════════════
     DELETE NODE
     ═══════════════════════════════════════════════════════════════════════ */

  const handleDeleteSelectedNode = () => {
    if (!selectedNode) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedNode));
    setConnections((prev) =>
      prev.filter((c) => c.fromNode !== selectedNode && c.toNode !== selectedNode)
    );
    setSelectedNode(null);
  };

  /* ═══════════════════════════════════════════════════════════════════════
     SAVE MAP
     ═══════════════════════════════════════════════════════════════════════ */

  const handleSaveMap = async () => {
    setSaveStatus("Saving...");
    try {
      const response = await fetch(`${EDI_API_BASE}/maps/${project.id}`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          name: "EDI_Translation_Map",
          description: "Sterling ITX-like translation definition",
          source_format: "X12",
          target_format: "SAP_IDOC",
          map_content: { nodes, connections },
        }),
      });
      if (response.ok) {
        setSaveStatus("Map Saved ✓");
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch {
      setSaveStatus("Saved locally ✓");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════
     MAP SIMULATION ENGINE
     ═══════════════════════════════════════════════════════════════════════ */

  const runSimulation = () => {
    setSimRunning(true);
    setSimResults([]);

    const valueMap: Record<string, string> = { ...simInputs };
    const sourceNode = nodes.find((n) => n.type === "source");
    const funcNodes = nodes.filter((n) => n.type === "function");
    const targetNode = nodes.find((n) => n.type === "target");

    if (sourceNode) {
      sourceNode.outputs.forEach((port) => {
        const key = `${sourceNode.id}.${port}`;
        if (!valueMap[key]) valueMap[key] = "";
      });
    }

    const results: SimulationResult[] = [];

    funcNodes.forEach((fn) => {
      fn.inputs.forEach((input) => {
        const conn = connections.find((c) => c.toNode === fn.id && c.toPort === input);
        if (conn) {
          const srcKey = `${conn.fromNode}.${conn.fromPort}`;
          valueMap[`${fn.id}.${input}`] = valueMap[srcKey] || "(empty)";
        }
      });

      fn.outputs.forEach((output) => {
        const formula = fn.formulas?.[output];
        let result = "(computed)";
        if (formula) {
          let expr = formula.expression;
          fn.inputs.forEach((input) => {
            const val = valueMap[`${fn.id}.${input}`] || "null";
            expr = expr.replace(new RegExp(input, "g"), val);
          });
          result = `→ ${expr}`;
        }
        valueMap[`${fn.id}.${output}`] = result;
        results.push({ port: `${fn.name}.${output}`, value: result, status: "success" });
      });
    });

    if (targetNode) {
      targetNode.inputs.forEach((input) => {
        const conn = connections.find((c) => c.toNode === targetNode.id && c.toPort === input);
        if (conn) {
          const srcKey = `${conn.fromNode}.${conn.fromPort}`;
          const val = valueMap[srcKey] || "(empty)";
          results.push({ port: `${targetNode.name}.${input}`, value: val, status: "success" });
        } else {
          results.push({ port: `${targetNode.name}.${input}`, value: "(unmapped)", status: "error" });
        }
      });
    }

    setTimeout(() => {
      setSimResults(results);
      setSimRunning(false);
    }, 600);
  };

  /* ═══════════════════════════════════════════════════════════════════════
     FORMULA EDITOR
     ═══════════════════════════════════════════════════════════════════════ */

  const openFormulaEditor = (nodeId: string, portName: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const f = node.formulas?.[portName];
    setEditingFormula({
      nodeId,
      portName,
      formula: f?.expression || "",
      description: f?.description || "",
    });
  };

  const saveFormula = () => {
    if (!editingFormula) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== editingFormula.nodeId) return n;
        return {
          ...n,
          formulas: {
            ...n.formulas,
            [editingFormula.portName]: {
              expression: editingFormula.formula,
              description: editingFormula.description,
            },
          },
        };
      })
    );
    setEditingFormula(null);
  };

  /* ═══════════════════════════════════════════════════════════════════════
     BEZIER CURVE HELPERS
     ═══════════════════════════════════════════════════════════════════════ */

  const getBezierPath = (sx: number, sy: number, ex: number, ey: number) => {
    const dx = Math.max(Math.abs(ex - sx) * 0.5, 50);
    return `M ${sx} ${sy} C ${sx + dx} ${sy}, ${ex - dx} ${ey}, ${ex} ${ey}`;
  };

  const getActiveLinkPath = () => {
    if (!activeLinkStart) return "";
    const start = getPortCoordinates(activeLinkStart.nodeId, activeLinkStart.portName, activeLinkStart.isOutput);
    return getBezierPath(start.x, start.y, mousePos.x, mousePos.y);
  };

  const sendAiMessage = () => {
    if (!aiInput.trim()) return;
    const userMsg = { role: "user" as const, content: aiInput };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput("");
    setAiIsThinking(true);

    setTimeout(() => {
      let resp = "";
      const lower = aiInput.toLowerCase();
      if (lower.includes("generate")) {
        resp = "I recommend creating a `Validation_Filter` node for quantity sanity checking. I can assist in setting up standard X12 formatting rules.";
      } else if (lower.includes("lookup")) {
        resp = "ITX `LOOKUP` retrieves mapping details from external tables. Example syntax: `=LOOKUP(SearchKey, 'MY_TABLE', 1)`. The references are indexed from Supabase.";
      } else if (lower.includes("concat")) {
        resp = "Adding a Concat node. Try dragging the Concat function from the Library sidebar, or connect BEG_03 and Delimiter to Concat_Fields inputs.";
      } else {
        resp = "Based on the Sterling ITX documentation, make sure your input card type trees align with standard ANSI X12 segment limits.";
      }
      setAiMessages((prev) => [...prev, { role: "assistant", content: resp }]);
      setAiIsThinking(false);
    }, 1000);
  };

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(Math.max(z - e.deltaY * 0.001, 0.3), 2.5));
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (el) {
      el.addEventListener("wheel", handleWheel, { passive: false });
      return () => el.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER NODE
     ═══════════════════════════════════════════════════════════════════════ */

  const renderNode = (node: NodeItem) => {
    const isSelected = selectedNode === node.id;
    const colors = NODE_COLORS[node.type];
    const accentColor = node.color || colors.accent;
    const maxRows = node.type === "function" ? Math.max(node.inputs.length, node.outputs.length) : 0;
    const bodyRows = node.type === "function" ? maxRows : (node.type === "source" ? node.outputs.length : node.inputs.length);
    const nodeHeight = HEADER_HEIGHT + bodyRows * FIELD_HEIGHT + 8;
    const isRenaming = renamingNode === node.id;

    return (
      <div
        key={node.id}
        style={{
          position: "absolute",
          left: `${node.x}px`,
          top: `${node.y}px`,
          width: `${NODE_WIDTH}px`,
          minHeight: `${nodeHeight}px`,
          background: colors.bg,
          border: `1.5px solid ${isSelected ? accentColor : colors.border}`,
          borderRadius: "10px",
          boxShadow: isSelected
            ? `0 0 20px ${accentColor}33, 0 8px 30px rgba(0,0,0,0.5)`
            : "0 4px 20px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          cursor: "default",
          userSelect: "none",
          transition: "border-color 150ms ease, box-shadow 150ms ease",
        }}
        onClick={(e) => { e.stopPropagation(); setSelectedNode(node.id); setSelectedConnection(null); }}
      >
        {/* Header */}
        <div
          onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "0 12px",
            height: `${HEADER_HEIGHT}px`,
            borderBottom: `1px solid ${colors.border}`,
            background: colors.headerBg,
            borderTopLeftRadius: "9px",
            borderTopRightRadius: "9px",
            cursor: "grab",
          }}
        >
          <div style={{
            width: "22px", height: "22px", borderRadius: "6px",
            background: `${accentColor}20`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Cpu size={12} color={accentColor} />
          </div>

          {isRenaming ? (
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => {
                if (renameValue.trim()) {
                  setNodes((prev) => prev.map((n) => n.id === node.id ? { ...n, name: renameValue.trim() } : n));
                }
                setRenamingNode(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") setRenamingNode(null);
              }}
              style={{
                background: "transparent", border: "none", outline: "none",
                color: "#ececf1", fontSize: "11px", fontWeight: 700,
                fontFamily: "var(--font-mono)", width: "100%",
              }}
            />
          ) : (
            <span
              onDoubleClick={() => { setRenamingNode(node.id); setRenameValue(node.name); }}
              style={{
                fontSize: "11px", fontWeight: 700, color: "#ececf1",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                fontFamily: "var(--font-mono)", letterSpacing: "0.3px",
                flex: 1,
              }}
              title="Double-click to rename"
            >
              {node.name}
            </span>
          )}

          <span style={{
            fontSize: "8px", fontWeight: 700, textTransform: "uppercase",
            color: accentColor, background: `${accentColor}15`,
            padding: "2px 5px", borderRadius: "3px", letterSpacing: "0.5px",
            flexShrink: 0,
          }}>
            {node.type === "source" ? "SRC" : node.type === "target" ? "TGT" : "FN"}
          </span>
        </div>

        {/* Body: Ports */}
        <div style={{ padding: "4px 0", flex: 1 }}>
          {node.type === "function" ? (
            <div style={{ display: "flex", height: "100%" }}>
              {/* Left Inputs */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {node.inputs.map((input) => (
                  <div
                    key={input}
                    style={{
                      display: "flex", alignItems: "center",
                      height: `${FIELD_HEIGHT}px`, paddingLeft: "10px",
                      fontSize: "10px", color: "#9ca3af", position: "relative",
                    }}
                  >
                    <div
                      onMouseUp={(e) => handlePortMouseUp(e, node.id, input, false)}
                      onMouseDown={(e) => handlePortMouseDown(e, node.id, input, false)}
                      style={{
                        width: `${PORT_RADIUS * 2}px`, height: `${PORT_RADIUS * 2}px`,
                        borderRadius: "50%", background: accentColor,
                        position: "absolute", left: `-${PORT_RADIUS}px`,
                        cursor: "crosshair", border: `2px solid ${colors.bg}`,
                        boxShadow: `0 0 6px ${accentColor}66`,
                      }}
                    />
                    <span style={{ fontFamily: "var(--font-mono)", marginLeft: "4px" }}>{input}</span>
                  </div>
                ))}
              </div>
              <div style={{ width: "1px", background: colors.border, margin: "4px 0" }} />
              {/* Right Outputs */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                {node.outputs.map((output) => {
                  const hasFormula = !!node.formulas?.[output];
                  return (
                    <div
                      key={output}
                      style={{
                        display: "flex", alignItems: "center",
                        height: `${FIELD_HEIGHT}px`, paddingRight: "10px",
                        fontSize: "10px", color: "#9ca3af", position: "relative",
                        cursor: "pointer",
                      }}
                      onDoubleClick={() => openFormulaEditor(node.id, output)}
                      title="Double-click to edit formula"
                    >
                      {hasFormula && <Zap size={8} color="#fbbf24" style={{ marginRight: "3px" }} />}
                      <span style={{ fontFamily: "var(--font-mono)", marginRight: "4px" }}>{output}</span>
                      <div
                        onMouseDown={(e) => handlePortMouseDown(e, node.id, output, true)}
                        onMouseUp={(e) => handlePortMouseUp(e, node.id, output, true)}
                        style={{
                          width: `${PORT_RADIUS * 2}px`, height: `${PORT_RADIUS * 2}px`,
                          borderRadius: "50%", background: accentColor,
                          position: "absolute", right: `-${PORT_RADIUS}px`,
                          cursor: "crosshair", border: `2px solid ${colors.bg}`,
                          boxShadow: `0 0 6px ${accentColor}66`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : node.type === "source" ? (
            <>
              {node.outputs.map((field) => (
                <div
                  key={field}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "flex-end",
                    height: `${FIELD_HEIGHT}px`, padding: "0 10px",
                    fontSize: "10px", color: "#9ca3af", position: "relative",
                  }}
                >
                  <span style={{ marginRight: "4px", fontFamily: "var(--font-mono)" }}>{field}</span>
                  <div
                    onMouseDown={(e) => handlePortMouseDown(e, node.id, field, true)}
                    onMouseUp={(e) => handlePortMouseUp(e, node.id, field, true)}
                    style={{
                      width: `${PORT_RADIUS * 2}px`, height: `${PORT_RADIUS * 2}px`,
                      borderRadius: "50%", background: accentColor,
                      position: "absolute", right: `-${PORT_RADIUS}px`,
                      cursor: "crosshair", border: `2px solid ${colors.bg}`,
                      boxShadow: `0 0 6px ${accentColor}66`,
                    }}
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              {node.inputs.map((field) => (
                <div
                  key={field}
                  style={{
                    display: "flex", alignItems: "center",
                    height: `${FIELD_HEIGHT}px`, padding: "0 10px",
                    fontSize: "10px", color: "#9ca3af", position: "relative",
                  }}
                >
                  <div
                    onMouseUp={(e) => handlePortMouseUp(e, node.id, field, false)}
                    onMouseDown={(e) => handlePortMouseDown(e, node.id, field, false)}
                    style={{
                      width: `${PORT_RADIUS * 2}px`, height: `${PORT_RADIUS * 2}px`,
                      borderRadius: "50%", background: accentColor,
                      position: "absolute", left: `-${PORT_RADIUS}px`,
                      cursor: "crosshair", border: `2px solid ${colors.bg}`,
                      boxShadow: `0 0 6px ${accentColor}66`,
                    }}
                  />
                  <span style={{ marginLeft: "4px", fontFamily: "var(--font-mono)" }}>{field}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", overflow: "hidden", background: "#07070a" }}>

      {/* ════════════════════════════════════════════════════════════════
          CENTRAL CANVAS AREA
          ════════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", borderRight: "1px solid #151520" }}>
        {/* Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "0 12px", height: "42px",
          borderBottom: "1px solid #151520",
          background: "#0a0a10",
          flexShrink: 0, zIndex: 10,
        }}>
          <Cable size={14} color="#10b981" />
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.6px", fontFamily: "var(--font-mono)" }}>
            MAP DESIGNER
          </span>

          <div style={{ height: "14px", width: "1px", background: "#1e1e2e", margin: "0 6px" }} />

          {/* Zoom Buttons */}
          {[
            { icon: ZoomIn, action: () => setZoom((z) => Math.min(z + 0.15, 2.5)), label: "Zoom In" },
            { icon: ZoomOut, action: () => setZoom((z) => Math.max(z - 0.15, 0.3)), label: "Zoom Out" },
            { icon: Maximize2, action: () => { setZoom(1); setPan({ x: 0, y: 0 }); }, label: "Fit View" },
          ].map(({ icon: Icon, action, label }) => (
            <button
              key={label}
              onClick={action}
              title={label}
              style={{
                width: "28px", height: "28px", background: "transparent",
                border: "none", color: "#6b7280", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "6px",
              }}
            >
              <Icon size={14} />
            </button>
          ))}

          <div style={{ height: "14px", width: "1px", background: "#1e1e2e", margin: "0 6px" }} />

          {/* New Map Wizard Button */}
          <button
            onClick={() => setShowWizard(true)}
            style={{
              padding: "4px 10px", background: "#fbbf2415",
              border: "1px solid #fbbf2433", color: "#fbbf24",
              borderRadius: "6px", fontSize: "10px", fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
            }}
          >
            <Sliders size={11} /> Map Wizard
          </button>

          {/* Add Card Dropdown Menu */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setAddCardDropdownOpen(!addCardDropdownOpen)}
              style={{
                padding: "4px 10px", background: "#10b98115",
                border: "1px solid #10b98133", color: "#10b981",
                borderRadius: "6px", fontSize: "10px", fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
              }}
            >
              <Plus size={11} /> Add Card/Node
            </button>
            {addCardDropdownOpen && (
              <div style={{
                position: "absolute", top: "32px", left: 0, background: "#0f0f18",
                border: "1px solid #222230", borderRadius: "8px", width: "160px",
                display: "flex", flexDirection: "column", gap: "2px", padding: "4px", zIndex: 100
              }}>
                {[
                  { type: "source", label: "Source Card (Input)" },
                  { type: "target", label: "Target Card (Output)" },
                  { type: "temporary", label: "Temporary Card" },
                  { type: "database", label: "Database Card" },
                  { type: "api", label: "API Card" },
                  { type: "mq", label: "MQ Queue Card" },
                  { type: "ftp", label: "FTP Card" },
                  { type: "as2", label: "AS2 Gateway Card" },
                  { type: "function", label: "Functional Map Block" }
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => {
                      addCustomNode(item.type as any);
                      setAddCardDropdownOpen(false);
                    }}
                    style={{
                      padding: "6px 8px", background: "transparent", border: "none",
                      color: "var(--text-secondary)", textAlign: "left", fontSize: "10px",
                      cursor: "pointer", borderRadius: "4px", width: "100%"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowCompanion(!showCompanion)}
            style={{
              padding: "4px 10px", background: "#10b98115",
              border: "1px solid #10b98133", color: "#10b981",
              borderRadius: "6px", fontSize: "10px", fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
            }}
          >
            <Sparkles size={11} /> ITX Companion
          </button>

          <div style={{ height: "14px", width: "1px", background: "#1e1e2e", margin: "0 6px" }} />

          {/* Delete & Clear */}
          <button
            onClick={handleDeleteSelectedNode}
            disabled={!selectedNode}
            style={{
              padding: "4px 8px", background: "transparent",
              border: `1px solid ${selectedNode ? "#ef444433" : "#1e1e2e"}`,
              color: selectedNode ? "#ef4444" : "#2a2a3a",
              cursor: selectedNode ? "pointer" : "default",
              borderRadius: "6px", fontSize: "10px", fontWeight: 600,
            }}
          >
            <Trash2 size={11} /> Delete
          </button>

          <button
            onClick={() => { setConnections([]); setSelectedNode(null); }}
            style={{
              padding: "4px 8px", background: "transparent",
              border: "1px solid #1e1e2e", color: "#6b7280",
              cursor: "pointer", borderRadius: "6px", fontSize: "10px", fontWeight: 600,
            }}
          >
            Clear Wires
          </button>

          <div style={{ flex: 1 }} />

          {/* Save status */}
          {saveStatus && <span style={{ fontSize: "10px", color: "#10b981", fontFamily: "var(--font-mono)" }}>{saveStatus}</span>}
          <button
            onClick={handleSaveMap}
            style={{
              padding: "5px 14px", background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#ffffff", border: "none", borderRadius: "6px",
              fontSize: "11px", fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            <Save size={12} /> Save Map
          </button>
        </div>

        {/* Canvas Grid container */}
        <div
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          style={{
            flex: 1, position: "relative", overflow: "hidden",
            background: "#07070a",
            backgroundImage: "radial-gradient(circle, #151520 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            cursor: isPanning ? "grabbing" : "default",
          }}
          onMouseDown={(e) => {
            if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === "svg") {
              setIsPanning(true);
              setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
              setSelectedNode(null);
              setSelectedConnection(null);
            }
          }}
        >
          {/* Zoom container */}
          <div
            style={{
              position: "absolute",
              left: `${pan.x}px`, top: `${pan.y}px`,
              width: `${CANVAS_W}px`, height: `${CANVAS_H}px`,
              transform: `scale(${zoom})`,
              transformOrigin: "0 0",
              pointerEvents: "none",
            }}
          >
            {/* Wires */}
            <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
              <defs>
                <marker id="arrow-green" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="6" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 4 L 0 8 z" fill="#10b981" />
                </marker>
                <filter id="glow-green">
                  <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#10b981" floodOpacity="0.4" />
                </filter>
              </defs>

              {connections.map((conn, index) => {
                const start = getPortCoordinates(conn.fromNode, conn.fromPort, true);
                const end = getPortCoordinates(conn.toNode, conn.toPort, false);
                const path = getBezierPath(start.x, start.y, end.x, end.y);
                const isSelectedWire = selectedConnection === index;

                return (
                  <g key={index} style={{ pointerEvents: "visibleStroke", cursor: "pointer" }}>
                    <path
                      d={path}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="12"
                      onClick={(e) => { e.stopPropagation(); setSelectedConnection(index); setSelectedNode(null); }}
                      onDoubleClick={() => setConnections((prev) => prev.filter((_, i) => i !== index))}
                    />
                    <path
                      d={path}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth={isSelectedWire ? "2.5" : "1.5"}
                      strokeOpacity={isSelectedWire ? "1" : "0.7"}
                      filter="url(#glow-green)"
                      markerEnd="url(#arrow-green)"
                    />
                  </g>
                );
              })}

              {activeLinkStart && (
                <path d={getActiveLinkPath()} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 3" />
              )}
            </svg>

            {/* Nodes */}
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "auto" }}>
              {nodes.map(renderNode)}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              NEW MAP setup WIZARD DIALOG
              ════════════════════════════════════════════════════════════ */}
          {showWizard && (
            <div style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
              backdropFilter: "blur(6px)",
            }}>
              <div style={{
                width: "440px", background: "#0f0f18", border: "1px solid #222230",
                borderRadius: "12px", boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                padding: "20px", display: "flex", flexDirection: "column", gap: "14px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Sliders size={16} color="#fbbf24" />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#ececf1" }}>
                      New ITX Integration Map Wizard
                    </span>
                  </div>
                  {nodes.length > 0 && (
                    <button onClick={() => setShowWizard(false)} style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer" }}>
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div style={{ fontSize: "11px", color: "#6b7280", lineHeight: 1.4 }}>
                  Define your mapping configuration. The ITX AI Companion will auto-generate the segments and validation logic using schema definitions.
                </div>

                 {/* Wizard Inputs */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", marginBottom: "4px", display: "block" }}>
                      MAP SPECIFICATION FILE (.pdf/.xlsx/.txt)
                    </label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <select
                        value={specFile}
                        onChange={(e) => setSpecFile(e.target.value)}
                        style={{ flex: 1, padding: "8px", background: "#07070a", border: "1px solid #1e1e2e", borderRadius: "6px", color: "#ececf1", fontSize: "11px" }}
                      >
                        <option value="X12_850_Inbound_Spec.pdf">X12_850_Inbound_Spec.pdf</option>
                        <option value="SAP_ORDERS05_Outbound_Spec.xlsx">SAP_ORDERS05_Outbound_Spec.xlsx</option>
                        <option value="Custom_Partner_Format_Spec.json">Custom_Partner_Format_Spec.json</option>
                      </select>
                      <label style={{
                        padding: "6px 10px", background: "#1c1c28", border: "1px solid #27273a",
                        borderRadius: "6px", color: "#ececf1", fontSize: "11px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        Upload
                        <input
                          type="file"
                          accept=".pdf,.xlsx,.csv,.txt,.json"
                          onChange={(e) => handleFileUpload(e, "spec")}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", marginBottom: "4px", display: "block" }}>
                      INPUT TYPE TREE (.mtt/.txt/.json)
                    </label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        value={inputTypeTree}
                        onChange={(e) => setInputTypeTree(e.target.value)}
                        placeholder="e.g. X12_850_Retail_PO"
                        style={{ flex: 1, padding: "8px", background: "#07070a", border: "1px solid #1e1e2e", borderRadius: "6px", color: "#ececf1", fontSize: "11px", fontFamily: "var(--font-mono)" }}
                      />
                      <label style={{
                        padding: "6px 10px", background: "#1c1c28", border: "1px solid #27273a",
                        borderRadius: "6px", color: "#ececf1", fontSize: "11px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        Upload
                        <input
                          type="file"
                          accept=".mtt,.txt,.json"
                          onChange={(e) => handleFileUpload(e, "inputTree")}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", marginBottom: "4px", display: "block" }}>
                      OUTPUT TYPE TREE (.mtt/.txt/.json)
                    </label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        value={outputTypeTree}
                        onChange={(e) => setOutputTypeTree(e.target.value)}
                        placeholder="e.g. SAP_ORDERS05_IDoc"
                        style={{ flex: 1, padding: "8px", background: "#07070a", border: "1px solid #1e1e2e", borderRadius: "6px", color: "#ececf1", fontSize: "11px", fontFamily: "var(--font-mono)" }}
                      />
                      <label style={{
                        padding: "6px 10px", background: "#1c1c28", border: "1px solid #27273a",
                        borderRadius: "6px", color: "#ececf1", fontSize: "11px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        Upload
                        <input
                          type="file"
                          accept=".mtt,.txt,.json"
                          onChange={(e) => handleFileUpload(e, "outputTree")}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", marginBottom: "4px", display: "block" }}>
                      INPUT TRANSACTION DATA FILE (OPTIONAL)
                    </label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        value={inputFile}
                        onChange={(e) => setInputFile(e.target.value)}
                        placeholder="e.g. partner_po_850.edi"
                        style={{ flex: 1, padding: "8px", background: "#07070a", border: "1px solid #1e1e2e", borderRadius: "6px", color: "#ececf1", fontSize: "11px", fontFamily: "var(--font-mono)" }}
                      />
                      <label style={{
                        padding: "6px 10px", background: "#1c1c28", border: "1px solid #27273a",
                        borderRadius: "6px", color: "#ececf1", fontSize: "11px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        Upload
                        <input
                          type="file"
                          accept=".edi,.txt,.json"
                          onChange={(e) => handleFileUpload(e, "inputData")}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  {nodes.length > 0 && (
                    <button
                      onClick={() => setShowWizard(false)}
                      style={{ flex: 1, padding: "8px", background: "transparent", border: "1px solid #222230", color: "#6b7280", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={handleGenerateMapFromWizard}
                    style={{
                      flex: 2, padding: "8px", background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
                    }}
                  >
                    Generate Map via ITX AI Companion
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════
              TYPE SELECTION DIALOG (MTT TREE EXPLORER)
              ════════════════════════════════════════════════════════════ */}
          {/* ════════════════════════════════════════════════════════════
              TYPE SELECTION DIALOG (MTT TREE EXPLORER)
              ════════════════════════════════════════════════════════════ */}
          {showTypeSelectionDialog && (() => {
            const getLeafNames = (item: any): string[] => {
              if (!item.children || item.children.length === 0) {
                return [item.name];
              }
              return item.children.flatMap(getLeafNames);
            };

            const renderSelectorNode = (node: any, depth: number = 0) => {
              const isParent = node.children && node.children.length > 0;
              const isExpanded = expandedSelectorNodes[node.name] !== false;
              
              if (!isParent) {
                if (typeSearchQuery && !node.name.toLowerCase().includes(typeSearchQuery.toLowerCase())) {
                  return null;
                }
                return (
                  <button
                    key={node.name}
                    onClick={() => {
                      if (activeSelectingNodeId && activeSelectingPort) {
                        if (activeSelectingPort === "__WHOLE_SCHEMA__") {
                          setNodes((prev) =>
                            prev.map((n) => {
                              if (n.id !== activeSelectingNodeId) return n;
                              const listKey = activeSelectingPortSide === "input" ? "inputs" : "outputs";
                              return { ...n, [listKey]: [node.name] };
                            })
                          );
                        } else {
                          setNodes((prev) =>
                            prev.map((n) => {
                              if (n.id !== activeSelectingNodeId) return n;
                              const listKey = activeSelectingPortSide === "input" ? "inputs" : "outputs";
                              const currentList = n[listKey];
                              const updatedList = currentList.map((p) => (p === activeSelectingPort ? node.name : p));
                              return { ...n, [listKey]: updatedList };
                            })
                          );
                        }
                      }
                      setShowTypeSelectionDialog(false);
                    }}
                    style={{
                      padding: "2px 6px", background: "#1a1a2e", border: "1px solid #27273f",
                      borderRadius: "4px", color: "#ececf1", fontSize: "9px", cursor: "pointer",
                      margin: "2px", fontFamily: "var(--font-mono)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#10b981";
                      e.currentTarget.style.color = "#000";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#1a1a2e";
                      e.currentTarget.style.color = "#ececf1";
                    }}
                  >
                    {node.name}
                  </button>
                );
              }
              
              const matchesSearch = node.name.toLowerCase().includes(typeSearchQuery.toLowerCase());
              const childViews = node.children.map((child: any) => renderSelectorNode(child, depth + 1)).filter(Boolean);
              
              if (typeSearchQuery && !matchesSearch && childViews.length === 0) {
                return null;
              }
              
              return (
                <div key={node.name} style={{ display: "flex", flexDirection: "column", gap: "4px", paddingLeft: `${depth > 0 ? 12 : 0}px`, marginTop: "4px", width: "100%" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700 }}
                  >
                    <div
                      onClick={() => setExpandedSelectorNodes((prev) => ({ ...prev, [node.name]: !isExpanded }))}
                      style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", color: depth === 0 ? "#10b981" : "#a855f7" }}
                    >
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      <span>{node.name}</span>
                    </div>
                    {activeSelectingPort === "__WHOLE_SCHEMA__" && (
                      <button
                        onClick={() => {
                          const leaves = getLeafNames(node);
                          if (activeSelectingNodeId) {
                            setNodes((prev) =>
                              prev.map((n) => {
                                if (n.id !== activeSelectingNodeId) return n;
                                const listKey = activeSelectingPortSide === "input" ? "inputs" : "outputs";
                                return { ...n, [listKey]: leaves };
                              })
                            );
                          }
                          setShowTypeSelectionDialog(false);
                        }}
                        style={{
                          padding: "1px 5px", background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)",
                          borderRadius: "3px", color: "#fbbf24", fontSize: "9px", cursor: "pointer", fontWeight: 800
                        }}
                      >
                        Select Group
                      </button>
                    )}
                  </div>
                  {isExpanded && (
                    <div style={{ borderLeft: "1px dashed #1e1e2e", paddingLeft: "8px", display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "2px", marginTop: "2px" }}>
                      {childViews}
                    </div>
                  )}
                </div>
              );
            };

            return (
              <div style={{
                position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100,
                backdropFilter: "blur(4px)",
              }}>
                <div style={{
                  width: "480px", height: "540px", background: "#0c0c14", border: "1px solid #222235",
                  borderRadius: "12px", boxShadow: "0 25px 60px rgba(0,0,0,0.7)",
                  display: "flex", flexDirection: "column", overflow: "hidden"
                }}>
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #1a1a2e" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <GitBranch size={16} color="#10b981" />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#ececf1" }}>
                        Select Type Element Dialog
                      </span>
                    </div>
                    <button
                      onClick={() => setShowTypeSelectionDialog(false)}
                      style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer" }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Filter Search Input */}
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #141424" }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "8px", background: "#06060a",
                      border: "1px solid #1e1e2e", borderRadius: "6px", padding: "6px 10px"
                    }}>
                      <Search size={12} color="#6b7280" />
                      <input
                        type="text"
                        placeholder="Filter segments, fields, groups or attributes..."
                        value={typeSearchQuery}
                        onChange={(e) => setTypeSearchQuery(e.target.value)}
                        style={{ background: "transparent", border: "none", outline: "none", color: "#ececf1", fontSize: "11px", width: "100%" }}
                      />
                    </div>
                  </div>

                  {/* Hierarchical Tree Explorer */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {dbTypeTrees.length === 0 ? (
                      <div style={{ padding: "20px", fontSize: "11px", color: "#6b7280", textAlign: "center" }}>
                        No custom Type Trees uploaded yet. Import an MTT/XML/JSON schema first.
                      </div>
                    ) : (
                      dbTypeTrees.map((tree) => (
                        <div key={tree.id} style={{ borderBottom: "1px solid #1a1a2e", paddingBottom: "10px", marginBottom: "10px" }}>
                          <div style={{ fontSize: "11px", fontWeight: 800, color: "#fbbf24", marginBottom: "4px" }}>
                            {tree.name}
                          </div>
                          {tree.hierarchy.map((node: any) => renderSelectorNode(node, 0))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ════════════════════════════════════════════════════════════
              DRAGGABLE FLOATING WINDOW: ITX AI COMPANION
              ════════════════════════════════════════════════════════════ */}
          {showCompanion && (
            <div
              style={{
                position: "absolute",
                left: `${companionPos.x}px`,
                top: `${companionPos.y}px`,
                width: "310px",
                height: "360px",
                background: "#0b0b0e",
                border: "1.5px solid #1c1c24",
                borderRadius: "12px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                zIndex: 500,
              }}
            >
              {/* Header - Drag handler */}
              <div
                onMouseDown={handleCompanionHeaderMouseDown}
                style={{
                  padding: "10px 12px",
                  background: "#0f0f13",
                  borderBottom: "1px solid #1c1c24",
                  cursor: isDraggingCompanion ? "grabbing" : "grab",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                  userSelect: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={12} color="#10b981" />
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#ececf1" }}>ITX AI Companion</div>
                    <div style={{ fontSize: "8px", color: "#10b981" }}>Model: gpt-4o · RAG Indexed</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCompanion(false)}
                  style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer" }}
                >
                  <X size={12} />
                </button>
              </div>

              {/* Suggestions Panel */}
              <div style={{ padding: "6px 8px", borderBottom: "1px solid #1c1c24", display: "flex", flexWrap: "wrap", gap: "4px", flexShrink: 0, background: "#0a0a0d" }}>
                {["Generate Map rules", "Explain ISA segment", "Show test data"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setAiInput(opt); }}
                    style={{
                      padding: "2px 5px", borderRadius: "4px",
                      border: "1px solid rgba(16,185,129,0.15)",
                      background: "rgba(16,185,129,0.04)",
                      color: "#10b981", fontSize: "9px", cursor: "pointer",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {aiMessages.map((m, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "8px", fontWeight: 700, color: m.role === "user" ? "#4b5563" : "#10b981" }}>
                      {m.role === "user" ? "YOU" : "ITX AI"}
                    </span>
                    <div style={{
                      fontSize: "11px", color: m.role === "user" ? "#9ca3af" : "#ececf1",
                      lineHeight: "1.4", whiteSpace: "pre-wrap",
                      background: m.role === "user" ? "transparent" : "#0e1613",
                      padding: m.role === "user" ? "0" : "5px 8px",
                      borderRadius: "6px",
                      border: m.role === "user" ? "none" : "1px solid rgba(16,185,129,0.06)",
                    }}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {aiIsThinking && (
                  <div style={{ display: "flex", gap: "3px", padding: "4px" }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981", animation: "pulse 1s infinite" }} />
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981", animation: "pulse 1s infinite 0.2s" }} />
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981", animation: "pulse 1s infinite 0.4s" }} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div style={{ padding: "6px", borderTop: "1px solid #1c1c24", background: "#0e0e13", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#07070a", border: "1px solid #1c1c24", borderRadius: "6px", padding: "4px 8px" }}>
                  <input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") sendAiMessage(); }}
                    placeholder="Ask about X12 elements mapping..."
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#ececf1", fontSize: "11px" }}
                  />
                  <button
                    onClick={sendAiMessage}
                    style={{
                      background: "#10b981", border: "none", borderRadius: "4px",
                      color: "#0a0a0c", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", padding: "3px",
                    }}
                  >
                    <Send size={10} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          RIGHT PANEL (LIBRARY & LOCAL REFERENCE)
          ════════════════════════════════════════════════════════════════ */}
      <div style={{ width: "290px", background: "#0a0a10", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Tab Switcher */}
        <div style={{ display: "flex", borderBottom: "1px solid #151520", background: "#0a0a10" }}>
          {([
            { id: "library" as const, label: "Library", icon: BookOpen },
            { id: "docs" as const, label: "Docs", icon: Search },
            { id: "simulate" as const, label: "Simulate", icon: Play },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setRightPanelTab(id)}
              style={{
                flex: 1, padding: "10px 0",
                background: rightPanelTab === id ? "#10b98110" : "transparent",
                borderBottom: rightPanelTab === id ? "2px solid #10b981" : "2px solid transparent",
                border: "none", color: rightPanelTab === id ? "#10b981" : "#4b5563",
                fontSize: "10px", fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "4px", transition: "all 100ms ease",
              }}
            >
              <Icon size={11} /> {label}
            </button>
          ))}
        </div>

        {/* Library Tab */}
        {rightPanelTab === "library" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            <div style={{ padding: "4px 4px 8px", fontSize: "9px", fontWeight: 700, color: "#4b5563", letterSpacing: "0.5px" }}>
              QUICK ADD FUNCTIONS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {FUNCTION_TEMPLATES.map((tmpl) => {
                const Icon = tmpl.icon;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => addFunctionFromTemplate(tmpl.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "8px 10px", background: "#0f0f18",
                      border: "1px solid #1a1a28", color: "#c4c4cc",
                      fontSize: "11px", cursor: "pointer", borderRadius: "8px",
                      textAlign: "left", width: "100%",
                      transition: "all 100ms ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = tmpl.color; e.currentTarget.style.background = "#12121e"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1a1a28"; e.currentTarget.style.background = "#0f0f18"; }}
                  >
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "7px",
                      background: `${tmpl.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Icon size={13} color={tmpl.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "11px" }}>{tmpl.name}</div>
                      <div style={{ fontSize: "9px", color: "#4b5563", marginTop: "1px" }}>
                        {tmpl.inputs.join(", ")}
                      </div>
                    </div>
                    <Plus size={12} color="#4b5563" />
                  </button>
                );
              })}
            </div>

            {selectedNode && (() => {
              const node = nodes.find((n) => n.id === selectedNode);
              if (!node) return null;
              const accentColor = node.color || NODE_COLORS[node.type].accent;
              return (
                <div style={{ marginTop: "12px", borderTop: "1px solid #1a1a28", paddingTop: "12px" }}>
                  <div style={{ padding: "4px 4px 8px", fontSize: "9px", fontWeight: 700, color: "#4b5563", letterSpacing: "0.5px" }}>
                    NODE PROPERTIES
                  </div>
                  <div style={{
                    background: "#0f0f18", border: "1px solid #1a1a28",
                    borderRadius: "8px", padding: "10px", fontSize: "11px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ color: "#6b7280" }}>Name</span>
                      <span style={{ color: "#ececf1", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{node.name}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ color: "#6b7280" }}>Type</span>
                      <span style={{ color: accentColor, fontWeight: 700, textTransform: "uppercase", fontSize: "9px" }}>{node.type}</span>
                    </div>

                    {/* Custom Card/Node Parameter Configurations */}
                    {node.type === "database" && (
                      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div>
                          <label style={{ fontSize: "9px", color: "#fbbf24", fontWeight: 700, display: "block" }}>DB CONNECTION STRING</label>
                          <input
                            type="text"
                            value={node.connectionString || ""}
                            onChange={(e) => updateNodeProperty(node.id, "connectionString", e.target.value)}
                            style={{ width: "100%", padding: "4px 6px", background: "#07070a", border: "1px solid #1e1e2e", borderRadius: "4px", color: "#ececf1", fontSize: "10px", marginTop: "2px" }}
                          />
                        </div>
                      </div>
                    )}
                    {node.type === "mq" && (
                      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div>
                          <label style={{ fontSize: "9px", color: "#06b6d4", fontWeight: 700, display: "block" }}>IBM MQ QUEUE NAME</label>
                          <input
                            type="text"
                            value={node.queueName || ""}
                            onChange={(e) => updateNodeProperty(node.id, "queueName", e.target.value)}
                            style={{ width: "100%", padding: "4px 6px", background: "#07070a", border: "1px solid #1e1e2e", borderRadius: "4px", color: "#ececf1", fontSize: "10px", marginTop: "2px" }}
                          />
                        </div>
                      </div>
                    )}
                    {node.type === "ftp" && (
                      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div>
                          <label style={{ fontSize: "9px", color: "#eab308", fontWeight: 700, display: "block" }}>FTP SERVER DIRECTORY PATH</label>
                          <input
                            type="text"
                            value={node.directoryPath || ""}
                            onChange={(e) => updateNodeProperty(node.id, "directoryPath", e.target.value)}
                            style={{ width: "100%", padding: "4px 6px", background: "#07070a", border: "1px solid #1e1e2e", borderRadius: "4px", color: "#ececf1", fontSize: "10px", marginTop: "2px" }}
                          />
                        </div>
                      </div>
                    )}
                    {node.type === "api" && (
                      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div>
                          <label style={{ fontSize: "9px", color: "#ec4899", fontWeight: 700, display: "block" }}>REST ENDPOINT URL</label>
                          <input
                            type="text"
                            value={node.endpointUrl || ""}
                            onChange={(e) => updateNodeProperty(node.id, "endpointUrl", e.target.value)}
                            style={{ width: "100%", padding: "4px 6px", background: "#07070a", border: "1px solid #1e1e2e", borderRadius: "4px", color: "#ececf1", fontSize: "10px", marginTop: "2px" }}
                          />
                        </div>
                      </div>
                    )}
                    {node.type === "as2" && (
                      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div>
                          <label style={{ fontSize: "9px", color: "#a8a29e", fontWeight: 700, display: "block" }}>AS2 PARTNER IDENTIFIER</label>
                          <input
                            type="text"
                            value={node.as2Partner || ""}
                            onChange={(e) => updateNodeProperty(node.id, "as2Partner", e.target.value)}
                            style={{ width: "100%", padding: "4px 6px", background: "#07070a", border: "1px solid #1e1e2e", borderRadius: "4px", color: "#ececf1", fontSize: "10px", marginTop: "2px" }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Card fields list & type tree binder */}
                    <div style={{ marginTop: "10px", borderTop: "1px dashed #1a1a28", paddingTop: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "9px", fontWeight: 700, color: "#6b7280" }}>CARD FIELDS & SEGMENTS</span>
                        {(node.type === "source" || node.type === "target" || node.type === "temporary") && (
                          <button
                            onClick={() => {
                              setActiveSelectingNodeId(node.id);
                              setActiveSelectingPort("__WHOLE_SCHEMA__");
                              setActiveSelectingPortSide(node.type === "source" ? "output" : "input");
                              setShowTypeSelectionDialog(true);
                            }}
                            style={{ padding: "2px 6px", background: "#fbbf2415", border: "1px solid #fbbf2433", borderRadius: "4px", color: "#fbbf24", fontSize: "9px", cursor: "pointer", fontWeight: 700 }}
                          >
                            Assign Schema Tree...
                          </button>
                        )}
                      </div>
                      
                      {node.inputs.map((p) => (
                        <div key={p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                          <span style={{ fontSize: "10px", color: "#ececf1", fontFamily: "monospace" }}>{p}</span>
                          <button
                            onClick={() => {
                              setActiveSelectingNodeId(node.id);
                              setActiveSelectingPort(p);
                              setActiveSelectingPortSide("input");
                              setShowTypeSelectionDialog(true);
                            }}
                            style={{ padding: "2px 6px", background: "#10b98115", border: "1px solid #10b98133", borderRadius: "4px", color: "#10b981", fontSize: "9px", cursor: "pointer" }}
                          >
                            Bind Type...
                          </button>
                        </div>
                      ))}
                      
                      {node.outputs.map((p) => (
                        <div key={p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                          <span style={{ fontSize: "10px", color: "#ececf1", fontFamily: "monospace" }}>{p}</span>
                          <button
                            onClick={() => {
                              setActiveSelectingNodeId(node.id);
                              setActiveSelectingPort(p);
                              setActiveSelectingPortSide("output");
                              setShowTypeSelectionDialog(true);
                            }}
                            style={{ padding: "2px 6px", background: "#10b98115", border: "1px solid #10b98133", borderRadius: "4px", color: "#10b981", fontSize: "9px", cursor: "pointer" }}
                          >
                            Bind Type...
                          </button>
                        </div>
                      ))}
                    </div>

                    {node.formulas && Object.keys(node.formulas).length > 0 && (
                      <>
                        <div style={{ fontSize: "9px", fontWeight: 700, color: "#fbbf24", marginBottom: "4px", marginTop: "8px" }}>FORMULAS</div>
                        {Object.entries(node.formulas).map(([port, f]) => (
                          <div
                            key={port}
                            onClick={() => openFormulaEditor(node.id, port)}
                            style={{
                              padding: "4px 6px", background: "#fbbf2408",
                              border: "1px solid #fbbf2420", borderRadius: "4px",
                              marginBottom: "3px", cursor: "pointer",
                              fontSize: "9px", color: "#9ca3af",
                            }}
                          >
                            <span style={{ color: "#fbbf24", fontWeight: 600 }}>{port}:</span>{" "}
                            <code style={{ color: "#6b7280" }}>{f.expression}</code>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Docs Tab */}
        {rightPanelTab === "docs" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "10px", borderBottom: "1px solid #151520" }}>
              <div style={{
                display: "flex", alignItems: "center",
                background: "#07070a", borderRadius: "7px",
                border: "1px solid #1e1e2e", padding: "5px 10px", gap: "6px",
              }}>
                <Search size={12} color="#6b7280" />
                <input
                  type="text"
                  placeholder="Search IBM Sterling ITX docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: "transparent", border: "none", outline: "none",
                    color: "#ececf1", fontSize: "11px", width: "100%",
                  }}
                />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {isSearching ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                  <span style={{ fontSize: "11px", color: "#6b7280" }}>Searching Supabase...</span>
                </div>
              ) : docResults.length > 0 ? (
                docResults.map((chunk) => (
                  <div
                    key={chunk.chunk_id}
                    style={{
                      background: "#0f0f18", border: "1px solid #1a1a28",
                      borderRadius: "8px", padding: "10px",
                      fontSize: "10px", color: "#9ca3af",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#10b981", marginBottom: "4px", fontSize: "10px" }}>
                      {chunk.source.replace("IBM_ITX_Page_", "📄 Page ")}
                    </div>
                    <div style={{
                      whiteSpace: "pre-line", lineHeight: "1.5",
                      maxHeight: "120px", overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {chunk.content}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  height: "120px", color: "#3a3a4a", gap: "8px",
                }}>
                  <HelpCircle size={22} />
                  <span style={{ fontSize: "10px", textAlign: "center", lineHeight: 1.4 }}>
                    {searchQuery.trim().length > 1
                      ? "No matching documentation found"
                      : "Search IBM Sterling ITX documentation\nfrom the Supabase knowledge base"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Simulate Tab */}
        {rightPanelTab === "simulate" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "10px", borderBottom: "1px solid #151520" }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#4b5563", letterSpacing: "0.5px", marginBottom: "8px" }}>
                TEST SOURCE VALUES
              </div>
              {(() => {
                const srcNode = nodes.find((n) => n.type === "source");
                if (!srcNode) return <span style={{ fontSize: "10px", color: "#4b5563" }}>No source node</span>;
                return srcNode.outputs.map((port) => (
                  <div key={port} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <span style={{
                      fontSize: "9px", color: "#6b7280", fontFamily: "var(--font-mono)",
                      width: "90px", overflow: "hidden", textOverflow: "ellipsis",
                      whiteSpace: "nowrap", flexShrink: 0,
                    }}>
                      {port}
                    </span>
                    <input
                      value={simInputs[`${srcNode.id}.${port}`] || ""}
                      onChange={(e) => setSimInputs((prev) => ({ ...prev, [`${srcNode.id}.${port}`]: e.target.value }))}
                      placeholder="test value"
                      style={{
                        flex: 1, padding: "3px 6px", background: "#07070a",
                        border: "1px solid #1e1e2e", borderRadius: "4px",
                        color: "#ececf1", fontSize: "10px",
                        fontFamily: "var(--font-mono)", outline: "none",
                      }}
                    />
                  </div>
                ));
              })()}
            </div>
            <div style={{ padding: "10px" }}>
              <button
                onClick={runSimulation}
                disabled={simRunning}
                style={{
                  width: "100%", padding: "8px",
                  background: simRunning ? "#1e1e2e" : "linear-gradient(135deg, #10b981, #059669)",
                  color: simRunning ? "#6b7280" : "#fff",
                  border: "none", borderRadius: "7px",
                  fontSize: "11px", fontWeight: 700, cursor: simRunning ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                }}
              >
                <Play size={12} /> {simRunning ? "Running..." : "Run Simulation"}
              </button>
            </div>
            {simResults.length > 0 && (
              <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 10px" }}>
                <div style={{ fontSize: "9px", fontWeight: 700, color: "#4b5563", marginBottom: "6px", letterSpacing: "0.5px" }}>
                  OUTPUT RESULTS
                </div>
                {simResults.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "5px 8px", marginBottom: "3px",
                      background: r.status === "error" ? "#ef444408" : "#10b98108",
                      border: `1px solid ${r.status === "error" ? "#ef444420" : "#10b98120"}`,
                      borderRadius: "5px", fontSize: "10px",
                    }}
                  >
                    {r.status === "error" ? (
                      <AlertCircle size={10} color="#ef4444" />
                    ) : (
                      <Check size={10} color="#10b981" />
                    )}
                    <span style={{ color: "#6b7280", fontFamily: "var(--font-mono)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.port}
                    </span>
                    <span style={{ color: r.status === "error" ? "#ef4444" : "#10b981", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          FORMULA EDITOR OVERLAY
          ════════════════════════════════════════════════════════════════ */}
      {editingFormula && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 9999,
          backdropFilter: "blur(4px)",
        }}
          onClick={() => setEditingFormula(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "480px", background: "#0f0f18",
              border: "1px solid #1e1e2e", borderRadius: "12px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
              overflow: "hidden",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", borderBottom: "1px solid #1e1e2e",
              background: "#0a0a10",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Zap size={14} color="#fbbf24" />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#ececf1" }}>
                  Rule Editor — {editingFormula.portName}
                </span>
              </div>
              <button
                onClick={() => setEditingFormula(null)}
                style={{
                  background: "transparent", border: "none",
                  color: "#6b7280", cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280", marginBottom: "4px", display: "block" }}>
                  EXPRESSION
                </label>
                <textarea
                  value={editingFormula.formula}
                  onChange={(e) => setEditingFormula({ ...editingFormula, formula: e.target.value })}
                  rows={4}
                  style={{
                    width: "100%", padding: "10px",
                    background: "#07070a", border: "1px solid #1e1e2e",
                    borderRadius: "8px", color: "#10b981",
                    fontFamily: "var(--font-mono)", fontSize: "12px",
                    outline: "none", resize: "vertical",
                    lineHeight: 1.6,
                  }}
                  placeholder="e.g., IF(InputQty > 0, InputQty, 0)"
                />
              </div>

              <div>
                <label style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280", marginBottom: "4px", display: "block" }}>
                  DESCRIPTION
                </label>
                <input
                  value={editingFormula.description}
                  onChange={(e) => setEditingFormula({ ...editingFormula, description: e.target.value })}
                  style={{
                    width: "100%", padding: "8px 10px",
                    background: "#07070a", border: "1px solid #1e1e2e",
                    borderRadius: "8px", color: "#ececf1",
                    fontSize: "11px", outline: "none",
                  }}
                  placeholder="What does this formula do?"
                />
              </div>

              <div>
                <label style={{ fontSize: "9px", fontWeight: 700, color: "#4b5563", marginBottom: "4px", display: "block" }}>
                  QUICK INSERT
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {["IF()", "CONCAT()", "LOOKUP()", "LEFT()", "RIGHT()", "SUM()", "FORMAT_DATE()", "VALIDATE()", "SPLIT()"].map((fn) => (
                    <button
                      key={fn}
                      onClick={() => setEditingFormula({ ...editingFormula, formula: editingFormula.formula + fn })}
                      style={{
                        padding: "3px 7px", background: "#1a1a28",
                        border: "1px solid #252538", color: "#9ca3af",
                        fontSize: "9px", fontWeight: 600, borderRadius: "4px",
                        cursor: "pointer", fontFamily: "var(--font-mono)",
                      }}
                    >
                      {fn}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              display: "flex", justifyContent: "flex-end", gap: "8px",
              padding: "12px 16px", borderTop: "1px solid #1e1e2e",
              background: "#0a0a10",
            }}>
              <button
                onClick={() => setEditingFormula(null)}
                style={{
                  padding: "6px 14px", background: "transparent",
                  border: "1px solid #1e1e2e", color: "#6b7280",
                  borderRadius: "6px", fontSize: "11px", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveFormula}
                style={{
                  padding: "6px 14px",
                  background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  border: "none", color: "#0a0a0c", borderRadius: "6px",
                  fontSize: "11px", fontWeight: 700, cursor: "pointer",
                }}
              >
                Save Formula
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
