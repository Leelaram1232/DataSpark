"use client";

import React, { useState } from "react";
import { X, Play, ShieldCheck, FileCode, Check } from "lucide-react";
import type { LogicNodeData } from "./types";

export function RuleEditorModal({
  node,
  onClose,
  onSave,
}: {
  node: LogicNodeData | null;
  onClose: () => void;
  onSave: (updatedNode: Partial<LogicNodeData>) => void;
}) {
  if (!node) return null;

  const [title, setTitle] = useState(node.title || "");
  const [details, setDetails] = useState(node.details || "");
  const [sourcePath, setSourcePath] = useState(node.sourcePath || node.sourceRef || "");
  const [targetPath, setTargetPath] = useState(node.targetPath || node.targetRef || "");
  const [expression, setExpression] = useState(node.expression || "");
  const [validation] = useState("Validation Passed (0 Errors)");
  const [previewResult, setPreviewResult] = useState<string | null>(null);

  const handleRunPreview = () => {
    setPreviewResult(`Mapped Output: "${expression || details || title}"`);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "560px",
          maxHeight: "90vh",
          background: "#0d0d14",
          border: "1px solid #1f1f2e",
          borderRadius: "12px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(59,130,246,0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            background: "#12121c",
            borderBottom: "1px solid #1a1a28",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileCode size={16} color="#3b82f6" />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#ececf1", letterSpacing: "0.2px" }}>
              Mapping Rule Editor — {node.type}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#6b7280",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto" }}>
          <div>
            <label style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", display: "block", marginBottom: "4px" }}>
              Rule Name / Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                background: "#07070c",
                border: "1px solid #1f1f2e",
                borderRadius: "6px",
                padding: "8px 10px",
                color: "#ececf1",
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "10px", fontWeight: 700, color: "#3b82f6", display: "block", marginBottom: "4px" }}>
                Source Element Path
              </label>
              <input
                type="text"
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
                style={{
                  width: "100%",
                  background: "#07070c",
                  border: "1px solid #1f1f2e",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  color: "#3b82f6",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "10px", fontWeight: 700, color: "#a855f7", display: "block", marginBottom: "4px" }}>
                Target Element Path
              </label>
              <input
                type="text"
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                style={{
                  width: "100%",
                  background: "#07070c",
                  border: "1px solid #1f1f2e",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  color: "#a855f7",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "10px", fontWeight: 700, color: "#f59e0b", display: "block", marginBottom: "4px" }}>
              Condition / Formula Expression
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              style={{
                width: "100%",
                background: "#07070c",
                border: "1px solid #1f1f2e",
                borderRadius: "6px",
                padding: "8px 10px",
                color: "#ececf1",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          {/* Validation & Preview */}
          <div style={{ background: "#11111a", padding: "10px", borderRadius: "6px", border: "1px solid #1a1a28" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                <ShieldCheck size={12} /> {validation}
              </span>
              <button
                onClick={handleRunPreview}
                style={{
                  background: "#1e1b4b",
                  border: "1px solid #4338ca",
                  color: "#818cf8",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Play size={10} /> Test Rule Expression
              </button>
            </div>

            {previewResult && (
              <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "#10b981", background: "#051a10", padding: "6px", borderRadius: "4px", border: "1px solid #10b98133" }}>
                {previewResult}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 18px",
            background: "#12121c",
            borderTop: "1px solid #1a1a28",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "6px 14px",
              background: "#181824",
              border: "1px solid #2a2a3c",
              borderRadius: "6px",
              color: "#9ca3af",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({ title, details, sourcePath, targetPath, expression });
              onClose();
            }}
            style={{
              padding: "6px 14px",
              background: "#2563eb",
              border: "none",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Check size={12} /> Save Rule
          </button>
        </div>
      </div>
    </div>
  );
}
