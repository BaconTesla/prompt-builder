"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { toast } from "react-toastify";
import { Session } from "@/types/session";
import { Section } from "@/utils/xmlHelpers";
import {
  getSessions as getStoredSessions,
  saveSession,
  deleteSession as deleteStoredSession,
  clearAllSessions as clearStoredSessions,
  getSession,
  getSessionDisplayName,
} from "@/utils/sessionStorage";

interface SessionContextType {
  sessions: Session[];
  loadSessions: () => void;
  saveCurrentSession: (sections: Section[], useTranslated: boolean) => void;
  deleteSessionById: (sessionId: string) => void;
  clearAllSessions: () => void;
  getSessionById: (sessionId: string) => Session | null;
  getSessionDisplayName: (sessionId: string) => string;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Initialize sessions from localStorage (client-side only)
  const [sessions, setSessions] = useState<Session[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return getStoredSessions();
    } catch (error) {
      console.error("Failed to load sessions:", error);
      return [];
    }
  });

  const loadSessions = useCallback(() => {
    try {
      const loaded = getStoredSessions();
      setSessions(loaded);
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast.error("Failed to load sessions");
    }
  }, []);

  const saveCurrentSession = useCallback(
    (sections: Section[], useTranslated: boolean) => {
      try {
        const newSession = saveSession(sections, useTranslated);
        // Reload all sessions from localStorage to ensure sync
        const updated = getStoredSessions();
        setSessions(updated);
        toast.success(`Session saved: ${newSession.id}`);
      } catch (error) {
        console.error("Error saving session:", error);
        toast.error("Failed to save session");
      }
    },
    [],
  );

  const deleteSessionById = useCallback((sessionId: string) => {
    try {
      console.log("Deleting session:", sessionId);
      // Delete from localStorage
      deleteStoredSession(sessionId);
      // Reload all sessions from localStorage to ensure sync
      const updated = getStoredSessions();
      console.log("Updated sessions after delete:", updated);
      setSessions(updated);
      toast.success("Session deleted");
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete session");
    }
  }, []);

  const clearAllSessions = useCallback(() => {
    try {
      console.log("Clearing all sessions");
      // Clear from localStorage
      clearStoredSessions();
      // Set sessions to empty array
      setSessions([]);
      toast.success("All sessions deleted");
    } catch (error) {
      console.error("Error clearing sessions:", error);
      toast.error("Failed to clear sessions");
    }
  }, []);

  const getSessionById = useCallback((sessionId: string): Session | null => {
    return getSession(sessionId);
  }, []);

  const getDisplayName = useCallback((sessionId: string): string => {
    return getSessionDisplayName(sessionId);
  }, []);

  const value: SessionContextType = {
    sessions,
    loadSessions,
    saveCurrentSession,
    deleteSessionById,
    clearAllSessions,
    getSessionById,
    getSessionDisplayName: getDisplayName,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
