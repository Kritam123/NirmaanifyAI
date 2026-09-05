'use client';

import React, { useState } from 'react';
import {
  FileCode,
  FolderTree,
  Copy,
  Check,
  FileText,
  Database,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';

interface FileExplorerPaneProps {
  files: Record<string, string>;
  diffs?: Record<string, { type: 'added' | 'modified' | 'deleted' }> | null;
}

export function FileExplorerPane({ files = {}, diffs = null }: FileExplorerPaneProps) {
  const filePaths = Object.keys(files);
  const [selectedFile, setSelectedFile] = useState<string>(
    filePaths.includes('app/page.tsx') ? 'app/page.tsx' : filePaths[0] || ''
  );
  const [copied, setCopied] = useState(false);

  // If selectedFile is not in filePaths, select the first available
  const activePath = files[selectedFile] !== undefined ? selectedFile : filePaths[0] || '';
  const currentContent = files[activePath] || '// No file content';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (path: string) => {
    if (path.includes('schema.prisma')) return <Database className="h-3.5 w-3.5 text-[#22D3EE]" />;
    if (path.includes('src/') || path.includes('controller') || path.includes('service'))
      return <Server className="h-3.5 w-3.5 text-[#8B5CF6]" />;
    if (path.endsWith('.css')) return <Layers className="h-3.5 w-3.5 text-amber-400" />;
    return <FileCode className="h-3.5 w-3.5 text-[#635BFF]" />;
  };

  const lines = currentContent.split('\n');

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#0E111C] text-slate-200 overflow-hidden font-mono select-text">
      {/* Left Sidebar: File Tree */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#24293D] flex flex-col bg-[#0B0D16] shrink-0">
        <div className="h-10 px-3 border-b border-[#24293D] flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <FolderTree className="h-3.5 w-3.5 text-[#635BFF]" />
          <span>Files &amp; Modules ({filePaths.length})</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs">
          {filePaths.length === 0 ? (
            <div className="p-4 text-center text-[11px] text-slate-500">
              No files generated yet. Send a prompt to the AI agent to generate project files.
            </div>
          ) : (
            filePaths.map((path) => {
              const isSelected = path === activePath;
              const diff = diffs?.[path];

              return (
                <button
                  key={path}
                  onClick={() => setSelectedFile(path)}
                  className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors ${
                    isSelected
                      ? 'bg-[#635BFF]/20 text-white font-semibold border border-[#635BFF]/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#161928]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getFileIcon(path)}
                    <span className="truncate text-[11.5px]">{path}</span>
                  </div>
                  {diff && (
                    <span
                      className={`text-[9.5px] px-1 py-0.2 rounded font-bold uppercase ${
                        diff.type === 'added'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {diff.type}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area: Code Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0C14]">
        {/* File Header Bar */}
        <div className="h-10 px-4 border-b border-[#24293D] flex items-center justify-between bg-[#0E111C] shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            {getFileIcon(activePath)}
            <span className="font-semibold">{activePath || 'No File Selected'}</span>
            <span className="text-[10px] text-slate-500">({lines.length} lines)</span>
          </div>

          <button
            onClick={handleCopy}
            className="h-6 px-2.5 inline-flex items-center gap-1.5 rounded bg-[#161928] hover:bg-[#20253B] text-slate-300 hover:text-white text-[11px] font-semibold transition-colors border border-[#24293D]"
            title="Copy file contents"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content with Line Numbers */}
        <div className="flex-1 overflow-auto p-4 flex font-mono text-[11.5px] leading-relaxed">
          <div className="pr-4 text-right select-none text-slate-600 border-r border-[#24293D]/60 space-y-0.5">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <pre className="pl-4 text-[#22D3EE] overflow-x-auto flex-1 select-text">
            <code>{currentContent}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
