import { z } from 'zod';

// ============================================================================
// 1. TEST SUITE & SECURITY AUDIT TYPES
// ============================================================================

export type TestSuiteCategory =
  | 'unit'
  | 'integration'
  | 'security'
  | 'e2e'
  | 'schema';

export interface TestCaseResult {
  id: string;
  name: string;
  category: TestSuiteCategory;
  status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'RUNNING';
  durationMs: number;
  details: string;
  error?: string;
}

export interface SecurityAuditItem {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'VERIFIED_SECURE' | 'WARNING' | 'NEEDS_ACTION';
  description: string;
  remediation: string;
}

// ============================================================================
// 2. MVP RELEASE CHECKLIST
// ============================================================================

export interface MvpChecklistModule {
  id: string;
  phaseNumber: number;
  title: string;
  description: string;
  status: 'COMPLETE' | 'IN_PROGRESS' | 'PENDING';
  verifiedAt: string;
  capabilities: string[];
}

export const TestSuiteCategorySchema = z.enum([
  'unit',
  'integration',
  'security',
  'e2e',
  'schema',
]);

export const TestCaseResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: TestSuiteCategorySchema,
  status: z.enum(['PASSED', 'FAILED', 'SKIPPED', 'RUNNING']),
  durationMs: z.number(),
  details: z.string(),
  error: z.string().optional(),
});

export const SecurityAuditItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  status: z.enum(['VERIFIED_SECURE', 'WARNING', 'NEEDS_ACTION']),
  description: z.string(),
  remediation: z.string(),
});
