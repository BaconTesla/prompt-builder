# LLM Prompt Builder

A single-page application built with Next.js that helps users design structured prompts for large language models by organizing them into an XML format.

## Features

- **Dynamic Section Management**: Add, edit, delete, and reorder prompt sections
- **Preset & Custom Tags**: Choose from common tags (role, task, instructions, etc.) or create your own
- **Real-time XML Preview**: See your structured prompt update as you type
- **Copy to Clipboard**: One-click copying of the complete XML prompt
- **XML Character Escaping**: Automatically handles special XML characters
- **Tag Validation**: Ensures all custom tags follow XML naming conventions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Clean UI**: Built with Tailwind CSS for a modern, minimalistic interface

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

0. Clone this repo

```
git clone https://github.com/BaconTesla/prompt-builder.git
```

1. Navigate to the project directory:

```bash
cd prompt-builder
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Add Sections**: Click the "Add Section" button to create new prompt sections
2. **Choose Tags**: Select from preset tags (role, task, instructions, etc.) or switch to custom mode to create your own
3. **Enter Content**: Fill in the content for each section
4. **Reorder**: Use the up/down arrow buttons to rearrange sections
5. **Preview**: View the generated XML in real-time on the right panel
6. **Copy**: Click "Copy to Clipboard" to copy the complete XML prompt
7. **Reset**: Click "Reset" to start over with default sections

## Project Structure

```
prompt-builder/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main page component
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── PromptSection.tsx  # Individual section component
│   └── utils/
│       └── xmlHelpers.ts      # XML generation and validation utilities
├── public/                     # Static assets
├── package.json
└── README.md
```

## Technologies Used

- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **react-icons**: Icon library (Feather icons)
- **clipboard-copy**: Clipboard API wrapper

## Building for Production

```bash
npm run build
npm start
```

## Deploying to Vercel

The easiest way to deploy this Next.js app is using [Vercel](https://vercel.com):

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Import your repository to Vercel
3. Vercel will automatically detect Next.js and configure the build settings
4. Click "Deploy"

Alternatively, use the Vercel CLI:

```bash
npm install -g vercel
vercel
```

## Key Components

### PromptSection Component

Handles individual sections with:

- Tag selection (preset or custom)
- Content input via textarea
- Move up/down functionality
- Delete capability
- XML tag validation

### XML Helpers Utility

Provides:

- `escapeXml()`: Escapes special XML characters
- `isValidTagName()`: Validates XML tag names
- `generateXml()`: Generates complete XML from sections array
- `COMMON_TAGS`: List of suggested tag names

## License

MIT

## Contributing

Feel free to submit issues and pull requests to improve the application.
