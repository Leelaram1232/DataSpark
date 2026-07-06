"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIStore, aiProviders } from "@/store/aiStore";
import { usePluginStore } from "@/store/pluginRegistry";
import { useUIStore } from "@/store/uiStore";
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Bot,
  Puzzle,
  CreditCard,
  Shield,
  Bell,
  Keyboard,
  Monitor,
  Check,
  Search,
  Eye,
  Lock,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

const settingsSections = [
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "editor", label: "Editor Configuration", icon: Monitor },
  { id: "ai", label: "AI & Models Settings", icon: Bot },
  { id: "integrations", label: "Plugins & SDKs Manager", icon: Puzzle },
  { id: "subscription", label: "Subscription Billing", icon: CreditCard },
  { id: "security", label: "Security Keys", icon: Shield },
  { id: "notifications", label: "System Alerts", icon: Bell },
  { id: "keybindings", label: "Shortcuts Map", icon: Keyboard },
  { id: "privacy", label: "Telemetry & Privacy", icon: Lock },
  { id: "about", label: "About DataSpark", icon: Monitor },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("appearance");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = settingsSections.filter((s) =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell workspace="developer">
      <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "var(--bg-base)" }}>
        {/* Settings Left Nav Sidebar */}
        <div
          style={{
            width: "240px",
            flexShrink: 0,
            borderRight: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            padding: "16px 8px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* Settings Nav Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 10px",
              borderRadius: "6px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
            }}
          >
            <Search size={12} style={{ color: "var(--text-muted)" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter settings..."
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
                fontSize: "11px",
                width: "100%",
              }}
            />
          </div>

          {/* Navigation links list */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
            {filteredSections.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 10px",
                    borderRadius: "6px",
                    border: "none",
                    background: isActive ? "rgba(99,102,241,0.1)" : "transparent",
                    color: isActive ? "#818cf8" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: isActive ? 600 : 400,
                    textAlign: "left",
                  }}
                >
                  <Icon size={14} style={{ flexShrink: 0 }} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content detail view area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
          <AnimatePresence mode="wait">
            {activeSection === "appearance" && (
              <motion.div key="appearance" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <AppearanceSettings />
              </motion.div>
            )}
            {activeSection === "editor" && (
              <motion.div key="editor" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <EditorSettings />
              </motion.div>
            )}
            {activeSection === "ai" && (
              <motion.div key="ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <AISettings />
              </motion.div>
            )}
            {activeSection === "integrations" && (
              <motion.div key="integrations" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <IntegrationsSettings />
              </motion.div>
            )}
            {activeSection === "subscription" && (
              <motion.div key="sub" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <SubscriptionSettings />
              </motion.div>
            )}
            {activeSection === "keybindings" && (
              <motion.div key="shortcuts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <ShortcutsSettings />
              </motion.div>
            )}
            {activeSection === "privacy" && (
              <motion.div key="privacy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <PrivacySettings />
              </motion.div>
            )}
            {activeSection === "about" && (
              <motion.div key="about" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <AboutSettings />
              </motion.div>
            )}
            {!["appearance", "editor", "ai", "integrations", "subscription", "keybindings", "privacy", "about"].includes(activeSection) && (
              <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                  {settingsSections.find((s) => s.id === activeSection)?.label}
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                  This settings config subsection is loaded dynamically via custom configuration maps.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "14px 0",
        borderBottom: "1px solid var(--border-subtle)",
        gap: "24px",
      }}
    >
      <div>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "2px" }}>
          {label}
        </p>
        {description && (
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{description}</p>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      style={{
        width: "40px",
        height: "22px",
        borderRadius: "11px",
        border: "none",
        background: enabled ? "var(--brand-600)" : "var(--bg-overlay)",
        cursor: "pointer",
        position: "relative",
        transition: "background 200ms ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "3px",
          left: enabled ? "21px" : "3px",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "white",
          transition: "left 200ms ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

function AppearanceSettings() {
  const { theme, setTheme } = useUIStore();
  const [fontScale, setFontScale] = useState("medium");
  const [animations, setAnimations] = useState(true);

  return (
    <div>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
        Appearance
      </h2>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
        Customize layout themes and styling components instantly.
      </p>

      <h3 style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>
        Workspace Theme
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "24px" }}>
        {["dark", "darker"].map((t) => (
          <div
            key={t}
            onClick={() => setTheme(t as any)}
            style={{
              padding: "16px",
              borderRadius: "8px",
              border: `2px solid ${theme === t ? "var(--brand-500)" : "var(--border-default)"}`,
              cursor: "pointer",
              transition: "all 120ms ease",
              background: t === "dark" ? "#111115" : "#09090b",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "white" }}>
                {t === "dark" ? "Classic Slate Dark" : "Pure Void Black"}
              </span>
              {theme === t && <Check size={12} color="var(--brand-400)" />}
            </div>
          </div>
        ))}
      </div>

      <SettingRow label="Animations" description="Enable smooth transitions and micro-animations">
        <Toggle enabled={animations} onChange={setAnimations} />
      </SettingRow>
    </div>
  );
}

function EditorSettings() {
  const [fontSize, setFontSize] = useState("13px");
  const [wordWrap, setWordWrap] = useState(false);
  const [tabSize, setTabSize] = useState("2");

  return (
    <div>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
        Editor Configuration
      </h2>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
        Adjust settings for Monaco developer code workspace panel.
      </p>

      <SettingRow label="Font Size" description="Controls text scale inside editors.">
        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          style={{ padding: "4px 8px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "4px", color: "white" }}
        >
          <option value="12px">12px (Small)</option>
          <option value="13px">13px (Normal)</option>
          <option value="15px">15px (Large)</option>
        </select>
      </SettingRow>

      <SettingRow label="Tab Size" description="Spaces to insert when pressing tab.">
        <select
          value={tabSize}
          onChange={(e) => setTabSize(e.target.value)}
          style={{ padding: "4px 8px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "4px", color: "white" }}
        >
          <option value="2">2 Spaces</option>
          <option value="4">4 Spaces</option>
        </select>
      </SettingRow>

      <SettingRow label="Word Wrap" description="Enable visual word wrap.">
        <Toggle enabled={wordWrap} onChange={setWordWrap} />
      </SettingRow>
    </div>
  );
}

function AISettings() {
  const { activeModelName, setProviderAndModel, apiKeys, setApiKey } = useAIStore();
  const [contextWindow, setContextWindow] = useState(true);

  return (
    <div>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
        AI & Models
      </h2>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
        Configure default target model provider weights.
      </p>

      <SettingRow label="Target model" description="Used for AI code refactor or loop maps.">
        <select
          value={activeModelName}
          onChange={(e) => {
            const m = e.target.value;
            const prov = aiProviders.find((p) => p.models.includes(m));
            if (prov) setProviderAndModel(prov.id, m);
          }}
          style={{ padding: "4px 8px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "4px", color: "white" }}
        >
          {aiProviders.flatMap((p) =>
            p.models.map((m) => (
              <option key={m} value={m}>
                {m} ({p.name})
              </option>
            ))
          )}
        </select>
      </SettingRow>

      <div style={{ marginTop: "24px" }}>
        <h3 style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>
          Provider keys configuration
        </h3>
        {aiProviders.map((p) => (
          <div key={p.id} style={{ marginBottom: "10px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              {p.name}
            </label>
            <input
              type="password"
              placeholder="sk-..."
              value={apiKeys[p.id] || ""}
              onChange={(e) => setApiKey(p.id, e.target.value)}
              style={{
                width: "100%",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-default)",
                background: "var(--bg-elevated)",
                color: "white",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationsSettings() {
  const { plugins, installPlugin, uninstallPlugin, togglePluginStatus } = usePluginStore();

  return (
    <div>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
        Plugins & SDKs
      </h2>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
        Install or toggle modular extension hooks.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
        {plugins.map((p) => (
          <div
            key={p.id}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-surface)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</span>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{p.description}</p>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              {p.installed ? (
                <>
                  <button
                    onClick={() => togglePluginStatus(p.id)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: p.status === "active" ? "rgba(16,185,129,0.15)" : "transparent",
                      color: p.status === "active" ? "#10b981" : "var(--text-muted)",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {p.status === "active" ? "Enabled" : "Disabled"}
                  </button>
                  <button
                    onClick={() => uninstallPlugin(p.id)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: "transparent",
                      color: "#ef4444",
                      border: "none",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <button
                  onClick={() => installPlugin(p.id)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "4px",
                    background: "var(--brand-600)",
                    color: "white",
                    border: "none",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  Install
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubscriptionSettings() {
  return (
    <div>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
        Subscription
      </h2>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
        Your active subscription tier.
      </p>

      <div style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "8px", padding: "16px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--brand-400)" }}>Enterprise Ultimate Plan</h3>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Unlocks Developer Monaco Studio, Autodesk Revit Grid clash modules, and EDI AI companion RAG.
        </p>
      </div>
    </div>
  );
}

function ShortcutsSettings() {
  const bindings = [
    { keys: "Ctrl + P", desc: "Quick Open Global Search" },
    { keys: "Ctrl + Shift + P", desc: "Toggle Command Palette" },
    { keys: "Ctrl + B", desc: "Toggle Left Navigation Rail" },
    { keys: "Ctrl + J", desc: "Toggle Bottom Console Terminal" },
    { keys: "Ctrl + Shift + E", desc: "Focus Workspace Explorer Pane" },
    { keys: "Ctrl + ,", desc: "Open Application Configurations Settings" },
    { keys: "Ctrl + /", desc: "Toggle AI Assistant & Properties Drawer" },
    { keys: "F11", desc: "Toggle Fullscreen Window Canvas" },
  ];

  return (
    <div>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
        Shortcuts Map
      </h2>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
        Application interface keybindings index.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {bindings.map((b) => (
          <div
            key={b.keys}
            style={{
              padding: "8px 12px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{b.desc}</span>
            <kbd style={{ padding: "3px 8px", background: "var(--bg-overlay)", border: "1px solid var(--border-default)", borderRadius: "4px", fontSize: "11px", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {b.keys}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrivacySettings() {
  const [telemetry, setTelemetry] = useState(false);
  const [diagnostics, setDiagnostics] = useState(true);

  return (
    <div>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
        Telemetry & Privacy
      </h2>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>
        Manage diagnostic logs and usage tracking options.
      </p>

      <SettingRow label="Share Telemetry Diagnostics" description="Send anonymous usage metrics to improve workspace performance.">
        <Toggle enabled={telemetry} onChange={setTelemetry} />
      </SettingRow>
      <SettingRow label="Local Crash Logger" description="Record debug execution errors to local bottom log terminal.">
        <Toggle enabled={diagnostics} onChange={setDiagnostics} />
      </SettingRow>
    </div>
  );
}

function AboutSettings() {
  return (
    <div>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
        About DataSpark
      </h2>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
        Workspace build version metadata.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "var(--bg-elevated)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
          <span style={{ color: "var(--text-muted)" }}>Application Version</span>
          <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>v2.4.0-stable</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
          <span style={{ color: "var(--text-muted)" }}>Build Hash identifier</span>
          <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>sha256:d8c07e7b...</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
          <span style={{ color: "var(--text-muted)" }}>License Status</span>
          <span style={{ color: "var(--text-secondary)" }}>Commercial Site License</span>
        </div>
      </div>
    </div>
  );
}
