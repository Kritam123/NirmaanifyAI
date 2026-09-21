import { Injectable, Logger } from '@nestjs/common';
import {
  BuildErrorDiagnostic,
  EnvironmentValidationResult,
} from '@nirmaanify/types';

@Injectable()
export class BuildValidationService {
  private readonly logger = new Logger(BuildValidationService.name);

  /**
   * Validates project files across syntax, route structure, and environment variables
   */
  validate(
    files: Record<string, string>,
    framework: string,
    environment: Record<string, string> = {},
  ): {
    isValid: boolean;
    errors: BuildErrorDiagnostic[];
    envValidation: EnvironmentValidationResult;
  } {
    const errors: BuildErrorDiagnostic[] = [];
    const detectedEnvVars = new Set<string>();

    const fileEntries = Object.entries(files);

    if (fileEntries.length === 0) {
      errors.push({
        file: 'root',
        message: 'No project files found in workspace snapshot',
        code: 'EMPTY_PROJECT',
        remediation: 'Prompt the AI agent to generate project components or APIs before building.',
      });
    }

    // 1. Syntax & Content Validation
    for (const [path, content] of fileEntries) {
      // JSON syntax verification
      if (path.endsWith('.json')) {
        try {
          JSON.parse(content);
        } catch (e: any) {
          errors.push({
            file: path,
            message: `JSON parse error: ${e.message}`,
            code: 'INVALID_JSON',
            remediation: 'Ensure valid JSON formatting without trailing commas or syntax errors.',
          });
        }
      }

      // TypeScript / JavaScript basic balance & syntax check
      if (path.endsWith('.ts') || path.endsWith('.tsx') || path.endsWith('.js') || path.endsWith('.jsx')) {
        this.checkBracketBalance(path, content, errors);
        this.extractEnvVars(content, detectedEnvVars);
      }
    }

    // 2. Next.js App Router Structure & Conflict Validation
    if (framework.toLowerCase().includes('next')) {
      this.validateNextJsStructure(fileEntries.map(([p]) => p), errors);
    }

    // 3. Environment Variable Checklist Validation
    const standardRequiredVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_API_URL',
      'NODE_ENV',
    ];

    const missingVars: string[] = [];
    const warnings: string[] = [];

    // Scan detected vars
    for (const v of detectedEnvVars) {
      if (!environment[v] && !process.env[v]) {
        if (standardRequiredVars.includes(v)) {
          missingVars.push(v);
        } else {
          warnings.push(`Detected optional environment variable: ${v}`);
        }
      }
    }

    const envValidation: EnvironmentValidationResult = {
      isValid: missingVars.length === 0,
      missing: missingVars,
      warnings,
      detectedVars: Array.from(detectedEnvVars),
    };

    if (missingVars.length > 0) {
      errors.push({
        file: '.env',
        message: `Missing required environment variables: ${missingVars.join(', ')}`,
        code: 'MISSING_ENV_VARS',
        remediation: 'Define all required environment variables in your project configuration.',
      });
    }

    const isValid = errors.filter((e) => e.code !== 'MISSING_ENV_VARS').length === 0;

    return {
      isValid,
      errors,
      envValidation,
    };
  }

  private checkBracketBalance(path: string, content: string, errors: BuildErrorDiagnostic[]) {
    let braceCount = 0;
    let parenCount = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : '';

      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (stringChar === char) {
          inString = false;
        }
        continue;
      }

      if (inString) continue;

      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
      else if (char === '(') parenCount++;
      else if (char === ')') parenCount--;
    }

    if (braceCount !== 0) {
      errors.push({
        file: path,
        message: `Unbalanced curly braces { } (imbalance: ${braceCount})`,
        code: 'UNBALANCED_BRACES',
        remediation: 'Check for missing closing or opening curly braces in this file.',
      });
    }

    if (parenCount !== 0) {
      errors.push({
        file: path,
        message: `Unbalanced parentheses ( ) (imbalance: ${parenCount})`,
        code: 'UNBALANCED_PARENS',
        remediation: 'Check for unclosed function calls or JSX expressions.',
      });
    }
  }

  private extractEnvVars(content: string, detected: Set<string>) {
    const regex = /process\.env\.([A-Z0-9_]+)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      if (match[1]) {
        detected.add(match[1]);
      }
    }
  }

  private validateNextJsStructure(paths: string[], errors: BuildErrorDiagnostic[]) {
    const hasRootPage = paths.some(
      (p) =>
        p.endsWith('app/page.tsx') ||
        p.endsWith('app/page.jsx') ||
        p.endsWith('pages/index.tsx') ||
        p.endsWith('pages/index.jsx'),
    );

    if (!hasRootPage && paths.length > 0) {
      errors.push({
        file: 'frontend/src/app/page.tsx',
        message: 'No root entry page found (app/page.tsx or pages/index.tsx)',
        code: 'MISSING_ROOT_PAGE',
        remediation: 'Create an app/page.tsx file to define your root application landing route.',
      });
    }
  }
}
