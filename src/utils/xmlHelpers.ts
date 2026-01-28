/**
 * Escapes special XML characters in a string
 */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Validates if a tag name is valid for XML
 */
export function isValidTagName(tag: string): boolean {
  // XML tag names must start with a letter or underscore,
  // and can contain letters, digits, hyphens, underscores, and periods
  const xmlTagPattern = /^[a-zA-Z_][\w.-]*$/;
  return xmlTagPattern.test(tag);
}

/**
 * Generates XML string from sections array
 */
export interface Section {
  tag: string;
  content: string;
  translatedContent?: string;
}

export function generateXml(
  sections: Section[],
  useTranslated: boolean = false,
): string {
  if (sections.length === 0) {
    return "<prompt>\n</prompt>";
  }

  const xmlContent = sections
    .filter((section) => section.tag.trim() !== "")
    .map((section) => {
      const tag = section.tag.trim();
      // Use translated content if available and requested, otherwise use original
      const contentToUse =
        useTranslated && section.translatedContent?.trim()
          ? section.translatedContent
          : section.content;
      const content = escapeXml(contentToUse);
      return `  <${tag}>${content}</${tag}>`;
    })
    .join("\n");

  return `<prompt>\n${xmlContent}\n</prompt>`;
}

/**
 * Common prompt tag suggestions
 */
export const COMMON_TAGS = [
  "role",
  "task",
  "instructions",
  "examples",
  "constraints",
  "output-format",
  "context",
  "guidelines",
  "steps",
  "requirements",
];
