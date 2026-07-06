"use client";

import { useState } from "react";
import { useProjectStore } from "@/store/projectStore";
import { GitBranch, ChevronRight, ChevronDown, Circle, CheckCircle, Search } from "lucide-react";

interface TreeNode {
  name: string;
  type: "category" | "group" | "field";
  dataType?: string;
  minOccurs?: number;
  maxOccurs?: number;
  children?: TreeNode[];
}

const defaultTypeTree: TreeNode[] = [
  {
    name: "ISA_InterchangeHeader",
    type: "group",
    children: [
      { name: "ISA_01_AuthQualifier", type: "field", dataType: "ID", minOccurs: 1, maxOccurs: 1 },
      { name: "ISA_02_AuthInfo", type: "field", dataType: "AN", minOccurs: 1, maxOccurs: 1 },
      { name: "ISA_05_SenderQualifier", type: "field", dataType: "ID", minOccurs: 1, maxOccurs: 1 },
      { name: "ISA_06_SenderID", type: "field", dataType: "AN", minOccurs: 1, maxOccurs: 1 }
    ]
  },
  {
    name: "GS_FunctionalGroupHeader",
    type: "group",
    children: [
      { name: "GS_01_Code", type: "field", dataType: "ID", minOccurs: 1, maxOccurs: 1 },
      { name: "GS_02_SenderCode", type: "field", dataType: "AN", minOccurs: 1, maxOccurs: 1 },
      { name: "GS_08_VersionCode", type: "field", dataType: "AN", minOccurs: 1, maxOccurs: 1 }
    ]
  },
  {
    name: "Transaction_Set_850",
    type: "category",
    children: [
      {
        name: "ST_Header",
        type: "group",
        children: [
          { name: "ST_01_TransactionSetID", type: "field", dataType: "ID", minOccurs: 1, maxOccurs: 1 },
          { name: "ST_02_ControlNumber", type: "field", dataType: "AN", minOccurs: 1, maxOccurs: 1 }
        ]
      },
      {
        name: "BEG_BeginningSegment",
        type: "group",
        children: [
          { name: "BEG_01_StructureCode", type: "field", dataType: "ID", minOccurs: 1, maxOccurs: 1 },
          { name: "BEG_02_TypeCode", type: "field", dataType: "ID", minOccurs: 1, maxOccurs: 1 },
          { name: "BEG_03_PONumber", type: "field", dataType: "AN", minOccurs: 1, maxOccurs: 1 }
        ]
      }
    ]
  }
];

export function TypeTreeManager() {
  const { activeProject } = useProjectStore();
  const project = activeProject();

  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({ "Transaction_Set_850": true });
  const [selectedField, setSelectedField] = useState<TreeNode | null>(null);

  const toggleNode = (name: string) => {
    setOpenNodes((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  function TreeItem({ node, depth }: { node: TreeNode; depth: number }) {
    const isParent = node.children && node.children.length > 0;
    const isOpen = openNodes[node.name] ?? false;

    return (
      <div>
        <div
          onClick={() => {
            if (isParent) toggleNode(node.name);
            else setSelectedField(node);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: `4px 8px 4px ${8 + depth * 12}px`,
            borderRadius: "4px",
            cursor: "pointer",
            color: selectedField?.name === node.name ? "#10b981" : "var(--text-secondary)",
            background: selectedField?.name === node.name ? "rgba(16,185,129,0.06)" : "transparent",
            fontSize: "12px",
          }}
          onMouseEnter={(e) => {
            if (selectedField?.name !== node.name) e.currentTarget.style.background = "var(--bg-hover)";
          }}
          onMouseLeave={(e) => {
            if (selectedField?.name !== node.name) e.currentTarget.style.background = "transparent";
          }}
        >
          {isParent ? (
            isOpen ? <ChevronDown size={11} style={{ opacity: 0.5 }} /> : <ChevronRight size={11} style={{ opacity: 0.5 }} />
          ) : (
            <Circle size={5} fill="#10b981" color="#10b981" style={{ opacity: 0.5 }} />
          )}
          <span style={{ fontFamily: node.type === "field" ? "var(--font-mono)" : "inherit" }}>{node.name}</span>
          <span style={{ fontSize: "9px", opacity: 0.5, marginLeft: "auto" }}>{node.type.toUpperCase()}</span>
        </div>
        {isParent && isOpen && node.children?.map((child) => (
          <TreeItem key={child.name} node={child} depth={depth + 1} />
        ))}
      </div>
    );
  }

  if (!project) return null;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "var(--bg-base)" }}>
      {/* Structural Tree Browser */}
      <div style={{ width: "260px", borderRight: "1px solid var(--border-subtle)", background: "var(--bg-surface)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "6px", alignItems: "center" }}>
          <GitBranch size={13} color="#10b981" />
          <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>TYPE TREE SCHEMAS</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
          {project.typeTrees.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 8px", fontSize: "11px", color: "var(--text-disabled)" }}>
              No custom type trees loaded.
            </div>
          ) : (
            defaultTypeTree.map((node) => <TreeItem key={node.name} node={node} depth={0} />)
          )}
        </div>
      </div>

      {/* Field parameters inspector */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        {selectedField ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#10b981", padding: "2px 6px", borderRadius: "4px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                TYPE PARAMETERS
              </span>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginTop: "8px", fontFamily: "var(--font-mono)" }}>
                {selectedField.name}
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Data Type Code", value: selectedField.dataType || "Group structure" },
                { label: "Minimum Occurrence", value: selectedField.minOccurs !== undefined ? selectedField.minOccurs : "N/A" },
                { label: "Maximum Occurrence", value: selectedField.maxOccurs !== undefined ? selectedField.maxOccurs : "N/A" },
                { label: "Status validation", value: "Compliant" }
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "12px" }}>
                  <span style={{ color: "var(--text-muted)" }}>{row.label}</span>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "12px" }}>
            Select a field schema element to view data properties.
          </div>
        )}
      </div>
    </div>
  );
}
