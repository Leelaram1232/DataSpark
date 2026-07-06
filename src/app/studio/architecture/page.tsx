"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ArchitectureStudio } from "@/components/architecture/ArchitectureStudio";

export default function ArchitecturePage() {
  return (
    <AppShell workspace="architecture">
      <ArchitectureStudio />
    </AppShell>
  );
}
