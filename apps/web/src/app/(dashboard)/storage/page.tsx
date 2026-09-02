'use client';

import React from 'react';
import { PageHeader, Badge } from '@nirmaanify/ui';
import { useStorage } from '../../../hooks/use-storage';
import { StorageDriverSwitcher } from '../../../components/storage/StorageDriverSwitcher';
import { FileUploadDropzone } from '../../../components/storage/FileUploadDropzone';
import { FileListTable } from '../../../components/storage/FileListTable';

export default function StoragePage() {
  const {
    activeDriver,
    drivers,
    files,
    isUploading,
    switchDriver,
    uploadFile,
    deleteFile,
  } = useStorage();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Multi-Driver Storage Engine"
        description="Switch between AWS S3 / MinIO, Vercel Blob Storage, and Local Filesystem in one click without restarting services."
        badge={<Badge variant="indigo">Zero Downtime Switcher</Badge>}
      />

      {/* Driver Switcher */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Storage Drivers</h3>
        <StorageDriverSwitcher
          activeDriver={activeDriver}
          drivers={drivers}
          onSwitchDriver={switchDriver}
        />
      </div>

      {/* Upload Dropzone */}
      <FileUploadDropzone
        activeDriver={activeDriver}
        onUpload={uploadFile}
        isUploading={isUploading}
      />

      {/* Stored Files Table */}
      <FileListTable
        files={files}
        activeDriver={activeDriver}
        onDeleteFile={deleteFile}
      />
    </div>
  );
}
