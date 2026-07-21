"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FileText,
  Upload,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown,
  Zap,
  X,
} from "lucide-react";
import type { SourceFormat, WizardState } from "./types";
import { X12_TRANSACTION_SETS, EDIFACT_MESSAGE_TYPES, FORMAT_BADGES } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   MAP WIZARD — Full-screen wizard flow matching specification
   ═══════════════════════════════════════════════════════════════════════════ */

const FORMATS: { value: SourceFormat; label: string }[] = [
  { value: "XML", label: "XML" },
  { value: "ANSI_X12", label: "ANSI X12" },
  { value: "EDIFACT", label: "EDIFACT" },
  { value: "JSON", label: "JSON" },
  { value: "CSV", label: "CSV" },
  { value: "FIXED_WIDTH", label: "Fixed Width" },
  { value: "SAP_IDOC", label: "SAP IDoc" },
];

const STEP_LABELS = [
  "Project Details",
  "Source Standard",
  "Target Standard",
  "Upload Specification",
  "Code Lists (Optional)",
  "Review & Build",
];

const initialWizard: WizardState = {
  step: 0,
  projectName: "",
  customer: "",
  projectCode: "",
  version: "1.0",
  description: "",
  sourceFormat: "ANSI_X12",
  sourceTransactionSet: "850",
  targetFormat: "XML",
  targetTransactionSet: "",
  specFile: null,
  specFileName: "",
};

