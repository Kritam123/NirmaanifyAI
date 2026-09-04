'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  StorageDriverType,
  StorageDriverInfo,
  StorageFileInfo,
  ProjectStorageConfig,
  TestStorageConnectionResult,
} from '@nirmaanify/types';
import { apiClient } from '../lib/api';
import { useToast } from '@nirmaanify/ui';

export function useStorage(initialProjectId?: string) {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(initialProjectId);
  const [activeDriver, setActiveDriver] = useState<StorageDriverType>('local');
  const [projectName, setProjectName] = useState<string | undefined>(undefined);
  const [config, setConfig] = useState<ProjectStorageConfig>({});
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [drivers, setDrivers] = useState<StorageDriverInfo[]>([
    {
      name: 'local',
      label: 'Local Filesystem',
      isActive: true,
      isConfigured: true,
      description: 'Zero-config local storage runtime for isolated project development.',
    },
    {
      name: 's3',
      label: 'AWS S3 / MinIO',
      isActive: false,
      isConfigured: true,
      description: 'Scalable cloud object storage with S3 API and presigned pipelines.',
    },
    {
      name: 'vercel-blob',
      label: 'Vercel Blob Storage',
      isActive: false,
      isConfigured: true,
      description: 'Low-latency global edge CDN media storage for deployed assets.',
    },
  ]);
  const [files, setFiles] = useState<StorageFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const fetchStatus = useCallback(async (projId?: string) => {
    const targetId = projId !== undefined ? projId : selectedProjectId;
    try {
      const res = await apiClient.storage.getStatus(targetId);
      if (res?.activeDriver) {
        setActiveDriver(res.activeDriver);
      }
      if (res?.projectName !== undefined) {
        setProjectName(res.projectName);
      }
      if (res?.drivers?.length) {
        setDrivers(res.drivers);
      }
      if (res?.config !== undefined) {
        setConfig(res.config);
      }
    } catch {
      // Ignored
    }
  }, [selectedProjectId]);

  const fetchFiles = useCallback(async (projId?: string) => {
    const targetId = projId !== undefined ? projId : selectedProjectId;
    setIsLoading(true);
    try {
      const res = await apiClient.storage.listFiles(targetId);
      if (res?.files) {
        setFiles(res.files);
      }
      if (res?.activeDriver) {
        setActiveDriver(res.activeDriver);
      }
    } catch {
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchStatus();
    fetchFiles();
  }, [fetchStatus, fetchFiles, selectedProjectId]);

  const switchDriver = async (driver: StorageDriverType, projId?: string) => {
    const targetId = projId !== undefined ? projId : selectedProjectId;
    try {
      const res = await apiClient.storage.switchDriver(driver, targetId);
      setActiveDriver(driver);
      setDrivers((prev) =>
        prev.map((d) => ({
          ...d,
          isActive: d.name === driver,
        }))
      );
      const scopeLabel = projectName ? `Project "${projectName}"` : res.projectId ? `Project "${res.projectId}"` : 'Project';
      toast({
        title: 'Project Storage Driver Switched',
        description: `${scopeLabel} storage engine is now ${driver.toUpperCase()}`,
        type: 'success',
      });
      await fetchFiles(targetId);
    } catch (err: any) {
      toast({
        title: 'Failed to Switch Storage Driver',
        description: err?.message || 'Could not switch storage engine',
        type: 'error',
      });
    }
  };

  const uploadFile = async (file: File, folder: string = 'uploads', projId?: string) => {
    const targetId = projId !== undefined ? projId : selectedProjectId;
    setIsUploading(true);
    try {
      const result = await apiClient.storage.uploadFile(file, file.name, folder, targetId);
      setFiles((prev) => [
        {
          key: result.key,
          url: result.url,
          size: result.size || file.size,
          uploadedAt: result.uploadedAt || new Date().toISOString(),
          driver: result.driver || activeDriver,
          projectId: targetId,
        },
        ...prev,
      ]);
      toast({
        title: 'File Uploaded',
        description: `${file.name} saved to ${activeDriver.toUpperCase()}${targetId ? ' for project' : ''}`,
        type: 'success',
      });
      return result;
    } catch (err: any) {
      toast({
        title: 'Upload Failed',
        description: err?.message || `Failed to upload ${file.name}`,
        type: 'error',
      });
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (key: string, projId?: string) => {
    const targetId = projId !== undefined ? projId : selectedProjectId;
    try {
      await apiClient.storage.deleteFile(key, targetId);
      setFiles((prev) => prev.filter((f) => f.key !== key));
      toast({
        title: 'File Deleted',
        description: `Removed ${key}`,
        type: 'info',
      });
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err?.message || `Could not delete ${key}`,
        type: 'error',
      });
    }
  };

  const updateStorageConfig = async (newConfig: ProjectStorageConfig, driver?: StorageDriverType, projId?: string) => {
    const targetId = projId !== undefined ? projId : selectedProjectId;
    if (!targetId) {
      toast({
        title: 'Project Required',
        description: 'Please select an individual project to save storage settings.',
        type: 'warning',
      });
      return;
    }
    setIsSavingConfig(true);
    try {
      const res = await apiClient.storage.updateConfig({
        projectId: targetId,
        driver: driver || activeDriver,
        config: newConfig,
      });
      setConfig(res.config);
      if (res.driver) {
        setActiveDriver(res.driver);
      }
      toast({
        title: 'Storage Settings Saved',
        description: res.message || 'Credentials saved successfully.',
        type: 'success',
      });
      await fetchStatus(targetId);
      return res;
    } catch (err: any) {
      toast({
        title: 'Save Failed',
        description: err?.message || 'Failed to save storage credentials',
        type: 'error',
      });
      throw err;
    } finally {
      setIsSavingConfig(false);
    }
  };

  const testConnection = async (driver: StorageDriverType, testConfig?: ProjectStorageConfig, projId?: string): Promise<TestStorageConnectionResult> => {
    const targetId = projId !== undefined ? projId : selectedProjectId;
    setIsTestingConnection(true);
    try {
      const res = await apiClient.storage.testConnection({
        projectId: targetId,
        driver,
        config: testConfig,
      });
      if (res.success) {
        toast({
          title: 'Connection Successful',
          description: res.message,
          type: 'success',
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: res.message,
          type: 'error',
        });
      }
      return res;
    } catch (err: any) {
      const failResult: TestStorageConnectionResult = {
        success: false,
        message: err?.message || 'Could not verify storage connection',
        driver,
        testedAt: new Date().toISOString(),
      };
      toast({
        title: 'Connection Error',
        description: failResult.message,
        type: 'error',
      });
      return failResult;
    } finally {
      setIsTestingConnection(false);
    }
  };

  return {
    selectedProjectId,
    setSelectedProjectId,
    projectName,
    activeDriver,
    drivers,
    files,
    config,
    isLoading,
    isUploading,
    isSavingConfig,
    isTestingConnection,
    switchDriver,
    updateStorageConfig,
    testConnection,
    uploadFile,
    deleteFile,
    fetchFiles,
    fetchStatus,
  };
}
