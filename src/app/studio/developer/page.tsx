"use client";

import { AppShell } from "@/components/layout/AppShell";
import { DeveloperStudio } from "@/components/developer/DeveloperStudio";

export default function DeveloperPage() {
  return (
    <AppShell workspace="developer">
      <DeveloperStudio />
    </AppShell>
  );
}
