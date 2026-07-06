"use client";

import { AppShell } from "@/components/layout/AppShell";
import { EDIStudio } from "@/components/edi/EDIStudio";
import { useState, useEffect } from "react";

export default function EDIPage() {
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
    <AppShell workspace="edi">
      <EDIStudio />
    </AppShell>
  );
}
