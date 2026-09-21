'use client';

import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Badge, Switch } from '@nirmaanify/ui';
import {
  StorageDriverType,
  ProjectStorageConfig,
  TestStorageConnectionResult,
} from '@nirmaanify/types';
import {
  Eye,
  EyeOff,
  Cloud,
  HardDrive,
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  ChevronDown,
} from 'lucide-react';

export interface StorageSettingsCardProps {
  projectId: string;
  projectName?: string;
  activeDriver: StorageDriverType;
  initialConfig?: ProjectStorageConfig;
  onSave: (config: ProjectStorageConfig, driver?: StorageDriverType) => Promise<any>;
  onTest: (driver: StorageDriverType, config?: ProjectStorageConfig) => Promise<TestStorageConnectionResult>;
  isSaving?: boolean;
  isTesting?: boolean;
}

export const StorageSettingsCard: React.FC<StorageSettingsCardProps> = ({
  projectName,
  activeDriver,
  initialConfig,
  onSave,
  onTest,
  isSaving = false,
  isTesting = false,
}) => {
  const [selectedDriver, setSelectedDriver] = useState<StorageDriverType>(activeDriver);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showBlobToken, setShowBlobToken] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testResult, setTestResult] = useState<TestStorageConnectionResult | null>(null);

  // Form states
  const [s3Bucket, setS3Bucket] = useState(initialConfig?.s3?.bucket || '');
  const [s3Region, setS3Region] = useState(initialConfig?.s3?.region || 'us-east-1');
  const [s3AccessKey, setS3AccessKey] = useState(initialConfig?.s3?.accessKeyId || '');
  const [s3SecretKey, setS3SecretKey] = useState(initialConfig?.s3?.secretAccessKey || '');
  const [s3Endpoint, setS3Endpoint] = useState(initialConfig?.s3?.endpoint || '');
  const [s3ForcePathStyle, setS3ForcePathStyle] = useState(Boolean(initialConfig?.s3?.forcePathStyle));

  const [blobToken, setBlobToken] = useState(initialConfig?.vercelBlob?.token || '');
  const [localBasePath, setLocalBasePath] = useState(initialConfig?.local?.basePath || '');

  // Keep state in sync with active driver & initial config
  useEffect(() => {
    setSelectedDriver(activeDriver);
  }, [activeDriver]);

  useEffect(() => {
    if (initialConfig) {
      if (initialConfig.s3?.bucket !== undefined) setS3Bucket(initialConfig.s3.bucket);
      if (initialConfig.s3?.region !== undefined) setS3Region(initialConfig.s3.region);
      if (initialConfig.s3?.accessKeyId !== undefined) setS3AccessKey(initialConfig.s3.accessKeyId);
      if (initialConfig.s3?.secretAccessKey !== undefined) setS3SecretKey(initialConfig.s3.secretAccessKey);
      if (initialConfig.s3?.endpoint !== undefined) {
        setS3Endpoint(initialConfig.s3.endpoint);
        if (initialConfig.s3.endpoint) setShowAdvanced(true);
      }
      if (initialConfig.s3?.forcePathStyle !== undefined) setS3ForcePathStyle(Boolean(initialConfig.s3.forcePathStyle));
      if (initialConfig.vercelBlob?.token !== undefined) setBlobToken(initialConfig.vercelBlob.token);
      if (initialConfig.local?.basePath !== undefined) setLocalBasePath(initialConfig.local.basePath);
    }
  }, [initialConfig]);

  const getCurrentConfig = (): ProjectStorageConfig => ({
    s3: {
      bucket: s3Bucket.trim() || undefined,
      region: s3Region.trim() || 'us-east-1',
      accessKeyId: s3AccessKey.trim() || undefined,
      secretAccessKey: s3SecretKey.trim() || undefined,
      endpoint: s3Endpoint.trim() || undefined,
      forcePathStyle: s3ForcePathStyle,
    },
    vercelBlob: {
      token: blobToken.trim() || undefined,
    },
    local: {
      basePath: localBasePath.trim() || undefined,
    },
  });

  const handleTest = async () => {
    setTestResult(null);
    const configPayload = getCurrentConfig();
    const result = await onTest(selectedDriver, configPayload);
    setTestResult(result);
  };

  const handleSave = async () => {
    const configPayload = getCurrentConfig();
    await onSave(configPayload, selectedDriver);
  };

  return (
    <Card className="p-5 border border-slate-200 dark:border-[#24293D] shadow-sm space-y-5">
      {/* Simple Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E2337]">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Storage Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select a driver and configure credentials for {projectName ? `"${projectName}"` : 'this project'}.
          </p>
        </div>
        <Badge
          variant={activeDriver === 's3' ? 'indigo' : activeDriver === 'vercel-blob' ? 'cyan' : 'secondary'}
          size="sm"
        >
          Active: {activeDriver === 'vercel-blob' ? 'Vercel Blob' : activeDriver === 's3' ? 'AWS S3' : 'Local Disk'}
        </Badge>
      </div>

      {/* Driver Tabs */}
      <div className="flex p-1 rounded-lg bg-slate-100 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] w-full sm:w-fit gap-1">
        <button
          type="button"
          onClick={() => {
            setSelectedDriver('s3');
            setTestResult(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            selectedDriver === 's3'
              ? 'bg-white dark:bg-[#1E2337] text-[#635BFF] shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Cloud className="h-3.5 w-3.5" />
          <span>AWS S3</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedDriver('vercel-blob');
            setTestResult(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            selectedDriver === 'vercel-blob'
              ? 'bg-white dark:bg-[#1E2337] text-[#22D3EE] shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Vercel Blob</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedDriver('local');
            setTestResult(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            selectedDriver === 'local'
              ? 'bg-white dark:bg-[#1E2337] text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HardDrive className="h-3.5 w-3.5" />
          <span>Local Disk</span>
        </button>
      </div>

      {/* Form Fields: Vercel Blob */}
      {selectedDriver === 'vercel-blob' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Read/Write Token
            </label>
            <button
              type="button"
              onClick={() => setShowBlobToken(!showBlobToken)}
              className="text-xs text-slate-400 hover:text-[#22D3EE] flex items-center gap-1 transition-colors"
            >
              {showBlobToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span>{showBlobToken ? 'Hide' : 'Show'}</span>
            </button>
          </div>
          <Input
            type={showBlobToken ? 'text' : 'password'}
            placeholder={blobToken ? '••••••••••••••••' : 'vercel_blob_rw_...'}
            value={blobToken}
            onChange={(e) => setBlobToken(e.target.value)}
            helperText="From your Vercel Project Dashboard under Storage > Blob."
          />
        </div>
      )}

      {/* Form Fields: AWS S3 */}
      {selectedDriver === 's3' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Bucket Name"
              placeholder="my-bucket"
              value={s3Bucket}
              onChange={(e) => setS3Bucket(e.target.value)}
            />
            <Input
              label="Region"
              placeholder="us-east-1"
              value={s3Region}
              onChange={(e) => setS3Region(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Access Key ID"
              placeholder="AKIA..."
              value={s3AccessKey}
              onChange={(e) => setS3AccessKey(e.target.value)}
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Secret Access Key
                </label>
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="text-xs text-slate-400 hover:text-[#635BFF] flex items-center gap-1 transition-colors"
                >
                  {showSecretKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{showSecretKey ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <Input
                type={showSecretKey ? 'text' : 'password'}
                placeholder={s3SecretKey ? '••••••••••••••••' : 'Secret access key'}
                value={s3SecretKey}
                onChange={(e) => setS3SecretKey(e.target.value)}
                helperText="Stored securely; leave masked to preserve existing secret"
              />
            </div>
          </div>

          {/* Advanced S3 settings */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium flex items-center gap-1 pt-1"
            >
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              <span>Advanced (MinIO / Cloudflare R2 / Custom Endpoint)</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    label="Custom Endpoint (Optional)"
                    placeholder="e.g. https://<account>.r2.cloudflarestorage.com or http://localhost:9000"
                    value={s3Endpoint}
                    onChange={(e) => setS3Endpoint(e.target.value)}
                  />
                </div>
                <div className="flex flex-col justify-center space-y-1 pt-2 sm:pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Force Path Style
                    </span>
                    <Switch
                      checked={s3ForcePathStyle}
                      onChange={(e) => setS3ForcePathStyle(e.target.checked)}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Required for MinIO</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Fields: Local Disk */}
      {selectedDriver === 'local' && (
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] flex items-center gap-3">
          <HardDrive className="h-5 w-5 text-slate-400 shrink-0" />
          <div className="text-xs text-slate-600 dark:text-slate-400">
            <p className="font-semibold text-slate-800 dark:text-slate-200">Local Disk Storage</p>
            <p>Zero-config storage runtime. Uploaded files are served from the local server directory (<code className="text-slate-700 dark:text-slate-300 font-mono">.storage/</code>).</p>
          </div>
        </div>
      )}

      {/* Compact Test Result Alert */}
      {testResult && (
        <div
          className={`px-3.5 py-2.5 rounded-lg border flex items-center justify-between gap-2 text-xs ${
            testResult.success
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {testResult.success ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            )}
            <span className="font-medium">{testResult.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setTestResult(null)}
            className="text-slate-400 hover:text-slate-600 text-xs ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-[#1E2337]">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Active: <strong className="text-slate-700 dark:text-slate-200">{activeDriver.toUpperCase()}</strong></span>
          {selectedDriver !== activeDriver && (
            <span className="text-amber-500 text-[11px] font-medium">
              (Will switch to {selectedDriver.toUpperCase()} on save)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedDriver !== 'local' && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />}
              onClick={handleTest}
              disabled={isTesting || isSaving}
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
          )}

          <Button
            variant="default"
            size="sm"
            leftIcon={<Save className="h-3.5 w-3.5" />}
            onClick={handleSave}
            disabled={isSaving || isTesting}
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
