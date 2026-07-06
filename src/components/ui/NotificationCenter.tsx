"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  Trash2,
  AlertCircle,
  Sparkles,
  Puzzle,
  Briefcase,
  RefreshCw,
  Info,
} from "lucide-react";
import { useUIStore, AppNotification, NotificationCategory } from "@/store/uiStore";
import { useRouter } from "next/navigation";

const categoryIcons: Record<NotificationCategory, React.ElementType> = {
  system: Info,
  ai: Sparkles,
  plugins: Puzzle,
  workspace: Briefcase,
  updates: RefreshCw,
  errors: AlertCircle,
};

const categoryColors: Record<NotificationCategory, string> = {
  system: "#38bdf8",
  ai: "#a855f7",
  plugins: "#f59e0b",
  workspace: "#6366f1",
  updates: "#10b981",
  errors: "#ef4444",
};

interface NotificationCenterProps {
  onClose: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAllRead,
    clearNotification,
    clearAllNotifications,
  } = useUIStore();
  const [filter, setFilter] = useState<NotificationCategory | "all">("all");
  const router = useRouter();

  const filtered = notifications.filter(
    (n) => filter === "all" || n.category === filter
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "transparent",
          zIndex: 900,
        }}
      />

      {/* Drawer */}
      <motion.div
        initial={{ opacity: 0, x: 280 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 280 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          top: "44px",
          right: "12px",
          bottom: "34px",
          width: "360px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-strong)",
          borderRadius: "12px",
          boxShadow: "var(--shadow-lg)",
          zIndex: 901,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={15} color="var(--brand-400)" />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <span
                style={{
                  background: "var(--brand-600)",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: "100px",
                }}
              >
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Action Bar */}
        {notifications.length > 0 && (
          <div
            style={{
              padding: "8px 12px",
              background: "var(--bg-surface)",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              style={{
                background: "transparent",
                border: "none",
                color: unreadCount === 0 ? "var(--text-disabled)" : "var(--brand-400)",
                fontSize: "11px",
                cursor: unreadCount === 0 ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: 500,
              }}
            >
              <Check size={11} /> Mark all read
            </button>
            <button
              onClick={clearAllNotifications}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "11px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: 500,
              }}
            >
              <Trash2 size={11} /> Clear all
            </button>
          </div>
        )}

        {/* Filters */}
        <div
          style={{
            padding: "8px",
            display: "flex",
            gap: "4px",
            overflowX: "auto",
            borderBottom: "1px solid var(--border-subtle)",
            flexShrink: 0,
          }}
        >
          {(["all", "system", "ai", "plugins", "updates", "errors"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: "none",
                background: filter === cat ? "var(--bg-active)" : "transparent",
                color: filter === cat ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: "10px",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                textTransform: "capitalize",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {filtered.length === 0 ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                color: "var(--text-muted)",
                fontSize: "12px",
                padding: "40px 0",
              }}
            >
              <Bell size={24} style={{ opacity: 0.2 }} />
              <span>No notifications in this filter</span>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filtered.map((n) => {
                const Icon = categoryIcons[n.category] || Info;
                const color = categoryColors[n.category] || "var(--text-muted)";
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, height: 0, y: 10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: n.read ? "transparent" : "rgba(255,255,255,0.02)",
                      border: "1px solid var(--border-subtle)",
                      marginBottom: "6px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {!n.read && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: "3px",
                          background: color,
                        }}
                      />
                    )}

                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      {/* Icon */}
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "6px",
                          background: `${color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={12} color={color} />
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: n.read ? 500 : 600,
                              color: "var(--text-primary)",
                            }}
                          >
                            {n.title}
                          </span>
                          <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>
                            {n.timestamp}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                            marginTop: "3px",
                            lineHeight: 1.4,
                          }}
                        >
                          {n.message}
                        </p>

                        {/* Action buttons */}
                        {n.action && (
                          <button
                            onClick={() => {
                              router.push(n.action!.target);
                              onClose();
                            }}
                            style={{
                              marginTop: "8px",
                              padding: "4px 8px",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid var(--border-default)",
                              borderRadius: "4px",
                              color: "var(--text-primary)",
                              fontSize: "10px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {n.action.label}
                          </button>
                        )}
                      </div>

                      {/* Dismiss button */}
                      <button
                        onClick={() => clearNotification(n.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          padding: "2px",
                          opacity: 0.5,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = "0.5";
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </>
  );
}
