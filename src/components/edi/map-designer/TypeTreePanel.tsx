"use client";

import React, { useState, useMemo } from "react";
import { X, Search, ChevronDown, ChevronRight, FileCode, CheckCircle2 } from "lucide-react";
import { TreeNode } from "./TreeNode";
import type { TreeNodeData } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   DEMO TREES MATCHING ITX REFERENCE SCREENSHOT
   ═══════════════════════════════════════════════════════════════════════════ */

const DEMO_INPUT_TREE: TreeNodeData[] = [
  {
    id: "in-root", name: "FreightReceipt", type: "root", children: [
      {
        id: "in-hdr", name: "Header", type: "segment", isMapped: true, children: [
          { id: "in-msgid", name: "MessageID", type: "element", dataType: "AN..35", isMapped: true },
          { id: "in-msgtype", name: "MessageType", type: "element", dataType: "AN..10", isMapped: true },
          { id: "in-dt", name: "DateTime", type: "element", dataType: "DT", isMapped: true },
          { id: "in-ver", name: "Version", type: "element", dataType: "AN..5", isMapped: true },
          { id: "in-sender", name: "SenderID", type: "element", dataType: "AN..15", isMapped: true },
          { id: "in-rec", name: "ReceiverID", type: "element", dataType: "AN..15", isMapped: true },
        ],
      },
      {
        id: "in-party", name: "Party", type: "loop", occurrence: "[0..99]", isMapped: true, children: [
          { id: "in-ptype", name: "@PartyType", type: "attribute", dataType: "AN..3", isMapped: true },
          { id: "in-pname", name: "Name", type: "element", dataType: "AN..70", isMapped: true },
          { id: "in-paddr", name: "Address", type: "element", dataType: "AN..70", isMapped: true },
          { id: "in-pcity", name: "City", type: "element", dataType: "AN..35", isMapped: true },
          { id: "in-pstate", name: "State", type: "element", dataType: "AN..35", isMapped: true },
          { id: "in-pzip", name: "PostalCode", type: "element", dataType: "AN..20", isMapped: true },
          { id: "in-pcountry", name: "CountryCode", type: "element", dataType: "AN..3", isMapped: true },
        ],
      },
      {
        id: "in-items", name: "Items", type: "group", children: [
          {
            id: "in-item", name: "Item", type: "loop", occurrence: "[0..999999]", children: [
              { id: "in-linenum", name: "LineNumber", type: "element", dataType: "N0..10", isMapped: true },
              { id: "in-itemid", name: "ItemID", type: "element", dataType: "AN..25", isMapped: true },
              { id: "in-desc", name: "Description", type: "element", dataType: "AN..70", isMapped: true },
              { id: "in-qty", name: "Quantity", type: "element", dataType: "N0..15.3", isMapped: true },
              { id: "in-uom", name: "UOM", type: "element", dataType: "AN..5", isMapped: true },
              { id: "in-price", name: "UnitPrice", type: "element", dataType: "N0..15.4", isMapped: true },
              { id: "in-amt", name: "Amount", type: "element", dataType: "N0..15.4", isMapped: true },
            ],
          },
        ],
      },
      {
        id: "in-summary", name: "Summary", type: "segment", children: [
          { id: "in-subtot", name: "SubTotal", type: "element", dataType: "N0..15.2", isMapped: true },
          { id: "in-tax", name: "TotalTax", type: "element", dataType: "N0..15.2", isMapped: true },
          { id: "in-grand", name: "GrandTotal", type: "element", dataType: "N0..15.2", isMapped: true },
        ],
      },
    ],
  },
];

