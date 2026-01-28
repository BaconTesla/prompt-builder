"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  FiPlus,
  FiCopy,
  FiRefreshCw,
  FiCheck,
  FiHelpCircle,
  FiToggleLeft,
  FiToggleRight,
  FiGlobe,
  FiChevronDown,
} from "react-icons/fi";
import copy from "clipboard-copy";
import { toast } from "react-toastify";
import PromptSection from "@/components/PromptSection";
import HelpDialog from "@/components/HelpDialog";
import TagPanel from "@/components/TagPanel";
import TranslationSettingsDialog from "@/components/TranslationSettingsDialog";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  TranslationProvider,
  useTranslation,
} from "@/context/TranslationContext";
import { generateXml, type Section } from "@/utils/xmlHelpers";
import {
  PROVIDERS,
  getApiKeyFieldForProvider,
  TranslationProvider as TranslationProviderType,
} from "@/types/translation";

function HomeContent() {
  const [sections, setSections] = useState<Section[]>([
    { tag: "role", content: "", translatedContent: "" },
    { tag: "task", content: "", translatedContent: "" },
  ]);
  const [copied, setCopied] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isTranslationSettingsOpen, setIsTranslationSettingsOpen] =
    useState(false);
  const [useTranslated, setUseTranslated] = useState(false);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  const providerDropdownRef = useRef<HTMLDivElement>(null);

  const { translate, settings, updateSettings } = useTranslation();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        providerDropdownRef.current &&
        !providerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProviderDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if a provider has API key configured
  const isProviderConfigured = (provider: TranslationProviderType): boolean => {
    if (provider === "custom") {
      return !!(settings.customApiUrl && settings.customApiKey);
    }
    const keyField = getApiKeyFieldForProvider(provider);
    if (!keyField) return false;
    return !!(settings[keyField] as string | undefined);
  };

  // Handle quick provider change
  const handleQuickProviderChange = (provider: TranslationProviderType) => {
    const providerInfo = PROVIDERS.find((p) => p.value === provider);
    updateSettings({
      provider,
      model: providerInfo?.models?.[0]?.value,
    });
    setIsProviderDropdownOpen(false);
    toast.success(`Switched to ${providerInfo?.label || provider}`);
  };

  // Get current provider info
  const currentProvider = PROVIDERS.find((p) => p.value === settings.provider);

  const handleAddSection = () => {
    setSections([...sections, { tag: "", content: "", translatedContent: "" }]);
  };

  const handleDeleteSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleTagChange = (index: number, tag: string) => {
    const newSections = [...sections];
    newSections[index].tag = tag;
    setSections(newSections);
  };

  const handleContentChange = (index: number, content: string) => {
    const newSections = [...sections];
    newSections[index].content = content;
    setSections(newSections);
  };

  const handleTranslatedContentChange = (
    index: number,
    translatedContent: string,
  ) => {
    const newSections = [...sections];
    newSections[index].translatedContent = translatedContent;
    setSections(newSections);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [
      newSections[index],
      newSections[index - 1],
    ];
    setSections(newSections);
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [
      newSections[index + 1],
      newSections[index],
    ];
    setSections(newSections);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all sections?")) {
      setSections([
        { tag: "role", content: "", translatedContent: "" },
        { tag: "task", content: "", translatedContent: "" },
      ]);
      setUseTranslated(false);
    }
  };

  // Batch translate all sections
  const handleTranslateAll = useCallback(async () => {
    setIsTranslatingAll(true);
    const newSections = [...sections];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < newSections.length; i++) {
      const section = newSections[i];
      if (section.content.trim()) {
        try {
          const translated = await translate(section.content);
          newSections[i] = { ...section, translatedContent: translated };
          successCount++;
        } catch {
          errorCount++;
        }
      }
    }

    setSections(newSections);
    setIsTranslatingAll(false);

    if (successCount > 0) {
      toast.success(
        `Translated ${successCount} section(s) to ${settings.targetLanguage}`,
      );
      setUseTranslated(true);
    }
    if (errorCount > 0) {
      toast.error(`Failed to translate ${errorCount} section(s)`);
    }
  }, [sections, translate, settings.targetLanguage]);

  const handleCopy = async () => {
    const xml = generateXml(sections, useTranslated);
    try {
      await copy(xml);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const xmlOutput = generateXml(sections, useTranslated);

  // Check if any section has translated content
  const hasTranslations = sections.some(
    (s) => s.translatedContent && s.translatedContent.trim(),
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                LLM Prompt Builder
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Design structured prompts for large language models using XML
                format
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Translate All Button */}
              <button
                onClick={() => {
                  if (!isProviderConfigured(settings.provider)) {
                    toast.error(
                      `${currentProvider?.label || settings.provider} is not configured. Please set up your API key in Translation Settings.`,
                    );
                    return;
                  }
                  handleTranslateAll();
                }}
                disabled={isTranslatingAll}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  isProviderConfigured(settings.provider)
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-400 cursor-not-allowed text-white"
                } ${isTranslatingAll ? "opacity-75" : ""}`}
                title={
                  isProviderConfigured(settings.provider)
                    ? "Translate all sections"
                    : `${currentProvider?.label || settings.provider} is not configured`
                }
              >
                {isTranslatingAll ? (
                  <FiRefreshCw size={20} className="animate-spin" />
                ) : (
                  <FiGlobe size={20} />
                )}
                {isTranslatingAll ? "Translating..." : "Translate"}
              </button>

              {/* Quick Provider Selector */}
              <div className="relative" ref={providerDropdownRef}>
                <button
                  onClick={() =>
                    setIsProviderDropdownOpen(!isProviderDropdownOpen)
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    isProviderConfigured(settings.provider)
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-yellow-500 hover:bg-yellow-600 text-white"
                  }`}
                  title={`Current: ${currentProvider?.label || settings.provider}`}
                >
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {currentProvider?.label || settings.provider}
                  </span>
                  <FiChevronDown
                    size={14}
                    className={`transition-transform ${isProviderDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isProviderDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                      Quick Provider Switch
                    </div>
                    {PROVIDERS.map((provider) => {
                      const configured = isProviderConfigured(provider.value);
                      const isActive = settings.provider === provider.value;
                      return (
                        <button
                          key={provider.value}
                          onClick={() =>
                            handleQuickProviderChange(provider.value)
                          }
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                            isActive ? "bg-green-50" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                configured ? "bg-green-500" : "bg-gray-300"
                              }`}
                            />
                            <span
                              className={
                                isActive
                                  ? "font-medium text-green-700"
                                  : "text-gray-700"
                              }
                            >
                              {provider.label}
                            </span>
                          </div>
                          {isActive && (
                            <FiCheck size={14} className="text-green-600" />
                          )}
                        </button>
                      );
                    })}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsProviderDropdownOpen(false);
                          setIsTranslationSettingsOpen(true);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
                      >
                        ⚙️ Open Translation Settings...
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Help Button */}
              <button
                onClick={() => setIsHelpOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
              >
                <FiHelpCircle size={20} />
                Help
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Prompt Sections
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                >
                  <FiRefreshCw size={16} />
                  Reset
                </button>
                <button
                  onClick={handleAddSection}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  <FiPlus size={16} />
                  Add Section
                </button>
              </div>
            </div>

            {sections.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">
                  No sections yet. Click Add Section to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section, index) => {
                  // Get all tags from other sections that have non-empty tags
                  const availableTags = sections
                    .filter((s, i) => i !== index && s.tag.trim() !== "")
                    .map((s) => s.tag);

                  return (
                    <PromptSection
                      key={index}
                      tag={section.tag}
                      content={section.content}
                      translatedContent={section.translatedContent}
                      onTagChange={(tag) => handleTagChange(index, tag)}
                      onContentChange={(content) =>
                        handleContentChange(index, content)
                      }
                      onTranslatedContentChange={(translated) =>
                        handleTranslatedContentChange(index, translated)
                      }
                      onDelete={() => handleDeleteSection(index)}
                      onMoveUp={() => handleMoveUp(index)}
                      onMoveDown={() => handleMoveDown(index)}
                      canMoveUp={index > 0}
                      canMoveDown={index < sections.length - 1}
                      index={index}
                      availableTags={availableTags}
                      onAddSection={handleAddSection}
                      isLast={index === sections.length - 1}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div>
            <div className="lg:sticky lg:top-8 space-y-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    XML Preview
                  </h2>
                  <div className="flex items-center gap-3">
                    {/* Toggle for translated content */}
                    {hasTranslations && (
                      <button
                        onClick={() => setUseTranslated(!useTranslated)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                          useTranslated
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                        title={
                          useTranslated
                            ? "Using translated content"
                            : "Using original content"
                        }
                        aria-label={
                          useTranslated
                            ? "Switch to original content"
                            : "Switch to translated content"
                        }
                      >
                        {useTranslated ? (
                          <FiToggleRight size={18} />
                        ) : (
                          <FiToggleLeft size={18} />
                        )}
                        <span className="hidden sm:inline">
                          {useTranslated ? "Translated" : "Original"}
                        </span>
                      </button>
                    )}
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                        copied
                          ? "bg-green-600 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {copied ? (
                        <>
                          <FiCheck size={16} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <FiCopy size={16} />
                          Copy to Clipboard
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono">
                    <code>{xmlOutput}</code>
                  </pre>
                  {useTranslated && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                        Translated
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Sections:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {sections.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Characters:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {xmlOutput.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tag Panel */}
              <TagPanel sections={sections} onReorder={setSections} />

              {/* Tips */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use preset tags or create custom ones</li>
                  <li>• Drag tags below to reorder sections</li>
                  <li>• Empty tags will be filtered out in XML</li>
                  <li>• Special characters are automatically escaped</li>
                  <li>
                    • Click the translate button on each section or use
                    &quot;Translate All&quot;
                  </li>
                  <li>
                    • Toggle between original and translated content in preview
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 text-center text-sm text-gray-600">
        <p>Built with Next.js, React, and Tailwind CSS</p>
      </footer>

      {/* Help Dialog */}
      <HelpDialog isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Translation Settings Dialog */}
      <TranslationSettingsDialog
        isOpen={isTranslationSettingsOpen}
        onClose={() => setIsTranslationSettingsOpen(false)}
        onTranslateAll={handleTranslateAll}
        isTranslatingAll={isTranslatingAll}
      />
    </div>
  );
}

// Wrap with TranslationProvider
export default function Home() {
  return (
    <TranslationProvider>
      <HomeContent />
    </TranslationProvider>
  );
}
