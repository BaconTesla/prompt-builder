"use client";

import { FiRepeat } from "react-icons/fi";
import { useTranslation } from "@/context/TranslationContext";
import { LANGUAGES } from "@/types/translation";

// Language code to flag emoji mapping (using regional indicator symbols)
const LANGUAGE_FLAGS: Record<string, string> = {
  en: "🇺🇸",
  ja: "🇯🇵",
  ko: "🇰🇷",
  fr: "🇫🇷",
  de: "🇩🇪",
  es: "🇪🇸",
  pt: "🇵🇹",
  ru: "🇷🇺",
  ar: "🇸🇦",
  it: "🇮🇹",
  nl: "🇳🇱",
  pl: "🇵🇱",
  tr: "🇹🇷",
};

// Languages that use custom SVG icons (placed in /public/icons/)
const LANGUAGE_ICONS: Record<string, string> = {
  "zh-CN": "/icons/zh-CN.svg",
  "zh-TW": "/icons/zh-TW.svg",
};

// Get display for a language (icon path, flag emoji, or abbreviation)
function getLanguageDisplay(langCode: string): {
  icon?: string;
  flag?: string;
  abbr: string;
} {
  const icon = LANGUAGE_ICONS[langCode];
  const flag = LANGUAGE_FLAGS[langCode];
  // Get abbreviation: first 2 characters of the code, uppercase
  const abbr = langCode.split("-")[0].toUpperCase();
  return { icon, flag, abbr };
}

// Get language label
function getLanguageLabel(langCode: string): string {
  const lang = LANGUAGES.find((l) => l.value === langCode);
  return lang?.label || langCode;
}

export default function LanguageSwitcher() {
  const { settings, updateSettings } = useTranslation();

  const sourceDisplay = getLanguageDisplay(settings.sourceLanguage);
  const targetDisplay = getLanguageDisplay(settings.targetLanguage);

  const handleSwap = () => {
    updateSettings({
      sourceLanguage: settings.targetLanguage,
      targetLanguage: settings.sourceLanguage,
    });
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1.5">
      {/* Source Language */}
      <div
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 cursor-default"
        title={`Source: ${getLanguageLabel(settings.sourceLanguage)}`}
      >
        {sourceDisplay.icon ? (
          <img
            src={sourceDisplay.icon}
            alt={getLanguageLabel(settings.sourceLanguage)}
            width={20}
            height={20}
            className="rounded-sm w-5 h-5"
          />
        ) : sourceDisplay.flag ? (
          <span className="text-base">{sourceDisplay.flag}</span>
        ) : (
          <span className="text-xs font-medium text-gray-600 bg-gray-200 px-1.5 py-0.5 rounded">
            {sourceDisplay.abbr}
          </span>
        )}
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-600 hover:text-gray-800"
        title="Swap languages"
        aria-label="Swap source and target languages"
      >
        <FiRepeat size={16} />
      </button>

      {/* Target Language */}
      <div
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 cursor-default"
        title={`Target: ${getLanguageLabel(settings.targetLanguage)}`}
      >
        {targetDisplay.icon ? (
          <img
            src={targetDisplay.icon}
            alt={getLanguageLabel(settings.targetLanguage)}
            width={20}
            height={20}
            className="rounded-sm w-5 h-5"
          />
        ) : targetDisplay.flag ? (
          <span className="text-base">{targetDisplay.flag}</span>
        ) : (
          <span className="text-xs font-medium text-gray-600 bg-gray-200 px-1.5 py-0.5 rounded">
            {targetDisplay.abbr}
          </span>
        )}
      </div>
    </div>
  );
}
