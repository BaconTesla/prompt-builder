"use client";

import { useState } from "react";
import { FiTrash2, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { COMMON_TAGS, isValidTagName } from "@/utils/xmlHelpers";

interface PromptSectionProps {
  tag: string;
  content: string;
  onTagChange: (tag: string) => void;
  onContentChange: (content: string) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  index: number;
}

export default function PromptSection({
  tag,
  content,
  onTagChange,
  onContentChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  index,
}: PromptSectionProps) {
  const [customTag, setCustomTag] = useState(
    !COMMON_TAGS.includes(tag) && tag !== "",
  );

  const isValidTag = tag.trim() === "" || isValidTagName(tag);

  const handleTagChange = (newTag: string) => {
    onTagChange(newTag);
    setCustomTag(!COMMON_TAGS.includes(newTag) && newTag !== "");
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
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Enter content for this section..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
          />
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
