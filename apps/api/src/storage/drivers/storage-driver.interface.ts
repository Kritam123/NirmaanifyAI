import {
  StorageDriverType,
  FileUploadPayload,
  StorageUploadResult,
  StorageFileInfo,
} from '@nirmaanify/types';

export interface IStorageDriver {
  readonly type: StorageDriverType;
  readonly label: string;
  isConfigured(): boolean;
  upload(payload: FileUploadPayload): Promise<StorageUploadResult>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<boolean>;
  getUrl(key: string): Promise<string>;
  listFiles(folder?: string): Promise<StorageFileInfo[]>;
  getDescription(): string;
  testConnection(): Promise<{ success: boolean; message: string; details?: any }>;
}
