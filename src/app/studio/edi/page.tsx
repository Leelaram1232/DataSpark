"use client";

import { AppShell } from "@/components/layout/AppShell";
import { EDIStudio } from "@/components/edi/EDIStudio";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EDIPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // const token = localStorage.getItem("dataspark_access_token");
    // if (!token) {
    //   router.push("/auth/login");
    // } else {
    //   setLoading(false);
    // }
    setLoading(false); // Bypass auth
  }, [router]);

  if (!mounted || loading) {
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
