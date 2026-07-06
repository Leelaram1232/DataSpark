"use client";

import { AppShell } from "@/components/layout/AppShell";
import { EDIStudio } from "@/components/edi/EDIStudio";

export default function EDIPage() {
  return (
    <AppShell workspace="edi">
      <EDIStudio />
    </AppShell>
  );
}
