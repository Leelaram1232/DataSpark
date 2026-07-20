"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  GitBranch,
  Zap,
  AlertTriangle,
  Layers,
  Cable,
  Shield,
  Palette,
  Check,
  Loader2,
} from "lucide-react";
import { BUILD_STEPS } from "./types";
import type { BuildStep } from "./types";

import type { WizardState } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   BUILD ANIMATION — Enhanced cinematic progress screen
   ═══════════════════════════════════════════════════════════════════════════ */

const STEP_ICONS = [FileText, GitBranch, Zap, AlertTriangle, Layers, Cable, Shield, Palette];

export function BuildAnimation({
  wizardState,
  onComplete,
}: {
  wizardState?: WizardState | null;
  onComplete: () => void;
}) {
  const [steps, setSteps] = useState<BuildStep[]>(() => {
    const src = wizardState?.sourceFormat === "ANSI_X12" ? `X12 ${wizardState.sourceTransactionSet}` : wizardState?.sourceFormat === "EDIFACT" ? wizardState.sourceTransactionSet : wizardState?.sourceFormat || "Source";
    const tgt = wizardState?.targetFormat === "ANSI_X12" ? `X12 ${wizardState.targetTransactionSet}` : wizardState?.targetFormat === "EDIFACT" ? wizardState.targetTransactionSet : wizardState?.targetFormat || "Target";
    const specName = wizardState?.specFileName || "uploaded specification";

    return BUILD_STEPS.map((s) => {
      let detail = s.detail;
      if (s.id === "read") detail = `Reading ${specName} page by page...`;
      if (s.id === "parse") detail = `Building ${src} input structure & ${tgt} output structure...`;
      if (s.id === "rules") detail = `Extracting header, loop, calculation & validation rules from ${specName}...`;
      if (s.id === "conditions") detail = `Detecting IF/ELSE conditional branches & qualifiers...`;
      if (s.id === "funcmaps") detail = `Generating F_Header, F_Party, F_Items & F_Totals maps...`;
      if (s.id === "graph") detail = `Connecting ${src} elements → AI Logic Nodes → ${tgt} elements...`;
      return { ...s, detail, status: "pending", progress: 0 };
    });
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; color: string; size: number }>>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate multi-colored particles
  useEffect(() => {
    const colors = ["#10b981", "#3b82f6", "#a855f7", "#06b6d4", "#f59e0b"];
    const ps = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
      color: colors[i % colors.length],
      size: Math.random() * 3 + 2,
    }));
    setParticles(ps);
  }, []);

  // Canvas animation for connection lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;

      // Draw flowing connection lines
      for (let i = 0; i < 8; i++) {
        const y = 50 + i * 45;
        const opacity = Math.sin(t + i * 0.5) * 0.3 + 0.3;
        const progress = Math.min(1, (overallProgress / 100) * 1.5 - i * 0.1);

        if (progress > 0) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = "#10b981";
          ctx.shadowBlur = 6;

          const startX = 50;
          const endX = startX + (canvas.width - 100) * progress;

          ctx.moveTo(startX, y);
          for (let x = startX; x < endX; x += 2) {
            const wave = Math.sin((x - startX) * 0.02 + t * 3 + i) * 8;
            ctx.lineTo(x, y + wave);
          }
          ctx.stroke();

          // Glow dot at the end
          if (progress < 1) {
            ctx.beginPath();
            ctx.arc(endX, y + Math.sin(endX * 0.02 + t * 3 + i) * 8, 3, 0, Math.PI * 2);
            ctx.fillStyle = "#10b981";
            ctx.shadowBlur = 12;
            ctx.fill();
          }
        }
      }

      ctx.shadowBlur = 0;
      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [overallProgress]);

  // Step progression
  useEffect(() => {
    if (currentStep >= steps.length) {
      setTimeout(onComplete, 800);
      return;
    }

    const stepDuration = 800 + Math.random() * 400;
    const progressInterval = setInterval(() => {
      setSteps((prev) => {
        const updated = [...prev];
        if (updated[currentStep]) {
          updated[currentStep] = { ...updated[currentStep], status: "running", progress: Math.min(100, updated[currentStep].progress + 8) };
          if (updated[currentStep].progress >= 100) {
            updated[currentStep] = { ...updated[currentStep], status: "complete", progress: 100 };
          }
        }
        return updated;
      });
    }, stepDuration / 12);

    const timeout = setTimeout(() => {
      clearInterval(progressInterval);
      setSteps((prev) => {
        const updated = [...prev];
        if (updated[currentStep]) {
          updated[currentStep] = { ...updated[currentStep], status: "complete", progress: 100 };
        }
        return updated;
      });
      setCurrentStep((prev) => prev + 1);
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [currentStep, steps.length, onComplete]);

  // Overall progress
  useEffect(() => {
    const completed = steps.filter((s) => s.status === "complete").length;
    const running = steps.find((s) => s.status === "running");
    const runningProgress = running ? running.progress / 100 : 0;
    setOverallProgress(((completed + runningProgress) / steps.length) * 100);
  }, [steps]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#07070a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        overflow: "hidden",
      }}
    >
      {/* Floating Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            background: p.color,
            boxShadow: `0 0 8px ${p.color}`,
            opacity: 0,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            y: [0, -40, -80],
            scale: [0.5, 1.4, 0.5],
          }}
          transition={{
            duration: 3.5,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Canvas for connection lines */}
      <canvas
        ref={canvasRef}
        width={800}
        height={420}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, width: "480px" }}>
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: "24px" }}
        >
          <div
            style={{
              width: "48px", height: "48px", borderRadius: "12px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px",
              boxShadow: "0 0 30px rgba(16, 185, 129, 0.4)",
            }}
          >
            <Zap size={22} color="#fff" />
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ececf1", margin: 0 }}>
            Building AI Map
          </h2>
          {wizardState && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "8px" }}>
              <span style={{ fontSize: "10px", padding: "2px 8px", background: "#3b82f615", border: "1px solid #3b82f644", borderRadius: "4px", color: "#3b82f6", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                In: {wizardState.sourceFormat} {wizardState.sourceTransactionSet}
              </span>
              <span style={{ fontSize: "10px", color: "#4b5563" }}>→</span>
              <span style={{ fontSize: "10px", padding: "2px 8px", background: "#a855f715", border: "1px solid #a855f744", borderRadius: "4px", color: "#a855f7", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                Out: {wizardState.targetFormat} {wizardState.targetTransactionSet}
              </span>
            </div>
          )}
        </motion.div>

        {/* Overall Progress Bar */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "10px", color: "#6b7280" }}>Overall Progress</span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#10b981", fontFamily: "var(--font-mono)" }}>
              {Math.round(overallProgress)}%
            </span>
          </div>
          <div style={{ height: "4px", background: "#151520", borderRadius: "4px", overflow: "hidden" }}>
            <motion.div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #10b981, #22c55e, #10b981)",
                borderRadius: "4px",
                boxShadow: "0 0 8px rgba(16, 185, 129, 0.5)",
              }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[i] || FileText;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: step.status === "running" ? "#10b98108" : "transparent",
                  border: `1px solid ${step.status === "running" ? "#10b98122" : "transparent"}`,
                  transition: "all 200ms ease",
                }}
              >
                {/* Status Icon */}
                <div
                  style={{
                    width: "24px", height: "24px", borderRadius: "6px",
                    background: step.status === "complete" ? "#10b98120" : step.status === "running" ? "#f59e0b20" : "#111118",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {step.status === "complete" ? (
                    <Check size={12} color="#10b981" />
                  ) : step.status === "running" ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Loader2 size={12} color="#f59e0b" />
                    </motion.div>
                  ) : (
                    <Icon size={12} color="#4b5563" />
                  )}
                </div>

                {/* Label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: step.status === "running" ? 700 : 500,
                      color: step.status === "complete" ? "#10b981" : step.status === "running" ? "#ececf1" : "#4b5563",
                    }}
                  >
                    {step.label}
                  </div>
                  {step.status === "running" && (
                    <div style={{ fontSize: "9px", color: "#6b7280", marginTop: "2px" }}>
                      {step.detail}
                    </div>
                  )}
                </div>

                {/* Step Progress */}
                {step.status === "running" && (
                  <span style={{ fontSize: "9px", fontWeight: 700, color: "#f59e0b", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                    {step.progress}%
                  </span>
                )}
                {step.status === "complete" && (
                  <span style={{ fontSize: "9px", color: "#10b981", flexShrink: 0 }}>✓</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
