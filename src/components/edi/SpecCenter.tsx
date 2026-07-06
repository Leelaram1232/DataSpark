"use client";

import { useState } from "react";
import { useProjectStore } from "@/store/projectStore";
import { FileText, UploadCloud, Search, Trash2, HelpCircle } from "lucide-react";

export function SpecCenter() {
  const { activeProject, addSpecDocument } = useProjectStore();
  const project = activeProject();
  const [searchQuery, setSearchQuery] = useState("");

  const handleUpload = () => {
    if (!project) return;
    const name = prompt("Enter specification file name:", "Partner_EDI_Guideline.pdf");
    if (name) {
      addSpecDocument(project.id, {
        id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
        name,
        type: name.endsWith(".pdf") ? "PDF Document" : "Excel Sheet",
        size: "3.2 MB",
        uploadedAt: "Just now",
        extractedGlossary: ["ISA Segment", "ST Header", "PO1 Baseline Item", "SE Control Trailer"]
      });
    }
  };

  if (!project) return null;

  const filteredSpecs = project.specifications.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "var(--bg-base)" }}>
      {/* Specifications list */}
      <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "16px", borderRight: "1px solid var(--border-subtle)" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>Specification Center</h2>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            Upload implementation guides, companion specs, and Excel layouts to build RAG semantic indices.
          </p>
        </div>

        {/* Search & Actions */}
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "6px", padding: "6px 10px" }}>
            <Search size={13} color="var(--text-muted)" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search specifications index..."
              style={{ background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: "12px", width: "100%" }}
            />
          </div>
          <button
            onClick={handleUpload}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "none",
              background: "rgba(16,185,129,0.15)",
              color: "#10b981",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <UploadCloud size={13} />
            Upload Spec
          </button>
        </div>

        {/* List of Files */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {filteredSpecs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", border: "1.5px dashed var(--border-subtle)", borderRadius: "8px" }}>
              <FileText size={28} style={{ opacity: 0.15, margin: "0 auto 8px" }} />
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>No companion specifications uploaded yet.</p>
            </div>
          ) : (
            filteredSpecs.map((doc) => (
              <div
                key={doc.id}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileText size={15} color="#10b981" />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{doc.name}</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{doc.type} · {doc.size} · Uploaded {doc.uploadedAt}</p>
                  </div>
                </div>
                <button style={{ border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Semantic Knowledge glossary */}
      <div style={{ width: "240px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", flexShrink: 0 }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>SEMANTIC DICTIONARY</p>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {project.specifications.length === 0 ? (
            <p style={{ fontSize: "11px", color: "var(--text-disabled)", fontStyle: "italic" }}>
              Upload files to extract segments terms dictionary.
            </p>
          ) : (
            project.specifications.flatMap((s) => s.extractedGlossary).map((term, index) => (
              <div key={index} style={{ padding: "6px 8px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "6px", fontSize: "11px", color: "var(--text-secondary)" }}>
                {term}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
