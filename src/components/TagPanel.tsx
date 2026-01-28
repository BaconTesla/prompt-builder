"use client";

import { useState, useRef } from "react";
import { FiTag, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Section } from "@/utils/xmlHelpers";

interface TagPanelProps {
  sections: Section[];
  onReorder: (newSections: Section[]) => void;
}

export default function TagPanel({ sections, onReorder }: TagPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [insertPosition, setInsertPosition] = useState<
    "before" | "after" | null
  >(null);
  const dragCounter = useRef(0);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setInsertPosition(null);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    dragCounter.current++;
    if (draggedIndex !== null && draggedIndex !== index) {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX;
      const elementMiddle = rect.left + rect.width / 2;

      // Determine if mouse position is in the left or right half of the element
      const position = mouseX < elementMiddle ? "before" : "after";

      setDragOverIndex(index);
      setInsertPosition(position);
    }
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
      setInsertPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    dragCounter.current = 0;

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null);
      setInsertPosition(null);
      return;
    }

    const newSections = [...sections];
    const [draggedSection] = newSections.splice(draggedIndex, 1);

    // Calculate actual insertion index
    let actualInsertIndex = dropIndex;

    // If inserting after, need +1
    if (insertPosition === "after") {
      actualInsertIndex = dropIndex + 1;
    }

    // If drag source is before insertion position, adjust index
    if (draggedIndex < actualInsertIndex) {
      actualInsertIndex--;
    }

    newSections.splice(actualInsertIndex, 0, draggedSection);

    onReorder(newSections);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setInsertPosition(null);
  };

  // Filter sections with non-empty tags
  const validSections = sections.filter((section) => section.tag.trim() !== "");

  if (validSections.length === 0) {
    return null; // Don't show if there are no tags
  }

  return (
    <div className="mt-4 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FiTag className="text-indigo-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Active Tags</h3>
          <span className="bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full text-sm font-medium">
            {validSections.length}
          </span>
        </div>
        <div className="text-gray-500">
          {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-4 bg-blue-50 p-2 rounded">
            💡 Drag tags to the left half of the target position to insert
            before, right half to insert after
          </p>

          {/* Grid Layout for Tags */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sections.map((section, index) => {
              if (section.tag.trim() === "") return null;

              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`
                    group relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 
                    transition-all duration-200 cursor-move
                    ${isDragging ? "opacity-50 scale-95 border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50"}
                    ${isDragOver && !isDragging ? "border-indigo-400 bg-indigo-50" : ""}
                    ${!isDragging && !isDragOver ? "hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md" : ""}
                  `}
                >
                  {/* Insert position indicator - left side */}
                  {isDragOver && insertPosition === "before" && !isDragging && (
                    <div className="absolute -left-1 top-0 bottom-0 w-1 bg-indigo-500 rounded-full shadow-lg z-10">
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-indigo-500 rounded-full"></div>
                    </div>
                  )}

                  {/* Insert position indicator - right side */}
                  {isDragOver && insertPosition === "after" && !isDragging && (
                    <div className="absolute -right-1 top-0 bottom-0 w-1 bg-indigo-500 rounded-full shadow-lg z-10">
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-indigo-500 rounded-full"></div>
                    </div>
                  )}

                  {/* Drag handle indicator - top corner */}
                  <div className="absolute top-1 left-1 flex gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-indigo-500"></div>
                    <div className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-indigo-500"></div>
                    <div className="w-1 h-1 rounded-full bg-gray-400 group-hover:bg-indigo-500"></div>
                  </div>

                  {/* Section number */}
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                    {index + 1}
                  </div>

                  {/* Tag name */}
                  <div className="text-center w-full">
                    <code className="text-xs font-mono font-semibold text-gray-800 break-all">
                      &lt;{section.tag}&gt;
                    </code>
                  </div>

                  {/* Content preview - optional */}
                  {section.content.trim() && (
                    <div className="text-xs text-gray-500 text-center w-full truncate px-1">
                      {section.content.trim().substring(0, 12)}
                      {section.content.trim().length > 12 ? "..." : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
