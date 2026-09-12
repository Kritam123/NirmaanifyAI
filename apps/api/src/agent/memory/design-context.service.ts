import { Injectable } from '@nestjs/common';
import { AgentDesignContext } from '@nirmaanify/types';

@Injectable()
export class DesignContextService {
  /**
   * Platform Design Context: Strictly enforces Nirmaanify Platform Design System
   * Used for Studio internal UI, platform inspectors, and dashboard components.
   */
  public getPlatformDesignContext(): AgentDesignContext {
    return {
      mode: 'platform',
      brandTokens: {
        primaryColor: '#635BFF', // Nirmaan Indigo
        secondaryColor: '#3B82F6', // Build Blue
        accentColor: '#8B5CF6', // AI Violet
        fontFamily: 'Geist, Inter, system-ui, sans-serif',
        borderRadius: '0.75rem', // 12px rounded-xl
      },
      uiFramework: 'shadcn/ui + Radix UI',
      animationEngine: 'Tailwind CSS transitions',
      formEngine: 'React Hook Form + Zod',
    };
  }

  /**
   * Project Design Context: Enforces the User Project Theme & Creative Freedom
   * Used for user-facing canvas pages, layouts, and components.
   */
  public getProjectDesignContext(
    project: { uiLibrary?: string },
    packages: Array<{ name: string; category?: string }> = []
  ): AgentDesignContext {
    const installedNames = new Set(packages.map((p) => p.name));

    // Determine UI framework
    let uiFramework = project.uiLibrary || 'shadcn/ui';
    if (installedNames.has('@mui/material')) {
      uiFramework = '@mui/material';
    } else if (installedNames.has('@chakra-ui/react')) {
      uiFramework = '@chakra-ui/react';
    }

    // Determine Animation engine
    let animationEngine = 'framer-motion';
    if (installedNames.has('gsap')) {
      animationEngine = 'gsap';
    } else if (installedNames.has('motion')) {
      animationEngine = 'motion';
    }

    // Determine Form engine
    let formEngine = 'react-hook-form';
    if (installedNames.has('formik')) {
      formEngine = 'formik';
    }

    return {
      mode: 'project',
      brandTokens: {
        primaryColor: '#3B82F6', // Project Default Blue
        secondaryColor: '#10B981', // Emerald
        accentColor: '#F59E0B', // Amber
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '0.5rem',
      },
      uiFramework,
      animationEngine,
      formEngine,
    };
  }
}
