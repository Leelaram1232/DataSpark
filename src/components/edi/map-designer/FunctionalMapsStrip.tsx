"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Layers, Plus } from "lucide-react";
import type { FunctionalMapCard } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   DEMO FUNCTIONAL MAP CARDS MATCHING REFERENCE SCREENSHOT
   ═══════════════════════════════════════════════════════════════════════════ */

const DEMO_CARDS: FunctionalMapCard[] = [
  {
    id: "f_header",
    name: "F_Header",
    status: "Active",
    color: "#3b82f6",
    rules: [
      "1. Map MessageID → MessageId",
      "2. Map DateTime → DateTime",
      "3. Map MessageType (IF)",
      "4. Map Version (IF)",
      "5. Map SenderID (CONST)",
      "6. Map ReceiverID (CONST)",
    ],
    stats: { rules: 6, conditions: 2, consts: 2 },
  },
  {
    id: "f_parties",
    name: "F_Parties",
    status: "Active",
    color: "#a855f7",
    rules: [
      "1. Map PartyType (IF)",
      "2. Map Name",
      "3. Map Address",
      "4. Map City",
      "5. Lookup State Code",
      "6. Lookup Country Code",
    ],
    stats: { rules: 6, conditions: 1, consts: 0 },
  },
  {
    id: "f_items",
    name: "F_Items",
    status: "Active",
    color: "#10b981",
    rules: [
      "1. Map ItemID",
      "2. Map Description",
      "3. Map Quantity",
      "4. Map UOM",
      "5. Calculate Amount",
    ],
    stats: { rules: 5, conditions: 0, consts: 0 },
  },
  {
    id: "f_lineitems",
    name: "F_LineItems",
    status: "Active",
    color: "#06b6d4",
    rules: [
      "1. Map LineNumber",
      "2. Map ItemID",
      "3. Map Description",
      "4. Map Quantity",
      "5. Map UOM",
      "6. Calculate Amount",
    ],
    stats: { rules: 5, conditions: 0, consts: 0 },
  },
  {
    id: "f_totals",
    name: "F_Totals",
    status: "Active",
    color: "#f59e0b",
    rules: [
      "1. Calculate SubTotal",
      "2. Calculate TotalTax",
      "3. Calculate GrandTotal",
    ],
    stats: { rules: 3, conditions: 0, consts: 0 },
  },
  {
    id: "f_conditions",
    name: "F_Conditions",
    status: "Active",
    color: "#ef4444",
    rules: [
      "1. MessageType = \"ORDERS\"",
      "2. PartyType = \"BT\" / \"SE\"",
      "3. Quantity > 0",
      "4. Discount > 0",
      "5. Plant based Site_Id",
      "6. TaxRate > 0",
    ],
    stats: { rules: 6, conditions: 6, consts: 0 },
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   FUNCTIONAL MAPS STRIP — Card Strip at Bottom of Canvas
   ═══════════════════════════════════════════════════════════════════════════ */

export function FunctionalMapsStrip({
  cards,
  selectedCardId,
  onSelectCard,
}: {
  cards?: FunctionalMapCard[];
  selectedCardId?: string | null;
  onSelectCard?: (id: string) => void;
}) {
  const [cardsList, setCardsList] = useState<FunctionalMapCard[]>(cards || DEMO_CARDS);
  const [selected, setSelected] = useState<string | null>(selectedCardId || null);
  const [isMinimized, setIsMinimized] = useState(false);

  React.useEffect(() => {
    if (cards) setCardsList(cards);
  }, [cards]);

  const handleSelect = (id: string) => {
    setSelected(id === selected ? null : id);
    onSelectCard?.(id);
  };

  return (
    <div
      style={{
        borderTop: "1px solid #141420",
        background: "#08080d",
        flexShrink: 0,
        transition: "all 200ms ease",
      }}
    >
      {/* Bar Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "5px 12px",
          borderBottom: isMinimized ? "none" : "1px solid #101018",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Layers size={12} color="#10b981" />
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.6px" }}>
              Functional Maps ({cardsList.length})
            </span>
          </div>

          {isMinimized && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", overflowX: "auto" }}>
              {cardsList.map((card) => (
                <span
                  key={card.id}
                  onClick={() => { setIsMinimized(false); handleSelect(card.id); }}
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                    color: card.color,
                    background: `${card.color}15`,
                    border: `1px solid ${card.color}33`,
                    padding: "1px 6px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {card.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Toggle Minimize/Expand */}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "#111118",
            border: "1px solid #1e1e2e",
            borderRadius: "4px",
            padding: "2px 6px",
            color: "#9ca3af",
            fontSize: "9px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <span>{isMinimized ? "Expand" : "Minimize"}</span>
          {isMinimized ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      </div>

      {/* Cards Strip */}
      {!isMinimized && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            padding: "8px 12px",
            overflowX: "auto",
          }}
        >
          {cardsList.map((card) => {
            const isActive = selected === card.id;
            return (
              <div
                key={card.id}
                onClick={() => handleSelect(card.id)}
                style={{
                  minWidth: "175px",
                  maxWidth: "210px",
                  background: isActive ? "#11111a" : "#0c0c14",
                  border: `1px solid ${isActive ? card.color + "55" : "#181825"}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  flexShrink: 0,
                  overflow: "hidden",
                  boxShadow: isActive ? `0 0 16px ${card.color}22` : "none",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "5px 10px",
                    background: `${card.color}10`,
                    borderBottom: `1px solid ${card.color}22`,
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: card.color,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {card.name}
                  </span>
                  <span
                    style={{
                      fontSize: "8px",
                      fontWeight: 600,
                      color: "#10b981",
                      background: "#10b98115",
                      border: "1px solid #10b98133",
                      padding: "1px 5px",
                      borderRadius: "4px",
                    }}
                  >
                    {card.status}
                  </span>
                </div>

                {/* Rules List */}
                <div style={{ padding: "6px 10px" }}>
                  {card.rules.map((rule, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: "9px",
                        color: "#9ca3af",
                        lineHeight: 1.5,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {rule}
                    </div>
                  ))}

                  {/* Add Rule Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newRule = prompt(`Add new rule to ${card.name}:`);
                      if (newRule) {
                        setCardsList((prev) =>
                          prev.map((c) =>
                            c.id === card.id ? { ...c, rules: [...c.rules, newRule] } : c
                          )
                        );
                      }
                    }}
                    style={{
                      marginTop: "6px",
                      background: "transparent",
                      border: "none",
                      color: "#3b82f6",
                      fontSize: "9px",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: "2px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    <Plus size={10} /> Add Rule
                  </button>
                </div>

                {/* Footer Stats */}
                {card.stats && (
                  <div
                    style={{
                      padding: "4px 10px",
                      background: "#08080d",
                      borderTop: "1px solid #141420",
                      fontSize: "8.5px",
                      color: "#6b7280",
                      display: "flex",
                      gap: "8px",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <span>Rules: {card.stats.rules}</span>
                    {card.stats.conditions > 0 && <span>Conditions: {card.stats.conditions}</span>}
                    {card.stats.consts > 0 && <span>Const: {card.stats.consts}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
