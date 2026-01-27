"use client";

import { FiX } from "react-icons/fi";

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAG_EXPLANATIONS = [
  {
    tag: "role",
    description: "Define the AI assistant's role and identity",
    example: `<role>You are an expert software engineer with 10 years of experience in full-stack development.</role>`,
    useCase:
      "Set the AI's professional background, capabilities, and conversation perspective",
  },
  {
    tag: "task",
    description: "Specify the specific task the AI needs to complete",
    example: `<task>Review the provided code and identify potential security vulnerabilities.</task>`,
    useCase: "Clearly describe the main work expected from the AI",
  },
  {
    tag: "instructions",
    description: "Detailed execution instructions and steps",
    example: `<instructions>
1. Read the input data carefully
2. Analyze each field for validation
3. Generate a comprehensive report
4. Highlight any anomalies found
</instructions>`,
    useCase:
      "Provide step-by-step guidance to ensure AI executes in a specific process",
  },
  {
    tag: "examples",
    description: "Provide sample inputs and expected outputs",
    example: `<examples>
Input: "Hello World"
Output: "HELLO WORLD"

Input: "Python Programming"
Output: "PYTHON PROGRAMMING"
</examples>`,
    useCase:
      "Help AI understand expected behavior patterns through concrete examples",
  },
  {
    tag: "constraints",
    description: "Set limitations and boundaries",
    example: `<constraints>
- Response must be under 500 words
- Use only technical terminology
- Do not include personal opinions
- Cite sources when possible
</constraints>`,
    useCase: "Clarify the AI's operational scope and restrictions",
  },
  {
    tag: "output-format",
    description: "Specify the format and structure of the output",
    example: `<output-format>
Provide the response in JSON format:
{
  "summary": "...",
  "details": [...],
  "recommendation": "..."
}
</output-format>`,
    useCase: "Ensure the AI returns results in the specified format",
  },
  {
    tag: "context",
    description: "Provide background information and relevant context",
    example: `<context>
This project is a web application built with React and TypeScript.
The team follows Agile methodology with 2-week sprints.
Current focus is on improving performance and user experience.
</context>`,
    useCase: "Help the AI understand the task background and environment",
  },
  {
    tag: "guidelines",
    description: "Provide guiding principles and best practices",
    example: `<guidelines>
- Follow clean code principles
- Prioritize readability over cleverness
- Include error handling
- Add comments for complex logic
</guidelines>`,
    useCase: "Guide the AI to follow specific standards and norms",
  },
  {
    tag: "steps",
    description: "Define the specific steps to execute the task",
    example: `<steps>
1. Parse the input JSON
2. Validate all required fields
3. Transform data to target format
4. Generate output file
</steps>`,
    useCase: "Clarify the task execution order and workflow",
  },
  {
    tag: "requirements",
    description: "List requirements and conditions that must be met",
    example: `<requirements>
- Must support Python 3.8+
- Code should be type-annotated
- Include unit tests
- Follow PEP 8 style guide
</requirements>`,
    useCase: "Ensure the AI output meets all necessary conditions",
  },
];

export default function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">📚 XML Tag Usage Guide</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors group"
            aria-label="Close"
          >
            <FiX
              size={24}
              className="text-white group-hover:text-gray-900 transition-colors"
            />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">
              Below are detailed explanations, use cases, and examples of
              commonly used XML tags. Using these tags wisely helps you build
              more precise and effective AI prompts.
            </p>
          </div>

          <div className="space-y-6">
            {TAG_EXPLANATIONS.map((item, index) => (
              <div
                key={item.tag}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-gray-50"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        &lt;{item.tag}&gt;
                      </code>
                    </h3>
                    <p className="text-gray-700 mb-2">{item.description}</p>
                    <p className="text-sm text-gray-600 italic">
                      <span className="font-medium">Use Case:</span>{" "}
                      {item.useCase}
                    </p>
                  </div>
                </div>

                <div className="mt-3 ml-11">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Example:
                  </p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-xs font-mono">
                    {item.example}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Tips */}
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-5">
            <h3 className="font-semibold text-amber-900 mb-3 text-lg">
              💡 Tips
            </h3>
            <ul className="text-sm text-amber-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>
                  <strong>Combine Tags:</strong> Multiple tags can be combined
                  to create more precise prompts
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>
                  <strong>Tag Order:</strong> Typically define role and task
                  first, then provide detailed explanations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>
                  <strong>Custom Tags:</strong> You can create custom tag names
                  that comply with XML specifications
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>
                  <strong>Clear Content:</strong> Tag content should be concise
                  and clear to avoid ambiguity
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>
                  <strong>Special Characters:</strong> The system automatically
                  escapes XML special characters (&lt; &gt; &amp; etc)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