const DEMO_OUTPUT_TREE: TreeNodeData[] = [
  {
    id: "out-root", name: "InvoiceResponse", type: "root", children: [
      {
        id: "out-hdr", name: "Header", type: "segment", isMapped: true, children: [
          { id: "out-msgid", name: "MessageId", type: "element", dataType: "xs:string", isMapped: true, mappingBadge: "MAP" },
          { id: "out-dt", name: "DateTime", type: "element", dataType: "xs:dateTime", isMapped: true, mappingBadge: "MAP" },
          { id: "out-msgtype", name: "MessageType", type: "element", dataType: "xs:string", isMapped: true, mappingBadge: "IF" },
          { id: "out-ver", name: "Version", type: "element", dataType: "xs:string", isMapped: true, mappingBadge: "IF" },
          { id: "out-sender", name: "SenderID", type: "element", dataType: "xs:string", isMapped: true, mappingBadge: "CONSTANT" },
          { id: "out-rec", name: "ReceiverID", type: "element", dataType: "xs:string", isMapped: true, mappingBadge: "CONSTANT" },
        ],
      },
      {
        id: "out-party", name: "Party", type: "loop", occurrence: "[0..99]", isMapped: true, children: [
          { id: "out-ptype", name: "@PartyType", type: "attribute", dataType: "xs:string", isMapped: true, mappingBadge: "IF" },
          { id: "out-pname", name: "Name", type: "element", dataType: "xs:string", isMapped: true, mappingBadge: "MAP" },
          { id: "out-paddr", name: "Address", type: "element", dataType: "xs:string", isMapped: true, mappingBadge: "MAP" },
          { id: "out-pcity", name: "City", type: "element", dataType: "xs:string", isMapped: true, mappingBadge: "MAP" },
          { id: "out-pstate", name: "State", type: "element", dataType: "xs:string", isMapped: true, mappingBadge: "LOOKUP" },
          { id: "out-pzip", name: "PostalCode", type: "element", dataType: "xs:string", isMapped: true, mappingBadge: "MAP" },
          { id: "out-pcountry", name: "CountryCode", type: "element", dataType: "xs:string", isMapped: true, mappingBadge: "LOOKUP" },
        ],
      },
      {
        id: "out-items", name: "Items", type: "group", children: [
          {
            id: "out-item", name: "Item", type: "loop", occurrence: "[0..999999]", children: [
              { id: "out-linenum", name: "LineNumber", type: "element", dataType: "xs:integer", isMapped: true, mappingBadge: "MAP" },
              { id: "out-itemid", name: "ItemID", type: "element", dataType: "xs:string", isMapped: true, mappingBadge: "MAP" },
              { id: "out-desc", name: "Description", type: "element", dataType: "xs:string", isMapped: true, mappingBadge: "MAP" },
              { id: "out-qty", name: "Quantity", type: "element", dataType: "xs:decimal", isMapped: true, mappingBadge: "MAP" },
              { id: "out-uom", name: "UOM", type: "element", dataType: "xs:string", isMapped: true, mappingBadge: "MAP" },
              { id: "out-price", name: "UnitPrice", type: "element", dataType: "xs:decimal", isMapped: true, mappingBadge: "MAP" },
              { id: "out-amt", name: "Amount", type: "element", dataType: "xs:decimal", isMapped: true, mappingBadge: "CALCULATE" },
            ],
          },
        ],
      },
      {
        id: "out-summary", name: "Summary", type: "segment", children: [
          { id: "out-subtot", name: "SubTotal", type: "element", dataType: "xs:decimal", isMapped: true, mappingBadge: "CALCULATE" },
          { id: "out-tax", name: "TotalTax", type: "element", dataType: "xs:decimal", isMapped: true, mappingBadge: "CALCULATE" },
          { id: "out-grand", name: "GrandTotal", type: "element", dataType: "xs:decimal", isMapped: true, mappingBadge: "CALCULATE" },
        ],
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   TYPE TREE PANEL COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

function countFields(nodes: TreeNodeData[]): number {
  let count = 0;
  for (const n of nodes) {
    if (!n.children || n.children.length === 0) count++;
    else count += countFields(n.children);
  }
  return count;
}

export function TypeTreePanel({
  side,
  fileName,
  badge,
  treeData,
  accentColor,
  onClose,
  onFieldClick,
  selectedFieldId,
}: {
  side: "input" | "output";
  fileName?: string;
  badge?: string;
  treeData?: TreeNodeData[];
  accentColor?: string;
  onClose?: () => void;
  onFieldClick?: (node: TreeNodeData) => void;
  selectedFieldId?: string | null;
}) {
  const color = accentColor || (side === "input" ? "#3b82f6" : "#a855f7");
  const data = treeData || (side === "input" ? DEMO_INPUT_TREE : DEMO_OUTPUT_TREE);
  const name = fileName || (side === "input" ? "Input: In_310_FreightReceipt.x12" : "Output: Out_Invoice_EDI.edi");
  const badgeText = badge || (side === "input" ? "X12" : "EDI");
  const totalFields = useMemo(() => countFields(data), [data]);

  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div
      style={{
        width: "250px",
        minWidth: "230px",
        display: "flex",
        flexDirection: "column",
        background: "#08080e",
        border: `1px solid ${color}44`,
        borderRadius: "8px",
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      {/* Window Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "7px 10px",
          background: `${color}12`,
          borderBottom: `1px solid ${color}25`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1, minWidth: 0 }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, flexShrink: 0 }} />
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: 700,
              color: color,
              fontFamily: "var(--font-mono)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </span>
        </div>

        <span
          style={{
            fontSize: "8px",
            fontWeight: 700,
            color: color,
            background: `${color}20`,
            border: `1px solid ${color}40`,
            padding: "1px 5px",
            borderRadius: "3px",
            marginRight: "6px",
            flexShrink: 0,
          }}
        >
          {badgeText}
        </span>

        {onClose && (
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", padding: "2px", display: "flex", flexShrink: 0 }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Search Input Bar */}
      <div style={{ padding: "6px 8px", borderBottom: "1px solid #12121c" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#0c0c14", border: "1px solid #1a1a28", borderRadius: "5px", padding: "4px 8px" }}>
          <Search size={11} color="#4b5563" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fields..."
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: "10px", color: "#ececf1", fontFamily: "var(--font-sans)" }}
          />
        </div>
      </div>

      {/* Tree View Scrollable Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
        {data.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            onFieldClick={onFieldClick}
            selectedFieldId={selectedFieldId}
          />
        ))}
      </div>

      {/* Footer Info */}
      <div
        style={{
          padding: "5px 10px",
          borderTop: "1px solid #12121c",
          background: "#06060a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "9px",
          color: "#4b5563",
          flexShrink: 0,
        }}
      >
        <span>Total Fields: {totalFields}</span>
        {side === "output" && (
          <span style={{ color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: "3px" }}>
            <CheckCircle2 size={9} /> All Mapped
          </span>
        )}
      </div>

      {/* Unmapped Fields Status Card at Bottom of Output Window */}
      {side === "output" && (
        <div
          style={{
            padding: "8px 10px",
            background: "#080f0c",
            borderTop: "1px solid #10b98133",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "9.5px",
            color: "#10b981",
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={11} color="#10b981" />
          <span>Unmapped Fields (0) — All output fields are mapped</span>
        </div>
      )}
    </div>
  );
}
