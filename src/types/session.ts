import { Section } from "@/utils/xmlHelpers";

export interface Session {
  id: string; // Format: YYMMDD-HHmmss
  timestamp: number; // Milliseconds since epoch
  sections: Section[];
  useTranslated: boolean;
}

export interface SessionListItem {
  id: string;
  timestamp: number;
  displayName: string; // Formatted as YYMMDD-HHmmss
  sectionsPreview: string; // Preview of sections count or first tag
}
