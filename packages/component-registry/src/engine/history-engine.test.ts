import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProjectHistory } from './history-engine';
import { ProjectSchema } from '@nirmaanify/types';

function schema(name: string): ProjectSchema {
  return {
    version: '1.0.0',
    id: `schema-${name}`,
    settings: {
      name,
      slug: name,
      responsive: { mobile: 375, tablet: 768, desktop: 1280, widescreen: 1536 },
    },
    theme: {
      mode: 'dark',
      primaryColor: '#635BFF',
      fontFamily: { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' },
      borderRadius: 'md',
    },
    pages: [],
    assets: [],
    dataSources: [],
    packages: [],
    plugins: [],
    backendConfiguration: {
      enabled: false,
      framework: 'NestJS 11',
      modules: [],
      databaseEngine: 'PostgreSQL 16',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe('useProjectHistory', () => {
  it('starts with undo/redo disabled', () => {
    const { result } = renderHook(() => useProjectHistory(schema('a')));
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('enables undo after a change and disables redo', () => {
    const { result } = renderHook(() => useProjectHistory(schema('a')));
    act(() => result.current.set(schema('b')));
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.state.settings.name).toBe('b');
  });

  it('restores the previous state on undo', () => {
    const { result } = renderHook(() => useProjectHistory(schema('a')));
    act(() => result.current.set(schema('b')));
    act(() => result.current.undo());
    expect(result.current.state.settings.name).toBe('a');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('re-applies a reverted change via redo', () => {
    const { result } = renderHook(() => useProjectHistory(schema('a')));
    act(() => result.current.set(schema('b')));
    act(() => result.current.undo());
    act(() => result.current.redo());
    expect(result.current.state.settings.name).toBe('b');
    expect(result.current.canRedo).toBe(false);
  });

  it('preserves selection metadata across undo', () => {
    const { result } = renderHook(() => useProjectHistory(schema('a'), 5));
    act(() => result.current.set(schema('b')));
    act(() => result.current.setMeta({ selectedNodeId: 'node-X' }));

    act(() => result.current.set(schema('c')));
    act(() => result.current.undo());

    expect(result.current.meta.selectedNodeId).toBe('node-X');
  });

  it('respects the maxHistory bound', () => {
    const { result } = renderHook(() => useProjectHistory(schema('a'), 3));
    act(() => result.current.set(schema('b')));
    act(() => result.current.set(schema('c')));
    act(() => result.current.set(schema('d')));
    act(() => result.current.set(schema('e')));
    // With maxHistory=3 the past stack holds only [b, c, d]; 'a' is dropped.
    act(() => result.current.undo()); // e -> d
    act(() => result.current.undo()); // d -> c
    act(() => result.current.undo()); // c -> b
    expect(result.current.canUndo).toBe(false);
    expect(result.current.state.settings.name).toBe('b');
  });

  it('clears the future when set() is called after an undo', () => {
    const { result } = renderHook(() => useProjectHistory(schema('a')));
    act(() => result.current.set(schema('b')));
    act(() => result.current.undo());
    expect(result.current.canRedo).toBe(true);
    act(() => result.current.set(schema('c')));
    expect(result.current.canRedo).toBe(false);
  });
});
