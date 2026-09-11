import { Injectable, Logger } from '@nestjs/common';
import {
  CompatibilityCheckRequest,
  CompatibilityCheckResponse,
  CompatibilityIssue,
} from '@nirmaanify/types';
import { CURATED_PRESETS } from './preset-registry';

@Injectable()
export class CompatibilityService {
  private readonly logger = new Logger(CompatibilityService.name);

  // Target runtime baselines
  private readonly REACT_VERSION = '19.0.0';
  private readonly NEXTJS_VERSION = '15.1.0';

  public async checkCompatibility(
    request: CompatibilityCheckRequest,
    existingPackages: Array<{ name: string; version: string; category?: string }> = []
  ): Promise<CompatibilityCheckResponse> {
    const { packageName, version = 'latest' } = request;
    const issues: CompatibilityIssue[] = [];
    const rootProviderModifications: string[] = [];
    let requiredPeerDependencies: Record<string, string> = {};
    let score = 100;

    const preset = CURATED_PRESETS[packageName];

    // ====================================================
    // TIER 1: SemVer & Runtime Engine Check
    // ====================================================
    if (preset) {
      // Known curated preset: pre-verified with React 19 / Next.js 15
      if (preset.requiredPeerDeps) {
        requiredPeerDependencies = { ...preset.requiredPeerDeps };
      }
      if (preset.requiredProviders) {
        preset.requiredProviders.forEach((p) => {
          rootProviderModifications.push(
            `import { ${p.name} } from '${p.importPath}';`
          );
        });
      }
    } else {
      // Custom NPM package: check version rules
      if (version.startsWith('0.') || version.startsWith('^0.')) {
        issues.push({
          severity: 'warning',
          code: 'PRE_RELEASE_PACKAGE',
          message: `Package "${packageName}" is at pre-1.0 version (${version}). API breaking changes may occur.`,
          suggestedFix: 'Pin to exact version or verify automated build tests.',
        });
        score -= 10;
      }
    }

    // ====================================================
    // TIER 2: Framework Boundary Check ('use client' vs RSC)
    // ====================================================
    const clientOnlyKeywords = [
      'motion',
      'framer',
      'gsap',
      'chart',
      'canvas',
      'react-dropzone',
      'dnd',
      'tooltip',
      'modal',
      'dialog',
    ];

    const isClientCandidate = clientOnlyKeywords.some((kw) =>
      packageName.toLowerCase().includes(kw)
    );

    if (isClientCandidate) {
      issues.push({
        severity: 'info',
        code: 'REQUIRES_CLIENT_BOUNDARY',
        message: `Components utilizing "${packageName}" require the 'use client' directive in Next.js 15 App Router.`,
        suggestedFix: "Nirmaanify code generator will automatically prepend 'use client' to consuming components.",
      });
    }

    // ====================================================
    // TIER 3: Styling Engine & Conflict Check
    // ====================================================
    const existingNames = new Set(existingPackages.map((p) => p.name));

    if (preset && preset.incompatibleWith) {
      for (const conflictingPkg of preset.incompatibleWith) {
        if (existingNames.has(conflictingPkg)) {
          issues.push({
            severity: 'error',
            code: 'STYLE_ENGINE_CONFLICT',
            message: `"${packageName}" conflicts with currently installed "${conflictingPkg}". Multiple competing styling engines can cause hydration mismatches and bundle bloat.`,
            affectedDependency: conflictingPkg,
            suggestedFix: `Uninstall "${conflictingPkg}" before switching to "${packageName}".`,
          });
          score -= 40;
        }
      }
    }

    // Check for duplicate animation or form engines
    if (packageName === 'framer-motion' && existingNames.has('gsap')) {
      issues.push({
        severity: 'warning',
        code: 'DUPLICATE_ANIMATION_ENGINE',
        message: 'Both Framer Motion and GSAP are selected. While functional, keeping one animation engine is recommended to optimize bundle size.',
        suggestedFix: 'Standardize on Framer Motion for React gestures, or GSAP for complex timelines.',
      });
      score -= 15;
    }

    if (packageName === 'react-hook-form' && existingNames.has('formik')) {
      issues.push({
        severity: 'warning',
        code: 'DUPLICATE_FORM_ENGINE',
        message: 'Both React Hook Form and Formik are installed in this project.',
        suggestedFix: 'Choose React Hook Form for modern uncontrolled forms, or Formik.',
      });
      score -= 15;
    }

    // ====================================================
    // TIER 4: Peer Dependencies & Auto-Remediation
    // ====================================================
    for (const [peerName, peerVer] of Object.entries(requiredPeerDependencies)) {
      if (!existingNames.has(peerName)) {
        issues.push({
          severity: 'info',
          code: 'PEER_DEP_REQUIRED',
          message: `Required peer dependency "${peerName}@${peerVer}" will be installed automatically.`,
          affectedDependency: peerName,
        });
      }
    }

    const compatible = !issues.some((i) => i.severity === 'error');

    return {
      compatible,
      score: Math.max(0, score),
      packageName,
      targetVersion: version,
      issues,
      requiredPeerDependencies,
      rootProviderModifications,
    };
  }
}