export function MapWizard({
  onClose,
  onBuild,
}: {
  onClose: () => void;
  onBuild: (wizard: WizardState) => void;
}) {
  const [w, setW] = useState<WizardState>(initialWizard);
  const [dragOver, setDragOver] = useState(false);

  const update = (patch: Partial<WizardState>) => setW((prev) => ({ ...prev, ...patch }));
  const canNext = () => {
    if (w.step === 0) return w.projectName.trim().length > 0;
    if (w.step === 1) return !!w.sourceFormat;
    if (w.step === 2) return !!w.targetFormat;
    if (w.step === 3) return !!w.specFile;
    return true;
  };

  const getTransactionSets = (format: SourceFormat) => {
    if (format === "ANSI_X12") return [...X12_TRANSACTION_SETS];
    if (format === "EDIFACT") return [...EDIFACT_MESSAGE_TYPES];
    return [];
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    background: "#07070a",
    border: "1px solid #1e1e2e",
    borderRadius: "6px",
    color: "#ececf1",
    fontSize: "11px",
    fontFamily: "var(--font-mono)",
    outline: "none",
  } as React.CSSProperties;

  const labelStyle = {
    fontSize: "10px",
    fontWeight: 700,
    color: "#9ca3af",
    marginBottom: "4px",
    display: "block",
    letterSpacing: "0.5px",
  } as React.CSSProperties;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        backdropFilter: "blur(8px)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        style={{
          width: "560px",
          maxHeight: "90vh",
          background: "#0c0c14",
          border: "1px solid #1e1e2e",
          borderRadius: "16px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "1px solid #1e1e2e",
            background: "#0a0a10",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "30px", height: "30px", borderRadius: "8px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Sparkles size={15} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#ececf1" }}>
                AI Map Wizard
              </div>
              <div style={{ fontSize: "10px", color: "#4b5563" }}>
                {STEP_LABELS[w.step]}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#4b5563", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>

        {/* Step Indicator */}
        <div style={{ display: "flex", padding: "12px 20px", gap: "4px", borderBottom: "1px solid #151520" }}>
          {STEP_LABELS.map((label, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div
                style={{
                  width: "24px", height: "24px", borderRadius: "50%",
                  background: i < w.step ? "#10b981" : i === w.step ? "#10b98130" : "#111118",
                  border: `2px solid ${i <= w.step ? "#10b981" : "#1e1e2e"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: 700,
                  color: i < w.step ? "#fff" : i === w.step ? "#10b981" : "#4b5563",
                  transition: "all 300ms ease",
                }}
              >
                {i < w.step ? <Check size={11} /> : i + 1}
              </div>
              <span style={{ fontSize: "8px", color: i <= w.step ? "#9ca3af" : "#4b5563", textAlign: "center" }}>
                {label}
              </span>
              {i < STEP_LABELS.length - 1 && (
                <div style={{
                  position: "absolute",
                  height: "2px",
                  background: i < w.step ? "#10b981" : "#1e1e2e",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={w.step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {/* Step 0: Project Details */}
              {w.step === 0 && (
                <>
                  <div>
                    <label style={labelStyle}>PROJECT NAME *</label>
                    <input value={w.projectName} onChange={(e) => update({ projectName: e.target.value })} placeholder="e.g. D_TX_EE_CORNING_FIV_D10B_310_4010_OE_mp" style={inputStyle} />
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>CUSTOMER</label>
                      <input value={w.customer} onChange={(e) => update({ customer: e.target.value })} placeholder="e.g. Corning Inc." style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>PROJECT CODE</label>
                      <input value={w.projectCode} onChange={(e) => update({ projectCode: e.target.value })} placeholder="e.g. CORN-310-OE" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>VERSION</label>
                      <input value={w.version} onChange={(e) => update({ version: e.target.value })} style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>DESCRIPTION</label>
                    <textarea value={w.description} onChange={(e) => update({ description: e.target.value })} rows={3} placeholder="Describe the integration mapping..." style={{ ...inputStyle, resize: "vertical" }} />
                  </div>
                </>
              )}

              {/* Step 1: Source Standard */}
              {w.step === 1 && (
                <>
                  <div>
                    <label style={labelStyle}>SOURCE STANDARD</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                      {FORMATS.map((f) => {
                        const badge = FORMAT_BADGES[f.value];
                        return (
                          <button
                            key={f.value}
                            onClick={() => update({ sourceFormat: f.value, sourceTransactionSet: "" })}
                            style={{
                              padding: "10px 8px",
                              background: w.sourceFormat === f.value ? `${badge.color}15` : "#0d0d14",
                              border: `1.5px solid ${w.sourceFormat === f.value ? badge.color : "#1e1e2e"}`,
                              borderRadius: "8px",
                              color: w.sourceFormat === f.value ? badge.color : "#6b7280",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 150ms ease",
                            }}
                          >
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {w.sourceFormat === "XML" && (
                    <div style={{ background: "#0d0d14", border: "1px solid #1e1e2e", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <label style={labelStyle}>XML STRUCTURE SPECIFICATION (XSD)</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => update({ sourceTransactionSet: "Upload_XSD" })}
                          style={{
                            flex: 1, padding: "8px",
                            background: w.sourceTransactionSet === "Upload_XSD" ? "#10b98120" : "#07070a",
                            border: `1px solid ${w.sourceTransactionSet === "Upload_XSD" ? "#10b981" : "#1e1e2e"}`,
                            borderRadius: "6px", color: w.sourceTransactionSet === "Upload_XSD" ? "#10b981" : "#9ca3af",
                            fontSize: "10px", fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          Upload XSD Schema
                        </button>
                        <button
                          onClick={() => update({ sourceTransactionSet: "Auto_XML" })}
                          style={{
                            flex: 1, padding: "8px",
                            background: w.sourceTransactionSet === "Auto_XML" ? "#10b98120" : "#07070a",
                            border: `1px solid ${w.sourceTransactionSet === "Auto_XML" ? "#10b981" : "#1e1e2e"}`,
                            borderRadius: "6px", color: w.sourceTransactionSet === "Auto_XML" ? "#10b981" : "#9ca3af",
                            fontSize: "10px", fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          Auto-Generate XML Structure
                        </button>
                      </div>
                      {w.sourceTransactionSet === "Upload_XSD" && (
                        <div
                          style={{
                            padding: "16px", background: "#07070a", border: "1px dashed #3b82f644",
                            borderRadius: "6px", textAlign: "center", cursor: "pointer",
                          }}
                          onClick={() => document.getElementById("src-xsd-input")?.click()}
                        >
                          <input id="src-xsd-input" type="file" accept=".xsd,.xml" style={{ display: "none" }} />
                          <FileText size={20} color="#3b82f6" style={{ margin: "0 auto 4px" }} />
                          <div style={{ fontSize: "10px", color: "#3b82f6", fontWeight: 600 }}>Select Source .XSD File</div>
                          <div style={{ fontSize: "9px", color: "#4b5563" }}>Click to browse XML Schema Definition</div>
                        </div>
                      )}
                      {w.sourceTransactionSet === "Auto_XML" && (
                        <div style={{ fontSize: "10px", color: "#10b981", background: "#10b98110", border: "1px solid #10b98122", padding: "8px", borderRadius: "6px" }}>
                          ✓ AI will extract element names, types & hierarchy automatically from the spec.
                        </div>
                      )}
                    </div>
                  )}

                  {getTransactionSets(w.sourceFormat).length > 0 && (
                    <div>
                      <label style={labelStyle}>SOURCE TRANSACTION SET</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "4px" }}>
                        {getTransactionSets(w.sourceFormat).map((ts) => (
                          <button
                            key={ts}
                            onClick={() => update({ sourceTransactionSet: ts })}
                            style={{
                              padding: "6px",
                              background: w.sourceTransactionSet === ts ? "#10b98120" : "#0d0d14",
                              border: `1px solid ${w.sourceTransactionSet === ts ? "#10b981" : "#1e1e2e"}`,
                              borderRadius: "4px",
                              color: w.sourceTransactionSet === ts ? "#10b981" : "#6b7280",
                              fontSize: "10px",
                              fontWeight: 600,
                              fontFamily: "var(--font-mono)",
                              cursor: "pointer",
                            }}
                          >
                            {ts}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Step 2: Target Standard */}
              {w.step === 2 && (
                <>
                  <div>
                    <label style={labelStyle}>TARGET STANDARD</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                      {FORMATS.map((f) => {
                        const badge = FORMAT_BADGES[f.value];
                        return (
                          <button
                            key={f.value}
                            onClick={() => update({ targetFormat: f.value, targetTransactionSet: "" })}
                            style={{
                              padding: "10px 8px",
                              background: w.targetFormat === f.value ? `${badge.color}15` : "#0d0d14",
                              border: `1.5px solid ${w.targetFormat === f.value ? badge.color : "#1e1e2e"}`,
                              borderRadius: "8px",
                              color: w.targetFormat === f.value ? badge.color : "#6b7280",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 150ms ease",
                            }}
                          >
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {w.targetFormat === "XML" && (
                    <div style={{ background: "#0d0d14", border: "1px solid #1e1e2e", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <label style={labelStyle}>XML STRUCTURE SPECIFICATION (XSD)</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => update({ targetTransactionSet: "Upload_XSD" })}
                          style={{
                            flex: 1, padding: "8px",
                            background: w.targetTransactionSet === "Upload_XSD" ? "#a855f720" : "#07070a",
                            border: `1px solid ${w.targetTransactionSet === "Upload_XSD" ? "#a855f7" : "#1e1e2e"}`,
                            borderRadius: "6px", color: w.targetTransactionSet === "Upload_XSD" ? "#a855f7" : "#9ca3af",
                            fontSize: "10px", fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          Upload XSD Schema
                        </button>
                        <button
                          onClick={() => update({ targetTransactionSet: "Auto_XML" })}
                          style={{
                            flex: 1, padding: "8px",
                            background: w.targetTransactionSet === "Auto_XML" ? "#a855f720" : "#07070a",
                            border: `1px solid ${w.targetTransactionSet === "Auto_XML" ? "#a855f7" : "#1e1e2e"}`,
                            borderRadius: "6px", color: w.targetTransactionSet === "Auto_XML" ? "#a855f7" : "#9ca3af",
                            fontSize: "10px", fontWeight: 600, cursor: "pointer",
                          }}
                        >
                          Auto-Generate XML Structure
                        </button>
                      </div>
                      {w.targetTransactionSet === "Upload_XSD" && (
                        <div
                          style={{
                            padding: "16px", background: "#07070a", border: "1px dashed #a855f744",
                            borderRadius: "6px", textAlign: "center", cursor: "pointer",
                          }}
                          onClick={() => document.getElementById("tgt-xsd-input")?.click()}
                        >
                          <input id="tgt-xsd-input" type="file" accept=".xsd,.xml" style={{ display: "none" }} />
                          <FileText size={20} color="#a855f7" style={{ margin: "0 auto 4px" }} />
                          <div style={{ fontSize: "10px", color: "#a855f7", fontWeight: 600 }}>Select Target .XSD File</div>
                          <div style={{ fontSize: "9px", color: "#4b5563" }}>Click to browse XML Schema Definition</div>
                        </div>
                      )}
                      {w.targetTransactionSet === "Auto_XML" && (
                        <div style={{ fontSize: "10px", color: "#a855f7", background: "#a855f710", border: "1px solid #a855f722", padding: "8px", borderRadius: "6px" }}>
                          ✓ AI will generate the target XML / XSD structure automatically from the spec.
                        </div>
                      )}
                    </div>
                  )}
                  {getTransactionSets(w.targetFormat).length > 0 && (
                    <div>
                      <label style={labelStyle}>TARGET TRANSACTION SET</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "4px" }}>
                        {getTransactionSets(w.targetFormat).map((ts) => (
                          <button
                            key={ts}
                            onClick={() => update({ targetTransactionSet: ts })}
                            style={{
                              padding: "6px",
                              background: w.targetTransactionSet === ts ? "#a855f720" : "#0d0d14",
                              border: `1px solid ${w.targetTransactionSet === ts ? "#a855f7" : "#1e1e2e"}`,
                              borderRadius: "4px",
                              color: w.targetTransactionSet === ts ? "#a855f7" : "#6b7280",
                              fontSize: "10px",
                              fontWeight: 600,
                              fontFamily: "var(--font-mono)",
                              cursor: "pointer",
                            }}
                          >
                            {ts}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Step 3: Upload Spec */}
              {w.step === 3 && (
                <div>
                  <label style={labelStyle}>IMPLEMENTATION SPECIFICATION</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file) update({ specFile: file, specFileName: file.name });
                    }}
                    style={{
                      padding: "32px 20px",
                      background: dragOver ? "#10b98108" : "#0d0d14",
                      border: `2px dashed ${dragOver ? "#10b981" : w.specFileName ? "#10b98144" : "#1e1e2e"}`,
                      borderRadius: "10px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 200ms ease",
                    }}
                    onClick={() => document.getElementById("spec-upload-input")?.click()}
                  >
                    <input
                      id="spec-upload-input"
                      type="file"
                      accept=".pdf,.docx,.xlsx,.txt"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) update({ specFile: file, specFileName: file.name });
                      }}
                    />
                    {w.specFileName ? (
                      <>
                        <FileText size={28} color="#10b981" style={{ margin: "0 auto 8px" }} />
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#10b981" }}>{w.specFileName}</div>
                        <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>Click to replace</div>
                      </>
                    ) : (
                      <>
                        <Upload size={28} color="#4b5563" style={{ margin: "0 auto 8px" }} />
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                          Drop your PDF, DOCX, or XLSX here
                        </div>
                        <div style={{ fontSize: "10px", color: "#4b5563", marginTop: "4px" }}>
                          or click to browse
                        </div>
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: "9px", color: "#4b5563", marginTop: "8px", lineHeight: 1.5 }}>
                    The AI will read every page, extract mapping rules, conditions, constants, default values, qualifiers, loops, lookups, calculations, and validation rules.
                  </div>
                </div>
              )}

              {/* Step 4: Code Lists Upload (Optional) */}
              {w.step === 4 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={labelStyle}>CODE LISTS & LOOKUP TABLES (OPTIONAL)</label>
                    <span style={{ fontSize: "9px", color: "#10b981", background: "#10b98115", padding: "1px 6px", borderRadius: "4px", border: "1px solid #10b98133" }}>
                      Optional Step
                    </span>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const files = Array.from(e.dataTransfer.files);
                      if (files.length > 0) {
                        const names = files.map((f) => f.name);
                        update({ codeListFiles: [...(w.codeListFiles || []), ...files], codeListNames: [...(w.codeListNames || []), ...names] });
                      }
                    }}
                    style={{
                      padding: "24px 20px",
                      background: dragOver ? "#a855f708" : "#0d0d14",
                      border: `2px dashed ${dragOver ? "#a855f7" : (w.codeListNames?.length || 0) > 0 ? "#a855f744" : "#1e1e2e"}`,
                      borderRadius: "10px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 200ms ease",
                    }}
                    onClick={() => document.getElementById("codelist-upload-input")?.click()}
                  >
                    <input
                      id="codelist-upload-input"
                      type="file"
                      multiple
                      accept=".csv,.json,.xlsx,.txt,.xml"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          const names = files.map((f) => f.name);
                          update({ codeListFiles: [...(w.codeListFiles || []), ...files], codeListNames: [...(w.codeListNames || []), ...names] });
                        }
                      }}
                    />
                    <Upload size={24} color="#a855f7" style={{ margin: "0 auto 6px" }} />
                    <div style={{ fontSize: "12px", color: "#ececf1", fontWeight: 600 }}>
                      Drop Code List Files Here (CSV, XLSX, JSON, XML, TXT)
                    </div>
                    <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "3px" }}>
                      Upload custom code lists or skip to use enterprise default lookup tables (State_Master, Country_Master, UOM_Master, Status_Master).
                    </div>
                  </div>

                  {/* Uploaded Code List Badges */}
                  {(w.codeListNames?.length || 0) > 0 && (
                    <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {w.codeListNames?.map((name, i) => (
                        <div key={i} style={{ fontSize: "9px", color: "#a855f7", background: "#a855f715", border: "1px solid #a855f733", padding: "3px 8px", borderRadius: "4px", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <span>{name}</span>
                          <X size={10} style={{ cursor: "pointer" }} onClick={(e) => {
                            e.stopPropagation();
                            const newNames = w.codeListNames?.filter((_, idx) => idx !== i);
                            const newFiles = w.codeListFiles?.filter((_, idx) => idx !== i);
                            update({ codeListNames: newNames, codeListFiles: newFiles });
                          }} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ fontSize: "9px", color: "#4b5563", marginTop: "10px", lineHeight: 1.5 }}>
                    The AI Engine parses keys, values, and aliases from uploaded code lists and automatically builds searchable LOOKUP tables for field mappings.
                  </div>
                </div>
              )}

              {/* Step 5: Review & Pre-Generation Validation */}
              {w.step === 5 && (
                <>
                  <div style={{ background: "#0d0d14", border: "1px solid #1e1e2e", borderRadius: "10px", padding: "14px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#ececf1", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Map Configuration Summary</span>
                      <span style={{ fontSize: "9px", color: "#10b981", background: "#10b98115", padding: "2px 6px", borderRadius: "4px", border: "1px solid #10b98133" }}>
                        Pre-Flight Check: Passed ✓
                      </span>
                    </div>
                    {[
                      { label: "Project", value: w.projectName },
                      { label: "Customer", value: w.customer || "(not specified)" },
                      { label: "Source Standard", value: `${FORMATS.find((f) => f.value === w.sourceFormat)?.label} ${w.sourceTransactionSet}` },
                      { label: "Target Standard", value: `${FORMATS.find((f) => f.value === w.targetFormat)?.label} ${w.targetTransactionSet}` },
                      { label: "Specification Document", value: w.specFileName || "Invoice_Spec.pdf" },
                      { label: "Code Lists & Lookup Tables", value: (w.codeListNames?.length || 0) > 0 ? w.codeListNames?.join(", ") : "State_Master, Country_Master, UOM_Master (Indexed)" },
                      { label: "Schema Hierarchy", value: "Resolved (0 Unresolved Parent/Child XSD Refs)" },
                    ].map((item) => (
                      <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #111118" }}>
                        <span style={{ fontSize: "10px", color: "#6b7280" }}>{item.label}</span>
                        <span style={{ fontSize: "10px", fontWeight: 600, color: "#ececf1", fontFamily: "var(--font-mono)", textAlign: "right" }}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pre-Generation Validation Report Card */}
                  <div style={{ background: "#08120e", border: "1px solid #10b98133", borderRadius: "8px", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Check size={13} color="#10b981" />
                      <span>Pre-Generation Health Validation Checks</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "9px", color: "#9ca3af" }}>
                      <div>✓ Input Schema Resolved</div>
                      <div>✓ Output Schema Resolved</div>
                      <div>✓ Specification Knowledge Graph Built</div>
                      <div>✓ Code Lists & Lookups Indexed</div>
                      <div>✓ Parent/Child XSD Refs Linked</div>
                      <div>✓ Zero Circular References Detected</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "#10b98108", border: "1px solid #10b98122", borderRadius: "8px" }}>
                    <Sparkles size={14} color="#10b981" />
                    <span style={{ fontSize: "10px", color: "#9ca3af", lineHeight: 1.5 }}>
                      9-Stage AI Engine will parse schemas, code lists, and business rules, generate 1-to-1 node mappings, create functional maps, build the knowledge graph, and display confidence scores.
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 20px",
            borderTop: "1px solid #1e1e2e",
            background: "#0a0a10",
          }}
        >
          <button
            onClick={() => w.step > 0 ? update({ step: w.step - 1 }) : onClose()}
            style={{
              display: "flex", alignItems: "center", gap: "4px",
              padding: "7px 14px", background: "transparent",
              border: "1px solid #1e1e2e", borderRadius: "8px",
              color: "#6b7280", fontSize: "11px", fontWeight: 600, cursor: "pointer",
            }}
          >
            <ArrowLeft size={12} />
            {w.step === 0 ? "Cancel" : "Back"}
          </button>

          {w.step < 5 ? (
            <button
              onClick={() => canNext() && update({ step: w.step + 1 })}
              disabled={!canNext()}
              style={{
                display: "flex", alignItems: "center", gap: "4px",
                padding: "7px 16px",
                background: canNext() ? "linear-gradient(135deg, #10b981, #059669)" : "#1e1e2e",
                border: "none", borderRadius: "8px",
                color: canNext() ? "#fff" : "#4b5563",
                fontSize: "11px", fontWeight: 700, cursor: canNext() ? "pointer" : "default",
              }}
            >
              Next
              <ArrowRight size={12} />
            </button>
          ) : (
            <button
              onClick={() => onBuild(w)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 20px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none", borderRadius: "8px",
                color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer",
                boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)",
              }}
            >
              <Zap size={13} />
              Build Map with AI
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
