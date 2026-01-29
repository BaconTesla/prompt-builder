export type TranslationProvider =
  | "google"
  | "deepl"
  | "openai"
  | "groq"
  | "deepseek"
  | "kimi"
  | "custom";

export interface TranslationSettings {
  provider: TranslationProvider;
  sourceLanguage: string;
  targetLanguage: string;
  model?: string;
  // API keys for each provider (stored in browser localStorage)
  googleApiKey?: string;
  deeplApiKey?: string;
  openaiApiKey?: string;
  groqApiKey?: string;
  deepseekApiKey?: string;
  kimiApiKey?: string;
  // Custom provider settings
  customApiUrl?: string;
  customApiKey?: string;
}

export interface LanguageOption {
  value: string;
  label: string;
}

export interface ProviderOption {
  value: TranslationProvider;
  label: string;
  description: string;
  icon?: string; // Path to icon in public folder
  models?: { value: string; label: string }[];
}

export const LANGUAGES: LanguageOption[] = [
  { value: "en", label: "English" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "zh-TW", label: "Chinese (Traditional)" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "ar", label: "Arabic" },
  { value: "it", label: "Italian" },
  { value: "nl", label: "Dutch" },
  { value: "pl", label: "Polish" },
  { value: "tr", label: "Turkish" },
];

export const PROVIDERS: ProviderOption[] = [
  {
    value: "google",
    label: "Google Translate",
    description: "Fast and reliable traditional translation",
    icon: "/icons/google-translate.svg",
  },
  {
    value: "deepl",
    label: "DeepL",
    description: "High-quality neural translation",
    icon: "/icons/deepl.svg",
  },
  {
    value: "openai",
    label: "OpenAI (GPT)",
    description: "LLM-based translation",
    icon: "/icons/openai.svg",
    models: [
      { value: "gpt-4o-mini", label: "GPT-4o Mini (Fast)" },
      { value: "gpt-4o", label: "GPT-4o (Best)" },
      { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    ],
  },
  {
    value: "groq",
    label: "Groq (Llama)",
    description: "Fast LLM translation with Llama models",
    icon: "/icons/groq.svg",
    models: [
      { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (Best)" },
      { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B (Fast)" },
      { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
    ],
  },
  {
    value: "deepseek",
    label: "DeepSeek",
    description: "High-quality Chinese AI translation",
    icon: "/icons/deepseek.svg",
    models: [{ value: "deepseek-chat", label: "DeepSeek Chat" }],
  },
  {
    value: "kimi",
    label: "KIMI (Moonshot)",
    description: "Moonshot AI translation service",
    icon: "/icons/kimi.svg",
    models: [
      { value: "kimi-k2-turbo-preview", label: "Moonshot K2 Fast (Preview)" },
    ],
  },
  {
    value: "custom",
    label: "Custom OpenAI-Compatible API",
    description: "Ollama, LocalAI, or other compatible APIs",
    icon: "/icons/custom.svg",
    models: [
      { value: "auto", label: "Auto-detect from provider" },
      { value: "llama2", label: "Llama 2" },
      { value: "qwen2.5", label: "Qwen 2.5" },
      { value: "mistral", label: "Mistral" },
    ],
  },
];

export const DEFAULT_TRANSLATION_SETTINGS: TranslationSettings = {
  provider: "openai",
  sourceLanguage: "en",
  targetLanguage: "zh-CN",
  model: "gpt-4o-mini",
  // API keys are stored in localStorage, not here
  googleApiKey: undefined,
  deeplApiKey: undefined,
  openaiApiKey: undefined,
  groqApiKey: undefined,
  deepseekApiKey: undefined,
  kimiApiKey: undefined,
  customApiUrl: undefined,
  customApiKey: undefined,
};

// Helper to get the API key field name for a provider
export function getApiKeyFieldForProvider(
  provider: TranslationProvider,
): keyof TranslationSettings | null {
  switch (provider) {
    case "google":
      return "googleApiKey";
    case "deepl":
      return "deeplApiKey";
    case "openai":
      return "openaiApiKey";
    case "groq":
      return "groqApiKey";
    case "deepseek":
      return "deepseekApiKey";
    case "kimi":
      return "kimiApiKey";
    case "custom":
      return "customApiKey";
    default:
      return null;
  }
}
