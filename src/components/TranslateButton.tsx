"use client";

import { useState } from "react";
import { FiGlobe, FiRefreshCw } from "react-icons/fi";
import { useTranslation } from "@/context/TranslationContext";

interface TranslateButtonProps {
  content: string;
  onTranslated: (translatedContent: string) => void;
  size?: "sm" | "md";
}

export default function TranslateButton({
  content,
  onTranslated,
  size = "sm",
}: TranslateButtonProps) {
  const { translate, isTranslating, settings } = useTranslation();
  const [localLoading, setLocalLoading] = useState(false);

  const handleTranslate = async () => {
    if (!content.trim()) return;

    setLocalLoading(true);
    try {
      const translated = await translate(content);
      onTranslated(translated);
    } catch (error) {
      // Error is already handled by toast in context
      console.error("Translation failed:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = localLoading || isTranslating;
  const buttonSize =
    size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <button
      onClick={handleTranslate}
      disabled={isLoading || !content.trim()}
      className={`flex items-center gap-1 ${buttonSize} bg-green-100 hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 text-green-700 rounded-md transition-colors`}
      title={`Translate to ${settings.targetLanguage}`}
      aria-label={`Translate content to ${settings.targetLanguage}`}
    >
      {isLoading ? (
        <FiRefreshCw className="animate-spin" size={iconSize} />
      ) : (
        <FiGlobe size={iconSize} />
      )}
      <span className="hidden sm:inline">
        {isLoading ? "..." : "Translate"}
      </span>
    </button>
  );
}
