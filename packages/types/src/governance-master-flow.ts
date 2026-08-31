import { z } from 'zod';

// ============================================================================
// 1. MVP PRIORITY TIERS & RULES TYPES
// ============================================================================

export type PriorityTier = 'P0' | 'P1' | 'P2';

export interface PriorityFeatureItem {
  id: string;
  tier: PriorityTier;
  title: string;
  description: string;
  phase: number;
  status: 'IMPLEMENTED' | 'ACTIVE' | 'PLANNED';
}

export interface DevelopmentRuleItem {
  ruleNumber: number;
  title: string;
  shortLaw: string;
  description: string;
  enforcementMechanism: string;
  isCompliant: boolean;
}

export interface MasterProductFlowNode {
  id: string;
  stepNumber: number;
  label: string;
  sublabel: string;
  domain: 'USER' | 'PLANNER' | 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'CMS' | 'EXTENSIONS' | 'DEPLOY';
  icon: string;
  routeTab: string;
}

export const PriorityTierSchema = z.enum(['P0', 'P1', 'P2']);

export const PriorityFeatureItemSchema = z.object({
  id: z.string(),
  tier: PriorityTierSchema,
  title: z.string(),
  description: z.string(),
  phase: z.number(),
  status: z.enum(['IMPLEMENTED', 'ACTIVE', 'PLANNED']),
});

export const DevelopmentRuleItemSchema = z.object({
  ruleNumber: z.number(),
  title: z.string(),
  shortLaw: z.string(),
  description: z.string(),
  enforcementMechanism: z.string(),
  isCompliant: z.boolean(),
});
