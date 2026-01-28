import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Types
export type TranslationProvider =
  | "google"
  | "deepl"
  | "openai"
  | "groq"
  | "deepseek"
  | "kimi"
  | "custom";

interface TranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
  provider: TranslationProvider;
  model?: string;
  apiKey?: string; // API key for the selected provider (sent from client)
  customApiUrl?: string;
  customApiKey?: string;
}

interface TranslateResponse {
  translatedText?: string;
  error?: string;
}

// Rate limiting - simple in-memory counter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Language code mapping for different APIs
const LANGUAGE_CODES: Record<
  string,
  { google: string; deepl: string; display: string }
> = {
  en: { google: "en", deepl: "EN", display: "English" },
  "zh-CN": { google: "zh-CN", deepl: "ZH", display: "Chinese (Simplified)" },
  "zh-TW": { google: "zh-TW", deepl: "ZH", display: "Chinese (Traditional)" },
  ja: { google: "ja", deepl: "JA", display: "Japanese" },
  ko: { google: "ko", deepl: "KO", display: "Korean" },
  fr: { google: "fr", deepl: "FR", display: "French" },
  de: { google: "de", deepl: "DE", display: "German" },
  es: { google: "es", deepl: "ES", display: "Spanish" },
  pt: { google: "pt", deepl: "PT-BR", display: "Portuguese" },
  ru: { google: "ru", deepl: "RU", display: "Russian" },
  ar: { google: "ar", deepl: "AR", display: "Arabic" },
  it: { google: "it", deepl: "IT", display: "Italian" },
  nl: { google: "nl", deepl: "NL", display: "Dutch" },
  pl: { google: "pl", deepl: "PL", display: "Polish" },
  tr: { google: "tr", deepl: "TR", display: "Turkish" },
};

// Google Cloud Translation
async function translateWithGoogle(
  text: string,
  targetLanguage: string,
  sourceLanguage: string,
  apiKey?: string,
): Promise<string> {
  if (!apiKey) {
    throw new Error(
      "Google Translate API key not provided. Please configure it in Translation Settings.",
    );
  }

  const targetCode = LANGUAGE_CODES[targetLanguage]?.google || targetLanguage;
  const sourceCode = LANGUAGE_CODES[sourceLanguage]?.google || sourceLanguage;

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        target: targetCode,
        source: sourceCode,
        format: "text",
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Google Translation failed");
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
}

// DeepL Translation
async function translateWithDeepL(
  text: string,
  targetLanguage: string,
  sourceLanguage: string,
  apiKey?: string,
): Promise<string> {
  if (!apiKey) {
    throw new Error(
      "DeepL API key not provided. Please configure it in Translation Settings.",
    );
  }

  // DeepL uses different API endpoints for free vs pro
  const baseUrl = apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com"
    : "https://api.deepl.com";

  const targetCode =
    LANGUAGE_CODES[targetLanguage]?.deepl || targetLanguage.toUpperCase();
  const sourceCode =
    LANGUAGE_CODES[sourceLanguage]?.deepl || sourceLanguage.toUpperCase();

  const response = await fetch(`${baseUrl}/v2/translate`, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [text],
      target_lang: targetCode,
      source_lang: sourceCode,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "DeepL Translation failed");
  }

  const data = await response.json();
  return data.translations[0].text;
}

