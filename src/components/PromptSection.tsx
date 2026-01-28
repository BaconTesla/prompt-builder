"use client";

import { useState, useRef } from "react";
import {
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
  FiTag,
  FiPlus,
  FiGlobe,
  FiX,
} from "react-icons/fi";
import { COMMON_TAGS, isValidTagName } from "@/utils/xmlHelpers";
import TranslateButton from "@/components/TranslateButton";

interface PromptSectionProps {
  tag: string;
  content: string;
  translatedContent?: string;
  onTagChange: (tag: string) => void;
  onContentChange: (content: string) => void;
  onTranslatedContentChange?: (translatedContent: string) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  index: number;
  availableTags: string[];
  onAddSection?: () => void;
  isLast?: boolean;
}

export default function PromptSection({
  tag,
  content,
  translatedContent = "",
  onTagChange,
  onContentChange,
  onTranslatedContentChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  index,
  availableTags,
  onAddSection,
  isLast = false,
}: PromptSectionProps) {
  const [customTag, setCustomTag] = useState(
    !COMMON_TAGS.includes(tag) && tag !== "",
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const isValidTag = tag.trim() === "" || isValidTagName(tag);

  const handleTagChange = (newTag: string) => {
    onTagChange(newTag);
    setCustomTag(!COMMON_TAGS.includes(newTag) && newTag !== "");
  };

  const insertTag = (tagToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = content.substring(0, start);
    const textAfter = content.substring(end);
    const tagText = `<${tagToInsert}>`;
    const newContent = textBefore + tagText + textAfter;

    onContentChange(newContent);

    // Set cursor position after the inserted tag
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + tagText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);

    setShowTagMenu(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3">
        {/* Move buttons */}
        <div className="flex flex-col gap-1">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className={`p-1 rounded ${
              canMoveUp
                ? "hover:bg-gray-200 text-gray-600"
                : "text-gray-300 cursor-not-allowed"
            }`}
            title="Move up"
          >
            <FiChevronUp size={18} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className={`p-1 rounded ${
              canMoveDown
                ? "hover:bg-gray-200 text-gray-600"
                : "text-gray-300 cursor-not-allowed"
            }`}
            title="Move down"
          >
            <FiChevronDown size={18} />
          </button>
        </div>

        <div className="flex-1">
          {/* Section number and tag input */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-semibold text-gray-500 min-w-15">
              Section {index + 1}
            </span>
            <div className="flex-1 relative">
              <div className="flex gap-2">
                {customTag ? (
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleTagChange(e.target.value)}
                    placeholder="custom-tag"
                    className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      !isValidTag ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                ) : (
                  <select
                    value={tag}
                    onChange={(e) => handleTagChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select a tag...</option>
                    {COMMON_TAGS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => {
                    setCustomTag(!customTag);
                    if (!customTag) {
                      onTagChange("");
                    }
                  }}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  {customTag ? "Preset" : "Custom"}
                </button>
              </div>
              {!isValidTag && (
                <p className="text-xs text-red-500 mt-1">
                  Tag must start with a letter or underscore and contain only
                  letters, numbers, hyphens, underscores, or periods.
                </p>
              )}
            </div>
          </div>

          {/* Content textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Enter content for this section..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
            />

            {/* Controls row */}
            <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {/* Insert Tag button */}
                {availableTags.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowTagMenu(!showTagMenu)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md transition-colors"
                      type="button"
                    >
                      <FiTag size={14} />
                      Insert Tag
                    </button>
                    {showTagMenu && (
                      <div className="absolute left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                        {availableTags.map((t) => (
                          <button
                            key={t}
                            onClick={() => insertTag(t)}
                            className="block w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm font-mono"
                            type="button"
                          >
                            &lt;{t}&gt;
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Translate button */}
                {content.trim() && onTranslatedContentChange && (
                  <TranslateButton
                    content={content}
                    onTranslated={(translated) => {
                      onTranslatedContentChange(translated);
                      setShowTranslation(true);
                    }}
                  />
                )}

                {/* Show/hide translation toggle */}
                {translatedContent && (
                  <button
                    onClick={() => setShowTranslation(!showTranslation)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                      showTranslation
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                    type="button"
                    title={
                      showTranslation ? "Hide translation" : "Show translation"
                    }
                  >
                    <FiGlobe size={12} />
                    {showTranslation ? "Hide" : "Show"}
                  </button>
                )}
              </div>

              {/* Add section button */}
              {isLast && onAddSection && (
                <button
                  onClick={onAddSection}
                  className="flex items-center justify-center w-8 h-8 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full border-2 border-dashed border-indigo-300 hover:border-indigo-400 transition-colors"
                  type="button"
                  title="Add new section"
                >
                  <FiPlus size={18} />
                </button>
              )}
            </div>

            {/* Translation preview */}
            {showTranslation && translatedContent && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-green-700 flex items-center gap-1">
                    <FiGlobe size={12} />
                    Translated Content
                  </span>
                  <button
                    onClick={() => {
                      if (onTranslatedContentChange) {
                        onTranslatedContentChange("");
                      }
                      setShowTranslation(false);
                    }}
                    className="text-green-600 hover:text-green-800 p-1"
                    title="Clear translation"
                    type="button"
                  >
                    <FiX size={14} />
                  </button>
                </div>
                <textarea
                  value={translatedContent}
                  onChange={(e) => onTranslatedContentChange?.(e.target.value)}
                  rows={3}
                  className="w-full px-2 py-1 text-sm bg-white border border-green-200 rounded focus:ring-2 focus:ring-green-500 focus:outline-none resize-y"
                  placeholder="Translated content will appear here..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
          title="Delete section"
        >
          <FiTrash2 size={20} />
        </button>
      </div>
    </div>
  );
}
