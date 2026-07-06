import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AIProvider {
  id: string;
  name: string;
  models: string[];
}

export const aiProviders: AIProvider[] = [
  { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"] },
  { id: "anthropic", name: "Anthropic Claude", models: ["claude-3-7-sonnet", "claude-3-5-sonnet", "claude-3-haiku"] },
  { id: "google", name: "Google Gemini", models: ["gemini-2.0-pro", "gemini-2.0-flash", "gemini-1.5-pro"] },
  { id: "azure", name: "Azure OpenAI", models: ["azure-gpt-4o", "azure-gpt-4"] },
  { id: "local", name: "Local Llama", models: ["llama-3.1-70b", "llama-3-8b", "mistral-7b"] }
];

interface AIStore {
  activeProviderId: string;
  activeModelName: string;
  apiKeys: Record<string, string>;
  setProviderAndModel: (providerId: string, modelName: string) => void;
  setApiKey: (providerId: string, key: string) => void;
}

export const useAIStore = create<AIStore>()(
  persist(
    (set) => ({
      activeProviderId: "openai",
      activeModelName: "gpt-4o",
      apiKeys: {},
      setProviderAndModel: (providerId, modelName) =>
        set({ activeProviderId: providerId, activeModelName: modelName }),
      setApiKey: (providerId, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [providerId]: key },
        })),
    }),
    { name: "dataspark-ai-settings" }
  )
);
