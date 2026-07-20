"use client";

import React, { useMemo } from "react";
import type { ConnectorData } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   CONNECTOR LAYER — SVG overlay for animated curved connectors
   ═══════════════════════════════════════════════════════════════════════════ */

const COLOR_MAP: Record<string, string> = {
  teal: "#10b981",
  red: "#ef4444",
  green: "#22c55e",
  orange: "#f97316",
  purple: "#a855f7",
  amber: "#f59e0b",
  blue: "#3b82f6",
  pink: "#ec4899",
};

interface ConnectorPoint {
  x: number;
  y: number;
}

function bezierPath(start: ConnectorPoint, end: ConnectorPoint): string {
  const dx = Math.max(Math.abs(end.x - start.x) * 0.45, 60);
  return `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;
}

export function ConnectorLayer({
  connectors,
  width = 2000,
  height = 1400,
  selectedConnectorId,
  onSelectConnector,
}: {
  connectors: Array<{
    id: string;
    start: ConnectorPoint;
    end: ConnectorPoint;
    color: string;
    animated?: boolean;
    label?: string;
    style?: "solid" | "dashed";
  }>;
  width?: number;
  height?: number;
  selectedConnectorId?: string | null;
  onSelectConnector?: (id: string | null) => void;
}) {
  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <defs>
        {/* Glow filters for each color */}
        {Object.entries(COLOR_MAP).map(([name, hex]) => (
          <filter key={name} id={`glow-${name}`}>
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={hex} floodOpacity="0.4" />
          </filter>
        ))}

        {/* Arrow markers */}
        {Object.entries(COLOR_MAP).map(([name, hex]) => (
          <marker
            key={`arrow-${name}`}
            id={`arrow-${name}`}
            viewBox="0 0 10 8"
            refX="9"
            refY="4"
            markerWidth="6"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d={`M 0 0 L 10 4 L 0 8 z`} fill={hex} />
          </marker>
        ))}

        {/* Animated dash pattern */}
        <style>{`
          @keyframes dash-flow {
            to { stroke-dashoffset: -20; }
          }
        `}</style>
      </defs>

      {connectors.map((conn) => {
        const path = bezierPath(conn.start, conn.end);
        const hex = COLOR_MAP[conn.color] || conn.color;
        const isSelected = selectedConnectorId === conn.id;
        const colorKey = Object.keys(COLOR_MAP).find((k) => COLOR_MAP[k] === hex) || "teal";

        return (
          <g key={conn.id}>
            {/* Invisible wider hit area */}
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth="14"
              style={{ pointerEvents: "visibleStroke", cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectConnector?.(conn.id);
              }}
            />

            {/* Main path */}
            <path
              d={path}
              fill="none"
              stroke={hex}
              strokeWidth={isSelected ? "2.5" : "1.5"}
              strokeOpacity={isSelected ? "1" : "0.65"}
              strokeDasharray={conn.style === "dashed" ? "6 4" : conn.animated ? "8 4" : "none"}
              filter={`url(#glow-${colorKey})`}
              markerEnd={`url(#arrow-${colorKey})`}
              style={
                conn.animated
                  ? { animation: "dash-flow 1s linear infinite" }
                  : undefined
              }
            />

            {/* Label */}
            {conn.label && (
              <>
                <circle
                  cx={(conn.start.x + conn.end.x) / 2}
                  cy={(conn.start.y + conn.end.y) / 2 - 10}
                  r="14"
                  fill="#0a0a10"
                  stroke={hex}
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />
                <text
                  x={(conn.start.x + conn.end.x) / 2}
                  y={(conn.start.y + conn.end.y) / 2 - 6}
                  textAnchor="middle"
                  fill={hex}
                  fontSize="8"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {conn.label}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
