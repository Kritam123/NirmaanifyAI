export type StorageDriverType = 'local' | 's3' | 'vercel-blob';

export interface StorageDriverInfo {
  name: StorageDriverType;
  label: string;
  isActive: boolean;
  isConfigured: boolean;
  description: string;
  details?: {
    bucket?: string;
    endpoint?: string;
    region?: string;
  };
}

export interface FileUploadPayload {
  filename: string;
  buffer: Uint8Array | ArrayBuffer | any;
  mimeType: string;
  folder?: string;
  projectId?: string;
}

export interface StorageUploadResult {
  key: string;
  url: string;
  size: number;
  driver: StorageDriverType;
  uploadedAt: string;
  projectId?: string;
}

export interface StorageFileInfo {
  key: string;
  url: string;
  size?: number;
  uploadedAt?: string;
  driver: StorageDriverType;
  projectId?: string;
}

export interface SwitchStorageDriverDto {
  driver: StorageDriverType;
  projectId?: string;
}

export interface S3StorageConfig {
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  forcePathStyle?: boolean;
}

export interface VercelBlobStorageConfig {
  token?: string;
}

export interface LocalStorageConfig {
  basePath?: string;
}

export interface ProjectStorageConfig {
  s3?: S3StorageConfig;
  vercelBlob?: VercelBlobStorageConfig;
  local?: LocalStorageConfig;
}

export interface UpdateProjectStorageConfigDto {
  projectId: string;
  driver?: StorageDriverType;
  config: ProjectStorageConfig;
}

export interface TestStorageConnectionDto {
  projectId?: string;
  driver: StorageDriverType;
  config?: ProjectStorageConfig;
}

export interface TestStorageConnectionResult {
  success: boolean;
  message: string;
  driver: StorageDriverType;
  testedAt: string;
  details?: Record<string, any>;
}

export interface ProjectStorageStatus {
  projectId?: string;
  projectName?: string;
  activeDriver: StorageDriverType;
  drivers: StorageDriverInfo[];
  config?: ProjectStorageConfig;
}

