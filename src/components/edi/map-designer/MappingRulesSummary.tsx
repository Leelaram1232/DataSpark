"use client";

import React from "react";
import type { MappingRule, CalculationFormula } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   DEMO DATA
   ═══════════════════════════════════════════════════════════════════════════ */

const DEMO_RULES: MappingRule[] = [
  { id: 1, condition: "Items/Item/Quantity > 0", action: "Include Item in mapping", source: "DetailSection/Item", target: "ReceiptLine", type: "Filter" },
  { id: 2, condition: "Items/Item/UnitPrice >= 0", action: "Include item in mapping", source: "DetailSection/Item", target: "ReceiptLine", type: "Filter" },
  { id: 3, condition: "Discount > 0", action: "Calculate DiscountAmount", source: "DetailSection/Item/Discount", target: "ReceiptLine/TotalDiscount", type: "Calculation" },
  { id: 4, condition: "Plant = 'GPAS'", action: "Map 'AUHPK01' to Site_Id", source: "Header/Plant", target: "Receipt/Site_Id", type: "Map" },
  { id: 5, condition: "Plant = 'GPAP'", action: "Map 'AUPEP01' to Site_Id", source: "Header/Plant", target: "Receipt/Site_Id", type: "Map" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   CALCULATION PREVIEW
   ═══════════════════════════════════════════════════════════════════════════ */

const DEMO_CALCULATIONS = [
  "LineAmount = Quantity * UnitPrice",
  "DiscountAmount = LineAmount * Discount",
  "TaxAmount = (LineAmount - DiscountAmount) * TaxRate",
  "SubTotal = SUM(LineAmount)",
  "TotalDiscount = SUM(DiscountAmount)",
  "GrandTotal = SubTotal - TotalDiscount + TotalTax",
];

const TYPE_COLORS: Record<string, string> = {
  Map: "#10b981",
  Filter: "#3b82f6",
  Calculation: "#f59e0b",
  Lookup: "#a855f7",
  Condition: "#ef4444",
  Validation: "#06b6d4",
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAPPING RULES SUMMARY — Bottom table + calculation preview
   ═══════════════════════════════════════════════════════════════════════════ */

export function MappingRulesSummary({
  rules,
  calculations,
}: {
  rules?: MappingRule[];
  calculations?: (string | CalculationFormula)[];
}) {
  const r = rules || DEMO_RULES;
  const c = calculations || DEMO_CALCULATIONS;

  return (
    <div
      style={{
        display: "flex",
        gap: "0",
        borderTop: "1px solid #151520",
        background: "#0a0a10",
        flexShrink: 0,
        maxHeight: "160px",
        overflow: "hidden",
      }}
    >
      {/* Rules Table */}
      <div style={{ flex: 2, borderRight: "1px solid #151520", overflow: "auto" }}>
        <div style={{ padding: "6px 12px", borderBottom: "1px solid #111118" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.6px" }}>
            Mapping Rules (Summary)
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #151520" }}>
              {["#", "Condition", "Action", "Source", "Target", "Type"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "4px 8px",
                    color: "#4b5563",
                    fontWeight: 700,
                    fontSize: "9px",
                    letterSpacing: "0.5px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {r.map((rule) => (
              <tr
                key={rule.id}
                style={{ borderBottom: "1px solid #0d0d14" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#111118")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "3px 8px", color: "#4b5563", fontFamily: "var(--font-mono)" }}>{rule.id}</td>
                <td style={{ padding: "3px 8px", color: "#f59e0b", fontFamily: "var(--font-mono)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {rule.condition}
                </td>
                <td style={{ padding: "3px 8px", color: "#9ca3af", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {rule.action}
                </td>
                <td style={{ padding: "3px 8px", color: "#3b82f6", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                  {rule.source}
                </td>
                <td style={{ padding: "3px 8px", color: "#a855f7", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                  {rule.target}
                </td>
                <td style={{ padding: "3px 8px" }}>
                  <span
                    style={{
                      fontSize: "8px",
                      fontWeight: 700,
                      color: TYPE_COLORS[rule.type] || "#6b7280",
                      background: `${TYPE_COLORS[rule.type] || "#6b7280"}15`,
                      padding: "1px 5px",
                      borderRadius: "3px",
                    }}
                  >
                    {rule.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calculation Preview */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "6px 12px", borderBottom: "1px solid #111118" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.6px" }}>
            Calculation Preview
          </span>
        </div>
        <div style={{ padding: "6px 12px" }}>
          {c.map((calc, i) => {
            const text = typeof calc === "string" ? calc : `${calc.name} = ${calc.expression}`;
            const isHighlight = typeof calc === "string" ? i === c.length - 1 : calc.highlighted;
            return (
              <div
                key={i}
                style={{
                  padding: "3px 0",
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  color: isHighlight ? "#22c55e" : "#9ca3af",
                  fontWeight: isHighlight ? 700 : 400,
                }}
              >
                {text}
              </div>
            );
          })}
        </div>

        {/* Mapping Summary */}
        <div style={{ padding: "6px 12px", borderTop: "1px solid #111118" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280", marginBottom: "4px", letterSpacing: "0.6px" }}>
            Mapping Summary
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 12px" }}>
            {[
              { label: "Total Nodes (In):", value: "24", color: "#3b82f6" },
              { label: "Total Nodes (Out):", value: "38", color: "#a855f7" },
              { label: "Mappings:", value: "56", color: "#10b981" },
              { label: "Conditions:", value: "3", color: "#f59e0b" },
              { label: "Functions:", value: "6", color: "#818cf8" },
              { label: "Validations:", value: "0 Issues", color: "#10b981" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "9px", color: "#6b7280" }}>{item.label}</span>
                <span style={{ fontSize: "9px", fontWeight: 700, color: item.color, fontFamily: "var(--font-mono)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
