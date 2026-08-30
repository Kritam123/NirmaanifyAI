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
  ReactCodeGenerator,
} from '@nirmaanify/component-registry';
import { StudioTopbar } from './studio-topbar';
import { AiCommandBar } from './ai-command-bar';
import { ComponentPalette } from './component-palette';
import { LayersPanel } from './layers-panel';
import { PropertyInspector } from './property-inspector';
import { VisualCanvas } from './visual-canvas';
import { Dialog, Button, Input, useToast } from '@nirmaanify/ui';
import { useAuth } from '../../context/auth-context';
import { Copy, Check, FileCode, Code2 } from 'lucide-react';

interface VisualStudioModalProps {
  project: ProjectDto | null;
  isOpen: boolean;
  onClose: () => void;
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
  } = useProjectHistory(initialSchema);

  // Active editor view states
  const [activePageId, setActivePageId] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeLeftTab, setActiveLeftTab] = useState<'palette' | 'layers'>('palette');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [mode, setMode] = useState<'builder' | 'preview'>('builder');
  const [zoom, setZoom] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

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

      reset(s);
      if (s.pages && s.pages.length > 0) {
        setActivePageId(s.pages[0].id);
        setSelectedNodeId(s.pages[0].rootNode.id);
      }
    }
  }, [project, reset]);

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
    const newNode = createComponentNode(type, {}, selectedNodeId || activePage.rootNode.id);

    updateActivePageRootNode((root) => {
      const insertNode = (parent: ComponentNode): ComponentNode => {
        if (parent.id === (selectedNodeId || root.id)) {
          return {
            ...parent,
            children: [...(parent.children || []), newNode],
          };
        }
        if (parent.children) {
          return {
            ...parent,
            children: parent.children.map(insertNode),
          };
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
    const newNode = createComponentNode(type, {}, targetParentId || activePage.rootNode.id);

    updateActivePageRootNode((root) => {
      const insert = (curr: ComponentNode): ComponentNode => {
        if (curr.id === (targetParentId || root.id)) {
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

  // Move Node Up / Down within parent
  const handleMoveNode = (nodeId: string, direction: 'up' | 'down') => {
    updateActivePageRootNode((root) => {
      const move = (curr: ComponentNode): ComponentNode => {
        if (curr.children) {
          const idx = curr.children.findIndex((c) => c.id === nodeId);
          if (idx !== -1) {
            const newChildren = [...curr.children];
            const targetIdx = direction === 'up' ? idx - 1 : idx + 1;

            if (targetIdx >= 0 && targetIdx < newChildren.length) {
              const [moved] = newChildren.splice(idx, 1);
              newChildren.splice(targetIdx, 0, moved);
              return { ...curr, children: newChildren };
            }
          }
          return { ...curr, children: curr.children.map(move) };
        }
        return curr;
      };
      return move(root);
    });
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
            const cloned: ComponentNode = JSON.parse(JSON.stringify(target));
            cloned.id = `node-${cloned.type}-${Date.now().toString(36)}`;
            cloned.name = `${cloned.name || cloned.type} (Copy)`;

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

    const newPage: PageSchema = {
      id: `page-${Date.now()}`,
      name: newPageName.trim(),
      path: newPagePath.trim().startsWith('/') ? newPagePath.trim() : `/${newPagePath.trim()}`,
      title: newPageTitle.trim() || newPageName.trim(),
      layout: 'default',
      rootNode: {
        id: `root-${Date.now()}`,
        type: 'container',
        name: 'Page Root',
        props: { maxWidth: '1200px', padding: '24px', direction: 'column', gap: '24px' },
        children: [],
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

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0E121E] text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-200">
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
        isValid={validationResult.isValid}
        errorsCount={validationResult.errors.length}
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
        onCloseStudio={onClose}
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
            {/* Narrow Icon Switcher */}
            <div className="w-12 border-r border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0E121E] flex flex-col items-center py-3 gap-2 shrink-0 select-none">
              <button
                onClick={() => setActiveLeftTab('palette')}
                title="Component Palette"
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
                title="Layers Tree"
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
          zoom={zoom}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          onSelectNode={setSelectedNodeId}
          onHoverNode={setHoveredNodeId}
          onDeleteNode={handleDeleteNode}
          onDuplicateNode={handleDuplicateNode}
          onMoveNode={handleMoveNode}
          onDropComponent={handleDropComponent}
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
          <pre className="p-4 rounded-xl bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-auto max-h-[500px]">
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
          <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-auto max-h-[500px]">
            {JSON.stringify(projectSchema, null, 2)}
          </pre>
        </div>
      </Dialog>
    </div>
  );
}
