'use client';

import React, { useState, useMemo } from 'react';
import {
  RotateCw,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  Globe,
  CheckCircle,
  Cloud,
  Zap,
  Terminal,
  AlertCircle,
} from 'lucide-react';

interface SandboxPreviewPaneProps {
  sandboxUrl?: string;
  projectId: string;
  files?: Record<string, string>;
}

export function SandboxPreviewPane({
  sandboxUrl = '',
  projectId,
  files = {},
}: SandboxPreviewPaneProps) {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewMode, setPreviewMode] = useState<'virtual' | 'cloud' | 'console'>('virtual');
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  // Normalize displayUrl: ensure relative paths resolve properly against current origin
  const displayUrl = useMemo(() => {
    if (!sandboxUrl) return `/preview/${projectId}`;
    if (sandboxUrl.startsWith('/')) return sandboxUrl;
    if (sandboxUrl.includes('.preview.nirmaanify.dev')) return `/preview/${projectId}`;
    return sandboxUrl;
  }, [sandboxUrl, projectId]);

  const handleReload = () => {
    setIsLoading(true);
    setKey((prev) => prev + 1);
    setConsoleLogs((prev) => [
      ...prev,
      `[Preview Reload] Reloaded runtime at ${new Date().toLocaleTimeString()}`,
    ]);
    setTimeout(() => setIsLoading(false), 500);
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
      default:
        return '100%';
    }
  };

  // Compile virtual HTML document from generated files
  const virtualSrcDoc = useMemo(() => {
    const pageFile =
      files['src/app/page.tsx'] ||
      files['app/page.tsx'] ||
      files['src/pages/index.tsx'] ||
      files['pages/index.tsx'] ||
      '';

    let bodyHtml = '';
    if (pageFile) {
      const returnMatch = pageFile.match(/return\s*\(\s*([\s\S]*?)\s*\);?\s*\n*}/);
      if (returnMatch && returnMatch[1]) {
        bodyHtml = returnMatch[1]
          .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
          .replace(/className=/g, 'class=')
          .replace(/<Button[^>]*>(.*?)<\/Button>/gs, '<button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-all cursor-pointer">$1</button>')
          .replace(/<Card[^>]*>(.*?)<\/Card>/gs, '<div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">$1</div>')
          .replace(/<Badge[^>]*>(.*?)<\/Badge>/gs, '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">$1</span>')
          .replace(/onClick=\{[^}]*\}/g, '')
          .replace(/onChange=\{[^}]*\}/g, '')
          .replace(/onSubmit=\{[^}]*\}/g, '')
          .replace(/key=\{[^}]*\}/g, '')
          .replace(/\{`([^`]+)`\}/g, '$1')
          .replace(/\{(\d+)\}/g, '$1')
          .replace(/\{"([^"]+)"\}/g, '$1')
          .replace(/<[A-Z][A-Za-z0-9]*\s*\/>/g, '<span class="inline-block w-4 h-4 opacity-70">✦</span>')
          .replace(/<[A-Z][A-Za-z0-9]*\s*class="([^"]*)"\s*\/>/g, '<span class="inline-block $1">✦</span>')
          .replace(/<[A-Z][A-Za-z0-9]*\s*className="([^"]*)"\s*\/>/g, '<span class="inline-block $1">✦</span>');
      }
    }

    if (!bodyHtml || bodyHtml.trim().length === 0) {
      bodyHtml = `
        <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-8 text-center font-sans">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 text-xs font-bold mb-4">
            <span>⚡ Live Preview</span>
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">
            Ready for AI Model Generation
          </h1>
          <p class="mt-3 text-slate-500 max-w-md text-sm">
            Prompt the AI agent to build custom UI components, full-stack APIs, or database models.
          </p>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html class="light">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              darkMode: 'class',
              theme: {
                extend: {
                  colors: {
                    brand: '#635BFF',
                  }
                }
              }
            }
          </script>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; }
          </style>
        </head>
        <body class="bg-white text-slate-900 min-h-screen antialiased">
          ${bodyHtml}
        </body>
      </html>
    `;
  }, [files]);

  return (
    <div className="h-full w-full flex-1 flex flex-col bg-slate-100/70 dark:bg-[#07090F] overflow-hidden">
      {/* Top Browser & Control Bar */}
      <div className="h-12 w-full px-3.5 border-b border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0E101A] flex items-center justify-between shrink-0 gap-3">
        {/* Navigation / Address Bar */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={handleReload}
            title="Reload Sandbox"
            aria-label="Reload Sandbox"
            className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#141724] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shadow-xs"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-[#635BFF]' : ''}`} />
          </button>

          <div className="flex-1 h-7 px-2.5 rounded-md border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#141724] flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-mono select-all overflow-hidden">
            <Globe className="h-3 w-3 text-emerald-500 shrink-0" />
            <span className="truncate">
              {previewMode === 'virtual' ? `virtual://preview/${projectId}` : displayUrl}
            </span>
            <span className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-semibold flex items-center gap-1">
              <CheckCircle className="h-2.5 w-2.5" />
              Live
            </span>
          </div>

          <a
            href={displayUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new window"
            className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#141724] text-slate-500 hover:text-[#635BFF] transition-colors shadow-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Engine Switcher [Virtual Preview | Cloud Micro-VM | Console] */}
        <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-[#141724] p-0.5 rounded-lg border border-slate-200 dark:border-[#24293D]">
          <button
            onClick={() => setPreviewMode('virtual')}
            title="Instant Virtual Live Preview"
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              previewMode === 'virtual'
                ? 'bg-white dark:bg-[#1E2337] text-[#635BFF] dark:text-[#A5B4FC] shadow-xs border border-slate-200/80 dark:border-[#2D334D]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="h-3 w-3" />
            <span>Virtual</span>
          </button>

          <button
            onClick={() => setPreviewMode('cloud')}
            title="Cloud Micro-VM / Local Docker Server"
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              previewMode === 'cloud'
                ? 'bg-white dark:bg-[#1E2337] text-[#635BFF] dark:text-[#A5B4FC] shadow-xs border border-slate-200/80 dark:border-[#2D334D]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Cloud className="h-3 w-3" />
            <span>Cloud VM</span>
          </button>

          <button
            onClick={() => setPreviewMode('console')}
            title="View Live Console Logs"
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              previewMode === 'console'
                ? 'bg-white dark:bg-[#1E2337] text-[#635BFF] dark:text-[#A5B4FC] shadow-xs border border-slate-200/80 dark:border-[#2D334D]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Terminal className="h-3 w-3" />
            <span>Logs</span>
          </button>
        </div>

        {/* Viewport Modes */}
        <div className="flex items-center gap-0.5 bg-slate-100/90 dark:bg-[#141724] p-0.5 rounded-lg border border-slate-200 dark:border-[#24293D]">
          {[
            { id: 'desktop' as const, label: 'Desktop · 100%', icon: <Monitor className="h-3.5 w-3.5" /> },
            { id: 'tablet' as const, label: 'Tablet · 768px', icon: <Tablet className="h-3.5 w-3.5" /> },
            { id: 'mobile' as const, label: 'Mobile · 375px', icon: <Smartphone className="h-3.5 w-3.5" /> },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setViewport(v.id)}
              title={v.label}
              className={`h-6 w-6 inline-flex items-center justify-center rounded-md transition-all ${
                viewport === v.id
                  ? 'bg-white dark:bg-[#1E2337] text-[#635BFF] dark:text-[#A5B4FC] shadow-xs border border-slate-200/80 dark:border-[#2D334D]'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {v.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Stage / Console Logs */}
      <div className={`flex-1 w-full flex items-center justify-center overflow-hidden ${viewport === 'desktop' ? 'p-0' : 'p-3'}`}>
        <div
          className={`h-full w-full bg-white dark:bg-[#0A0D14] overflow-hidden transition-all duration-300 flex flex-col ${
            viewport === 'desktop'
              ? 'rounded-none border-0 shadow-none'
              : 'rounded-xl shadow-2xl border border-slate-200 dark:border-[#24293D]'
          }`}
          style={{ width: getViewportWidth() }}
        >
          {/* Simulated Browser Frame Header - displayed when simulating smaller devices */}
          {viewport !== 'desktop' && (
            <div className="h-6 px-3 bg-slate-100 dark:bg-[#121522] border-b border-slate-200 dark:border-[#24293D] flex items-center gap-1.5 select-none shrink-0">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="ml-2 text-[10px] text-slate-400 font-mono truncate">
                {viewport === 'tablet' ? 'Tablet · 768px' : 'Mobile · 375px'}
              </span>
            </div>
          )}

          <div className="flex-1 relative w-full h-full overflow-hidden">
            {previewMode === 'virtual' ? (
              <iframe
                key={`virtual-${key}`}
                srcDoc={virtualSrcDoc}
                title="Virtual Live Application Preview"
                className="w-full h-full min-w-full border-0 bg-white dark:bg-[#07090F] block"
                sandbox="allow-scripts allow-forms allow-same-origin"
              />
            ) : previewMode === 'cloud' ? (
              <iframe
                key={`cloud-${key}`}
                src={displayUrl}
                title="Live Cloud Micro-VM Sandbox Preview"
                className="w-full h-full min-w-full border-0 bg-white dark:bg-[#07090F] block"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            ) : (
              /* Console Output Viewer */
              <div className="h-full bg-[#0E101A] p-4 font-mono text-xs text-slate-300 overflow-y-auto space-y-2 select-text">
                <div className="text-slate-500 border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
                  <span>SANDBOX LOG TERMINAL</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Connected
                  </span>
                </div>
                {consoleLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed flex items-start gap-2">
                    <span className="text-indigo-400 select-none">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
                {Object.keys(files).length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    <div className="font-semibold text-slate-300 mb-1">Mounted Virtual Filesystem ({Object.keys(files).length} files):</div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-500 font-mono">
                      {Object.keys(files).map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
