'use client';

import React, { useState } from 'react';
import {
  Sliders,
  FileText,
  Sparkles,
  ShieldAlert,
  Save,
  Check,
  Palette,
  Activity,
  Trash2,
  Unlink,
  Link2,
  ArrowRight,
  ArrowLeft,
  Server,
} from 'lucide-react';
import { CanvasNode, CanvasEdge, CanvasSettings } from '@nirmaanify/types';

interface CanvasInspectorProps {
  selectedNode: CanvasNode | null;
  selectedEdge: CanvasEdge | null;
  allNodes?: CanvasNode[];
  allEdges?: CanvasEdge[];
  onUpdateNodeData: (nodeId: string, newData: any) => void;
  onUpdateEdgeData: (edgeId: string, newData: any) => void;
  onDeleteNode?: (nodeId: string) => void;
  onDeleteEdge?: (edgeId: string) => void;
  onDetachEdge?: (edgeId: string) => void;
  onDetachNodeEdges?: (nodeId: string, specificEdgeId?: string) => void;
  documentContent: string;
  onUpdateDocument: (doc: string) => void;
  onReviewArchitecture: () => void;
  isReviewing?: boolean;
  reviewResult?: any;
  canvasSettings: CanvasSettings;
  onUpdateSettings: (settings: CanvasSettings) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const CanvasInspector: React.FC<CanvasInspectorProps> = ({
  selectedNode,
  selectedEdge,
  allNodes = [],
  allEdges = [],
  onUpdateNodeData,
  onUpdateEdgeData,
  onDeleteNode,
  onDeleteEdge,
  onDetachEdge,
  onDetachNodeEdges,
  documentContent,
  onUpdateDocument,
  onReviewArchitecture,
  isReviewing = false,
  reviewResult,
  canvasSettings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'docs' | 'ai'>('properties');
  const [docDraft, setDocDraft] = useState(documentContent);
  const [isDocSaved, setIsDocSaved] = useState(false);

  // Compute connections for selectedNode
  const outgoingEdges = React.useMemo(() => {
    if (!selectedNode || !allEdges) return [];
    return allEdges.filter((e) => e.source === selectedNode.id);
  }, [selectedNode, allEdges]);

  const incomingEdges = React.useMemo(() => {
    if (!selectedNode || !allEdges) return [];
    return allEdges.filter((e) => e.target === selectedNode.id);
  }, [selectedNode, allEdges]);

  const connectedEdges = React.useMemo(() => {
    return [...outgoingEdges, ...incomingEdges];
  }, [outgoingEdges, incomingEdges]);

  // Sync draft when documentContent changes from external (e.g. AI scaffold)
  React.useEffect(() => {
    setDocDraft(documentContent);
  }, [documentContent]);

  const handleSaveDoc = () => {
    onUpdateDocument(docDraft);
    setIsDocSaved(true);
    setTimeout(() => setIsDocSaved(false), 2000);
  };

  return (
    <aside className="w-80 border-l border-[#24293D] bg-[#0F111A] flex flex-col h-full select-none shrink-0 shadow-xl md:shadow-none z-10 transition-all">
      {/* Tab Header (No collapse button) */}
      <div className="flex items-center justify-between border-b border-[#24293D] px-3 py-2 bg-[#141724]/50">
        <div className="flex items-center gap-1 w-full">
          <button
            type="button"
            onClick={() => setActiveTab('properties')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'properties'
                ? 'bg-[#1C2033] text-[#635BFF] shadow-sm border border-[#2E354F]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Properties</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'docs'
                ? 'bg-[#1C2033] text-[#635BFF] shadow-sm border border-[#2E354F]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Spec Doc</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'ai'
                ? 'bg-[#1C2033] text-[#635BFF] shadow-sm border border-[#2E354F]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
            <span>Review</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Properties */}
      {activeTab === 'properties' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E2337]">
                <span className="font-bold text-slate-100 uppercase tracking-wider text-[10px]">
                  Node Properties
                </span>
                <span className="font-mono text-[10px] text-slate-400">{selectedNode.type}</span>
              </div>

              {/* Label */}
              <div className="space-y-1.5">
                <label className="font-medium text-slate-400">Label / Name</label>
                <input
                  type="text"
                  value={selectedNode.data.label || ''}
                  onChange={(e) => onUpdateNodeData(selectedNode.id, { label: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#24293D] bg-[#141724] text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1.5">
                <label className="font-medium text-slate-400">Technology / Subtitle</label>
                <input
                  type="text"
                  value={selectedNode.data.subtitle || ''}
                  onChange={(e) => onUpdateNodeData(selectedNode.id, { subtitle: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#24293D] bg-[#141724] text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
                />
              </div>

              {/* Service Icon / Type */}
              {selectedNode.type === 'cloud-service' && (
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-400">Service Stencil & Icon</label>
                  <select
                    value={selectedNode.data.icon || 'server'}
                    onChange={(e) => onUpdateNodeData(selectedNode.id, { icon: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#24293D] bg-[#141724] text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
                  >
                    <option value="server">Compute Server (EC2 / VM / Web)</option>
                    <option value="client">Client Web / Mobile Device</option>
                    <option value="api-gateway">API Gateway / Envoy / Kong</option>
                    <option value="lambda">Serverless Handler (Lambda / Worker)</option>
                    <option value="s3">Object Storage (S3 / Blob)</option>
                    <option value="postgres">PostgreSQL / Relational DB</option>
                    <option value="redis">Redis Cache / In-Memory</option>
                    <option value="kafka">Kafka / Message Queue</option>
                    <option value="k8s">Kubernetes Pod / Container</option>
                  </select>
                </div>
              )}

              {/* Provider */}
              {selectedNode.type === 'cloud-service' && (
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-400">Cloud Provider</label>
                  <select
                    value={selectedNode.data.provider || 'generic'}
                    onChange={(e) => onUpdateNodeData(selectedNode.id, { provider: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#24293D] bg-[#141724] text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
                  >
                    <option value="generic">Generic / On-Premise</option>
                    <option value="aws">Amazon Web Services (AWS)</option>
                    <option value="gcp">Google Cloud Platform (GCP)</option>
                    <option value="azure">Microsoft Azure</option>
                    <option value="k8s">Kubernetes</option>
                    <option value="docker">Docker</option>
                  </select>
                </div>
              )}

              {/* Status */}
              <div className="space-y-1.5">
                <label className="font-medium text-slate-400">Status</label>
                <select
                  value={selectedNode.data.status || 'active'}
                  onChange={(e) => onUpdateNodeData(selectedNode.id, { status: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#24293D] bg-[#141724] text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
                >
                  <option value="active">Active / Running</option>
                  <option value="warning">Warning / High Load</option>
                  <option value="deprecated">Deprecated</option>
                  <option value="planned">Planned Architecture</option>
                </select>
              </div>

              {/* Connected Services / Attachments with Detach Option */}
              <div className="space-y-2 pt-3 border-t border-[#1E2337]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">
                      Attached Connections ({connectedEdges.length})
                    </span>
                  </div>
                  {connectedEdges.length > 1 && onDetachNodeEdges && (
                    <button
                      type="button"
                      onClick={() => onDetachNodeEdges(selectedNode.id)}
                      className="text-[10px] text-red-400 hover:text-red-300 font-semibold transition-colors hover:underline"
                      title="Detach all connections attached to this service"
                    >
                      Detach All
                    </button>
                  )}
                </div>

                {connectedEdges.length === 0 ? (
                  <div className="p-2 rounded-lg border border-dashed border-[#24293D] bg-[#141724]/40 text-slate-500 text-[11px] leading-relaxed">
                    No attached connections. Drag handles from this service to point to another service.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                    {outgoingEdges.map((edge) => {
                      const targetNode = allNodes?.find((n) => n.id === edge.target);
                      const targetLabel = targetNode?.data?.label || edge.target;
                      return (
                        <div
                          key={edge.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#141724] border border-[#24293D] hover:border-[#3E4766] transition-colors"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-semibold mb-0.5">
                              <ArrowRight className="h-3 w-3 shrink-0" />
                              <span>Pointing to:</span>
                            </div>
                            <div className="text-xs font-semibold text-slate-100 truncate">
                              {targetLabel}
                            </div>
                            {targetNode?.data?.subtitle && (
                              <div className="text-[10px] text-slate-400 truncate">
                                {targetNode.data.subtitle}
                              </div>
                            )}
                            {edge.data?.label && (
                              <div className="text-[9px] font-mono text-slate-500 mt-0.5">
                                Protocol: {edge.data.label}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onDetachEdge?.(edge.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors shrink-0 shadow-sm"
                            title={`Detach connection pointing to "${targetLabel}"`}
                          >
                            <Unlink className="h-3 w-3" />
                            <span>Detach</span>
                          </button>
                        </div>
                      );
                    })}

                    {incomingEdges.map((edge) => {
                      const sourceNode = allNodes?.find((n) => n.id === edge.source);
                      const sourceLabel = sourceNode?.data?.label || edge.source;
                      return (
                        <div
                          key={edge.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#141724] border border-[#24293D] hover:border-[#3E4766] transition-colors"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mb-0.5">
                              <ArrowLeft className="h-3 w-3 shrink-0" />
                              <span>Pointed from:</span>
                            </div>
                            <div className="text-xs font-semibold text-slate-100 truncate">
                              {sourceLabel}
                            </div>
                            {sourceNode?.data?.subtitle && (
                              <div className="text-[10px] text-slate-400 truncate">
                                {sourceNode.data.subtitle}
                              </div>
                            )}
                            {edge.data?.label && (
                              <div className="text-[9px] font-mono text-slate-500 mt-0.5">
                                Protocol: {edge.data.label}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onDetachEdge?.(edge.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors shrink-0 shadow-sm"
                            title={`Detach connection from "${sourceLabel}"`}
                          >
                            <Unlink className="h-3 w-3" />
                            <span>Detach</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Delete Component Button (Simple, clean, static) */}
              {onDeleteNode && (
                <div className="pt-3 border-t border-[#1E2337]">
                  <button
                    type="button"
                    onClick={() => onDeleteNode(selectedNode.id)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors shadow-sm"
                    title="Delete component from canvas (Del / Backspace)"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    <span>Delete Component</span>
                  </button>
                </div>
              )}
            </div>
          ) : selectedEdge ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E2337]">
                <span className="font-bold text-slate-100 uppercase tracking-wider text-[10px]">
                  Connection / Edge Properties
                </span>
                <span className="font-mono text-[10px] text-slate-400">{selectedEdge.type}</span>
              </div>

              {/* Attached Endpoints */}
              <div className="p-2.5 rounded-lg bg-[#141724] border border-[#24293D] space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">From (Source):</span>
                  <span className="font-semibold text-slate-200">
                    {allNodes.find((n) => n.id === selectedEdge.source)?.data?.label || selectedEdge.source}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">To (Target):</span>
                  <span className="font-semibold text-slate-200">
                    {allNodes.find((n) => n.id === selectedEdge.target)?.data?.label || selectedEdge.target}
                  </span>
                </div>
              </div>

              {/* Label */}
              <div className="space-y-1.5">
                <label className="font-medium text-slate-400">Connection Label</label>
                <input
                  type="text"
                  value={selectedEdge.data?.label || ''}
                  onChange={(e) => onUpdateEdgeData(selectedEdge.id, { label: e.target.value })}
                  placeholder="e.g. HTTPS, gRPC, Kafka topic"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#24293D] bg-[#141724] text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
                />
              </div>

              {/* Protocol */}
              <div className="space-y-1.5">
                <label className="font-medium text-slate-400">Protocol</label>
                <input
                  type="text"
                  value={selectedEdge.data?.protocol || ''}
                  onChange={(e) => onUpdateEdgeData(selectedEdge.id, { protocol: e.target.value })}
                  placeholder="e.g. REST, GraphQL, TCP"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#24293D] bg-[#141724] text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
                />
              </div>

              {/* Line Style */}
              <div className="space-y-1.5">
                <label className="font-medium text-slate-400">Line Style</label>
                <select
                  value={selectedEdge.data?.lineStyle || 'solid'}
                  onChange={(e) => onUpdateEdgeData(selectedEdge.id, { lineStyle: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#24293D] bg-[#141724] text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
                >
                  <option value="solid">Solid Line</option>
                  <option value="dashed">Dashed Line</option>
                  <option value="dotted">Dotted Line</option>
                </select>
              </div>

              {/* Animated Traffic */}
              <div className="flex items-center justify-between pt-1">
                <label className="font-medium text-slate-400">Animated Traffic</label>
                <input
                  type="checkbox"
                  checked={!!selectedEdge.animated}
                  onChange={(e) => onUpdateEdgeData(selectedEdge.id, { animated: e.target.checked })}
                  className="h-4 w-4 rounded border-[#2E354F] bg-[#141724] text-[#635BFF] focus:ring-[#635BFF]"
                />
              </div>

              {/* Delete / Detach Connection Button */}
              {(onDetachEdge || onDeleteEdge) && (
                <div className="pt-3 border-t border-[#1E2337]">
                  <button
                    type="button"
                    onClick={() => (onDetachEdge || onDeleteEdge)!(selectedEdge.id)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors shadow-sm"
                    title="Detach connection from canvas (Del / Backspace)"
                  >
                    <Unlink className="h-3.5 w-3.5 text-red-400" />
                    <span>Detach Connection</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E2337]">
                <span className="font-bold text-slate-100 uppercase tracking-wider text-[10px]">
                  Canvas Preferences
                </span>
                <Palette className="h-3.5 w-3.5 text-slate-400" />
              </div>


              {/* Grid Toggle */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-300">Show Canvas Grid</span>
                <input
                  type="checkbox"
                  checked={canvasSettings.grid}
                  onChange={(e) => onUpdateSettings({ ...canvasSettings, grid: e.target.checked })}
                  className="h-4 w-4 rounded border-[#2E354F] bg-[#141724] text-[#635BFF] focus:ring-[#635BFF]"
                />
              </div>

              {/* Snap to grid */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-300">Snap to Grid</span>
                <input
                  type="checkbox"
                  checked={canvasSettings.snapToGrid}
                  onChange={(e) => onUpdateSettings({ ...canvasSettings, snapToGrid: e.target.checked })}
                  className="h-4 w-4 rounded border-[#2E354F] bg-[#141724] text-[#635BFF] focus:ring-[#635BFF]"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#141724] border border-[#24293D] text-[11px] text-slate-400 space-y-1.5">
                <p className="font-semibold text-slate-200">Keyboard Shortcuts</p>
                <p>• <kbd className="px-1.5 py-0.5 rounded bg-[#1E2337] border border-[#2E354F] text-slate-300">Space + Drag</kbd> Pan canvas</p>
                <p>• <kbd className="px-1.5 py-0.5 rounded bg-[#1E2337] border border-[#2E354F] text-slate-300">Ctrl + Scroll</kbd> Zoom</p>
                <p>• <kbd className="px-1.5 py-0.5 rounded bg-[#1E2337] border border-[#2E354F] text-slate-300">Del / Backspace</kbd> Delete selected</p>
                <p>• <kbd className="px-1.5 py-0.5 rounded bg-[#1E2337] border border-[#2E354F] text-slate-300">Ctrl + D</kbd> Clone component</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Architecture Spec / Markdown Sidecar (Eraser.io style) */}
      {activeTab === 'docs' && (
        <div className="flex-1 flex flex-col min-h-0 p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Markdown Architecture Specification</span>
            <button
              type="button"
              onClick={handleSaveDoc}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#635BFF] hover:bg-[#5249e0] text-white text-[11px] font-semibold transition-colors"
            >
              {isDocSaved ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
              <span>{isDocSaved ? 'Saved' : 'Save Spec'}</span>
            </button>
          </div>
          <textarea
            value={docDraft}
            onChange={(e) => setDocDraft(e.target.value)}
            placeholder="# System Architecture Specification&#10;&#10;Document system goals, latency SLAs, data flows, and team decisions here..."
            className="flex-1 w-full p-3 font-mono text-xs rounded-lg border border-[#24293D] bg-[#141724] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#635BFF] resize-none leading-relaxed"
          />
        </div>
      )}

      {/* Tab 3: AI Architecture Reviewer */}
      {activeTab === 'ai' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-gradient-to-r from-fuchsia-500/10 to-indigo-500/10 border border-fuchsia-500/20 text-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-sm text-fuchsia-400">
              <Sparkles className="h-4 w-4" />
              <span>AI Architecture Reviewer</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Evaluates current diagram against distributed system best practices: single points of failure, scaling bottlenecks, and security boundaries.
            </p>
            <button
              type="button"
              disabled={isReviewing}
              onClick={onReviewArchitecture}
              className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
            >
              {isReviewing ? 'Analyzing Architecture...' : 'Run Architecture Audit'}
            </button>
          </div>

          {reviewResult && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#1A1E2E] border border-[#24293D]">
                <span className="font-semibold text-slate-300">Resilience Score</span>
                <span className="font-mono text-base font-bold text-[#635BFF]">
                  {reviewResult.score}/100
                </span>
              </div>

              {reviewResult.singlePointsOfFailure?.length > 0 && (
                <div className="space-y-1">
                  <div className="font-semibold text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Single Points of Failure</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                    {reviewResult.singlePointsOfFailure.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {reviewResult.scalingBottlenecks?.length > 0 && (
                <div className="space-y-1">
                  <div className="font-semibold text-amber-400 flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5" />
                    <span>Scaling Bottlenecks</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                    {reviewResult.scalingBottlenecks.map((b: string, idx: number) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
