"use client";

import { useState } from "react";
import {
  FiX,
  FiGlobe,
  FiRefreshCw,
  FiRepeat,
  FiKey,
  FiEye,
  FiEyeOff,
  FiCheck,
} from "react-icons/fi";
import { useTranslation } from "@/context/TranslationContext";
import {
  LANGUAGES,
  PROVIDERS,
  getApiKeyFieldForProvider,
} from "@/types/translation";

interface TranslationSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTranslateAll?: () => void;
  isTranslatingAll?: boolean;
}

export default function TranslationSettingsDialog({
  isOpen,
  onClose,
  onTranslateAll,
  isTranslatingAll = false,
}: TranslationSettingsDialogProps) {
  const { settings, updateSettings, clearCache } = useTranslation();
  const [showApiKey, setShowApiKey] = useState(false);

  const currentProvider = PROVIDERS.find((p) => p.value === settings.provider);
  const hasModels =
    currentProvider?.models && currentProvider.models.length > 0;

  // Get the current API key field and value for the selected provider
  const apiKeyField = getApiKeyFieldForProvider(settings.provider);
  const currentApiKey = apiKeyField
    ? (settings[apiKeyField] as string | undefined)
    : undefined;

  // Helper to get API key placeholder text based on provider
  const getApiKeyPlaceholder = () => {
    switch (settings.provider) {
      case "google":
        return "Enter your Google Cloud Translation API key";
      case "deepl":
        return "Enter your DeepL API key";
      case "openai":
        return "Enter your OpenAI API key (sk-...)";
      case "groq":
        return "Enter your Groq API key";
      case "deepseek":
        return "Enter your DeepSeek API key (sk-...)";
      case "kimi":
        return "Enter your Moonshot/KIMI API key (sk-...)";
      case "custom":
        return "Enter your API key (if required)";
      default:
        return "Enter API key";
    }
  };

  // Helper to get API key help text
  const getApiKeyHelpText = () => {
    switch (settings.provider) {
      case "google":
        return "Get your API key from Google Cloud Console → APIs & Services → Credentials";
      case "deepl":
        return "Get your API key from DeepL Pro account → Account → API Keys";
      case "openai":
        return "Get your API key from platform.openai.com → API Keys";
      case "groq":
        return "Get your API key from console.groq.com → API Keys";
      case "deepseek":
        return "Get your API key from platform.deepseek.com → API Keys";
      case "kimi":
        return "Get your API key from platform.moonshot.cn → API Key Management";
      case "custom":
        return "Some providers may not require an API key";
      default:
        return "";
    }
  };

  const handleApiKeyChange = (value: string) => {
    if (apiKeyField) {
      updateSettings({ [apiKeyField]: value || undefined });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiGlobe size={24} />
            <h2 className="text-2xl font-bold">Translation Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors group"
            aria-label="Close"
          >
            <FiX
              size={24}
              className="text-white group-hover:text-gray-900 transition-colors"
            />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Translation Provider
            </label>
            <select
              value={settings.provider}
              onChange={(e) => {
                const provider = e.target.value as typeof settings.provider;
                const providerInfo = PROVIDERS.find(
                  (p) => p.value === provider,
                );
                updateSettings({
                  provider,
                  model: providerInfo?.models?.[0]?.value,
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
              aria-label="Translation provider"
            >
              {PROVIDERS.map((provider) => (
                <option key={provider.value} value={provider.value}>
                  {provider.label} - {provider.description}
                </option>
              ))}
            </select>
          </div>

          {/* Model Selection (for LLM providers) */}
          {hasModels && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <select
                value={settings.model || ""}
                onChange={(e) => updateSettings({ model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                aria-label="AI model"
              >
                {currentProvider?.models?.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* API Key Input (for all providers except custom which has its own section) */}
          {settings.provider !== "custom" && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiKey size={14} />
                API Key
                {currentApiKey && (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                    <FiCheck size={10} />
                    Configured
                  </span>
                )}
              </label>
              <div className="relative mt-2">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={currentApiKey || ""}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder={getApiKeyPlaceholder()}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                  aria-label={`${settings.provider} API key`}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showApiKey ? "Hide API key" : "Show API key"}
                >
                  {showApiKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {getApiKeyHelpText()}
              </p>
            </div>
          )}

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Languages
            </label>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  Source
                </label>
                <select
                  value={settings.sourceLanguage}
                  onChange={(e) =>
                    updateSettings({ sourceLanguage: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                  aria-label="Source language"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() =>
                  updateSettings({
                    sourceLanguage: settings.targetLanguage,
                    targetLanguage: settings.sourceLanguage,
                  })
                }
                className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors mb-0.5"
                title="Swap languages"
                aria-label="Swap source and target languages"
              >
                <FiRepeat size={18} />
              </button>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  Target
                </label>
                <select
                  value={settings.targetLanguage}
                  onChange={(e) =>
                    updateSettings({ targetLanguage: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                  aria-label="Target language"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Custom API Configuration (only for custom provider) */}
          {settings.provider === "custom" && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
              <h3 className="font-medium text-gray-900">
                Custom API Configuration
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Base URL
                </label>
                <input
                  type="url"
                  value={settings.customApiUrl || ""}
                  onChange={(e) =>
                    updateSettings({
                      customApiUrl: e.target.value || undefined,
                    })
                  }
                  placeholder="e.g., http://localhost:11434/v1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                  aria-label="Custom API base URL"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Examples: Ollama (http://localhost:11434/v1), LocalAI
                  (http://localhost:8080/v1)
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiKey size={14} />
                  API Key
                  {settings.customApiKey && (
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                      <FiCheck size={10} />
                      Configured
                    </span>
                  )}
                </label>
                <div className="relative mt-2">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={settings.customApiKey || ""}
                    onChange={(e) =>
                      updateSettings({
                        customApiKey: e.target.value || undefined,
                      })
                    }
                    placeholder="Enter your API key (required for most providers)"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                    aria-label="Custom API key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showApiKey ? "Hide API key" : "Show API key"}
                  >
                    {showApiKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty only for local services like Ollama that
                  don&apos;t require authentication
                </p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 text-sm">
              🔒 Privacy Notice
            </h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>
                  API keys are stored securely in your browser&apos;s local
                  storage
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>
                  Your keys are never sent to our servers - only directly to
                  your chosen translation provider
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>Clear your browser data to remove stored API keys</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={clearCache}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
            title="Clear translation cache"
            aria-label="Clear translation cache"
          >
            <FiRefreshCw size={16} />
            Clear Cache
          </button>
          <div className="flex gap-3">
            {onTranslateAll && (
              <button
                onClick={() => {
                  onTranslateAll();
                  onClose();
                }}
                disabled={isTranslatingAll}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors"
                aria-label="Translate all sections"
              >
                {isTranslatingAll ? (
                  <>
                    <FiRefreshCw className="animate-spin" size={16} />
                    Translating...
                  </>
                ) : (
                  <>
                    <FiGlobe size={16} />
                    Translate All
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
