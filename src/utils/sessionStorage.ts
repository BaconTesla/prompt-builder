import { Session } from "@/types/session";
import { Section } from "@/utils/xmlHelpers";

const SESSIONS_STORAGE_KEY = "prompt-sessions";

/**
 * Format timestamp to YYMMDD-HHmmss
 */
export function formatSessionId(timestamp: number): string {
  const date = new Date(timestamp);
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mn = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yy}${mm}${dd}-${hh}${mn}${ss}`;
}

/**
 * Get all sessions from localStorage
 */
export function getSessions(): Session[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error("Failed to load sessions from localStorage:", error);
  }
  return [];
}

/**
 * Save a new session
 */
export function saveSession(
  sections: Section[],
  useTranslated: boolean,
): Session {
  const timestamp = Date.now();
  const session: Session = {
    id: formatSessionId(timestamp),
    timestamp,
    sections: JSON.parse(JSON.stringify(sections)), // Deep copy
    useTranslated,
  };

  const sessions = getSessions();
  sessions.push(session);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("Failed to save session to localStorage:", error);
      throw new Error("Failed to save session");
    }
  }

  return session;
}

/**
 * Delete a session by id
 */
export function deleteSession(sessionId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const sessions = getSessions();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete session from localStorage:", error);
    throw new Error("Failed to delete session");
  }
}

/**
 * Delete all sessions
 */
export function clearAllSessions(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.removeItem(SESSIONS_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear sessions from localStorage:", error);
    throw new Error("Failed to clear sessions");
  }
}

/**
 * Get a session by id
 */
export function getSession(sessionId: string): Session | null {
  const sessions = getSessions();
  return sessions.find((s) => s.id === sessionId) || null;
}

/**
 * Get session display name
 */
export function getSessionDisplayName(sessionId: string): string {
  // The session id is already in YYMMDD-HHmmss format
  return sessionId;
}
