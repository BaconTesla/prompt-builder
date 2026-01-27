"use client";

import { useState } from "react";
import { FiPlus, FiCopy, FiRefreshCw, FiCheck } from "react-icons/fi";
import copy from "clipboard-copy";
import PromptSection from "@/components/PromptSection";
import { generateXml, type Section } from "@/utils/xmlHelpers";

export default function Home() {
  const [sections, setSections] = useState<Section[]>([
    { tag: "role", content: "" },
    { tag: "task", content: "" },
  ]);
  const [copied, setCopied] = useState(false);

  const handleAddSection = () => {
    setSections([...sections, { tag: "", content: "" }]);
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
        { tag: "role", content: "" },
        { tag: "task", content: "" },
      ]);
    }
  };

  const handleCopy = async () => {
    const xml = generateXml(sections);
    try {
      await copy(xml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy to clipboard");
    }
  };

  const xmlOutput = generateXml(sections);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            LLM Prompt Builder
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Design structured prompts for large language models using XML format
          </p>
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
                {sections.map((section, index) => (
                  <PromptSection
                    key={index}
                    tag={section.tag}
                    content={section.content}
                    onTagChange={(tag) => handleTagChange(index, tag)}
                    onContentChange={(content) =>
                      handleContentChange(index, content)
                    }
                    onDelete={() => handleDeleteSection(index)}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    canMoveUp={index > 0}
                    canMoveDown={index < sections.length - 1}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  XML Preview
                </h2>
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

              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono">
                  <code>{xmlOutput}</code>
                </pre>
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

            {/* Tips */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use preset tags or create custom ones</li>
                <li>• Reorder sections with up/down arrows</li>
                <li>• Empty tags will be filtered out in XML</li>
                <li>• Special characters are automatically escaped</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 text-center text-sm text-gray-600">
        <p>Built with Next.js, React, and Tailwind CSS</p>
      </footer>
    </div>
  );
}
