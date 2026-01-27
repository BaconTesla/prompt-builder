# Project Documentation

## Application Overview

The **LLM Prompt Builder** is a React-based single-page application that allows users to create structured XML prompts for large language models. It features a clean, modern interface with real-time preview and clipboard integration.

## Architecture

### Component Hierarchy

```
App (page.tsx)
├── Header
├── Main Content
│   ├── Left Panel (Prompt Sections)
│   │   └── PromptSection[] (components)
│   └── Right Panel (XML Preview)
│       ├── Preview Area
│       ├── Copy Button
│       └── Stats & Tips
└── Footer
```

### State Management

- Uses React's `useState` hook for local component state
- Main state: `sections` array containing Section objects `{ tag: string, content: string }`
- UI state: `copied` boolean for copy button feedback

### Key Files

#### `/src/app/page.tsx`

Main application component with:

- Section management (add, delete, reorder)
- State handlers for tag and content changes
- XML generation and clipboard copy functionality
- Layout with two-column responsive grid

#### `/src/components/PromptSection.tsx`

Individual section component featuring:

- Tag selection (preset dropdown or custom input)
- Content textarea with resizing
- Move up/down buttons
- Delete button
- XML tag name validation

#### `/src/utils/xmlHelpers.ts`

Utility functions for:

- `escapeXml()`: Escapes special XML characters (&, <, >, ", ')
- `isValidTagName()`: Validates XML tag naming rules
- `generateXml()`: Converts sections array to formatted XML string
- `COMMON_TAGS`: Preset tag suggestions

## Features Implementation

### 1. Dynamic Section Management

```typescript
const handleAddSection = () => {
  setSections([...sections, { tag: "", content: "" }]);
};

const handleDeleteSection = (index: number) => {
  setSections(sections.filter((_, i) => i !== index));
};
```

### 2. Reordering Sections

```typescript
const handleMoveUp = (index: number) => {
  if (index === 0) return;
  const newSections = [...sections];
  [newSections[index - 1], newSections[index]] = [
    newSections[index],
    newSections[index - 1],
  ];
  setSections(newSections);
};
```

### 3. XML Generation

```typescript
export function generateXml(sections: Section[]): string {
  if (sections.length === 0) {
    return "<prompt>\n</prompt>";
  }

  const xmlContent = sections
    .filter((section) => section.tag.trim() !== "")
    .map((section) => {
      const tag = section.tag.trim();
      const content = escapeXml(section.content);
      return `  <${tag}>${content}</${tag}>`;
    })
    .join("\n");

  return `<prompt>\n${xmlContent}\n</prompt>`;
}
```

### 4. Clipboard Integration

```typescript
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
```

## Styling Strategy

### Tailwind CSS Classes Used

- **Layout**: Grid, Flexbox for responsive two-column design
- **Colors**: Blue/Indigo gradient background, white cards
- **Shadows**: Elevation with `shadow-md`, `shadow-lg`
- **Transitions**: Smooth hover effects on buttons and cards
- **Responsive**: Mobile-first with `lg:` breakpoints for desktop layout

### Component Styling Patterns

- Cards: `bg-white rounded-lg shadow-md p-4 border border-gray-200`
- Buttons: `flex items-center gap-2 px-4 py-2 rounded-md transition-colors`
- Inputs: `border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none`

## Validation & Error Handling

### XML Tag Validation

Tags must:

- Start with a letter or underscore
- Contain only letters, digits, hyphens, underscores, or periods
- Pattern: `/^[a-zA-Z_][\w.-]*$/`

### Edge Cases Handled

1. **Empty Sections**: Filtered out during XML generation
2. **Invalid Tags**: Visual feedback with red border and error message
3. **Special Characters**: Automatically escaped in content
4. **Empty State**: Friendly message when no sections exist
5. **Copy Failure**: Alert shown if clipboard API fails

## Performance Considerations

- **Minimal Re-renders**: State updates are localized to affected components
- **No Heavy Dependencies**: Uses lightweight libraries (clipboard-copy, react-icons)
- **Client-side Only**: No server-side processing needed
- **Efficient XML Generation**: Simple string concatenation with filtering

## Browser Compatibility

- Modern browsers with ES6+ support
- Clipboard API support (fallback alert for unsupported browsers)
- CSS Grid and Flexbox required
- Tested on Chrome, Firefox, Safari, Edge

## Future Enhancement Ideas

1. **Drag & Drop Reordering**: Implement react-beautiful-dnd
2. **Templates**: Save and load common prompt structures
3. **Export Options**: Download as .xml file
4. **Syntax Highlighting**: Color-coded XML preview
5. **Dark Mode**: Theme toggle support
6. **Undo/Redo**: Action history management
7. **Multi-format Export**: JSON, YAML, plain text
8. **Section Duplication**: Copy existing sections
9. **Nested Tags**: Support for hierarchical structures
10. **Auto-save**: LocalStorage persistence

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment Notes

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Configure build settings (auto-detected)
3. Deploy with one click
4. Custom domain optional

### Environment Variables

None required - fully client-side application

### Build Output

- Static HTML/CSS/JS files
- Optimized for performance with Next.js
- Edge-ready for global CDN deployment

## Testing Checklist

- [ ] Add new section
- [ ] Delete section
- [ ] Move section up/down
- [ ] Select preset tag
- [ ] Enter custom tag
- [ ] Validate invalid tag names
- [ ] Enter content with special characters
- [ ] Preview updates in real-time
- [ ] Copy to clipboard works
- [ ] Reset confirmation dialog
- [ ] Responsive on mobile
- [ ] Responsive on desktop
- [ ] Empty state displays correctly
- [ ] Stats counter updates

## Accessibility Features

- Semantic HTML elements
- Button titles for screen readers
- Keyboard navigation support
- Clear visual feedback for actions
- High contrast text colors
- Focus states on interactive elements

---

**Built with**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
**Author**: AI-assisted development
**License**: MIT
