"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Code2,
  Sparkles,
  Columns,
  LayoutGrid,
  FilePlus,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectStore } from "@/store/projectStore";
import { useUIStore } from "@/store/uiStore";
import { TabBar } from "@/components/layout/TabBar";

// Monaco Editor loaded client-side only
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false, loading: () => <EditorLoading /> }
);

function EditorLoading() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        gap: "12px",
      }}
    >
      <div className="skeleton" style={{ width: "80%", height: "24px" }} />
      <div className="skeleton" style={{ width: "60%", height: "20px" }} />
      <div className="skeleton" style={{ width: "70%", height: "20px" }} />
      <div style={{ color: "var(--text-muted)", fontSize: "12px", fontFamily: "var(--font-mono)", marginTop: "12px" }}>
        Loading Monaco compiler...
      </div>
    </div>
  );
}

const extColors: Record<string, string> = {
  tsx: "#61dafb",
  ts: "#3178c6",
  css: "#f472b6",
  json: "#fbbf24",
  js: "#f59e0b",
};

const languageMap: Record<string, string> = {
  tsx: "typescript",
  ts: "typescript",
  css: "css",
  json: "json",
  js: "javascript",
  html: "html",
  md: "markdown",
};

export function DeveloperStudio() {
  const { activeProject } = useProjectStore();
  const project = activeProject();

  const {
    tabs,
    activeTabId,
    addTab,
    splitMode,
  } = useUIStore();

  const [editorContent, setEditorContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Sync project files list into UI tabs on mount/import
  useEffect(() => {
    if (project && project.type === "developer" && project.files.length > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        const fileList: any[] = [];
        const flatten = (arr: any[]) => {
          arr.forEach((f) => {
            if (f.type === "file") {
              fileList.push({
                name: f.name,
                ext: f.ext || "ts",
                path: f.name,
                content: f.content || "",
              });
            } else if (f.children) {
              flatten(f.children);
            }
          });
        };
        flatten(project.files);

        // Prepopulate first 2 files into tab states
        fileList.slice(0, 3).forEach((f) => {
          addTab("developer", {
            label: f.name,
            path: f.path,
            language: languageMap[f.ext] || "typescript",
          });
          setEditorContent((prev) => ({ ...prev, [f.name]: f.content }));
        });
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [project, addTab]);

  const activeId = activeTabId.developer;
  const currentTabsList = tabs.developer || [];
  const currentTab = currentTabsList.find((t) => t.id === activeId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {project && currentTabsList.length > 0 ? (
        <>
          {/* Tab bar */}
          <TabBar workspace="developer" />

          {/* Breadcrumb path */}
          {currentTab && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "0 12px",
                height: "24px",
                borderBottom: "1px solid var(--border-subtle)",
                fontSize: "11px",
                color: "var(--text-muted)",
                flexShrink: 0,
                background: "var(--bg-base)",
              }}
            >
              <span className="breadcrumb-segment">{project.name}</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-segment">{currentTab.label}</span>
            </div>
          )}

          {/* Editor Workspace (With split support) */}
          <div style={{ flex: 1, display: "flex", flexDirection: splitMode === "horizontal" ? "column" : "row", overflow: "hidden", position: "relative" }}>
            {isLoading ? (
              <EditorLoading />
            ) : currentTab ? (
              <>
                <div style={{ flex: 1, height: "100%", width: "100%" }}>
                  <MonacoEditor
                    height="100%"
                    language={currentTab.language || "typescript"}
                    value={editorContent[currentTab.label] || ""}
                    onChange={(val) => {
                      if (val !== undefined) {
                        setEditorContent((prev) => ({ ...prev, [currentTab.label]: val }));
                      }
                    }}
                    theme="vs-dark"
                    options={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 13,
                      lineHeight: 22,
                      minimap: { enabled: true },
                      scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                      padding: { top: 12, bottom: 12 },
                      smoothScrolling: true,
                      cursorBlinking: "smooth",
                      cursorSmoothCaretAnimation: "on",
                    }}
                  />
                </div>

                {splitMode !== "none" && (
                  <>
                    <div style={{ background: "var(--border-subtle)", width: splitMode === "vertical" ? "1px" : "100%", height: splitMode === "horizontal" ? "1px" : "100%" }} />
                    <div style={{ flex: 1, height: "100%", width: "100%" }}>
                      <MonacoEditor
                        height="100%"
                        language={currentTab.language || "typescript"}
                        value={editorContent[currentTab.label] || ""}
                        theme="vs-dark"
                        options={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: 13,
                          lineHeight: 22,
                          readOnly: true,
                          minimap: { enabled: false },
                          padding: { top: 12, bottom: 12 },
                        }}
                      />
                    </div>
                  </>
                )}
              </>
            ) : (
              <WelcomeScreen />
            )}

            {/* AI Inline floating tip */}
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                fontSize: "11px",
                color: "#818cf8",
                fontWeight: 500,
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                zIndex: 5,
              }}
            >
              <Sparkles size={12} />
              Ctrl+K — AI Assist
            </div>
          </div>

          {/* Tab Footer status */}
          {currentTab && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 12px",
                height: "22px",
                borderTop: "1px solid var(--border-subtle)",
                background: "var(--bg-surface)",
                fontSize: "11px",
                color: "var(--text-muted)",
                flexShrink: 0,
              }}
            >
              <div>Ln 1, Col 1 · UTF-8</div>
              <div>Spaces: 2</div>
            </div>
          )}
        </>
      ) : (
        <WelcomeScreen />
      )}
    </div>
  );
}

function WelcomeScreen() {
  const { importSampleProject, createProject } = useProjectStore();

  return (
    <div className="empty-state">
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--brand-400)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.8 }}
      >
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <path d="m10 13-2 2 2 2" />
        <path d="m14 17 2-2-2-2" />
      </svg>
      <div>
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
          No Active Repository
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "320px", margin: "0 auto", lineHeight: 1.5 }}>
          Create a fresh code workspace or import a pre-configured Next.js template to begin workspace execution.
        </p>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => {
            const name = prompt("Enter project name:", "My Code Studio");
            if (name) createProject(name, "developer");
          }}
          style={{
            padding: "8px 14px",
            borderRadius: "6px",
            border: "none",
            background: "var(--brand-600)",
            color: "white",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-700)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand-600)")}
        >
          Create Empty Project
        </button>
        <button
          onClick={() => importSampleProject("developer")}
          style={{
            padding: "8px 14px",
            borderRadius: "6px",
            border: "1px solid var(--border-default)",
            background: "var(--bg-elevated)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 500,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
        >
          Import Sample Repo
        </button>
      </div>
    </div>
  );
}
