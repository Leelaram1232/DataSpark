"use client";

import { useState, useEffect, useRef } from "react";
import { useProjectStore } from "@/store/projectStore";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, UploadCloud, Search, Trash2, HelpCircle, Loader2 } from "lucide-react";

const EDI_API_BASE = typeof window !== "undefined"
  ? (window.location.origin.includes("vercel.app") ? "/api/backend/api/v1/edi" : "http://localhost:8000/api/v1/edi")
  : "http://localhost:8000/api/v1/edi";

export function SpecCenter() {
  const { activeProject } = useProjectStore();
  const project = activeProject();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [specs, setSpecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadSpecs = () => {
    if (!project) return;
    setLoading(true);
    fetch(`${EDI_API_BASE}/specifications/${project.id}`)
      .then((res) => res.json())
      .then((data) => {
        setSpecs(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadSpecs();
  }, [project?.id]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${EDI_API_BASE}/import/${project.id}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        loadSpecs();
        // Invalidate sidebar file tree so the folder shows the new file
        queryClient.invalidateQueries({ queryKey: ["projects", project.id, "files"] });
      }
    } catch (err) {
      console.error("Failed to upload spec file:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!project) return;
    if (!confirm("Are you sure you want to delete this specification?")) return;

    try {
      const response = await fetch(`${EDI_API_BASE}/specifications/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        loadSpecs();
        queryClient.invalidateQueries({ queryKey: ["projects", project.id, "files"] });
      }
    } catch (err) {
      console.error("Failed to delete spec:", err);
    }
  };

  if (!project) return null;

  const filteredSpecs = specs.filter((doc) =>
    (doc.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allTerms = specs.flatMap((s) => s.extracted_glossary || []);

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
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.xlsx,.xls,.xml,.json,.csv,.zip"
            style={{ display: "none" }}
          />

          <button
            onClick={handleUploadClick}
            disabled={uploading}
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
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <UploadCloud size={13} />
            )}
            {uploading ? "Importing..." : "Upload Spec"}
          </button>
        </div>

        {/* List of Files */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
              <Loader2 size={24} className="animate-spin" style={{ color: "#10b981" }} />
            </div>
          ) : filteredSpecs.length === 0 ? (
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
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      Specification Document · Uploaded {new Date(doc.created_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  style={{ border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                >
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
          {allTerms.length === 0 ? (
            <p style={{ fontSize: "11px", color: "var(--text-disabled)", fontStyle: "italic" }}>
              Upload files to extract segments terms dictionary.
            </p>
          ) : (
            allTerms.map((term, index) => (
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
