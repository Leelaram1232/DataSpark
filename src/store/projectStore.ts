import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ProjectFile {
  name: string;
  type: "file" | "folder";
  ext?: string;
  content?: string;
  children?: ProjectFile[];
  open?: boolean;
}

export interface EdiMapData {
  id: string;
  name: string;
  type: string;
  format: string;
  records: string;
  lastRun: string;
  status: "active" | "warning" | "idle" | "error";
  rules: string[];
}

export interface EdiAdapterData {
  name: string;
  type: string;
  status: "connected" | "disconnected" | "warning";
  partner: string;
  count: number;
}

export interface BimElement {
  id: string;
  name: string;
  type: string;
  level: string;
  area: string;
  volume: string;
  finish: string;
  occupancy: string;
}

export interface BimIssue {
  id: string;
  type: string;
  severity: "high" | "medium" | "low";
  desc: string;
  date: string;
}

export interface SpecDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  extractedGlossary: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: "developer" | "architecture" | "edi";
  createdAt: string;
  
  // Developer Workspace Data
  files: ProjectFile[];
  
  // Architecture Workspace Data
  levels: string[];
  grids: string[];
  bimElements: BimElement[];
  bimIssues: BimIssue[];
  worksets: string[];
  phases: string[];
  
  // EDI Workspace Data
  ediMaps: EdiMapData[];
  adapters: EdiAdapterData[];
  typeTrees: string[];
  functionalMaps: string[];
  specifications: SpecDocument[];
  connections: string[];
  deployments: string[];
}

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  activeProject: () => Project | null;
  createProject: (name: string, type: "developer" | "architecture" | "edi") => Project;
  importSampleProject: (type: "developer" | "architecture" | "edi") => Project;
  deleteProject: (id: string) => void;
  setActiveProjectId: (id: string | null) => void;
  addSpecDocument: (projectId: string, doc: SpecDocument) => void;
  addEdiMap: (projectId: string, map: EdiMapData) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      activeProject: () => {
        const state = get();
        return state.projects.find((p) => p.id === state.activeProjectId) || null;
      },
      createProject: (name, type) => {
        const newProject: Project = {
          id: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
          name,
          description: `Custom ${type} engineering workspace.`,
          type,
          createdAt: new Date().toLocaleDateString(),
          files: [
            {
              name: "src",
              type: "folder",
              children: [
                { name: "index.ts", type: "file", ext: "ts", content: `// Project: ${name}\nconsole.log("Hello DataSpark!");\n` }
              ]
            }
          ],
          levels: ["Level 1", "Level 2", "Roof"],
          grids: ["A-1", "A-2", "B-1", "B-2"],
          bimElements: [],
          bimIssues: [],
          worksets: ["Shared Levels and Grids", "Workset1"],
          phases: ["Existing", "New Construction"],
          ediMaps: [],
          adapters: [],
          typeTrees: [],
          functionalMaps: [],
          specifications: [],
          connections: [],
          deployments: [],
        };
        
        set((state) => ({
          projects: [...state.projects, newProject],
          activeProjectId: newProject.id,
        }));
        
        return newProject;
      },
      importSampleProject: (type) => {
        const id = `SMPL-${type.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
        let sample: Project;
        
        if (type === "developer") {
          sample = {
            id,
            name: "DataSpark Engine Demo",
            description: "A sample TypeScript repository for exploring IDE capabilities.",
            type,
            createdAt: new Date().toLocaleDateString(),
            files: [
              {
                name: "src",
                type: "folder",
                children: [
                  {
                    name: "app",
                    type: "folder",
                    children: [
                      { name: "layout.tsx", type: "file", ext: "tsx", content: `"use client";\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}` },
                      { name: "page.tsx", type: "file", ext: "tsx", content: `"use client";\n\nimport { useState } from "react";\n\nexport default function Home() {\n  const [count, setCount] = useState(0);\n  return (\n    <main>\n      <h1>DataSpark Sample App</h1>\n      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>\n    </main>\n  );\n}` },
                      { name: "globals.css", type: "file", ext: "css", content: `body {\n  background: #09090b;\n  color: #fff;\n}` }
                    ]
                  },
                  {
                    name: "components",
                    type: "folder",
                    children: [
                      { name: "Button.tsx", type: "file", ext: "tsx", content: `"use client";\n\nexport function Button({ label }: { label: string }) {\n  return <button>{label}</button>;\n}` }
                    ]
                  }
                ]
              },
              { name: "package.json", type: "file", ext: "json", content: `{\n  "name": "dataspark-engine-demo",\n  "version": "1.0.0",\n  "dependencies": {\n    "next": "latest",\n    "react": "latest"\n  }\n}` }
            ],
            levels: [],
            grids: [],
            bimElements: [],
            bimIssues: [],
            worksets: [],
            phases: [],
            ediMaps: [],
            adapters: [],
            typeTrees: [],
            functionalMaps: [],
            specifications: [],
            connections: [],
            deployments: [],
          };
        } else if (type === "architecture") {
          sample = {
            id,
            name: "Metropolitan Commercial Center",
            description: "A professional Revit model template containing multi-level BIM layout details.",
            type,
            createdAt: new Date().toLocaleDateString(),
            files: [],
            levels: ["Level 1", "Level 2", "Level 3", "Roof", "Basement"],
            grids: ["A-1", "A-2", "B-1", "B-2", "C-1", "C-2"],
            bimElements: [
              { id: "E-10041", name: "Living Room Loft", type: "Room", level: "Level 1", area: "45.2 m²", volume: "135.6 m³", finish: "Hardwood", occupancy: "Residential" },
              { id: "E-10042", name: "Gourmet Kitchen", type: "Room", level: "Level 1", area: "24.5 m²", volume: "73.5 m³", finish: "Polished Concrete", occupancy: "Commercial Kitchen" },
              { id: "E-10043", name: "Workspace Studio", type: "Room", level: "Level 2", area: "38.1 m²", volume: "114.3 m³", finish: "Carpet", occupancy: "Office" },
              { id: "E-10044", name: "Executive Suite", type: "Room", level: "Level 2", area: "32.4 m²", volume: "97.2 m³", finish: "Wood Panel", occupancy: "Executive Room" },
              { id: "E-10045", name: "Rooftop Observatory", type: "Room", level: "Roof", area: "120.0 m²", volume: "360.0 m³", finish: "Slate Tiles", occupancy: "Public Leisure" }
            ],
            bimIssues: [
              { id: "C-001", type: "clash", severity: "high", desc: "Structural beam ST-402 intersects HVAC Duct line D-12 on Level 2", date: "Today" },
              { id: "W-012", type: "warning", severity: "medium", desc: "Door swing conflict with partition wall in Suite 204", date: "Yesterday" }
            ],
            worksets: ["Shared Levels and Grids", "Core Shell", "Interior Partitioning", "HVAC Services", "Electrical Distribution"],
            phases: ["Existing Conditions", "Phase 1 - Demolition", "Phase 2 - New Construction"],
            ediMaps: [],
            adapters: [],
            typeTrees: [],
            functionalMaps: [],
            specifications: [],
            connections: [],
            deployments: [],
          };
        } else {
          sample = {
            id,
            name: "IBM ITX Standard Retail Map Package",
            description: "EDI X12 mapping setup containing 850 PO files and SAP IDoc structures.",
            type,
            createdAt: new Date().toLocaleDateString(),
            files: [],
            levels: [],
            grids: [],
            bimElements: [],
            bimIssues: [],
            worksets: [],
            phases: [],
            ediMaps: [
              { id: "MAP-850", name: "X12_850_to_SAP_ORDERS05", type: "X12 → SAP IDoc", format: "X12 850", records: "45,219", lastRun: "2 min ago", status: "active", rules: ["ISA01 = '00'", "GS01 = 'PO'", "ORDERS05 = SAP_ORDERS"] },
              { id: "MAP-856", name: "SAP_DELVRY03_to_EDIFACT_DESADV", type: "SAP IDoc → EDIFACT", format: "DESADV", records: "12,940", lastRun: "1 hour ago", status: "active", rules: ["DESADV_HEADER = IDOC_HEADER"] }
            ],
            adapters: [
              { name: "Acme AS2 Gateway", type: "AS2", status: "connected", partner: "Acme Corp", count: 852 },
              { name: "Direct FTP Partner Link", type: "FTP/SFTP", status: "connected", partner: "Global Shipping Inc", count: 184 },
              { name: "Internal WebSphere MQ Listener", type: "IBM MQ", status: "connected", partner: "SAP Gateway", count: 4210 }
            ],
            typeTrees: ["x12_version_5010.mtt", "sap_orders05_idoc.mtt", "edifact_d96a.mtt"],
            functionalMaps: ["MapShippingAddress", "FormatLineItems", "TranslatePaymentTerms"],
            specifications: [
              { id: "DOC-001", name: "Acme Corporation EDI 850 Guideline v4.2", type: "PDF Specification", size: "4.8 MB", uploadedAt: "Yesterday", extractedGlossary: ["ISA Segment", "BEG Purchase Order", "PO1 Item Baseline", "N1 Name Identifiers"] }
            ],
            connections: ["SAP_DB_Production", "WebSphere_MQ_Broker_Local"],
            deployments: ["Dev Sandbox Environment", "Staging QA Gateway", "Production EDI Server"],
          };
        }
        
        set((state) => ({
          projects: [...state.projects, sample],
          activeProjectId: sample.id,
        }));
        
        return sample;
      },
      deleteProject: (id) =>
        set((state) => {
          const filtered = state.projects.filter((p) => p.id !== id);
          return {
            projects: filtered,
            activeProjectId: state.activeProjectId === id ? (filtered[0]?.id || null) : state.activeProjectId,
          };
        }),
      setActiveProjectId: (id) => set({ activeProjectId: id }),
      addSpecDocument: (projectId, doc) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, specifications: [...p.specifications, doc] }
              : p
          ),
        })),
      addEdiMap: (projectId, map) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, ediMaps: [...p.ediMaps, map] }
              : p
          ),
        })),
    }),
    { name: "dataspark-projects-store" }
  )
);
