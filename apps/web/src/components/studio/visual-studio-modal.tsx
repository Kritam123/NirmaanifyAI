'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  rewireParentPointers,
  normalizeParentPointers,
} from '@nirmaanify/component-registry';
import { StudioTopbar } from './studio-topbar';
import { ComponentPalette } from './component-palette';
import { LayersPanel } from './layers-panel';
import { PropertyInspector } from './property-inspector';
import { VisualCanvas } from './visual-canvas';
import { Dialog, Button, Input, useToast } from '@nirmaanify/ui';
import { useAuth } from '../../context/auth-context';
import { Copy, Check } from 'lucide-react';

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

    // Generate starter schema for this project architecture
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
  const [isSaving, setIsSaving] = useState(false);

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

  // Sync initial schema when project changes
  useEffect(() => {
    if (project) {
      const s =
        project.projectSchema &&
        project.projectSchema.pages &&
        Array.isArray(project.projectSchema.pages) &&
        typeof project.projectSchema.pages[0] === 'object'
          ? (project.projectSchema as ProjectSchema)
          : createDefaultProjectSchema(project.name, project.type);

      // Normalize parent pointers in case the persisted schema is from an older
      // version of the engine that didn't maintain them.
      s.pages?.forEach((p) => p?.rootNode && normalizeParentPointers(p.rootNode, null));

      const initialMeta = s.pages && s.pages.length > 0
        ? { selectedNodeId: s.pages[0].rootNode.id, activePageId: s.pages[0].id }
        : {};
      reset(s, initialMeta);
      if (s.pages && s.pages.length > 0) {
        setActivePageId(s.pages[0].id);
        setSelectedNodeId(s.pages[0].rootNode.id);
      }
    }
  }, [project, reset]);

  // Active page resolution
  const activePage: PageSchema = useMemo(() => {
    if (!projectSchema.pages || projectSchema.pages.length === 0) {
      const defaultPage = createDefaultProjectSchema(project?.name || 'App').pages[0];
      return defaultPage;
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

  // Auto-save debounce effect
  useEffect(() => {
    if (!project) return;
    setIsSaving(true);

    const timer = setTimeout(async () => {
      try {
        await updateProject(project.id, {
          projectSchema: projectSchema as any,
        });
      } catch (err) {
        console.error('Auto-save error:', err);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [projectSchema, project, updateProject]);

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

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
        setSelectedNodeId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, undo, redo]);

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
    // createComponentNode already sets `parent` on the new node; we still run
    // rewireParentPointers below as a defensive normalization in case the
    // (id, parent) pair was supplied by the user from the layer panel.
    const newNode = createComponentNode(type, {}, parentId);

    updateActivePageRootNode((root) => {
      // If a container is selected, add as child; otherwise append to root.
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

  // Update Props
  const handleUpdateProps = (nodeId: string, newProps: Record<string, any>) => {
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
    updateActivePageRootNode((root) => {
      const duplicate = (curr: ComponentNode): ComponentNode => {
        if (curr.children) {
          const index = curr.children.findIndex((c) => c.id === nodeId);
          if (index !== -1) {
            const target = curr.children[index];
            const clonedRaw: ComponentNode = JSON.parse(JSON.stringify(target));
            clonedRaw.id = `node-${clonedRaw.type}-${Date.now().toString(36)}`;
            clonedRaw.name = `${clonedRaw.name || clonedRaw.type} (Copy)`;

            // Rewire the entire subtree so the cloned node and its descendants
            // point at the new parent's id (curr.id).
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
        return curr;
      };
      return update(root);
    });
  };

  // Toggle Hide
  const handleToggleHideNode = (nodeId: string) => {
    updateActivePageRootNode((root) => {
      const update = (curr: ComponentNode): ComponentNode => {
        if (curr.id === nodeId) {
          return { ...curr, isHidden: !curr.isHidden };
        }
        if (curr.children) {
          return { ...curr, children: curr.children.map(update) };
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

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0E121E] text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Bar */}
      <StudioTopbar
        project={projectSchema}
        activePage={activePage}
        viewport={viewport}
        mode={mode}
        canUndo={canUndo}
        canRedo={canRedo}
        isSaving={isSaving}
        isValid={validationResult.isValid}
        errorsCount={validationResult.errors.length}
        onSelectPage={(id) => {
          setActivePageId(id);
          setSelectedNodeId(null);
        }}
        onAddPage={() => setAddPageModalOpen(true)}
        onChangeViewport={setViewport}
        onChangeMode={setMode}
        onUndo={undo}
        onRedo={redo}
        onViewSchema={() => setSchemaModalOpen(true)}
        onCloseStudio={onClose}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Palette & Layers Switcher) in Builder Mode */}
        {mode === 'builder' && (
          <div className="flex">
            {/* Narrow Icon Switcher */}
            <div className="w-12 border-r border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0E121E] flex flex-col items-center py-3 gap-2 shrink-0 select-none">
              <button
                onClick={() => setActiveLeftTab('palette')}
                title="Component Library Palette"
                className={`p-2 rounded-xl transition-colors ${
                  activeLeftTab === 'palette'
                    ? 'bg-[#635BFF] text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#161926]'
                }`}
              >
                <div className="h-4 w-4 font-bold text-xs flex items-center justify-center">+</div>
              </button>
              <button
                onClick={() => setActiveLeftTab('layers')}
                title="Layers Tree Navigator"
                className={`p-2 rounded-xl transition-colors ${
                  activeLeftTab === 'layers'
                    ? 'bg-[#635BFF] text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#161926]'
                }`}
              >
                <div className="h-4 w-4 flex items-center justify-center font-mono text-[10px]">☰</div>
              </button>
            </div>

            {/* Left Panel Content */}
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
              />
            )}
          </div>
        )}

        {/* Center Visual Canvas */}
        <VisualCanvas
          page={activePage}
          mode={mode}
          viewport={viewport}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          onSelectNode={setSelectedNodeId}
          onHoverNode={setHoveredNodeId}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
          onOpenAddModal={() => setActiveLeftTab('palette')}
        />

        {/* Right Property Inspector in Builder Mode */}
        {mode === 'builder' && (
          <PropertyInspector
            selectedNode={selectedNode}
            onUpdateProps={handleUpdateProps}
            onUpdateStyle={handleUpdateStyle}
            onUpdateName={handleUpdateName}
          />
        )}
      </div>

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
          <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-auto max-h-[500px]">
            {JSON.stringify(projectSchema, null, 2)}
          </pre>
        </div>
      </Dialog>
    </div>
  );
}
