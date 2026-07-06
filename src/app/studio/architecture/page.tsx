"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ArchitectureStudio } from "@/components/architecture/ArchitectureStudio";
import { useState, useEffect } from "react";

export default function ArchitecturePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ minHeight: "100vh", background: "#060609", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "12px", fontFamily: "monospace" }}>
        Loading DataSpark Studio...
      </div>
    );
  }

  return (
    <AppShell workspace="architecture">
      <ArchitectureStudio />
    </AppShell>
  );
}
