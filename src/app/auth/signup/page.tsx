"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRegister } from "@/lib/hooks";
import {
  Sparkles,
  Code2,
  Building2,
  Network,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter a valid email and password.");
      return;
    }
    setLoading(true);
    registerMutation.mutate(
      { email, password, full_name: fullName || undefined },
      {
        onSuccess: () => {
          setLoading(false);
          router.push("/");
        },
        onError: (err: any) => {
          setLoading(false);
          alert(err.message || "Failed to create account. Please try again.");
        },
      }
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-void)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: "32px" }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
            }}
          >
            <Sparkles size={24} color="white" />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
            Create DataSpark Account
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Register your professional workspace credentials
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "16px",
            padding: "28px",
          }}
        >
          {/* Inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>
                Full Name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                placeholder="John Doe"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                  transition: "border-color 120ms ease",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "var(--border-focus)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "var(--border-default)";
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@company.com"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                  transition: "border-color 120ms ease",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "var(--border-focus)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "var(--border-default)";
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "5px" }}>
                Password (min 8 chars)
              </label>
              <div style={{ position: "relative" }}>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "9px 36px 9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-default)",
                    background: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    outline: "none",
                    transition: "border-color 120ms ease",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLInputElement).style.borderColor = "var(--border-focus)";
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLInputElement).style.borderColor = "var(--border-default)";
                  }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: "2px",
                  }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "9px",
                border: "none",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "all 120ms ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                marginTop: "8px"
              }}
            >
              {loading ? "Creating Account..." : (
                <>
                  Sign Up Free
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>

          {/* Switch link */}
          <p style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <span
              style={{ color: "#10b981", cursor: "pointer", fontWeight: 500 }}
              onClick={() => router.push("/auth/login")}
            >
              Sign in here
            </span>
          </p>
        </motion.div>

        {/* Workspaces preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "24px",
          }}
        >
          {[
            { icon: Code2, label: "Developer", color: "#6366f1" },
            { icon: Building2, label: "Architecture", color: "#f59e0b" },
            { icon: Network, label: "EDI", color: "#10b981" },
          ].map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                color: "var(--text-muted)",
                fontSize: "10px",
              }}
            >
              <Icon size={16} color={color} />
              {label}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
