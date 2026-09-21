'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, Badge, Button } from '@nirmaanify/ui';
import { HardDrive, Database, Cloud, Check, Lock } from 'lucide-react';
import { StorageDriverType, StorageDriverInfo } from '@nirmaanify/types';
import { useRBAC } from '../../hooks/use-rbac';

interface StorageDriverSwitcherProps {
  activeDriver: StorageDriverType;
  drivers: StorageDriverInfo[];
  targetName?: string;
  onSwitchDriver: (driver: StorageDriverType) => void;
}

export const StorageDriverSwitcher: React.FC<StorageDriverSwitcherProps> = ({
  activeDriver,
  drivers,
  targetName,
  onSwitchDriver,
}) => {
  const { canSwitchStorageDriver } = useRBAC();

  const getDriverIcon = (type: StorageDriverType) => {
    switch (type) {
      case 'local':
        return <HardDrive className="h-6 w-6 text-slate-400" />;
      case 's3':
        return <Database className="h-6 w-6 text-[#635BFF]" />;
      case 'vercel-blob':
        return <Cloud className="h-6 w-6 text-[#22D3EE]" />;
    }
  };

  const driverCards: Array<{
    id: StorageDriverType;
    title: string;
    description: string;
    tag: string;
  }> = [
    {
      id: 'local',
      title: 'Local Filesystem',
      description: 'Zero-config local directory storage for rapid development and testing.',
      tag: 'Development',
    },
    {
      id: 's3',
      title: 'AWS S3 / MinIO',
      description: 'Enterprise object storage with multi-region replication and asset pipelines.',
      tag: 'Object Store',
    },
    {
      id: 'vercel-blob',
      title: 'Vercel Blob Storage',
      description: 'Global low-latency edge CDN media storage with automatic optimization.',
      tag: 'Edge CDN',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {driverCards.map((driver) => {
        const isActive = activeDriver === driver.id;

        return (
          <Card
            key={driver.id}
            hoverable={canSwitchStorageDriver}
            onClick={() => canSwitchStorageDriver && !isActive && onSwitchDriver(driver.id)}
            className={`flex flex-col justify-between transition-all ${
              canSwitchStorageDriver ? 'cursor-pointer' : 'cursor-default'
            } ${
              isActive
                ? 'border-2 border-[#635BFF] bg-[#635BFF]/5 dark:bg-[#635BFF]/5 shadow-lg shadow-[#635BFF]/5'
                : ''
            }`}
          >
            <CardHeader className="p-6">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-[#161926]">
                  {getDriverIcon(driver.id)}
                </div>
                <Badge variant={isActive ? 'indigo' : 'secondary'} size="sm">
                  {driver.tag}
                </Badge>
              </div>

              <CardTitle className="mt-4 text-base text-slate-900 dark:text-white">
                {driver.title}
              </CardTitle>
              <CardDescription className="text-xs mt-1 leading-relaxed">
                {driver.description}
              </CardDescription>
            </CardHeader>

            <CardFooter className="p-6 pt-0">
              {isActive ? (
                <Button
                  variant="default"
                  size="sm"
                  disabled
                  className="w-full text-xs font-semibold bg-[#635BFF] text-white opacity-100"
                >
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" /> Active {targetName ? `(${targetName})` : 'Driver'}
                  </span>
                </Button>
              ) : canSwitchStorageDriver ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwitchDriver(driver.id);
                  }}
                >
                  Switch {targetName ? `for ${targetName}` : 'Driver'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="w-full text-xs font-semibold opacity-60 flex items-center justify-center gap-1.5"
                >
                  <Lock className="h-3 w-3" /> Admin Only
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