// OpenAI/Groq/DeepSeek/KIMI LLM Translation
async function translateWithLLM(
  text: string,
  targetLanguage: string,
  sourceLanguage: string,
  provider: "openai" | "groq" | "deepseek" | "kimi" | "custom",
  model?: string,
  apiKey?: string, // API key from client
  customApiUrl?: string,
  customApiKey?: string,
): Promise<string> {
  let finalApiKey: string;
  let baseURL: string | undefined;

  if (provider === "custom") {
    finalApiKey = customApiKey || "";
    baseURL = customApiUrl;

    if (!baseURL) {
      throw new Error(
        "Custom API URL not provided. Please configure it in Translation Settings.",
      );
    }
    // For custom providers, API key might be optional (e.g., local Ollama)
    // We'll let it through and let the provider handle the error if needed
  } else {
    finalApiKey = apiKey || "";

    if (!finalApiKey) {
      const providerNames: Record<string, string> = {
        openai: "OpenAI",
        groq: "Groq",
        deepseek: "DeepSeek",
        kimi: "KIMI/Moonshot",
      };
      throw new Error(
        `${providerNames[provider] || provider} API key not provided. Please configure it in Translation Settings.`,
      );
    }

    // Set the appropriate base URL for each provider
    switch (provider) {
      case "groq":
        baseURL = "https://api.groq.com/openai/v1";
        break;
      case "deepseek":
        baseURL = "https://api.deepseek.com";
        break;
      case "kimi":
        baseURL = "https://api.moonshot.cn/v1";
        break;
      // OpenAI uses the default URL (undefined)
    }
  }

  const client = new OpenAI({
    apiKey: finalApiKey || "dummy", // Some providers like Ollama don't need a key
    baseURL,
  });

  // Default models for each provider
  let selectedModel = model;
  if (!selectedModel) {
    switch (provider) {
      case "custom":
        selectedModel = "auto";
        break;
      case "groq":
        selectedModel = "llama-3.3-70b-versatile";
        break;
      case "deepseek":
        selectedModel = "deepseek-chat";
        break;
      case "kimi":
        selectedModel = "moonshot-v1-8k";
        break;
      default:
        selectedModel = "gpt-4o-mini";
    }
  }

  const sourceLang = LANGUAGE_CODES[sourceLanguage]?.display || sourceLanguage;
  const targetLang = LANGUAGE_CODES[targetLanguage]?.display || targetLanguage;

  const completion = await client.chat.completions.create({
    model: selectedModel,
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate the following text from ${sourceLang} to ${targetLang}. 
Preserve the original meaning, tone, and style. 
Only output the translated text without any explanations or additional text.
If the text contains technical terms or proper nouns, keep them in their original form if appropriate for the target language.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });

  return completion.choices[0].message.content || "";
}

// Main handler
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json<TranslateResponse>(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 },
      );
    }

    const body: TranslateRequest = await request.json();
    const {
      text,
      targetLanguage,
      sourceLanguage = "en",
      provider,
      model,
      apiKey,
      customApiUrl,
      customApiKey,
    } = body;

    // Validation
    if (!text || typeof text !== "string") {
      return NextResponse.json<TranslateResponse>(
        { error: "Text is required" },
        { status: 400 },
      );
    }

    if (!targetLanguage || typeof targetLanguage !== "string") {
      return NextResponse.json<TranslateResponse>(
        { error: "Target language is required" },
        { status: 400 },
      );
    }

    if (
      !provider ||
      ![
        "google",
        "deepl",
        "openai",
        "groq",
        "deepseek",
        "kimi",
        "custom",
      ].includes(provider)
    ) {
      return NextResponse.json<TranslateResponse>(
        {
          error:
            "Valid provider is required (google, deepl, openai, groq, deepseek, kimi, custom)",
        },
        { status: 400 },
      );
    }

    // Sanitize text (basic XSS prevention)
    const sanitizedText = text.trim().slice(0, 50000); // Limit to 50k chars

    let translatedText: string;

    switch (provider) {
      case "google":
        translatedText = await translateWithGoogle(
          sanitizedText,
          targetLanguage,
          sourceLanguage,
          apiKey,
        );
        break;
      case "deepl":
        translatedText = await translateWithDeepL(
          sanitizedText,
          targetLanguage,
          sourceLanguage,
          apiKey,
        );
        break;
      case "openai":
      case "groq":
      case "deepseek":
      case "kimi":
        translatedText = await translateWithLLM(
          sanitizedText,
          targetLanguage,
          sourceLanguage,
          provider,
          model,
          apiKey,
        );
        break;
      case "custom":
        translatedText = await translateWithLLM(
          sanitizedText,
          targetLanguage,
          sourceLanguage,
          provider,
          model,
          undefined,
          customApiUrl,
          customApiKey,
        );
        break;
      default:
        return NextResponse.json<TranslateResponse>(
          { error: "Invalid provider" },
          { status: 400 },
        );
    }

    return NextResponse.json<TranslateResponse>({ translatedText });
  } catch (error) {
    console.error("Translation error:", error);
    const message =
      error instanceof Error ? error.message : "Translation failed";
    return NextResponse.json<TranslateResponse>(
      { error: message },
      { status: 500 },
    );
  }
}
