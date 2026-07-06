"use client";

import { useState } from "react";
import { Book, Search, Filter, HelpCircle, Code } from "lucide-react";

interface FunctionItem {
  name: string;
  category: "String" | "Numeric" | "Date" | "Logical" | "Lookup" | "Database";
  syntax: string;
  description: string;
  parameters: string[];
  examples: string[];
  returns: string;
}

const libFunctions: FunctionItem[] = [
  {
    name: "CONCAT",
    category: "String",
    syntax: "CONCAT(string1, string2, ...)",
    description: "Combines two or more string segments together.",
    parameters: ["string1 - First text segment", "string2 - Second text segment"],
    examples: ["CONCAT('ISA_06: ', ISA_06) -> 'ISA_06: ACME_PARTNER'"],
    returns: "String",
  },
  {
    name: "SUM",
    category: "Numeric",
    syntax: "SUM(number1, number2, ...)",
    description: "Returns the sum of values within PO line items.",
    parameters: ["number1 - First numerical element", "number2 - Second numerical element"],
    examples: ["SUM(PO1_02_Qty, PO1_04_Price)"],
    returns: "Numeric",
  },
  {
    name: "LOOKUP",
    category: "Lookup",
    syntax: "LOOKUP(key, tableCode, columnMatch)",
    description: "Performs cross-reference mapping conversions using external DB tables.",
    parameters: ["key - The search criteria", "tableCode - Target CSV/DB code index", "columnMatch - Target column index"],
    examples: ["LOOKUP(PO1_03_Unit, 'UOM_TABLE', 2)"],
    returns: "String/Variant",
  },
  {
    name: "FORMAT_DATE",
    category: "Date",
    syntax: "FORMAT_DATE(dateInput, formatPattern)",
    description: "Translates EDI transaction headers date format (e.g. YYYYMMDD to DD/MM/YYYY).",
    parameters: ["dateInput - The raw date segment", "formatPattern - Format template ('DD/MM/YYYY')"],
    examples: ["FORMAT_DATE(DTM_02_Date, 'DD-MM-YYYY')"],
    returns: "String",
  }
];

export function FunctionLibrary() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedFn, setSelectedFn] = useState<FunctionItem | null>(libFunctions[0]);

  const categories = ["All", "String", "Numeric", "Date", "Logical", "Lookup", "Database"];

  const filtered = libFunctions.filter((fn) => {
    const matchesSearch = fn.name.toLowerCase().includes(search.toLowerCase()) || fn.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || fn.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "var(--bg-base)" }}>
      {/* List Sidebar */}
      <div style={{ width: "240px", borderRight: "1px solid var(--border-subtle)", background: "var(--bg-surface)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Search */}
        <div style={{ padding: "8px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "6px", padding: "4px 8px" }}>
            <Search size={12} color="var(--text-muted)" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search functions..."
              style={{ background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", fontSize: "11px", width: "100%" }}
            />
          </div>
        </div>

        {/* Categories picker */}
        <div style={{ padding: "4px", display: "flex", gap: "2px", flexWrap: "wrap", borderBottom: "1px solid var(--border-subtle)" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "2px 6px",
                borderRadius: "4px",
                border: "none",
                background: activeCategory === cat ? "rgba(16,185,129,0.15)" : "transparent",
                color: activeCategory === cat ? "#10b981" : "var(--text-muted)",
                fontSize: "9px",
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
          {filtered.map((fn) => (
            <div
              key={fn.name}
              onClick={() => setSelectedFn(fn)}
              style={{
                padding: "6px 8px",
                borderRadius: "5px",
                cursor: "pointer",
                background: selectedFn?.name === fn.name ? "var(--bg-selected)" : "transparent",
                color: selectedFn?.name === fn.name ? "#10b981" : "var(--text-secondary)",
                fontSize: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onMouseEnter={(e) => {
                if (selectedFn?.name !== fn.name) e.currentTarget.style.background = "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                if (selectedFn?.name !== fn.name) e.currentTarget.style.background = "transparent";
              }}
            >
              <span>{fn.name}</span>
              <span style={{ fontSize: "9px", opacity: 0.6 }}>{fn.category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Details Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {selectedFn ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#10b981", textTransform: "uppercase", padding: "2px 6px", borderRadius: "4px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                {selectedFn.category} FUNCTION
              </span>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginTop: "10px" }}>
                {selectedFn.name}
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px" }}>
                {selectedFn.description}
              </p>
            </div>

            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>SYNTAX</p>
              <div style={{ padding: "8px 12px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "6px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "#fbbf24", marginTop: "4px" }}>
                {selectedFn.syntax}
              </div>
            </div>

            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>PARAMETERS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                {selectedFn.parameters.map((p, i) => (
                  <div key={i} style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    • {p}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>EXAMPLES</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                {selectedFn.examples.map((ex, i) => (
                  <div key={i} style={{ padding: "6px 10px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "6px", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-secondary)" }}>
                    {ex}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)" }}>RETURNS</p>
              <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{selectedFn.returns}</span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            Select a function to inspect.
          </div>
        )}
      </div>
    </div>
  );
}
