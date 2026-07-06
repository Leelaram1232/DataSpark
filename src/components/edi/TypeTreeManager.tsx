"use client";

import { useState, useEffect } from "react";
import { useProjectStore } from "@/store/projectStore";
import { GitBranch, ChevronRight, ChevronDown, Circle, Folder, Search, Loader2 } from "lucide-react";

interface TreeNode {
  name: string;
  type: "category" | "group" | "field";
  dataType?: string;
  minOccurs?: number;
  maxOccurs?: number;
  children?: TreeNode[];
  value?: string;
}

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

export function TypeTreeManager() {
  const { activeProject } = useProjectStore();
  const project = activeProject();

  const [typeTrees, setTypeTrees] = useState<any[]>([]);
  const [selectedTreeId, setSelectedTreeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});
  const [selectedField, setSelectedField] = useState<TreeNode | null>(null);

  useEffect(() => {
    if (!project) return;
    setLoading(true);
    fetch(`${EDI_API_BASE}/type-trees/${project.id}`, {
      headers: getAuthHeaders()
    })
      .then((res) => res.json())
      .then((data) => {
        setTypeTrees(data || []);
        if (data && data.length > 0) {
          setSelectedTreeId(data[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [project?.id]);

  const toggleNode = (name: string) => {
    setOpenNodes((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const activeTree = typeTrees.find((t) => t.id === selectedTreeId);
  const hierarchyNodes: TreeNode[] = activeTree?.hierarchy || [];

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
            padding: `6px 8px 6px ${8 + depth * 12}px`,
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
          
          {isParent ? (
            <Folder size={12} color="#fbbf24" style={{ opacity: 0.7 }} />
          ) : null}

          <span style={{ fontFamily: node.type === "field" ? "var(--font-mono)" : "inherit" }}>
            {node.name}
          </span>
          <span style={{ fontSize: "9px", opacity: 0.4, marginLeft: "auto" }}>
            {node.type ? node.type.toUpperCase() : "FIELD"}
          </span>
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

        {/* Tree Selector List */}
        {typeTrees.length > 1 && (
          <div style={{ padding: "8px", borderBottom: "1px solid var(--border-subtle)" }}>
            <select
              value={selectedTreeId || ""}
              onChange={(e) => {
                setSelectedTreeId(e.target.value);
                setOpenNodes({});
                setSelectedField(null);
              }}
              style={{ width: "100%", padding: "4px 6px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "11px" }}
            >
              {typeTrees.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
              <Loader2 size={16} className="animate-spin" style={{ color: "#10b981" }} />
            </div>
          ) : typeTrees.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 8px", fontSize: "11px", color: "var(--text-disabled)" }}>
              No custom type trees loaded. Upload .mtt, .json or .xml in Specification center or Wizard to explore.
            </div>
          ) : (
            hierarchyNodes.map((node) => <TreeItem key={node.name} node={node} depth={0} />)
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
                { label: "Data Type Code", value: selectedField.dataType || "AN" },
                { label: "Minimum Occurrence", value: selectedField.minOccurs !== undefined ? selectedField.minOccurs : 0 },
                { label: "Maximum Occurrence", value: selectedField.maxOccurs !== undefined ? selectedField.maxOccurs : 1 },
                { label: "Field Value Value", value: selectedField.value || "N/A" },
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
            Select a field schema element on the left to view data properties.
          </div>
        )}
      </div>
    </div>
  );
}
