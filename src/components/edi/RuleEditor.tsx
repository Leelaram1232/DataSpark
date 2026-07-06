"use client";

import { useState } from "react";
import {
  FileCode,
  CheckCircle,
  AlertTriangle,
  Play,
  Settings,
  History,
  BookOpen,
} from "lucide-react";

export function RuleEditor() {
  const [ruleInput, setRuleInput] = useState("=IF(X12_850.BEG_03_PO_Num == \"\", \"DRAFT_PO\", LEFT(X12_850.BEG_03_PO_Num, 10))");
  const [activeTab, setActiveTab] = useState("editor"); // editor | documentation | history

  // Auto-completing list matching keywords
  const functions = [
    { name: "IF(condition, trueVal, falseVal)", desc: "Evaluates standard conditional statements." },
    { name: "LEFT(text, count)", desc: "Extracts count characters from the start of text." },
    { name: "RIGHT(text, count)", desc: "Extracts count characters from the end of text." },
    { name: "LOOKUP(key, table)", desc: "Searches structural lookup index tables." },
  ];

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "var(--bg-base)" }}>
      {/* Editor Main Canvas */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid var(--border-subtle)", overflow: "hidden" }}>
        {/* Editor Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>
            <FileCode size={13} color="#10b981" />
            <span>TRANSFORMATION RULE EDITOR</span>
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={() => alert("Rule parsed and validated successfully!")}
              style={{
                padding: "3px 8px",
                borderRadius: "4px",
                border: "none",
                background: "rgba(16,185,129,0.15)",
                color: "#10b981",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <CheckCircle size={10} />
              Validate Rule
            </button>
          </div>
        </div>

        {/* Rule Textarea area */}
        <div style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "#10b981", marginBottom: "4px" }}>
            =
          </div>
          <textarea
            value={ruleInput}
            onChange={(e) => setRuleInput(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              lineHeight: "1.7",
              resize: "none",
              caretColor: "#10b981",
            }}
            placeholder="Enter mapping rules here..."
          />
          {/* Autocomplete helper */}
          <div style={{ position: "absolute", bottom: "16px", left: "16px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "6px", padding: "8px", width: "320px", boxShadow: "var(--shadow-lg)" }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#10b981", textTransform: "uppercase", marginBottom: "4px" }}>Autocomplete Suggestions</p>
            {functions.map((fn) => (
              <div
                key={fn.name}
                onClick={() => setRuleInput((prev) => prev + " " + fn.name)}
                style={{
                  padding: "4px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <code style={{ color: "#fbbf24" }}>{fn.name.split("(")[0]}</code>
                <span style={{ fontSize: "9px", opacity: 0.6, marginLeft: "6px" }}>{fn.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar documentation lookup */}
      <div style={{ width: "220px", display: "flex", flexDirection: "column", background: "var(--bg-surface)", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "6px", alignItems: "center" }}>
          <BookOpen size={12} color="#10b981" />
          <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>RULE DOCUMENTATION</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>IF Function</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4, marginTop: "2px" }}>
              Runs logical validation tests. Returns trueVal if condition holds, else falseVal.
            </p>
          </div>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>LEFT Function</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4, marginTop: "2px" }}>
              Truncates target text structures to output the leftmost count characters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
