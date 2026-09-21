'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, EmptyState } from '@nirmaanify/ui';
import { File, Trash2, ExternalLink, Download, HardDrive } from 'lucide-react';
import { StorageFileInfo, StorageDriverType } from '@nirmaanify/types';

interface FileListTableProps {
  files: StorageFileInfo[];
  activeDriver: StorageDriverType;
  targetName?: string;
  onDeleteFile: (key: string) => void;
}

export const FileListTable: React.FC<FileListTableProps> = ({
  files,
  activeDriver,
  targetName,
  onDeleteFile,
}) => {
  const formatSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Stored Files & Assets</CardTitle>
            <CardDescription className="text-xs">
              Objects currently stored in {activeDriver.toUpperCase()} engine{targetName ? ` for ${targetName}` : ''}.
            </CardDescription>
          </div>
          <Badge variant="indigo" size="sm">
            {files.length} {files.length === 1 ? 'Object' : 'Objects'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0 divide-y divide-slate-100 dark:divide-[#1E2337]">
        {files.length === 0 ? (
          <div className="py-4">
            <EmptyState
              compact
              icon={<HardDrive className="h-6 w-6 text-slate-400" />}
              title={`No files in ${activeDriver.toUpperCase()} engine`}
              description="Drop assets into the upload dropzone above to store static files or media."
            />
          </div>
        ) : (
          files.map((file) => (
            <div key={file.key} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#161926] text-[#635BFF] shrink-0">
                  <File className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate font-mono">
                    {file.key}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatSize(file.size)} • Uploaded{' '}
                    {file.uploadedAt ? new Date(file.uploadedAt).toLocaleTimeString() : 'Recently'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={file.driver === 's3' ? 'indigo' : file.driver === 'vercel-blob' ? 'cyan' : 'secondary'} size="sm">
                  {file.driver || activeDriver}
                </Badge>

                {file.url && (
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="xs">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                )}

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onDeleteFile(file.key)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
