'use client';

import React, { useRef, useState } from 'react';
import { Card, Button, Input } from '@nirmaanify/ui';
import { UploadCloud, File, Loader2 } from 'lucide-react';
import { StorageDriverType } from '@nirmaanify/types';

interface FileUploadDropzoneProps {
  activeDriver: StorageDriverType;
  onUpload: (file: File, folder?: string) => Promise<any>;
  isUploading: boolean;
}

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({
  activeDriver,
  onUpload,
  isUploading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [folder, setFolder] = useState('uploads');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files[0], folder);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0], folder);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upload Asset to Storage</h3>
          <p className="text-xs text-slate-400">Target Driver: {activeDriver.toUpperCase()}</p>
        </div>
        <div className="w-full sm:w-48">
          <Input
            label="Folder"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-[#635BFF] bg-[#635BFF]/10'
            : 'border-slate-300 dark:border-[#24293D] hover:border-[#635BFF]/50 bg-slate-50/50 dark:bg-[#161926]/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-[#635BFF] mx-auto" />
            <p className="text-xs font-semibold">Streaming to {activeDriver.toUpperCase()}...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-3 rounded-full bg-slate-100 dark:bg-[#1E2337] text-[#635BFF] w-fit mx-auto">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Click or drag & drop files here
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Supports PNG, JPG, SVG, JSON, PDF, ZIP (up to 50MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
