"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "react-toastify";
import {
  TranslationSettings,
  DEFAULT_TRANSLATION_SETTINGS,
  getApiKeyFieldForProvider,
} from "@/types/translation";

const STORAGE_KEY = "translation-settings";

// Load settings from localStorage
function loadSettingsFromStorage(): TranslationSettings {
  if (typeof window === "undefined") {
    return DEFAULT_TRANSLATION_SETTINGS;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_TRANSLATION_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error(
      "Failed to load translation settings from localStorage:",
      error,
    );
  }
  return DEFAULT_TRANSLATION_SETTINGS;
}

// Save settings to localStorage
function saveSettingsToStorage(settings: TranslationSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error(
      "Failed to save translation settings to localStorage:",
      error,
    );
  }
}

interface TranslationContextType {
  settings: TranslationSettings;
  updateSettings: (updates: Partial<TranslationSettings>) => void;
  translate: (text: string) => Promise<string>;
  isTranslating: boolean;
  translationCache: Map<string, string>;
  clearCache: () => void;
  getCurrentApiKey: () => string | undefined;
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined,
);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TranslationSettings>(
    DEFAULT_TRANSLATION_SETTINGS,
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache] = useState(() => new Map<string, string>());
  const [isHydrated, setIsHydrated] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadedSettings = loadSettingsFromStorage();
    setSettings(loadedSettings);
    setIsHydrated(true);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isHydrated) {
      saveSettingsToStorage(settings);
    }
  }, [settings, isHydrated]);

  const updateSettings = useCallback(
    (updates: Partial<TranslationSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  // Get the current API key for the selected provider
  const getCurrentApiKey = useCallback((): string | undefined => {
    const keyField = getApiKeyFieldForProvider(settings.provider);
    if (!keyField) return undefined;
    return settings[keyField] as string | undefined;
  }, [settings]);

  const clearCache = useCallback(() => {
    translationCache.clear();
  }, [translationCache]);

  // Create cache key from text and settings
  const getCacheKey = useCallback(
    (text: string) => {
      return `${settings.provider}:${settings.sourceLanguage}:${settings.targetLanguage}:${settings.model || ""}:${text}`;
    },
    [settings],
  );

  // Core translation function
  const translate = useCallback(
    async (text: string): Promise<string> => {
      if (!text.trim()) {
        return text;
      }

      // Check cache first
      const cacheKey = getCacheKey(text);
      const cached = translationCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Get the API key for the current provider
      const apiKey = getCurrentApiKey();
      if (!apiKey && settings.provider !== "custom") {
        toast.error(
          `Please configure your ${settings.provider.toUpperCase()} API key in Translation Settings`,
        );
        throw new Error(`${settings.provider} API key not configured`);
      }
      if (settings.provider === "custom" && !settings.customApiKey) {
        toast.error(
          "Please configure your Custom API key in Translation Settings",
        );
        throw new Error("Custom API key not configured");
      }
      if (settings.provider === "custom" && !settings.customApiUrl) {
        toast.error(
          "Please configure your Custom API URL in Translation Settings",
        );
        throw new Error("Custom API URL not configured");
      }

      setIsTranslating(true);

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            targetLanguage: settings.targetLanguage,
            sourceLanguage: settings.sourceLanguage,
            provider: settings.provider,
            model: settings.model,
            // Send the appropriate API key based on provider
            apiKey: apiKey,
            customApiUrl: settings.customApiUrl,
            customApiKey: settings.customApiKey,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Translation failed");
        }

        if (data.error) {
          throw new Error(data.error);
        }

        const result = data.translatedText || text;

        // Cache the result
        translationCache.set(cacheKey, result);

        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Translation failed";
        toast.error(message);
        throw error;
      } finally {
        setIsTranslating(false);
      }
    },
    [settings, getCacheKey, translationCache, getCurrentApiKey],
  );

  return (
    <TranslationContext.Provider
      value={{
        settings,
        updateSettings,
        translate,
        isTranslating,
        translationCache,
        clearCache,
        getCurrentApiKey,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
