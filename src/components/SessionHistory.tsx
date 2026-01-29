"use client";

import React, { useState } from "react";
import {
  FiTrash2,
  FiDownload,
  FiChevronDown,
  FiChevronUp,
  FiClock,
} from "react-icons/fi";
import { useSession } from "@/context/SessionContext";
import { Session } from "@/types/session";

interface SessionHistoryProps {
  onLoadSession: (session: Session, checkCurrent: boolean) => void;
  isLoading: boolean;
  isCollapsed?: boolean;
}

export default function SessionHistory({
  onLoadSession,
  isLoading,
  isCollapsed = false,
}: SessionHistoryProps) {
  const { sessions, deleteSessionById } = useSession();
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    new Set(),
  );

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this session?")) {
      deleteSessionById(sessionId);
    }
  };

  const handleToggleExpand = (sessionId: string) => {
    setExpandedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  if (sessions.length === 0) {
    if (isCollapsed) {
      return null;
    }
    return (
      <div className="text-center py-6 text-gray-500">
        <FiClock size={24} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No session history yet</p>
      </div>
    );
  }

  // Sort sessions by timestamp in descending order (newest first)
  const sortedSessions = [...sessions].sort(
    (a, b) => b.timestamp - a.timestamp,
  );

  // Collapsed mode - show only icons
  if (isCollapsed) {
    return (
      <div className="space-y-2">
        {sortedSessions.slice(0, 5).map((session) => (
          <button
            key={session.id}
            onClick={() => onLoadSession(session, true)}
            disabled={isLoading}
            className="w-full flex items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
            title={session.id}
          >
            <FiClock size={16} className="text-gray-600" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {sortedSessions.map((session) => {
        const isExpanded = expandedSessions.has(session.id);
        const sectionsCount = session.sections.length;
        const tagsPreview = session.sections
          .filter((s) => s.tag)
          .map((s) => s.tag)
          .slice(0, 2)
          .join(", ");

        return (
          <div
            key={session.id}
            className="bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors overflow-hidden"
          >
            {/* Session Header */}
            <div
              onClick={() => !isLoading && onLoadSession(session, true)}
              className={`w-full text-left px-3 py-2 flex items-center justify-between hover:opacity-80 cursor-pointer ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleExpand(session.id);
                  }}
                  className="shrink-0 text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? (
                    <FiChevronUp size={16} />
                  ) : (
                    <FiChevronDown size={16} />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {session.id}
                  </p>
                  {tagsPreview && (
                    <p className="text-xs text-gray-500 truncate">
                      {tagsPreview}
                      {session.sections.length > 2 && " ..."}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {sectionsCount}
                </span>
                {session.useTranslated && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    Translated
                  </span>
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-gray-200 bg-white px-3 py-2 text-xs space-y-1">
                <div className="text-gray-600">
                  <span className="font-medium">Sections:</span>
                  <ul className="mt-1 ml-4 space-y-0.5">
                    {session.sections.map((section, idx) => (
                      <li key={idx} className="text-gray-700">
                        <span className="font-medium">
                          {section.tag || `(${idx})`}
                        </span>
                        {section.content && (
                          <span className="text-gray-500 ml-1">
                            — {section.content.substring(0, 40)}
                            {section.content.length > 40 ? "..." : ""}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2 pt-2 mt-2 border-t border-gray-100">
                  <button
                    onClick={() => onLoadSession(session, true)}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors disabled:opacity-50"
                  >
                    <FiDownload size={12} />
                    Load
                  </button>
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs transition-colors"
                  >
                    <FiTrash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
