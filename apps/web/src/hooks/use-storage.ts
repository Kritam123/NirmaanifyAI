'use client';

import { useState, useEffect, useCallback } from 'react';
import { StorageDriverType, StorageDriverInfo, StorageFileInfo } from '@nirmaanify/types';
import { apiClient } from '../lib/api';
import { useToast } from '@nirmaanify/ui';

export function useStorage() {
  const { toast } = useToast();
  const [activeDriver, setActiveDriver] = useState<StorageDriverType>('local');
  const [drivers, setDrivers] = useState<StorageDriverInfo[]>([
    {
      name: 'local',
      label: 'Local Filesystem',
      isActive: true,
      isConfigured: true,
      description: 'Local directory storage in workspace runtime',
    },
    {
      name: 's3',
      label: 'AWS S3 / MinIO',
      isActive: false,
      isConfigured: true,
      description: 'Scalable object storage with S3 compatible API',
    },
    {
      name: 'vercel-blob',
      label: 'Vercel Blob Storage',
      isActive: false,
      isConfigured: true,
      description: 'Edge asset storage for deployed media',
    },
  ]);
  const [files, setFiles] = useState<StorageFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await apiClient.storage.getStatus();
      if (res?.activeDriver) {
        setActiveDriver(res.activeDriver);
      }
      if (res?.drivers?.length) {
        setDrivers(res.drivers);
      }
    } catch {
      // Ignored
    }
  }, []);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.storage.listFiles();
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
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchFiles();
  }, [fetchStatus, fetchFiles]);

  const switchDriver = async (driver: StorageDriverType) => {
    try {
      await apiClient.storage.switchDriver(driver);
      setActiveDriver(driver);
      setDrivers((prev) =>
        prev.map((d) => ({
          ...d,
          isActive: d.name === driver,
        }))
      );
      toast({
        title: 'Storage Driver Switched',
        description: `Active engine is now ${driver.toUpperCase()}`,
        type: 'success',
      });
      await fetchFiles();
    } catch (err: any) {
      toast({
        title: 'Failed to Switch Storage Driver',
        description: err?.message || 'Could not switch storage engine',
        type: 'error',
      });
    }
  };

  const uploadFile = async (file: File, folder: string = 'uploads') => {
    setIsUploading(true);
    try {
      const result = await apiClient.storage.uploadFile(file, file.name, folder);
      setFiles((prev) => [
        {
          key: result.key,
          url: result.url,
          size: result.size || file.size,
          uploadedAt: result.uploadedAt || new Date().toISOString(),
          driver: result.driver || activeDriver,
        },
        ...prev,
      ]);
      toast({
        title: 'File Uploaded',
        description: `${file.name} saved to ${activeDriver.toUpperCase()}`,
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

  const deleteFile = async (key: string) => {
    try {
      await apiClient.storage.deleteFile(key);
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

  return {
    activeDriver,
    drivers,
    files,
    isLoading,
    isUploading,
    switchDriver,
    uploadFile,
    deleteFile,
    fetchFiles,
    fetchStatus,
  };
}
