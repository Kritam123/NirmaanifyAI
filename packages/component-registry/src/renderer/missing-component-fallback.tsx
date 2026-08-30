import React from 'react';
import { ComponentNode } from '@nirmaanify/types';
import { AlertCircle } from 'lucide-react';

interface MissingComponentFallbackProps {
  node: ComponentNode;
}

export function MissingComponentFallback({ node }: MissingComponentFallbackProps) {
  return (
    <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-between text-xs my-2">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <div>
          <span className="font-bold">Unregistered Component: &ldquo;{node.type}&rdquo;</span>
          <p className="text-[10px] text-slate-400 font-mono">Node ID: {node.id}</p>
        </div>
      </div>
      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[10px] font-mono">
        Fallback Active
      </span>
    </div>
  );
}
