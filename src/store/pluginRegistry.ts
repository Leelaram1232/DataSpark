import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PluginItem {
  id: string;
  name: string;
  category: "BIM" | "EDI" | "VCS" | "CI_CD" | "DB" | "Cloud" | "AI";
  description: string;
  version: string;
  author: string;
  installed: boolean;
  status: "active" | "inactive";
}

const defaultPlugins: PluginItem[] = [
  { id: "revit-conn", name: "Autodesk Revit Connector", category: "BIM", description: "BIM synchronization and family explorer bridge for Revit APIs.", version: "1.0.4", author: "DataSpark", installed: false, status: "inactive" },
  { id: "itx-runner", name: "IBM ITX Execution Adapter", category: "EDI", description: "Execution sandbox for ITX map rule structures (.mms/.tx).", version: "3.2.1", author: "Enterprise Integrations", installed: false, status: "inactive" },
  { id: "ace-agent", name: "IBM App Connect Enterprise Client", category: "EDI", description: "Deploy maps and functional schemas to ACE Integration Server.", version: "1.1.0", author: "IBM Dev", installed: false, status: "inactive" },
  { id: "github-link", name: "GitHub Repository Manager", category: "VCS", description: "Direct connection to commit, tag, and pull maps from branches.", version: "2.0.0", author: "DataSpark", installed: false, status: "inactive" },
  { id: "docker-deploy", name: "Docker Deployment Engine", category: "CI_CD", description: "Containerize mapping runtimes and deployments automatically.", version: "1.5.0", author: "DevOps Tech", installed: false, status: "inactive" },
  { id: "sap-connector", name: "SAP IDoc RFC Adapter", category: "EDI", description: "Receive and map SAP standard IDocs (ORDERS, INVOIC, etc.).", version: "1.0.0", author: "SAP Partner LLC", installed: false, status: "inactive" }
];

interface PluginRegistryStore {
  plugins: PluginItem[];
  installPlugin: (id: string) => void;
  uninstallPlugin: (id: string) => void;
  togglePluginStatus: (id: string) => void;
}

export const usePluginStore = create<PluginRegistryStore>()(
  persist(
    (set) => ({
      plugins: defaultPlugins,
      installPlugin: (id) =>
        set((state) => ({
          plugins: state.plugins.map((p) =>
            p.id === id ? { ...p, installed: true, status: "active" } : p
          ),
        })),
      uninstallPlugin: (id) =>
        set((state) => ({
          plugins: state.plugins.map((p) =>
            p.id === id ? { ...p, installed: false, status: "inactive" } : p
          ),
        })),
      togglePluginStatus: (id) =>
        set((state) => ({
          plugins: state.plugins.map((p) =>
            p.id === id
              ? { ...p, status: p.status === "active" ? "inactive" : "active" }
              : p
          ),
        })),
    }),
    { name: "dataspark-plugin-settings" }
  )
);
