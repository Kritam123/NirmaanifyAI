import { useState, useCallback, useRef } from 'react';
import { ProjectSchema } from '@nirmaanify/types';

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface HistoryMetadata {
  selectedNodeId?: string | null;
  activePageId?: string | null;
}

export function useProjectHistory(initialPresent: ProjectSchema, maxHistory: number = 30) {
  const [state, setState] = useState<HistoryState<ProjectSchema>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  // Per-snapshot metadata stack so we can rewind the selection pointer together
  // with the schema. Using a ref (not state) avoids re-rendering the studio on
  // every selection change.
  const metaPast = useRef<HistoryMetadata[]>([]);
  const metaFuture = useRef<HistoryMetadata[]>([]);
  const [metaPresent, setMetaPresent] = useState<HistoryMetadata>({});

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const pushMeta = useCallback((m: HistoryMetadata) => {
    metaPast.current.push(m);
    metaFuture.current = [];
  }, []);

  const undo = useCallback(() => {
    setState((curr) => {
      if (curr.past.length === 0) return curr;

      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, curr.past.length - 1);

      // Move current selection metadata to the future stack, pop the past one.
      metaFuture.current.unshift({ ...metaPresent });
      const restored = metaPast.current.pop() ?? {};

      // Schedule a metadata update outside the reducer to avoid double-render.
      queueMicrotask(() => setMetaPresent(restored));

      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future],
      };
    });
  }, [metaPresent]);

  const redo = useCallback(() => {
    setState((curr) => {
      if (curr.future.length === 0) return curr;

      const next = curr.future[0];
      const newFuture = curr.future.slice(1);

      metaPast.current.push({ ...metaPresent });
      const restored = metaFuture.current.shift() ?? {};
      queueMicrotask(() => setMetaPresent(restored));

      return {
        past: [...curr.past, curr.present],
        present: next,
        future: newFuture,
      };
    });
  }, [metaPresent]);

  const set = useCallback(
    (newPresent: ProjectSchema | ((prev: ProjectSchema) => ProjectSchema)) => {
      setState((curr) => {
        const resolved = typeof newPresent === 'function' ? newPresent(curr.present) : newPresent;
        if (resolved === curr.present) return curr;

        const newPast = [...curr.past, curr.present].slice(-maxHistory);
        pushMeta({ ...metaPresent });

        return {
          past: newPast,
          present: {
            ...resolved,
            updatedAt: new Date().toISOString(),
          },
          future: [],
        };
      });
    },
    [maxHistory, metaPresent, pushMeta]
  );

  const reset = useCallback((newPresent: ProjectSchema, meta: HistoryMetadata = {}) => {
    setState({
      past: [],
      present: newPresent,
      future: [],
    });
    metaPast.current = [];
    metaFuture.current = [];
    setMetaPresent(meta);
  }, []);

  const setMeta = useCallback((patch: Partial<HistoryMetadata>) => {
    setMetaPresent((prev) => ({ ...prev, ...patch }));
  }, []);

  return {
    state: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    historyDepth: state.past.length,
    meta: metaPresent,
    setMeta,
  };
}
