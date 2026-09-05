import { Logger } from '@nestjs/common';
import { ToolCallExecution } from '@nirmaanify/types';

export interface GeminiAgentExecutionOptions {
  prompt: string;
  initialFiles: Record<string, string>;
  driver?: any;
  apiKey: string;
  preferredModel?: string;
  logger?: Logger;
}

export interface GeminiAgentExecutionResult {
  content: string;
  thought: string;
  toolCalls: ToolCallExecution[];
  title: string;
  updatedFiles: Record<string, string>;
  modelUsed: string;
}

export function deriveTitle(prompt: string): string {
  const cleaned = prompt
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => !['i', 'want', 'to', 'build', 'create', 'make', 'add', 'a', 'the', 'with', 'for'].includes(w.toLowerCase()))
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  return cleaned ? `${cleaned}` : 'Full-Stack Application';
}

export async function executeGeminiAgentLoop(
  options: GeminiAgentExecutionOptions,
): Promise<GeminiAgentExecutionResult> {
  const {
    prompt,
    initialFiles,
    driver,
    apiKey,
    preferredModel = 'gemini-3.8-flash',
    logger,
  } = options;

  const log = (msg: string) => (logger ? logger.log(msg) : console.log(msg));
  const warn = (msg: string) => (logger ? logger.warn(msg) : console.warn(msg));

  if (!apiKey || !apiKey.trim()) {
    throw new Error('GEMINI_API_KEY is not configured in .env. Please provide a valid Gemini API key to connect to Gemini 3.8 Flash.');
  }

  const updatedFiles = { ...initialFiles };
  const toolCalls: ToolCallExecution[] = [];

  // Model cascade: prioritize requested model (e.g. gemini-3.8-flash), followed by active stable Google Gemini models
  const candidateModels = preferredModel.includes('pro')
    ? [
        preferredModel,
        'gemini-3.1-pro-preview',
        'gemini-pro-latest',
        'gemini-3.8-flash',
        'gemini-3.7-flash',
        'gemini-3.6-flash',
        'gemini-flash-latest',
      ]
    : [
        preferredModel,
        'gemini-3.8-flash',
        'gemini-3.7-flash',
        'gemini-3.6-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash',
      ];

  const uniqueModels = Array.from(new Set(candidateModels.filter(Boolean)));

  const systemPrompt = `You are Nirmaanify AI Autonomous Senior Full-Stack Engineer (powered by ${preferredModel}).
You are an expert full-stack developer building production-ready Next.js 15 App Router and NestJS 11 applications.
Given the user prompt and existing files, build or update the full-stack application.

TECH STACK & ARCHITECTURE RULES:
1. Frontend (Next.js 15 App Router & React 19):
   - 'app/page.tsx' is the primary interactive client view. Always start with 'use client';.
   - Use Tailwind CSS with clean, modern dark mode styling (e.g., 'bg-slate-50 dark:bg-[#0A0D14]', 'text-slate-900 dark:text-slate-100', rounded borders, shadows).
   - Use Lucide React icons ('lucide-react').
   - You can use '@nirmaanify/ui' components or clean Tailwind elements.
   - Implement realistic, interactive client-side React state ('useState', 'useEffect') such as filtering, creation forms, tabs, or modal dialogs.

2. Backend (NestJS 11 REST API & Prisma):
   - If the user asks for backend APIs or full-stack features (such as "Create a NestJS products API with GET and POST endpoints"):
     a) Create the full NestJS files: e.g. 'src/products/dto/create-product.dto.ts', 'src/products/products.controller.ts', 'src/products/products.service.ts', and 'src/products/products.module.ts'.
     b) AND create/update the frontend interface in 'app/page.tsx' to showcase, interact with, and test this API (e.g. live product catalog cards/table, product creation modal/form with price, category, status fields, and quick action buttons). This ensures the user immediately sees and tests their feature in the live sandbox!

3. Completeness:
   - NEVER use placeholder comments like '// TODO' or mock strings. Write complete, functional code!

OUTPUT FORMAT:
Return ONLY a valid, parseable JSON object without markdown fences outside:
{
  "thought": "Your step-by-step reasoning explaining the architecture and design decisions made.",
  "title": "A concise 3-5 word title (e.g., 'Products API & Catalog UI')",
  "message": "A helpful message for the user explaining what was created and how to use it.",
  "files": {
    "app/page.tsx": "full file content here...",
    "src/products/products.controller.ts": "full file content here..."
  },
  "commands": ["pnpm add lucide-react"]
}`;

  let lastError: Error | null = null;
  let successfulText: string | null = null;
  let usedModel: string = preferredModel;

  for (const modelCandidate of uniqueModels) {
    try {
      log(`Calling Google Gemini API using model: ${modelCandidate}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelCandidate}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemPrompt}\n\nUser Request: "${prompt}"\nExisting Project Files:\n${Object.entries(initialFiles)
                    .map(([p, c]) => `--- File: ${p} ---\n${c.slice(0, 1000)}`)
                    .join('\n')}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        warn(`Model ${modelCandidate} returned HTTP ${response.status}: ${errBody}`);
        // If 503 (high demand spike), 429 (quota limit), 404 (not found), or 400, continue to next candidate model
        if (
          response.status === 503 ||
          response.status === 429 ||
          response.status === 404 ||
          response.status === 400
        ) {
          lastError = new Error(`Gemini ${modelCandidate} returned HTTP ${response.status}: ${errBody}`);
          continue;
        }
        throw new Error(`Gemini HTTP Error ${response.status} (${response.statusText}): ${errBody}`);
      }

      const data = await response.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) {
        lastError = new Error(`Model ${modelCandidate} returned empty parts.`);
        continue;
      }

      successfulText = raw;
      usedModel = modelCandidate;
      log(`✓ Model ${modelCandidate} successfully generated response.`);
      break;
    } catch (err: any) {
      lastError = err;
      warn(`Model candidate ${modelCandidate} attempt failed: ${err.message}`);
    }
  }

  if (!successfulText) {
    throw lastError || new Error(`All candidate Gemini models failed to generate response.`);
  }

  let cleanJson = successfulText.trim();
  if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  } else if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```\s*/i, '').replace(/```\s*$/, '');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (parseErr: any) {
    throw new Error(`Failed to parse Gemini code generation JSON: ${parseErr.message}`);
  }

  if (parsed.files && typeof parsed.files === 'object') {
    for (const [path, content] of Object.entries(parsed.files)) {
      if (typeof content === 'string' && content.trim()) {
        updatedFiles[path] = content;
        if (driver?.writeFile) {
          await driver.writeFile(path, content);
        }
        toolCalls.push({
          name: 'createOrUpdateFiles',
          args: { path },
          status: 'success',
          output: `Wrote ${path}`,
        });
      }
    }
  }

  if (parsed.commands && Array.isArray(parsed.commands) && driver?.execCommand) {
    for (const cmd of parsed.commands) {
      try {
        const execRes = await driver.execCommand(cmd);
        toolCalls.push({
          name: 'terminal',
          args: { command: cmd },
          status: execRes?.exitCode === 0 ? 'success' : 'failed',
          output: execRes?.stdout || execRes?.stderr || 'Command executed',
        });
      } catch (cmdErr: any) {
        toolCalls.push({
          name: 'terminal',
          args: { command: cmd },
          status: 'failed',
          output: cmdErr.message,
        });
      }
    }
  }

  return {
    content: parsed.message || `Successfully implemented changes for: "${prompt}" using ${usedModel}`,
    thought: parsed.thought || `Constructed full-stack implementation using model ${usedModel}.`,
    toolCalls,
    title: parsed.title || deriveTitle(prompt),
    updatedFiles,
    modelUsed: usedModel,
  };
}
