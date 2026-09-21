'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  FileCode,
  FolderTree,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  FileText,
  Database,
  Server,
  Layers,
  Globe,
  Settings,
  Braces,
  File,
  ChevronsDown,
  ChevronsUp,
} from 'lucide-react';

interface FileExplorerPaneProps {
  files: Record<string, string>;
  diffs?: Record<string, { type: 'added' | 'modified' | 'deleted' }> | null;
}

export interface FileTreeNode {
  id: string;
  name: string;
  path?: string;
  type: 'folder' | 'file';
  category: 'frontend' | 'backend' | 'config';
  children?: FileTreeNode[];
}

function categorizePath(filePath: string): 'frontend' | 'backend' | 'config' {
  const p = filePath.toLowerCase();
  if (p.startsWith('frontend/') || p.startsWith('client/') || p.startsWith('web/')) {
    return 'frontend';
  }
  if (p.startsWith('backend/') || p.startsWith('server/') || p.startsWith('api/')) {
    return 'backend';
  }
  if (
    p.includes('schema.prisma') ||
    p.includes('prisma/') ||
    p.includes('controller') ||
    p.includes('service') ||
    p.includes('module.ts') ||
    p.includes('entity') ||
    p.includes('nest') ||
    p.includes('migration') ||
    p.includes('database/') ||
    p.includes('/api/')
  ) {
    return 'backend';
  }
  if (
    !p.includes('/') &&
    (p.endsWith('.json') ||
      p.endsWith('.config.js') ||
      p.endsWith('.config.ts') ||
      p.endsWith('.config.mjs') ||
      p.startsWith('.') ||
      p === 'dockerfile' ||
      p.endsWith('.md'))
  ) {
    return 'config';
  }
  return 'frontend';
}

