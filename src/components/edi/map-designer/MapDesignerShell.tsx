"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { WorkspacePanel } from "./WorkspacePanel";
import { TopToolbar } from "./TopToolbar";
import { StatusBar } from "./StatusBar";
import { TypeTreePanel } from "./TypeTreePanel";
import { LogicCanvas } from "./LogicCanvas";
import { FunctionalMapsStrip } from "./FunctionalMapsStrip";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { MapWizard } from "./MapWizard";
import { BuildAnimation } from "./BuildAnimation";
import { ValidateMapModal } from "./ValidateMapModal";
import { generateMapFromWizard } from "./mapGenerator";
import type { GeneratedMapData } from "./mapGenerator";
import type { WizardState } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   MAP DESIGNER SHELL — Enterprise ITX Studio layout
   ═══════════════════════════════════════════════════════════════════════════ */

export function MapDesignerShell() {
  // ── Generated Map Data (populated by wizard → build pipeline) ──────
  const [mapData, setMapData] = useState<GeneratedMapData | null>(() => {
    // Default initial map so canvas is populated immediately
    return generateMapFromWizard({
      step: 4,
      projectName: "DSV_Project",
      customer: "DSV Logistics",
      projectCode: "DSV-EDI-2025",
      version: "1.0.0",
      description: "Enterprise X12 to EDIFACT Invoice mapping pipeline",
      sourceFormat: "ANSI_X12",
      sourceTransactionSet: "310",
      targetFormat: "EDIFACT",
      targetTransactionSet: "INVOIC",
      specFile: null,
      specFileName: "Invoice_Spec.pdf",
    });
  });

  const [wizardState, setWizardState] = useState<WizardState | null>({
    step: 4,
    projectName: "DSV_Project",
    customer: "DSV Logistics",
    projectCode: "DSV-EDI-2025",
    version: "1.0.0",
    description: "Enterprise X12 to EDIFACT Invoice mapping pipeline",
    sourceFormat: "ANSI_X12",
    sourceTransactionSet: "310",
    targetFormat: "EDIFACT",
    targetTransactionSet: "INVOIC",
    specFile: null,
    specFileName: "Invoice_Spec.pdf",
  });

  const [showValidationModal, setShowValidationModal] = useState(false);

  // ── View mode and zoom ───────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"canvas" | "table" | "tree">("canvas");
  const [zoom, setZoom] = useState(100);

  // ── Panel visibility ─────────────────────────────────────────────────
  const [showWorkspace, setShowWorkspace] = useState(true);
  const [showInputTree, setShowInputTree] = useState(true);
  const [showOutputTree, setShowOutputTree] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showFunctionalMaps, setShowFunctionalMaps] = useState(true);

  // ── Wizard & Build Animation ──────────────────────────────────────────
  const [showWizard, setShowWizard] = useState(false);
  const [showBuildAnimation, setShowBuildAnimation] = useState(false);

  // ── Selection State ───────────────────────────────────────────────────
  const [selectedLogicNodeId, setSelectedLogicNodeId] = useState<string | null>("n-calc-amount");
  const [selectedInputFieldId, setSelectedInputFieldId] = useState<string | null>(null);
  const [selectedOutputFieldId, setSelectedOutputFieldId] = useState<string | null>(null);

  // ── Chat Panel toggles ────────────────────────────────────────────────
  const [showAIChat, setShowAIChat] = useState(false);
  const [showSpecChat, setShowSpecChat] = useState(false);

  // ── Save State ────────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const handleBuild = (wizard: WizardState) => {
    setWizardState(wizard);
    setShowWizard(false);
    setShowBuildAnimation(true);
  };

  const handleBuildComplete = () => {
    setShowBuildAnimation(false);

    if (wizardState) {
      const generated = generateMapFromWizard(wizardState);
      setMapData(generated);
    }

    setShowInputTree(true);
    setShowOutputTree(true);
    setShowAIPanel(true);
    setShowFunctionalMaps(true);
  };

  const selectedNodeData = mapData?.logicNodes?.find((n) => n.id === selectedLogicNodeId) || null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        background: "#07070a",
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ═══ TOP TOOLBAR ═══ */}
      <TopToolbar
        projectName={wizardState?.projectName || "DSV_Project"}
        currentMapName={mapData?.mapName || "XML_TO_XML_InvoiceMap"}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        zoom={zoom}
        onZoomChange={setZoom}
        onSave={handleSave}
        onValidate={() => setShowValidationModal(true)}
        onGenerateMap={() => setShowWizard(true)}
        onToggleAIChat={() => { setShowAIChat(!showAIChat); setShowAIPanel(true); }}
        onToggleSpecChat={() => { setShowSpecChat(!showSpecChat); setShowAIPanel(true); }}
        showAIChat={showAIChat}
        showSpecChat={showSpecChat}
        isSaving={isSaving}
        metrics={{
          mappings: mapData?.metrics?.mappedFields || 156,
          conditions: mapData?.metrics?.conditions || 28,
          lookups: mapData?.metrics?.lookups || 12,
          calculations: mapData?.metrics?.calculations || 18,
          functions: mapData?.metrics?.functions || 25,
          validations: 25,
        }}
      />

      {/* ═══ MAIN CONTENT AREA ═══ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* ─── Workspace Panel (Left Explorer) ─── */}
        {showWorkspace && (
          <WorkspacePanel
            projectName={wizardState?.projectName || "DSV_Project"}
            mapData={mapData}
            wizardState={wizardState}
          />
        )}

        {/* ─── Center Area (Trees + Canvas + Functional Maps) ─── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Top: Trees + Canvas */}
          <div style={{ flex: 1, position: "relative", display: "flex", overflow: "hidden", minHeight: 0 }}>
            {/* Logic Canvas (Center) */}
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {mapData ? (
                <LogicCanvas
                  sourcePills={mapData.sourcePills}
                  targetPills={mapData.targetPills}
                  logicNodes={mapData.logicNodes}
                  connectors={mapData.connectors}
                  selectedNodeId={selectedLogicNodeId}
                  viewMode={viewMode}
                  zoom={zoom}
                  onSelectNode={setSelectedLogicNodeId}
                  onUpdateNode={(nodeId, updated) => {
                    setMapData((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        logicNodes: prev.logicNodes.map((n) => (n.id === nodeId ? { ...n, ...updated } : n)),
                      };
                    });
                  }}
                />
              ) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", color: "#6b7280" }}>
                  <div style={{ fontSize: "16px", fontWeight: 600 }}>Empty Map Canvas</div>
                  <div style={{ fontSize: "12px", maxWidth: "400px", textAlign: "center", lineHeight: 1.6 }}>
                    Click <strong>Generate Map</strong> in the top right to start the AI Map Wizard. The AI will parse your specification, generate the structures, and build the mapping logic graph.
                  </div>
                </div>
              )}
            </div>

            {/* Input Type Tree - Floating Left */}
            {showInputTree && mapData && (
              <div style={{ position: "absolute", left: 14, top: 14, bottom: 14, display: "flex", pointerEvents: "auto", zIndex: 10 }}>
                <TypeTreePanel
                  side="input"
                  accentColor="#3b82f6"
                  treeData={mapData.sourceTree}
                  fileName={mapData.sourceFileName}
                  badge={mapData.sourceBadge}
                  onClose={() => setShowInputTree(false)}
                  onFieldClick={(node) => setSelectedInputFieldId(node.id)}
                  selectedFieldId={selectedInputFieldId}
                />
              </div>
            )}

            {/* Output Type Tree - Floating Right */}
            {showOutputTree && mapData && (
              <div style={{ position: "absolute", right: 14, top: 14, bottom: 14, display: "flex", pointerEvents: "auto", zIndex: 10 }}>
                <TypeTreePanel
                  side="output"
                  accentColor="#a855f7"
                  treeData={mapData.targetTree}
                  fileName={mapData.targetFileName}
                  badge={mapData.targetBadge}
                  onClose={() => setShowOutputTree(false)}
                  onFieldClick={(node) => setSelectedOutputFieldId(node.id)}
                  selectedFieldId={selectedOutputFieldId}
                />
              </div>
            )}
          </div>

          {/* Functional Maps Strip */}
          {showFunctionalMaps && mapData && (
            <FunctionalMapsStrip cards={mapData.functionalMaps} />
          )}
        </div>

        {/* ─── AI Assistant Panel (Right) ─── */}
        {showAIPanel && (
          <AIAssistantPanel
            onClose={() => setShowAIPanel(false)}
            mapData={mapData}
            wizardState={wizardState}
            selectedNode={selectedNodeData}
            onApplyAIChange={(changes) => {
              setMapData((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  ...(changes.logicNodes ? { logicNodes: changes.logicNodes } : {}),
                  ...(changes.functionalMaps ? { functionalMaps: changes.functionalMaps } : {}),
                  ...(changes.rules ? { rules: changes.rules } : {}),
                };
              });
            }}
          />
        )}
      </div>

      {/* ═══ STATUS BAR ═══ */}
      <StatusBar
        projectName={wizardState?.projectName || "DSV_Project"}
        mapName={mapData?.mapName || "XML_TO_XML_InvoiceMap"}
        mapType={`${mapData?.sourceBadge || "XML"} -> ${mapData?.targetBadge || "XML"}`}
      />

      {/* ═══ WIZARD OVERLAY ═══ */}
      <AnimatePresence>
        {showWizard && (
          <MapWizard
            onClose={() => setShowWizard(false)}
            onBuild={handleBuild}
          />
        )}
      </AnimatePresence>

      {/* ═══ BUILD ANIMATION OVERLAY ═══ */}
      {showBuildAnimation && (
        <BuildAnimation
          wizardState={wizardState}
          onComplete={handleBuildComplete}
        />
      )}

      {/* ═══ VALIDATION REPORT MODAL ═══ */}
      {showValidationModal && (
        <ValidateMapModal
          mapData={mapData}
          onClose={() => setShowValidationModal(false)}
        />
      )}
    </div>
  );
}
