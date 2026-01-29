"use client";

import React, { useState, useSyncExternalStore } from "react";
import { FiMenu, FiX, FiSave, FiClock, FiTrash2 } from "react-icons/fi";
import SessionHistory from "@/components/SessionHistory";
import { useSession } from "@/context/SessionContext";
import { Session } from "@/types/session";
import { Section } from "@/utils/xmlHelpers";

interface SidebarProps {
  sections: Section[];
  useTranslated: boolean;
  onLoadSession: (session: Session, checkCurrent: boolean) => void;
  isLoading: boolean;
}

// Hook to handle client-side hydration
const useIsClient = () => {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
};

export default function Sidebar({
  sections,
  useTranslated,
  onLoadSession,
  isLoading,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isClient = useIsClient();
  const { saveCurrentSession, clearAllSessions } = useSession();

  const handleSaveSession = () => {
    if (sections.length === 0 || sections.every((s) => !s.content.trim())) {
      alert("Please enter some content before saving a session.");
      return;
    }
    saveCurrentSession(sections, useTranslated);
    // Close sidebar on mobile after saving
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
          isCollapsed ? "w-16" : "w-64 shadow-xl"
        } ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!isCollapsed && (
              <h2 className="text-lg font-bold text-gray-900">Sessions</h2>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Content */}
          <div
            className={`flex-1 overflow-y-auto space-y-4 ${isCollapsed ? "p-2" : "p-4"}`}
          >
            {/* Save Button */}
            <button
              onClick={handleSaveSession}
              className={`w-full flex items-center justify-center py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium whitespace-nowrap overflow-hidden ${
                isCollapsed ? "px-0" : "gap-2 px-4"
              }`}
              title="Save current session"
            >
              <FiSave size={18} className="flex-shrink-0" />
              {!isCollapsed && <span>Save Session</span>}
            </button>

            {/* Session History */}
            <div>
              {!isCollapsed && (
                <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold text-sm">
                  <FiClock size={16} />
                  History
                </div>
              )}
              <SessionHistory
                onLoadSession={onLoadSession}
                isLoading={isLoading}
                isCollapsed={isCollapsed}
              />
            </div>
          </div>

          {/* Footer Info */}
          <div
            className={`border-t border-gray-200 ${isCollapsed ? "p-2" : "p-4"}`}
          >
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete all sessions?")) {
                  clearAllSessions();
                }
              }}
              className={`w-full flex items-center justify-center gap-2 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm ${isCollapsed ? "px-0" : "px-3"}`}
              title="Delete all sessions"
            >
              <FiTrash2 size={16} className="flex-shrink-0" />
              {!isCollapsed && "Delete All"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
