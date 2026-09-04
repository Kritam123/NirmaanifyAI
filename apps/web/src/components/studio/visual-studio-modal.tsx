'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ProjectDto,
  ProjectSchema,
  PageSchema,
  ComponentNode,
  ComponentNodeStyle,
} from '@nirmaanify/types';
import {
  useProjectHistory,
  ProjectValidator,
  createDefaultProjectSchema,
  createComponentNode,
  ReactCodeGenerator,
  rewireParentPointers,
  normalizeParentPointers,
  jumpNode,
  moveNodeToTarget,
  findNode,
  findParentNode,
} from '@nirmaanify/component-registry';
import { StudioTopbar } from './studio-topbar';
import { AiCommandBar } from './ai-command-bar';
import { ComponentPalette } from './component-palette';
import { LayersPanel } from './layers-panel';
import { PropertyInspector } from './property-inspector';
import { VisualCanvas } from './visual-canvas';
import { Button, Dialog, Input, useToast } from '@nirmaanify/ui';
import { useAuth } from '../../context/auth-context';
import { Copy, Check, FileCode, Code2, Save, Sparkles, Layers, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface VisualStudioModalProps {
  project: ProjectDto | null;
  isOpen: boolean;
  onClose: () => void;
}

function findNodeInTree(root: ComponentNode, id: string | null): ComponentNode | null {
  if (!id) return null;
  if (!root) return null;
  if (root.id === id) return root;
  if (Array.isArray(root.children)) {
    for (const c of root.children) {
      const res = findNodeInTree(c, id);
      if (res) return res;
    }
  }
  if (root.slots && typeof root.slots === 'object') {
    for (const arr of Object.values(root.slots)) {
      if (!Array.isArray(arr)) continue;
      for (const c of arr) {
        const res = findNodeInTree(c, id);
        if (res) return res;
      }
    }
  }
  return null;
}

export function VisualStudioModal({ project, isOpen, onClose }: VisualStudioModalProps) {
  const { toast } = useToast();
  const { updateProject } = useAuth();

  // Initial schema generation or parsing
  const initialSchema: ProjectSchema = useMemo(() => {
    if (!project) {
      return createDefaultProjectSchema('My App', 'SAAS');
    }

    if (
      project.projectSchema &&
      project.projectSchema.pages &&
      Array.isArray(project.projectSchema.pages) &&
      typeof project.projectSchema.pages[0] === 'object'
    ) {
      return project.projectSchema as ProjectSchema;
    }

    return createDefaultProjectSchema(project.name, project.type);
  }, [project]);

  // History & State Engine
  const {
    state: projectSchema,
    set: setProjectSchema,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    meta: historyMeta,
    setMeta: setHistoryMeta,
  } = useProjectHistory(initialSchema);

  // Active editor view states
  const [activePageId, setActivePageIdRaw] = useState<string>('');
  const [selectedNodeId, setSelectedNodeIdRaw] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeLeftTab, setActiveLeftTab] = useState<'palette' | 'layers'>('palette');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [mode, setMode] = useState<'builder' | 'preview'>('builder');
  const [zoom, setZoom] = useState<number>(1);

  // Manual save state
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const lastSavedRef = useRef<string>(JSON.stringify(initialSchema));
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Collapsible sidebars (persisted in localStorage)
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  useEffect(() => {
    try {
      const l = localStorage.getItem('nirmaanify_studio_left_collapsed');
      const r = localStorage.getItem('nirmaanify_studio_right_collapsed');
      if (l !== null) setLeftCollapsed(l === 'true');
      if (r !== null) setRightCollapsed(r === 'true');
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('nirmaanify_studio_left_collapsed', String(leftCollapsed));
    } catch {}
  }, [leftCollapsed]);
  useEffect(() => {
    try {
      localStorage.setItem('nirmaanify_studio_right_collapsed', String(rightCollapsed));
    } catch {}
  }, [rightCollapsed]);

  // SSR safety for createPortal
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Wrap the selection/page setters so the history engine can replay them
  // on undo/redo without the studio dropping its cursor context.
  const setActivePageId = (id: string) => {
    setActivePageIdRaw(id);
    setHistoryMeta({ activePageId: id });
  };
  const setSelectedNodeId = (id: string | null) => {
    setSelectedNodeIdRaw(id);
    setHistoryMeta({ selectedNodeId: id });
  };

  // Add Page Modal
  const [addPageModalOpen, setAddPageModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPagePath, setNewPagePath] = useState('');
  const [newPageTitle, setNewPageTitle] = useState('');

  // Master Schema Modal
  const [schemaModalOpen, setSchemaModalOpen] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Live React Code Preview Modal
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync initial schema ONLY when the project identity changes (i.e. the
// user navigated to a different project). We deliberately do NOT depend
// on the `project` object reference here — after a save, `updateProject`
// replaces the project in the context's projects list, which would
// otherwise re-fire this effect and bounce the user back to the first
// page even though they stayed on the same project.
  useEffect(() => {
    if (!project) return;
    const s =
      project.projectSchema &&
      project.projectSchema.pages &&
      Array.isArray(project.projectSchema.pages) &&
      typeof project.projectSchema.pages[0] === 'object'
        ? (project.projectSchema as ProjectSchema)
        : createDefaultProjectSchema(project.name, project.type);

    s.pages?.forEach((p) => p?.rootNode && normalizeParentPointers(p.rootNode, null));

    const initialMeta = s.pages && s.pages.length > 0
      ? { selectedNodeId: s.pages[0].rootNode.id, activePageId: s.pages[0].id }
      : {};
    reset(s, initialMeta);
    if (s.pages && s.pages.length > 0) {
      setActivePageId(s.pages[0].id);
      setSelectedNodeId(s.pages[0].rootNode.id);
    }

    const snapshot = JSON.stringify(s);
    lastSavedRef.current = snapshot;
    setIsDirty(false);
    setSavedAt(new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  // Track dirty state: compare current schema against the last saved snapshot.
  useEffect(() => {
    const snapshot = JSON.stringify(projectSchema);
    if (snapshot !== lastSavedRef.current) {
      setIsDirty(true);
    }
  }, [projectSchema]);

  // Manual save handler — also reused by the 30s auto-save loop. We keep an
  // `isSavingRef` alongside `isSaving` state so the auto-save interval can
  // read the latest value without racing on a stale React closure.
  const isSavingRef = useRef(false);
  const isDirtyRef = useRef(false);
  const handleSaveRef = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    isSavingRef.current = isSaving;
  }, [isSaving]);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  const handleSave = useCallback(async () => {
    if (!project || isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    try {
      await updateProject(project.id, { projectSchema: projectSchema as any });
      const snapshot = JSON.stringify(projectSchema);
      lastSavedRef.current = snapshot;
      setIsDirty(false);
      isDirtyRef.current = false;
      setSavedAt(new Date());
      toast({
        title: 'Project saved',
        description: `${projectSchema.pages.length} page${projectSchema.pages.length === 1 ? '' : 's'} synced to cloud.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Save error:', err);
      toast({
        title: 'Save failed',
        description: 'Could not persist your changes. Please try again.',
        type: 'error',
      });
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [project, projectSchema, updateProject, toast]);

  // Keep `handleSaveRef` pointing at the latest handleSave so the
  // auto-save interval below can call it without capturing a stale closure.
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);

  // Auto-save: every 30 seconds, if the schema has diverged from the last
  // saved snapshot. We compare via `isDirtyRef.current` (kept in sync with
  // `isDirty` state above) so the interval doesn't need to re-render on
  // every keystroke. The interval cleans up when the modal closes, when
  // the project changes, or when the component unmounts.
  const AUTO_SAVE_INTERVAL_MS = 30_000;
  useEffect(() => {
    if (!isOpen || !project) return;
    const intervalId = window.setInterval(() => {
      if (isDirtyRef.current && !isSavingRef.current) {
        handleSaveRef.current();
      }
    }, AUTO_SAVE_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [isOpen, project?.id]);

  // Warn before closing if there are unsaved changes
  const handleClose = useCallback(() => {
    if (isDirty) {
      const ok = typeof window !== 'undefined'
        ? window.confirm('You have unsaved changes. Discard them and close the studio?')
        : true;
      if (!ok) return;
    }
    onClose();
  }, [isDirty, onClose]);

  // Active page resolution
  const activePage: PageSchema = useMemo(() => {
    if (!projectSchema.pages || projectSchema.pages.length === 0) {
      return createDefaultProjectSchema(project?.name || 'App').pages[0];
    }
    return (
      projectSchema.pages.find((p) => p.id === activePageId) ||
      projectSchema.pages[0]
    );
  }, [projectSchema.pages, activePageId, project?.name]);

  // Validation diagnostic
  const validationResult = useMemo(() => {
    return ProjectValidator.validate(projectSchema);
  }, [projectSchema]);

  // Active node resolution for inspector
  const selectedNode = useMemo((): ComponentNode | null => {
    if (!selectedNodeId || !activePage?.rootNode) return null;

    const findNode = (curr: ComponentNode): ComponentNode | null => {
      if (curr.id === selectedNodeId) return curr;
      if (curr.children) {
        for (const child of curr.children) {
          const res = findNode(child);
          if (res) return res;
        }
      }
      return null;
    };

    return findNode(activePage.rootNode);
  }, [selectedNodeId, activePage?.rootNode]);

  // Generated React TSX Code
  const generatedReactCode = useMemo(() => {
    if (!activePage) return '';
    return ReactCodeGenerator.generatePageComponent(activePage);
  }, [activePage]);

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S, Ctrl+[, Ctrl+], Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      // Toggle left sidebar: Ctrl/Cmd + [
      if ((e.ctrlKey || e.metaKey) && e.key === '[') {
        e.preventDefault();
        setLeftCollapsed((prev) => !prev);
        return;
      }
      // Toggle right sidebar: Ctrl/Cmd + ]
      if ((e.ctrlKey || e.metaKey) && e.key === ']') {
        e.preventDefault();
        setRightCollapsed((prev) => !prev);
        return;
      }

      // Move / Jump selected node: Alt + ArrowUp / Alt + ArrowDown
      if (selectedNodeId && e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        handleMoveNode(selectedNodeId, e.key === 'ArrowUp' ? 'up' : 'down');
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        redo();
      } else if (e.key === 'Escape') {
        if (isDirty) {
          handleClose();
        } else {
          setSelectedNodeId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, undo, redo, handleSave, isDirty, handleClose]);

  // Restore selection + active page after undo/redo. We only apply metadata
  // when the target id still exists in the current schema; otherwise we
  // gracefully fall back to the root of the active page.
  useEffect(() => {
    if (!historyMeta) return;
    if (historyMeta.activePageId && historyMeta.activePageId !== activePageId) {
      const exists = projectSchema.pages?.some((p) => p.id === historyMeta.activePageId);
      if (exists) {
        setActivePageIdRaw(historyMeta.activePageId);
      }
    }
    if (historyMeta.selectedNodeId !== undefined && historyMeta.selectedNodeId !== selectedNodeId) {
      const target = historyMeta.selectedNodeId;
      const page = projectSchema.pages?.find((p) => p.id === (historyMeta.activePageId ?? activePageId));
      if (!page) return;
      const found = findNodeInTree(page.rootNode, target);
      if (found) {
        setSelectedNodeIdRaw(target);
      } else if (page.rootNode) {
        setSelectedNodeIdRaw(page.rootNode.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyMeta]);

  // Helper to update current page component tree
  const updateActivePageRootNode = useCallback(
    (updater: (currentRoot: ComponentNode) => ComponentNode) => {
      setProjectSchema((prev) => {
        const updatedPages = prev.pages.map((page) => {
          if (page.id === activePage.id) {
            return {
              ...page,
              rootNode: updater(page.rootNode),
              updatedAt: new Date().toISOString(),
            };
          }
          return page;
        });

        return {
          ...prev,
          pages: updatedPages,
        };
      });
    },
    [activePage.id, setProjectSchema]
  );

  // Add Component handler
  const handleAddComponent = (type: string) => {
    const parentId = selectedNodeId || activePage.rootNode.id;
    const parentNode = findNode(activePage.rootNode, parentId);
    if (parentNode?.isLocked) {
      toast({ title: 'Container Locked', description: 'Cannot insert components into a locked container. Unlock it first.', type: 'warning' });
      return;
    }
    const newNode = createComponentNode(type, {}, parentId);

    updateActivePageRootNode((root) => {
      const insertNode = (parent: ComponentNode): ComponentNode => {
        if (parent.id === parentId) {
          return rewireParentPointers({
            ...parent,
            children: [...(parent.children || []), newNode],
          });
        }
        if (parent.children) {
          return rewireParentPointers({
            ...parent,
            children: parent.children.map(insertNode),
          });
        }
        return parent;
      };

      return insertNode(root);
    });

    setSelectedNodeId(newNode.id);
    toast({ title: 'Component Added', description: `Inserted ${newNode.name}`, type: 'info' });
  };

  // Drag-and-Drop component dropped into canvas
  const handleDropComponent = (type: string, targetParentId?: string) => {
    const parentId = targetParentId || activePage.rootNode.id;
    const parentNode = findNode(activePage.rootNode, parentId);
    if (parentNode?.isLocked) {
      toast({ title: 'Container Locked', description: 'Cannot drop components into a locked container. Unlock it first.', type: 'warning' });
      return;
    }
    const newNode = createComponentNode(type, {}, parentId);

    updateActivePageRootNode((root) => {
      const insert = (curr: ComponentNode): ComponentNode => {
        if (curr.id === parentId) {
          return {
            ...curr,
            children: [...(curr.children || []), newNode],
          };
        }
        if (curr.children) {
          return {
            ...curr,
            children: curr.children.map(insert),
          };
        }
        return curr;
      };
      return insert(root);
    });

    setSelectedNodeId(newNode.id);
    toast({ title: 'Dropped Component', description: `Added ${newNode.name} to canvas`, type: 'success' });
  };

  // Move / Jump Node Up / Down across siblings and layout sections
  const handleMoveNode = (nodeId: string, direction: 'up' | 'down') => {
    const targetNode = findNode(activePage.rootNode, nodeId);
    if (targetNode?.isLocked) {
      toast({
        title: 'Component Locked',
        description: 'Cannot move or jump a locked component. Unlock it first.',
        type: 'warning',
      });
      return;
    }

    const parentNode = findParentNode(activePage.rootNode, nodeId);
    if (parentNode?.isLocked) {
      toast({
        title: 'Container Locked',
        description: 'Cannot move components inside a locked container. Unlock it first.',
        type: 'warning',
      });
      return;
    }

    updateActivePageRootNode((root) => {
      const updated = jumpNode(root, nodeId, direction);
      if (!updated) {
        toast({
          title: direction === 'up' ? 'Top Boundary' : 'Bottom Boundary',
          description: `Cannot move ${direction} further.`,
          type: 'info',
        });
        return root;
      }
      return updated;
    });
  };

  // Reparent / Drag and Drop Move Node across layouts
  const handleReparentNode = (
    sourceId: string,
    targetId: string,
    position: 'before' | 'after' | 'inside'
  ) => {
    const sourceNode = findNode(activePage.rootNode, sourceId);
    if (sourceNode?.isLocked) {
      toast({
        title: 'Component Locked',
        description: 'Cannot move a locked component. Unlock it first.',
        type: 'warning',
      });
      return;
    }

    const sourceParent = findParentNode(activePage.rootNode, sourceId);
    if (sourceParent?.isLocked) {
      toast({
        title: 'Container Locked',
        description: 'Cannot move components out of a locked container. Unlock it first.',
        type: 'warning',
      });
      return;
    }

    const targetNode = findNode(activePage.rootNode, targetId);
    if (position === 'inside' && targetNode?.isLocked) {
      toast({
        title: 'Container Locked',
        description: 'Cannot move components into a locked container. Unlock it first.',
        type: 'warning',
      });
      return;
    }

    if (position === 'before' || position === 'after') {
      const targetParent = findParentNode(activePage.rootNode, targetId);
      if (targetParent?.isLocked) {
        toast({
          title: 'Container Locked',
          description: 'Cannot insert components into a locked container. Unlock it first.',
          type: 'warning',
        });
        return;
      }
    }

    updateActivePageRootNode((root) => {
      const updated = moveNodeToTarget(root, sourceId, targetId, position);
      if (!updated) {
        toast({
          title: 'Cannot Move Component',
          description: 'Cannot move a locked component or place into a locked container.',
          type: 'error',
        });
        return root;
      }
      toast({
        title: 'Component Moved',
        description: `Reparented component ${position} target layout.`,
        type: 'success',
      });
      return updated;
    });
    setSelectedNodeId(sourceId);
  };

  // Insert AI generated node tree
  const handleInsertGeneratedNodes = (nodes: ComponentNode[]) => {
    updateActivePageRootNode((root) => {
      return {
        ...root,
        children: [...(root.children || []), ...nodes],
      };
    });
    if (nodes[0]) {
      setSelectedNodeId(nodes[0].id);
    }
  };

  // Update Props
  const handleUpdateProps = (nodeId: string, newProps: Record<string, any>) => {
    const targetNode = findNode(activePage.rootNode, nodeId);
    if (targetNode?.isLocked) {
      toast({ title: 'Component Locked', description: 'Unlock this component to edit its properties.', type: 'warning' });
      return;
    }

    updateActivePageRootNode((root) => {
      const update = (curr: ComponentNode): ComponentNode => {
        if (curr.id === nodeId) {
          return { ...curr, props: newProps };
        }
        if (curr.children) {
          return { ...curr, children: curr.children.map(update) };
        }
        return curr;
      };
      return update(root);
    });
  };

  // Update Styles
  const handleUpdateStyle = (nodeId: string, newStyle: ComponentNodeStyle) => {
    const targetNode = findNode(activePage.rootNode, nodeId);
    if (targetNode?.isLocked) {
      toast({ title: 'Component Locked', description: 'Unlock this component to edit styles.', type: 'warning' });
      return;
    }

    updateActivePageRootNode((root) => {
      const update = (curr: ComponentNode): ComponentNode => {
        if (curr.id === nodeId) {
          return { ...curr, style: newStyle };
        }
        if (curr.children) {
          return { ...curr, children: curr.children.map(update) };
        }
        return curr;
      };
      return update(root);
    });
  };

  // Update Node Name
  const handleUpdateName = (nodeId: string, newName: string) => {
    const targetNode = findNode(activePage.rootNode, nodeId);
    if (targetNode?.isLocked) {
      toast({ title: 'Component Locked', description: 'Unlock this component to rename it.', type: 'warning' });
      return;
    }

    updateActivePageRootNode((root) => {
      const update = (curr: ComponentNode): ComponentNode => {
        if (curr.id === nodeId) {
          return { ...curr, name: newName };
        }
        if (curr.children) {
          return { ...curr, children: curr.children.map(update) };
        }
        return curr;
      };
      return update(root);
    });
  };

  // Delete Node
  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === activePage.rootNode.id) {
      toast({ title: 'Protected Node', description: 'Cannot delete the page root container.', type: 'error' });
      return;
    }

    const targetNode = findNode(activePage.rootNode, nodeId);
    if (targetNode?.isLocked) {
      toast({ title: 'Component Locked', description: 'Cannot delete a locked component. Unlock it first.', type: 'warning' });
      return;
    }

    const parentNode = findParentNode(activePage.rootNode, nodeId);
    if (parentNode?.isLocked) {
      toast({ title: 'Container Locked', description: 'Cannot delete components inside a locked container. Unlock it first.', type: 'warning' });
      return;
    }

    updateActivePageRootNode((root) => {
      const remove = (curr: ComponentNode): ComponentNode => {
        if (curr.children) {
          return {
            ...curr,
            children: curr.children.filter((c) => c.id !== nodeId).map(remove),
          };
        }
        return curr;
      };
      return remove(root);
    });

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  // Duplicate Node
  const handleDuplicateNode = (nodeId: string) => {
    const targetNode = findNode(activePage.rootNode, nodeId);
    if (targetNode?.isLocked) {
      toast({ title: 'Component Locked', description: 'Cannot duplicate a locked component.', type: 'warning' });
      return;
    }

    const parentNode = findParentNode(activePage.rootNode, nodeId);
    if (parentNode?.isLocked) {
      toast({ title: 'Container Locked', description: 'Cannot duplicate components inside a locked container. Unlock it first.', type: 'warning' });
      return;
    }

    updateActivePageRootNode((root) => {
      const duplicate = (curr: ComponentNode): ComponentNode => {
        if (curr.children) {
          const index = curr.children.findIndex((c) => c.id === nodeId);
          if (index !== -1) {
            const target = curr.children[index];
            const clonedRaw: ComponentNode = JSON.parse(JSON.stringify(target));
            clonedRaw.id = `node-${clonedRaw.type}-${Date.now().toString(36)}`;
            clonedRaw.name = `${clonedRaw.name || clonedRaw.type} (Copy)`;

            const cloned = rewireParentPointers(clonedRaw, curr.id);

            const newChildren = [...curr.children];
            newChildren.splice(index + 1, 0, cloned);
            return { ...curr, children: newChildren };
          }
          return { ...curr, children: curr.children.map(duplicate) };
        }
        return curr;
      };
      return duplicate(root);
    });
    toast({ title: 'Duplicated', description: 'Cloned component node', type: 'info' });
  };

  // Toggle Lock
  const handleToggleLockNode = (nodeId: string) => {
    updateActivePageRootNode((root) => {
      const update = (curr: ComponentNode): ComponentNode => {
        if (curr.id === nodeId) {
          return { ...curr, isLocked: !curr.isLocked };
        }
        if (curr.children) {
          return { ...curr, children: curr.children.map(update) };
        }
        if (curr.slots && typeof curr.slots === 'object') {
          const updatedSlots = Object.fromEntries(
            Object.entries(curr.slots).map(([k, list]) => [
              k,
              Array.isArray(list) ? list.map(update) : list,
            ])
          );
          return { ...curr, slots: updatedSlots };
        }
        return curr;
      };
      return update(root);
    });
  };

  // Toggle Hide (cascades to all sub-children and slots)
  const handleToggleHideNode = (nodeId: string) => {
    updateActivePageRootNode((root) => {
      // Helper to recursively set isHidden on a node and all its descendants
      const setHiddenDeep = (node: ComponentNode, hidden: boolean): ComponentNode => {
        const updatedChildren = Array.isArray(node.children)
          ? node.children.map((child) => setHiddenDeep(child, hidden))
          : node.children;

        let updatedSlots = node.slots;
        if (node.slots && typeof node.slots === 'object') {
          updatedSlots = Object.fromEntries(
            Object.entries(node.slots).map(([k, list]) => [
              k,
              Array.isArray(list) ? list.map((c) => setHiddenDeep(c, hidden)) : list,
            ])
          );
        }

        return {
          ...node,
          isHidden: hidden,
          children: updatedChildren,
          slots: updatedSlots,
        };
      };

      const update = (curr: ComponentNode): ComponentNode => {
        if (curr.id === nodeId) {
          const nextHidden = !curr.isHidden;
          return setHiddenDeep(curr, nextHidden);
        }
        if (curr.children) {
          return { ...curr, children: curr.children.map(update) };
        }
        if (curr.slots && typeof curr.slots === 'object') {
          const updatedSlots = Object.fromEntries(
            Object.entries(curr.slots).map(([k, list]) => [
              k,
              Array.isArray(list) ? list.map(update) : list,
            ])
          );
          return { ...curr, slots: updatedSlots };
        }
        return curr;
      };
      return update(root);
    });
  };

  // Add Page submit
  const handleAddPageSubmit = () => {
    if (!newPageName.trim() || !newPagePath.trim()) return;

    const pageId = `page-${Date.now()}`;
    const rootId = `root-${Date.now()}`;
    const newPage: PageSchema = {
      id: pageId,
      name: newPageName.trim(),
      path: newPagePath.trim().startsWith('/') ? newPagePath.trim() : `/${newPagePath.trim()}`,
      title: newPageTitle.trim() || newPageName.trim(),
      layout: 'default',
      rootNode: {
        id: rootId,
        type: 'container',
        name: 'Page Root',
        props: { maxWidth: '1200px', padding: '24px', direction: 'column', gap: '24px' },
        children: [],
        parent: null,
      },
    };

    setProjectSchema((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage],
    }));

    setActivePageId(newPage.id);
    setSelectedNodeId(newPage.rootNode.id);
    setNewPageName('');
    setNewPagePath('');
    setNewPageTitle('');
    setAddPageModalOpen(false);
    toast({ title: 'Page Created', description: `Created route ${newPage.path}`, type: 'success' });
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(projectSchema, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
    toast({ title: 'Copied to Clipboard', description: 'Full Project JSON Schema copied', type: 'info' });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedReactCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast({ title: 'Copied Code', description: 'React TSX component copied to clipboard', type: 'success' });
  };

  const lastSavedLabel = savedAt
    ? savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  if (!isOpen || !project || !mounted) return null;

  const studioContent = (
    <div className="fixed inset-0 z-[100] bg-[#F8FAFC] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-200 font-sans">
      {/* Brand gradient accent strip across the top */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#635BFF] via-[#8B5CF6] to-[#22D3EE] shrink-0 z-40" />

      {/* Top Bar */}
      <StudioTopbar
        project={projectSchema}
        activePage={activePage}
        viewport={viewport}
        mode={mode}
        zoom={zoom}
        canUndo={canUndo}
        canRedo={canRedo}
        isSaving={isSaving}
        isDirty={isDirty}
        isValid={validationResult.isValid}
        errorsCount={validationResult.errors.length}
        lastSavedLabel={lastSavedLabel}
        autoSaveEnabled={isOpen && !!project}
        autoSaveIntervalLabel={`${AUTO_SAVE_INTERVAL_MS / 1000}s`}
        leftCollapsed={leftCollapsed}
        rightCollapsed={rightCollapsed}
        onToggleLeft={() => setLeftCollapsed((v) => !v)}
        onToggleRight={() => setRightCollapsed((v) => !v)}
        onSelectPage={(id) => {
          setActivePageId(id);
          setSelectedNodeId(null);
        }}
        onAddPage={() => setAddPageModalOpen(true)}
        onChangeViewport={setViewport}
        onChangeMode={setMode}
        onChangeZoom={setZoom}
        onUndo={undo}
        onRedo={redo}
        onViewSchema={() => setSchemaModalOpen(true)}
        onViewCode={() => setCodeModalOpen(true)}
        onSave={handleSave}
        onCloseStudio={handleClose}
      />

      {/* In-Studio AI Command Bar */}
      {mode === 'builder' && (
        <AiCommandBar
          onInsertGeneratedNodes={handleInsertGeneratedNodes}
          selectedNodeId={selectedNodeId}
        />
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar in Builder Mode */}
        {mode === 'builder' && (
          <div className="flex">
            {/* Narrow Icon Switcher (always visible in builder mode) */}
            <div className="w-11 border-r border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] flex flex-col items-center py-2.5 gap-1 shrink-0 select-none">
              {/* Collapse / Expand Toggle Button at Top */}
              <button
                onClick={() => setLeftCollapsed((v) => !v)}
                title={leftCollapsed ? 'Expand sidebar (Ctrl+[)' : 'Collapse sidebar (Ctrl+[)'}
                aria-label={leftCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141724] border border-slate-200 dark:border-[#24293D] transition-all mb-1 shadow-xs"
              >
                {leftCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={() => {
                  if (leftCollapsed) setLeftCollapsed(false);
                  setActiveLeftTab('palette');
                }}
                title="Component Palette"
                aria-label="Switch to Component Palette"
                className={`h-8 w-8 inline-flex items-center justify-center rounded-lg transition-all duration-200 ${
                  !leftCollapsed && activeLeftTab === 'palette'
                    ? 'bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white shadow-sm shadow-[#635BFF]/30'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141724]'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  if (leftCollapsed) setLeftCollapsed(false);
                  setActiveLeftTab('layers');
                }}
                title="Layers Tree"
                aria-label="Switch to Layers Tree"
                className={`h-8 w-8 inline-flex items-center justify-center rounded-lg transition-all duration-200 ${
                  !leftCollapsed && activeLeftTab === 'layers'
                    ? 'bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white shadow-sm shadow-[#635BFF]/30'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141724]'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setLeftCollapsed((v) => !v)}
                title={leftCollapsed ? 'Expand sidebar (Ctrl+[)' : 'Collapse sidebar (Ctrl+[)'}
                aria-label={leftCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141724] transition-colors"
              >
                {leftCollapsed ? (
                  <PanelLeftOpen className="h-3.5 w-3.5" />
                ) : (
                  <PanelLeftClose className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Left Panel Content (only when not collapsed) */}
            {!leftCollapsed && (
              <div className="animate-in slide-in-from-left-2 duration-200">
                {activeLeftTab === 'palette' ? (
                  <ComponentPalette onAddComponent={handleAddComponent} />
                ) : (
                  <LayersPanel
                    rootNode={activePage.rootNode}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={setSelectedNodeId}
                    onDeleteNode={handleDeleteNode}
                    onDuplicateNode={handleDuplicateNode}
                    onToggleLockNode={handleToggleLockNode}
                    onToggleHideNode={handleToggleHideNode}
                    onMoveNode={handleMoveNode}
                    onReparentNode={handleReparentNode}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Center Visual Canvas */}
        <VisualCanvas
          page={activePage}
          mode={mode}
          viewport={viewport}
          zoom={zoom}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          onSelectNode={setSelectedNodeId}
          onHoverNode={setHoveredNodeId}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
          onMoveNode={handleMoveNode}
          onReparentNode={handleReparentNode}
          onDropComponent={handleDropComponent}
          onOpenAddModal={() => {
            setLeftCollapsed(false);
            setActiveLeftTab('palette');
          }}
        />

        {/* Right Property Inspector in Builder Mode */}
        {mode === 'builder' && !rightCollapsed && (
          <div className="h-full flex animate-in slide-in-from-right-2 duration-200">
            <PropertyInspector
              selectedNode={selectedNode}
              onUpdateProps={handleUpdateProps}
              onUpdateStyle={handleUpdateStyle}
              onUpdateName={handleUpdateName}
              onCollapse={() => setRightCollapsed(true)}
            />
          </div>
        )}

        {/* Floating chevron to re-open right inspector when collapsed */}
        {mode === 'builder' && rightCollapsed && (
          <button
            onClick={() => setRightCollapsed(false)}
            title="Open inspector (Ctrl+])"
            aria-label="Open inspector"
            className="absolute right-3 top-20 z-30 h-8 w-8 inline-flex items-center justify-center rounded-full bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-500 hover:text-[#635BFF] hover:border-[#635BFF]/40 hover:shadow-md hover:shadow-[#635BFF]/20 transition-all"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* LIVE REACT CODE PREVIEW MODAL */}
      <Dialog
        isOpen={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        title="Live React JSX & Tailwind Code Preview"
        description="Generated in real-time from the declarative project component tree."
        className="max-w-4xl"
        footer={
          <div className="w-full flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              leftIcon={copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              onClick={handleCopyCode}
            >
              {copiedCode ? 'Copied Code!' : 'Copy TSX Component'}
            </Button>
            <Button variant="default" size="sm" onClick={() => setCodeModalOpen(false)}>
              Close Code Preview
            </Button>
          </div>
        }
      >
        <div className="space-y-2">
          <pre className="p-4 rounded-xl bg-slate-950 dark:bg-[#06080F] text-[#22D3EE] font-mono text-[11px] overflow-auto max-h-[500px] border border-slate-200 dark:border-[#24293D]">
            {generatedReactCode}
          </pre>
        </div>
      </Dialog>

      {/* ADD PAGE MODAL */}
      <Dialog
        isOpen={addPageModalOpen}
        onClose={() => setAddPageModalOpen(false)}
        title="Add New Page Route"
        description="Create an additional route in this application schema."
        footer={
          <>
            <Button variant="outline" onClick={() => setAddPageModalOpen(false)}>Cancel</Button>
            <Button variant="default" onClick={handleAddPageSubmit}>Create Page</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Page Name"
            placeholder="e.g. Products Catalog"
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
          />
          <Input
            label="Route Path (URL)"
            placeholder="e.g. /products"
            value={newPagePath}
            onChange={(e) => setNewPagePath(e.target.value)}
          />
          <Input
            label="Page Browser Title"
            placeholder="e.g. Products — Store"
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
          />
        </div>
      </Dialog>

      {/* MASTER JSON SCHEMA MODAL */}
      <Dialog
        isOpen={schemaModalOpen}
        onClose={() => setSchemaModalOpen(false)}
        title="Project Declarative JSON Schema"
        description="The clean decoupled schema representing all settings, theme tokens, pages, and component nodes."
        className="max-w-4xl"
        footer={
          <div className="w-full flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              leftIcon={copiedSchema ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              onClick={handleCopySchema}
            >
              {copiedSchema ? 'Copied!' : 'Copy JSON'}
            </Button>
            <Button variant="default" size="sm" onClick={() => setSchemaModalOpen(false)}>
              Close Inspector
            </Button>
          </div>
        }
      >
        <div className="space-y-2">
          <pre className="p-4 rounded-xl bg-slate-950 dark:bg-[#06080F] text-emerald-400 font-mono text-[11px] overflow-auto max-h-[500px] border border-slate-200 dark:border-[#24293D]">
            {JSON.stringify(projectSchema, null, 2)}
          </pre>
        </div>
      </Dialog>
    </div>
  );

  return createPortal(studioContent, document.body);
}