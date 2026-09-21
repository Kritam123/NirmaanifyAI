'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Rocket,
  Download,
  Github,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Terminal,
  Server,
  Layers,
  FileCode,
  ShieldCheck,
  FolderTree,
  Loader2,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  useToast,
} from '@nirmaanify/ui';
import { apiClient } from '../../lib/api';
import {
  ProjectBuildDto,
  ProjectDeploymentDto,
  DeploymentTarget,
  GithubExportResultDto,
} from '@nirmaanify/types';

interface ExportDeployModalProps {
  projectId: string;
  projectName: string;
  projectSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDeployModal({
  projectId,
  projectName,
  projectSlug,
  isOpen,
  onClose,
}: ExportDeployModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'build' | 'export' | 'deploy'>('build');

  // Build State
  const [builds, setBuilds] = useState<ProjectBuildDto[]>([]);
  const [activeBuild, setActiveBuild] = useState<ProjectBuildDto | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  // Deployments State
  const [deployments, setDeployments] = useState<ProjectDeploymentDto[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<DeploymentTarget>('VERCEL');

  // GitHub Export State
  const [ghRepoName, setGhRepoName] = useState(projectSlug || 'my-app');
  const [ghPat, setGhPat] = useState('');
  const [ghPrivate, setGhPrivate] = useState(true);
  const [isPushingGh, setIsPushingGh] = useState(false);
  const [ghResult, setGhResult] = useState<GithubExportResultDto | null>(null);

  // Load Initial Builds & Deployments
  useEffect(() => {
    if (!isOpen || !projectId) return;

    let mounted = true;
    async function loadData() {
      try {
        const [buildsList, deployList] = await Promise.all([
          apiClient.builds.listBuilds(projectId).catch(() => []),
          apiClient.deployments.listDeployments(projectId).catch(() => []),
        ]);

        if (mounted) {
          setBuilds(buildsList);
          if (buildsList.length > 0) {
            setActiveBuild(buildsList[0]);
          }
          setDeployments(deployList);
        }
      } catch (err: any) {
        console.error('Failed to load builds & deployments:', err);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [isOpen, projectId]);

  // Handle Trigger Build
  const handleTriggerBuild = async () => {
    try {
      setIsBuilding(true);
      toast({
        title: 'Build Triggered',
        description: 'Compiling App Router routes and validating environment...',
        type: 'info',
      });

      const build = await apiClient.builds.triggerBuild(projectId, { target: 'production' });
      setActiveBuild(build);
      setBuilds((prev) => [build, ...prev]);

      toast({
        title: build.status === 'SUCCESS' ? 'Build Succeeded' : 'Build Failed',
        description: `Completed in ${build.durationMs || 0}ms with status: ${build.status}`,
        type: build.status === 'SUCCESS' ? 'success' : 'error',
      });
    } catch (err: any) {
      toast({
        title: 'Build Error',
        description: err.message || 'Could not execute build runner',
        type: 'error',
      });
    } finally {
      setIsBuilding(false);
    }
  };

  // Handle Download ZIP
  const handleDownloadZip = () => {
    const fullUrl = apiClient.export.getZipUrl(projectId);
    window.open(fullUrl, '_blank');
    toast({
      title: 'Monorepo Export Started',
      description: 'Downloading full-stack repository ZIP archive...',
      type: 'success',
    });
  };

  // Handle GitHub Push
  const handlePushGithub = async () => {
    if (!ghPat.trim()) {
      toast({
        title: 'GitHub Token Required',
        description: 'Provide a GitHub Personal Access Token with repo permissions.',
        type: 'error',
      });
      return;
    }

    try {
      setIsPushingGh(true);
      const res = await apiClient.export.pushToGithub(projectId, {
        repoName: ghRepoName,
        personalAccessToken: ghPat.trim(),
        isPrivate: ghPrivate,
        commitMessage: `feat: export ${projectName} full-stack codebase via Nirmaanify AI`,
      });

      setGhResult(res);
      toast({
        title: 'GitHub Push Completed',
        description: `Successfully pushed ${res.filesPushed} files to ${res.repoUrl}`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'GitHub Export Failed',
        description: err.message || 'Could not push repository to GitHub',
        type: 'error',
      });
    } finally {
      setIsPushingGh(false);
    }
  };

  // Handle Cloud Deploy
  const handleTriggerDeploy = async (target: DeploymentTarget) => {
    try {
      setIsDeploying(true);
      setSelectedTarget(target);
      toast({
        title: `Deploying to ${target}`,
        description: 'Packaging production container and routing traffic...',
        type: 'info',
      });

      const dep = await apiClient.deployments.triggerDeployment(projectId, {
        target,
        buildId: activeBuild?.id,
      });

      setDeployments((prev) => [dep, ...prev]);

      toast({
        title: 'Deployment Active',
        description: dep.url ? `Live at: ${dep.url}` : `Target: ${target}`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Deployment Error',
        description: err.message || 'Could not deploy project',
        type: 'error',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white dark:bg-[#0E101A] border border-slate-200 dark:border-[#24293D] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#24293D] flex items-center justify-between bg-slate-50/50 dark:bg-[#121522]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#635BFF] flex items-center justify-center text-white shadow-md shadow-[#635BFF]/25">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Preview, Build, Export & Deploy</span>
                <Badge variant="indigo" size="sm" className="font-mono text-[10px]">
                  Phase 12
                </Badge>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage production compilation, monorepo ZIP downloads, GitHub push, and cloud hosting.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E2337] flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-[#24293D] flex items-center gap-2 bg-white dark:bg-[#0E101A]">
          <button
            onClick={() => setActiveTab('build')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'build'
                ? 'border-[#635BFF] text-[#635BFF]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>Build & Diagnostics</span>
            {activeBuild && (
              <Badge
                variant={
                  activeBuild.status === 'SUCCESS'
                    ? 'cyan'
                    : activeBuild.status === 'FAILED'
                    ? 'destructive'
                    : 'secondary'
                }
                size="sm"
                className="text-[9px]"
              >
                {activeBuild.status}
              </Badge>
            )}
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'export'
                ? 'border-[#635BFF] text-[#635BFF]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Code Export (ZIP & GitHub)</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'deploy'
                ? 'border-[#635BFF] text-[#635BFF]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Server className="h-4 w-4" />
            <span>Multi-Cloud Deployments</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
              {deployments.length}
            </span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: BUILD & DIAGNOSTICS */}
          {activeTab === 'build' && (
            <div className="space-y-5">
              {/* Build Action & Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#131624] border border-slate-200 dark:border-[#24293D]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white dark:bg-[#1E2337] border border-slate-200 dark:border-[#2D334D] flex items-center justify-center text-[#635BFF]">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Production Build Pipeline</span>
                      {activeBuild && (
                        <span className="text-xs text-slate-400 font-normal">
                          ({activeBuild.durationMs ? `${activeBuild.durationMs}ms` : 'In Progress'})
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Compiles Next.js App Router, verifies NestJS APIs, and scans environment variables.
                    </p>
                  </div>
                </div>

                <Button
                  variant="default"
                  onClick={handleTriggerBuild}
                  disabled={isBuilding}
                  leftIcon={
                    isBuilding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )
                  }
                  className="bg-[#635BFF] hover:bg-[#5248FF] text-white shrink-0"
                >
                  {isBuilding ? 'Building Project...' : 'Run Build Validation'}
                </Button>
              </div>

              {/* Environment Validation Status Card */}
              {activeBuild?.envValidation && (
                <Card className="p-4 bg-white dark:bg-[#141726] border-slate-200 dark:border-[#24293D] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck
                        className={`h-4 w-4 ${
                          activeBuild.envValidation.isValid
                            ? 'text-emerald-500'
                            : 'text-amber-500'
                        }`}
                      />
                      <span>Environment Variables Checklist</span>
                    </span>
                    <Badge
                      variant={activeBuild.envValidation.isValid ? 'cyan' : 'secondary'}
                      size="sm"
                    >
                      {activeBuild.envValidation.isValid ? 'VALID' : 'MISSING KEYS'}
                    </Badge>
                  </div>

                  {activeBuild.envValidation.missing.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                      <strong>Missing required variables:</strong>{' '}
                      {activeBuild.envValidation.missing.join(', ')}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeBuild.envValidation.detectedVars.map((v) => (
                      <span
                        key={v}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-[#1E2337] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-[#2D334D]"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Diagnostic Errors if any */}
              {activeBuild?.errors && activeBuild.errors.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    <span>Compilation Diagnostics ({activeBuild.errors.length})</span>
                  </h5>
                  {activeBuild.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs space-y-1 text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                        <span>{err.file}</span>
                        <span>{err.code}</span>
                      </div>
                      <p>{err.message}</p>
                      {err.remediation && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          💡 Hint: {err.remediation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Terminal Logs Viewer */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#07090F] text-slate-200 font-mono text-xs shadow-inner">
                <div className="h-9 px-4 bg-[#0F111D] border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Build Runner Output</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {activeBuild?.logs.length || 0} events
                  </span>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto space-y-1.5 leading-relaxed">
                  {(!activeBuild || activeBuild.logs.length === 0) && (
                    <div className="text-slate-500 italic text-center py-6">
                      Click &ldquo;Run Build Validation&rdquo; to start compiler check...
                    </div>
                  )}
                  {activeBuild?.logs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-slate-600 select-none">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          log.level === 'error'
                            ? 'bg-rose-500/20 text-rose-400'
                            : log.level === 'warn'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-slate-300">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Monorepo ZIP Download */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50/50 dark:bg-[#121522] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Download className="h-4 w-4 text-[#635BFF]" />
                    <span>Download Production Monorepo (.ZIP)</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg">
                    Downloads an idiomatic codebase with <code className="text-[#635BFF]">frontend/</code> (Next.js 15), <code className="text-[#635BFF]">backend/</code> (NestJS 11), <code className="text-[#635BFF]">docker-compose.yml</code>, and deployment manifests.
                  </p>
                </div>

                <Button
                  variant="default"
                  onClick={handleDownloadZip}
                  leftIcon={<Download className="h-4 w-4" />}
                  className="bg-[#635BFF] hover:bg-[#5248FF] text-white shrink-0"
                >
                  Download ZIP
                </Button>
              </div>

              {/* Monorepo Folder Structure Preview */}
              <Card className="p-4 bg-white dark:bg-[#141726] border-slate-200 dark:border-[#24293D] space-y-3">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FolderTree className="h-4 w-4 text-[#635BFF]" />
                  <span>Generated Project Monorepo Structure</span>
                </h5>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0D14] border border-slate-200 dark:border-[#1E2337] font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1 leading-relaxed">
                  <div className="text-indigo-600 dark:text-indigo-400 font-bold">{projectSlug}/</div>
                  <div className="pl-4">├── <span className="font-semibold text-blue-500">frontend/</span> (Next.js 15 App Router, React 19, Tailwind CSS)</div>
                  <div className="pl-8">├── src/app/ (layout.tsx, page.tsx, globals.css)</div>
                  <div className="pl-8">├── package.json, tsconfig.json, Dockerfile</div>
                  <div className="pl-4">├── <span className="font-semibold text-emerald-500">backend/</span> (NestJS 11 REST API, Swagger OpenAPI)</div>
                  <div className="pl-8">├── src/ (main.ts, app.module.ts)</div>
                  <div className="pl-8">├── prisma/schema.prisma, Dockerfile</div>
                  <div className="pl-4">├── <span className="text-amber-500">docker-compose.yml</span> (Local PostgreSQL + Redis + Full-Stack)</div>
                  <div className="pl-4">├── <span className="text-cyan-500">vercel.json, render.yaml, railway.json</span> (Multi-cloud manifests)</div>
                  <div className="pl-4">├── <span className="text-slate-400">README.md & .env.example</span></div>
                </div>
              </Card>

              {/* Direct GitHub Push */}
              <Card className="p-5 bg-white dark:bg-[#141726] border-slate-200 dark:border-[#24293D] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Github className="h-4 w-4 text-slate-800 dark:text-white" />
                  <span>Direct GitHub Repository Export</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Export and push your codebase directly to a personal or organization GitHub repository using a GitHub Personal Access Token (PAT).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Repository Name
                    </label>
                    <input
                      type="text"
                      value={ghRepoName}
                      onChange={(e) => setGhRepoName(e.target.value)}
                      placeholder="e.g. saas-ecommerce-store"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1E2337] border border-slate-200 dark:border-[#2D334D] text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      GitHub Personal Access Token
                    </label>
                    <input
                      type="password"
                      value={ghPat}
                      onChange={(e) => setGhPat(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#1E2337] border border-slate-200 dark:border-[#2D334D] text-slate-900 dark:text-white focus:outline-none focus:border-[#635BFF]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ghPrivate}
                      onChange={(e) => setGhPrivate(e.target.checked)}
                      className="rounded border-slate-300 text-[#635BFF] focus:ring-[#635BFF]"
                    />
                    <span>Make repository Private</span>
                  </label>

                  <Button
                    variant="outline"
                    onClick={handlePushGithub}
                    disabled={isPushingGh || !ghPat.trim()}
                    leftIcon={
                      isPushingGh ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Github className="h-4 w-4" />
                      )
                    }
                  >
                    {isPushingGh ? 'Pushing Repository...' : 'Push to GitHub'}
                  </Button>
                </div>

                {ghResult && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                    <span>{ghResult.message}</span>
                    <a
                      href={ghResult.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold flex items-center gap-1 hover:underline text-[#635BFF]"
                    >
                      <span>Open Repo</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* TAB 3: MULTI-CLOUD DEPLOYMENTS */}
          {activeTab === 'deploy' && (
            <div className="space-y-6">
              {/* Cloud Targets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    target: 'VERCEL' as DeploymentTarget,
                    name: 'Vercel',
                    badge: 'Next.js 15 Edge',
                    desc: 'Instant serverless frontend deployment with global CDN edge caching.',
                    color: 'from-blue-600 to-indigo-600',
                  },
                  {
                    target: 'RENDER' as DeploymentTarget,
                    name: 'Render',
                    badge: 'Full-Stack + DB',
                    desc: 'Managed PostgreSQL database, NestJS web service, and Redis cache.',
                    color: 'from-emerald-600 to-teal-600',
                  },
                  {
                    target: 'RAILWAY' as DeploymentTarget,
                    name: 'Railway',
                    badge: 'Microservices',
                    desc: 'Nixpacks-powered container deployments with automated health checks.',
                    color: 'from-purple-600 to-pink-600',
                  },
                  {
                    target: 'DOCKER' as DeploymentTarget,
                    name: 'Docker / Self-Host',
                    badge: 'Production Compose',
                    desc: 'Multi-stage production containers for private VPS or enterprise Kubernetes.',
                    color: 'from-slate-700 to-slate-900',
                  },
                ].map((item) => (
                  <div
                    key={item.target}
                    className="p-4 rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50/50 dark:bg-[#131624] flex flex-col justify-between gap-3 shadow-xs hover:border-[#635BFF]/40 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-[#635BFF]/10 text-[#635BFF]">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTriggerDeploy(item.target)}
                      disabled={isDeploying}
                      className="w-full text-xs"
                    >
                      {isDeploying && selectedTarget === item.target ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        `Deploy to ${item.name}`
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Active Deployments Table */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Recent Cloud Deployments ({deployments.length})</span>
                  <button
                    onClick={async () => {
                      const list = await apiClient.deployments.listDeployments(projectId).catch(() => []);
                      setDeployments(list);
                    }}
                    className="text-[11px] font-semibold text-[#635BFF] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Refresh</span>
                  </button>
                </h5>

                {deployments.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-[#24293D] text-slate-400 text-xs">
                    No active cloud deployments yet. Click one of the providers above to deploy your project.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {deployments.map((d) => (
                      <div
                        key={d.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#141726] flex items-center justify-between gap-4 shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-[#1E2337] flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xs">
                            {d.target[0]}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{d.target}</span>
                              <Badge
                                variant={
                                  d.status === 'DEPLOYED'
                                    ? 'cyan'
                                    : d.status === 'FAILED'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                size="sm"
                                className="text-[9px]"
                              >
                                {d.status}
                              </Badge>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(d.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {d.url && (
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#635BFF]/10 text-[#635BFF] hover:bg-[#635BFF]/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <span>Live URL</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