function buildCategoryTree(filePaths: string[]): FileTreeNode[] {
  const categories: Record<'frontend' | 'backend' | 'config', string[]> = {
    frontend: [],
    backend: [],
    config: [],
  };

  for (const path of filePaths) {
    const cat = categorizePath(path);
    categories[cat].push(path);
  }

  const buildTreeForPaths = (paths: string[], category: 'frontend' | 'backend' | 'config'): FileTreeNode[] => {
    const rootNodes: FileTreeNode[] = [];

    for (const filePath of paths) {
      let relativePath = filePath;
      if (category === 'frontend' && relativePath.startsWith('frontend/')) {
        relativePath = relativePath.replace(/^frontend\//, '');
      } else if (category === 'backend' && relativePath.startsWith('backend/')) {
        relativePath = relativePath.replace(/^backend\//, '');
      }

      const segments = relativePath.split('/').filter(Boolean);
      let currentLevel = rootNodes;
      let currentPath: string = category;

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const isFile = i === segments.length - 1;
        currentPath = `${currentPath}/${segment}`;

        if (isFile) {
          currentLevel.push({
            id: currentPath,
            name: segment,
            path: filePath,
            type: 'file',
            category,
          });
        } else {
          let folder = currentLevel.find((n) => n.type === 'folder' && n.name === segment);
          if (!folder) {
            folder = {
              id: currentPath,
              name: segment,
              type: 'folder',
              category,
              children: [],
            };
            currentLevel.push(folder);
          }
          currentLevel = folder.children!;
        }
      }
    }

    const sortNodes = (nodes: FileTreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      for (const node of nodes) {
        if (node.children) {
          sortNodes(node.children);
        }
      }
    };

    sortNodes(rootNodes);
    return rootNodes;
  };

  const tree: FileTreeNode[] = [];

  // Frontend root
  const frontendChildren = buildTreeForPaths(categories.frontend, 'frontend');
  tree.push({
    id: 'root-frontend',
    name: 'frontend',
    type: 'folder',
    category: 'frontend',
    children: frontendChildren,
  });

  // Backend root
  const backendChildren = buildTreeForPaths(categories.backend, 'backend');
  tree.push({
    id: 'root-backend',
    name: 'backend',
    type: 'folder',
    category: 'backend',
    children: backendChildren,
  });

  // Config root
  if (categories.config.length > 0) {
    const configChildren = buildTreeForPaths(categories.config, 'config');
    tree.push({
      id: 'root-config',
      name: 'config',
      type: 'folder',
      category: 'config',
      children: configChildren,
    });
  }

  return tree;
}

function getFileIcon(fileName: string, fullPath: string) {
  const name = fileName.toLowerCase();
  if (name.endsWith('.prisma')) return <Database className="h-3.5 w-3.5 text-cyan-600 dark:text-[#22D3EE] shrink-0" />;
  if (name.includes('controller') || name.includes('service') || name.includes('module'))
    return <Server className="h-3.5 w-3.5 text-indigo-600 dark:text-[#8B5CF6] shrink-0" />;
  if (name.endsWith('.css') || name.endsWith('.scss')) return <Layers className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0" />;
  if (name.endsWith('.json')) return <Braces className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />;
  if (name.endsWith('.md')) return <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
  if (name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('.js') || name.endsWith('.jsx'))
    return <FileCode className="h-3.5 w-3.5 text-[#635BFF] shrink-0" />;
  return <File className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
}

interface TreeNodeItemProps {
  node: FileTreeNode;
  depth: number;
  activePath: string;
  expandedFolders: Record<string, boolean>;
  onToggleFolder: (folderId: string) => void;
  onSelectFile: (filePath: string) => void;
  diffs?: Record<string, { type: 'added' | 'modified' | 'deleted' }> | null;
}

function TreeNodeItem({
  node,
  depth,
  activePath,
  expandedFolders,
  onToggleFolder,
  onSelectFile,
  diffs,
}: TreeNodeItemProps) {
  if (node.type === 'folder') {
    const isExpanded = expandedFolders[node.id] ?? true;
    const isRootFrontend = node.id === 'root-frontend';
    const isRootBackend = node.id === 'root-backend';
    const isRootConfig = node.id === 'root-config';
    const childCount = node.children?.length ?? 0;

    return (
      <div className="select-none">
        <button
          onClick={() => onToggleFolder(node.id)}
          className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors group ${
            isRootFrontend || isRootBackend || isRootConfig
              ? 'bg-slate-100/80 dark:bg-[#141724] font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-[#1c2133] my-0.5'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#161928]'
          }`}
          style={{ paddingLeft: `${depth * 10 + 8}px` }}
        >
          <div className="flex items-center gap-1.5 truncate">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-slate-400 shrink-0 transition-transform" />
            ) : (
              <ChevronRight className="h-3 w-3 text-slate-400 shrink-0 transition-transform" />
            )}

            {isRootFrontend ? (
              <Globe className="h-3.5 w-3.5 text-[#635BFF] shrink-0" />
            ) : isRootBackend ? (
              <Server className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            ) : isRootConfig ? (
              <Settings className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            ) : isExpanded ? (
              <FolderOpen className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            ) : (
              <Folder className="h-3.5 w-3.5 text-amber-500/80 shrink-0" />
            )}

            <span className="truncate text-[11.5px] font-medium">{node.name}</span>
          </div>

          {(isRootFrontend || isRootBackend) && (
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase tracking-wider ${
                isRootFrontend
                  ? 'bg-[#635BFF]/10 text-[#635BFF] font-bold'
                  : 'bg-indigo-500/10 text-indigo-500 font-bold'
              }`}
            >
              {isRootFrontend ? 'Next.js' : 'NestJS'}
            </span>
          )}
        </button>

        {isExpanded && node.children && (
          <div className="border-l border-slate-200/80 dark:border-[#24293D]/60 ml-3.5 my-0.5 space-y-0.5">
            {node.children.length === 0 ? (
              <div className="text-[10px] text-slate-400 italic py-1 pl-4">No files in this branch</div>
            ) : (
              node.children.map((child) => (
                <TreeNodeItem
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  activePath={activePath}
                  expandedFolders={expandedFolders}
                  onToggleFolder={onToggleFolder}
                  onSelectFile={onSelectFile}
                  diffs={diffs}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // File item
  const isSelected = node.path === activePath;
  const diff = node.path ? diffs?.[node.path] : null;

  return (
    <button
      onClick={() => node.path && onSelectFile(node.path)}
      className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-left transition-all ${
        isSelected
          ? 'bg-white dark:bg-[#635BFF]/20 text-[#635BFF] dark:text-white font-semibold border border-slate-200 dark:border-[#635BFF]/40 shadow-xs'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#161928] border border-transparent'
      }`}
      style={{ paddingLeft: `${depth * 10 + 8}px` }}
    >
      <div className="flex items-center gap-2 truncate">
        {getFileIcon(node.name, node.path || '')}
        <span className="truncate text-[11.5px]">{node.name}</span>
      </div>
      {diff && (
        <span
          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
            diff.type === 'added'
              ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-transparent'
              : 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-transparent'
          }`}
        >
          {diff.type}
        </span>
      )}
    </button>
  );
}

export function FileExplorerPane({ files = {}, diffs = null }: FileExplorerPaneProps) {
  const filePaths = useMemo(() => Object.keys(files), [files]);
  const [selectedFile, setSelectedFile] = useState<string>(
    filePaths.includes('app/page.tsx')
      ? 'app/page.tsx'
      : filePaths.includes('src/app/page.tsx')
      ? 'src/app/page.tsx'
      : filePaths[0] || ''
  );
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'frontend' | 'backend'>('all');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const tree = useMemo(() => buildCategoryTree(filePaths), [filePaths]);

  const frontendCount = useMemo(
    () => filePaths.filter((p) => categorizePath(p) === 'frontend').length,
    [filePaths]
  );
  const backendCount = useMemo(
    () => filePaths.filter((p) => categorizePath(p) === 'backend').length,
    [filePaths]
  );

  const filteredTree = useMemo(() => {
    if (activeCategory === 'frontend') {
      return tree.filter((n) => n.category === 'frontend');
    }
    if (activeCategory === 'backend') {
      return tree.filter((n) => n.category === 'backend');
    }
    return tree;
  }, [tree, activeCategory]);

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: prev[folderId] === undefined ? false : !prev[folderId],
    }));
  }, []);

  const expandAll = useCallback(() => {
    const expanded: Record<string, boolean> = {};
    const collect = (nodes: FileTreeNode[]) => {
      for (const n of nodes) {
        if (n.type === 'folder') {
          expanded[n.id] = true;
          if (n.children) collect(n.children);
        }
      }
    };
    collect(tree);
    setExpandedFolders(expanded);
  }, [tree]);

  const collapseAll = useCallback(() => {
    const collapsed: Record<string, boolean> = {};
    const collect = (nodes: FileTreeNode[]) => {
      for (const n of nodes) {
        if (n.type === 'folder') {
          collapsed[n.id] = false;
          if (n.children) collect(n.children);
        }
      }
    };
    collect(tree);
    setExpandedFolders(collapsed);
  }, [tree]);

  const activePath = files[selectedFile] !== undefined ? selectedFile : filePaths[0] || '';
  const currentContent = files[activePath] || '// No file content';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = currentContent.split('\n');

  return (
    <div className="h-full w-full flex-1 flex flex-col md:flex-row bg-white dark:bg-[#0E111C] text-slate-800 dark:text-slate-200 overflow-hidden font-mono select-text">
      {/* Left Sidebar: Collapsible Recursive File Tree */}
      <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#24293D] flex flex-col bg-slate-50 dark:bg-[#0B0D16] shrink-0">
        {/* Sidebar Header */}
        <div className="h-10 px-3 border-b border-slate-200 dark:border-[#24293D] flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-400 bg-white/70 dark:bg-[#0B0D16] shrink-0">
          <div className="flex items-center gap-1.5">
            <FolderTree className="h-3.5 w-3.5 text-[#635BFF]" />
            <span>Explorer</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={expandAll}
              title="Expand All Branches"
              className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-[#1A1E2E] text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ChevronsDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={collapseAll}
              title="Collapse All Branches"
              className="p-1 rounded hover:bg-slate-200/70 dark:hover:bg-[#1A1E2E] text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ChevronsUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Frontend / Backend Segment Filter Pills */}
        <div className="p-2 border-b border-slate-200/70 dark:border-[#24293D]/60 bg-slate-50/80 dark:bg-[#0B0D16] shrink-0">
          <div className="grid grid-cols-3 gap-1 bg-slate-200/70 dark:bg-[#151827] p-0.5 rounded-lg text-[10.5px] font-medium text-center">
            <button
              onClick={() => setActiveCategory('all')}
              className={`py-1 rounded-md transition-all ${
                activeCategory === 'all'
                  ? 'bg-white dark:bg-[#1E2337] text-[#635BFF] dark:text-[#A5B4FC] font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({filePaths.length})
            </button>
            <button
              onClick={() => setActiveCategory('frontend')}
              className={`py-1 rounded-md transition-all ${
                activeCategory === 'frontend'
                  ? 'bg-white dark:bg-[#1E2337] text-[#635BFF] dark:text-[#A5B4FC] font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Frontend ({frontendCount})
            </button>
            <button
              onClick={() => setActiveCategory('backend')}
              className={`py-1 rounded-md transition-all ${
                activeCategory === 'backend'
                  ? 'bg-white dark:bg-[#1E2337] text-[#635BFF] dark:text-[#A5B4FC] font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Backend ({backendCount})
            </button>
          </div>
        </div>

        {/* Tree View Body */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs">
          {filePaths.length === 0 ? (
            <div className="p-4 text-center text-[11px] text-slate-400">
              No files generated yet. Prompt the AI agent to generate project files.
            </div>
          ) : (
            filteredTree.map((node) => (
              <TreeNodeItem
                key={node.id}
                node={node}
                depth={0}
                activePath={activePath}
                expandedFolders={expandedFolders}
                onToggleFolder={toggleFolder}
                onSelectFile={setSelectedFile}
                diffs={diffs}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Area: Code Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0A0C14]">
        {/* File Header Bar */}
        <div className="h-10 px-4 border-b border-slate-200 dark:border-[#24293D] flex items-center justify-between bg-slate-50/70 dark:bg-[#0E111C] shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-300 truncate">
            {getFileIcon(activePath.split('/').pop() || '', activePath)}
            <span className="font-semibold truncate">{activePath || 'No File Selected'}</span>
            <span className="text-[10px] text-slate-400 shrink-0 font-mono">({lines.length} lines)</span>
          </div>

          <button
            onClick={handleCopy}
            className="h-6 px-2.5 inline-flex items-center gap-1.5 rounded-md bg-white dark:bg-[#161928] hover:bg-slate-100 dark:hover:bg-[#20253B] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-[11px] font-semibold transition-colors border border-slate-200 dark:border-[#24293D] shadow-xs shrink-0"
            title="Copy file contents"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content with Line Numbers - Single Scroll Container */}
        <div className="flex-1 overflow-auto bg-white dark:bg-[#0A0C14] select-text">
          <div className="min-w-full inline-flex font-mono text-xs leading-6 p-4">
            {/* Sticky Line Numbers Gutter */}
            <div className="sticky left-0 bg-white dark:bg-[#0A0C14] pr-4 text-right select-none text-slate-400 dark:text-slate-600 border-r border-slate-200 dark:border-[#24293D]/60 min-w-[2.75rem] shrink-0 z-10">
              {lines.map((_, i) => (
                <div key={i} className="h-6 leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Content - overflow-visible so only outer container scrolls */}
            <pre className="pl-4 text-slate-800 dark:text-[#22D3EE] flex-1 m-0 p-0 font-mono text-xs leading-6 overflow-visible">
              <code>{currentContent}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
