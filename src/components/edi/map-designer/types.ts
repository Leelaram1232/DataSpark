/* ═══════════════════════════════════════════════════════════════════════════
   DataSpark AI Map Designer — Shared Type Definitions
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Tree Structure Types ─────────────────────────────────────────────────

export interface TreeNodeData {
  id: string;
  name: string;
  type: "element" | "attribute" | "segment" | "loop" | "composite" | "group" | "root";
  dataType?: string; // xs:string, AN, N0, DT, AN..35, etc.
  occurrence?: string; // [0..1], [1..999], etc.
  children?: TreeNodeData[];
  isMapped?: boolean;
  mappedTo?: string;
  mappingBadge?: "MAP" | "IF" | "CONSTANT" | "LOOKUP" | "CALCULATE" | "NONE";
  description?: string;
  depth?: number;
}

export interface TypeTreeConfig {
  id: string;
  name: string;          // e.g. "Input_Invoice.xsd", "In_310_FreightReceipt.x12"
  format: SourceFormat;
  rootNodes: TreeNodeData[];
  totalFields: number;
  badge?: string;        // "XSD", "X12", "EDI", "JSON"
}

// ── Source/Target Format Types ───────────────────────────────────────────

export type SourceFormat = "XML" | "ANSI_X12" | "EDIFACT" | "JSON" | "CSV" | "FIXED_WIDTH" | "SAP_IDOC";

export const X12_TRANSACTION_SETS = [
  "204", "210", "214", "310", "315", "810", "820", "824", "830", "850", "855", "856", "940", "943", "945", "997",
] as const;

export const EDIFACT_MESSAGE_TYPES = [
  "ORDERS", "DESADV", "IFTSTA", "INVOIC", "PREADV", "RECADV", "APERAK", "INVRPT",
] as const;

export type X12TransactionSet = typeof X12_TRANSACTION_SETS[number];
export type EdifactMessageType = typeof EDIFACT_MESSAGE_TYPES[number];

// ── Logic Node Types ─────────────────────────────────────────────────────

export type LogicNodeType =
  | "MAP" | "IF" | "ELSE" | "SWITCH" | "LOOP" | "FOREACH"
  | "LOOKUP" | "CALCULATE" | "FUNCTION" | "CONSTANT" | "DEFAULT VALUE"
  | "VALIDATION" | "SORT" | "FILTER" | "GROUP" | "PARSE" | "FORMAT"
  | "DATE" | "STRING" | "NUMBER" | "CONCAT" | "SUBSTRING" | "TRIM"
  | "UPPER" | "LOWER" | "PAD" | "SPLIT" | "MERGE" | "CUSTOM FUNCTION"
  | "VALIDATE" | "CONDITIONS" | "NONE";

export interface SourceFieldPill {
  id: string;
  label: string; // e.g. "Header.MessageId", "Party.Name"
  path: string;
  dataType?: string;
  x: number;
  y: number;
}

export interface TargetFieldPill {
  id: string;
  label: string; // e.g. "Header.MessageID", "Party.@PartyType"
  path: string;
  dataType?: string;
  confidence?: string; // "100%"
  x: number;
  y: number;
}

export interface LogicNodeData {
  id: string;
  type: LogicNodeType;
  title: string;
  subtitle?: string;
  details?: string;          // Formula or condition expression
  sourceRef?: string;        // e.g. "Header", "AddressSection"
  targetRef?: string;        // e.g. "HEAD", "ReceiptParty"
  trueLabel?: string;
  falseLabel?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  mappingType?: "MAP" | "CONSTANT" | "LOOKUP" | "CALCULATE" | "IF" | "NONE";
  sourcePath?: string;
  targetPath?: string;
  expression?: string;
  confidence?: string;
  specReference?: string;
}

// ── Connector Types ──────────────────────────────────────────────────────

export type ConnectorColor = "teal" | "red" | "green" | "orange" | "purple" | "amber" | "blue" | "pink";

export interface ConnectorData {
  id: string;
  fromType: "tree" | "logic";
  fromId: string;
  fromField?: string;
  toType: "tree" | "logic";
  toId: string;
  toField?: string;
  color: ConnectorColor;
  animated?: boolean;
  label?: string; // "True", "False"
  style?: "solid" | "dashed";
}

// ── Functional Map Types ─────────────────────────────────────────────────

export interface FunctionalMapCard {
  id: string;
  name: string; // F_Header, F_Parties, F_Items, etc.
  status: "Active" | "Draft" | "Error";
  rules: string[];
  color: string;
  stats?: { rules: number; conditions: number; consts: number };
}

// ── Mapping Rule Types ───────────────────────────────────────────────────

export interface MappingRule {
  id: number;
  condition: string;
  action: string;
  source: string;
  target: string;
  type: "Map" | "Filter" | "Calculation" | "Lookup" | "Condition" | "Validation";
}

// ── Calculation Types ────────────────────────────────────────────────────

export interface CalculationFormula {
  name: string;
  expression: string;
  highlighted?: boolean;
}

// ── Mapping Summary Types ────────────────────────────────────────────────

export interface MappingSummary {
  totalNodesIn: number;
  totalNodesOut: number;
  mappings: number;
  conditions: number;
  lookups: number;
  calculations: number;
  functions: number;
  validations: number;
  constants: number;
  coverage: number;
  validationIssues: number;
  lastSaved: string;
  mapType: string; // "XML Map", "EDI Map", etc.
}

// ── Wizard Types ─────────────────────────────────────────────────────────

export interface WizardState {
  step: number;
  projectName: string;
  customer: string;
  projectCode: string;
  version: string;
  description: string;
  sourceFormat: SourceFormat;
  sourceTransactionSet: string;
  targetFormat: SourceFormat;
  targetTransactionSet: string;
  specFile: File | null;
  specFileName: string;
}

// ── Build Animation Types ────────────────────────────────────────────────

export interface BuildStep {
  id: string;
  label: string;
  detail: string;
  status: "pending" | "running" | "complete" | "error";
  progress: number; // 0-100
}

export const BUILD_STEPS: Omit<BuildStep, "status" | "progress">[] = [
  { id: "read", label: "Reading Specification", detail: "Parsing document structure and extracting text..." },
  { id: "parse", label: "Parsing Structure", detail: "Identifying segments, loops, and data elements..." },
  { id: "rules", label: "Extracting Business Rules", detail: "Detecting mapping intent and transformation logic..." },
  { id: "conditions", label: "Detecting Conditions", detail: "Analyzing conditional branching and qualifiers..." },
  { id: "funcmaps", label: "Creating Functional Maps", detail: "Generating F_Header, F_Parties, F_Items..." },
  { id: "graph", label: "Building Mapping Graph", detail: "Constructing node connections and data flow..." },
  { id: "validate", label: "Validating Rules", detail: "Cross-referencing spec against generated mappings..." },
  { id: "render", label: "Rendering Canvas", detail: "Drawing visual mapping layout..." },
];

// ── AI Explanation Types ─────────────────────────────────────────────────

export interface AIExplanation {
  description: string;
  conditionsApplied: string[];
  functionsUsed: { name: string; icon: string; count: number }[];
  calculations: string[];
  functionalMapsUsed: string[];
  specReferences: string[];
  keyPoints: string[];
}

// ── Workspace File Tree Types ────────────────────────────────────────────

export interface WorkspaceFile {
  id: string;
  name: string;
  type: "file" | "folder";
  badge?: string;  // "XSD", "X12", "EDI", "PDF", "MAP", "JSON"
  icon?: string;
  children?: WorkspaceFile[];
  isOpen?: boolean;
}

// ── Project Status Types ─────────────────────────────────────────────────

export interface ProjectStatus {
  typeTrees: { done: number; total: number };
  specsParsed: { done: number; total: number };
  mappingRules: number;
  functionalMaps: { done: number; total: number };
  validations: number;
}

// ── Color Constants ──────────────────────────────────────────────────────

export const LOGIC_NODE_COLORS: Record<string, { bg: string; border: string; headerBg: string; accent: string }> = {
  IF:        { bg: "#1a0f0f", border: "#5f2020", headerBg: "#2a1515", accent: "#ef4444" },
  ELSE:      { bg: "#1a0f0f", border: "#5f2020", headerBg: "#2a1515", accent: "#f97316" },
  MAP:       { bg: "#0f1a17", border: "#1a3d2e", headerBg: "#122318", accent: "#10b981" },
  CALCULATE: { bg: "#0f1a14", border: "#1a4d2e", headerBg: "#12291a", accent: "#22c55e" },
  LOOKUP:    { bg: "#1a170f", border: "#4d3a1a", headerBg: "#292015", accent: "#f59e0b" },
  VALIDATE:  { bg: "#0f171a", border: "#1a3d4d", headerBg: "#152329", accent: "#06b6d4" },
  LOOP:      { bg: "#170f1a", border: "#3d1a4d", headerBg: "#231529", accent: "#a855f7" },
  FUNCTION:  { bg: "#0f141a", border: "#1a2e4d", headerBg: "#152029", accent: "#3b82f6" },
  SORT:      { bg: "#1a1a0f", border: "#4d4d1a", headerBg: "#292915", accent: "#eab308" },
  PARSE:     { bg: "#1a0f17", border: "#4d1a3d", headerBg: "#291523", accent: "#ec4899" },
  CONDITIONS:{ bg: "#1a100f", border: "#5f3020", headerBg: "#2a1a15", accent: "#f97316" },
  CONSTANT:  { bg: "#150f1a", border: "#3a1a4d", headerBg: "#1e1529", accent: "#a855f7" },
  NONE:      { bg: "#121216", border: "#222230", headerBg: "#181822", accent: "#6b7280" },
};

export const CONNECTOR_COLORS: Record<ConnectorColor, string> = {
  teal: "#10b981",
  red: "#ef4444",
  green: "#22c55e",
  orange: "#f97316",
  purple: "#a855f7",
  amber: "#f59e0b",
  blue: "#3b82f6",
  pink: "#ec4899",
};

export const FORMAT_BADGES: Record<SourceFormat, { label: string; color: string }> = {
  XML: { label: "XSD", color: "#3b82f6" },
  ANSI_X12: { label: "X12", color: "#10b981" },
  EDIFACT: { label: "EDI", color: "#f59e0b" },
  JSON: { label: "JSON", color: "#a855f7" },
  CSV: { label: "CSV", color: "#06b6d4" },
  FIXED_WIDTH: { label: "FIX", color: "#ec4899" },
  SAP_IDOC: { label: "IDOC", color: "#f97316" },
};
