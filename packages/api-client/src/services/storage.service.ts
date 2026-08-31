import { HttpClient } from '../http-client';
import { API_ENDPOINTS } from '../endpoints';
import {
  StorageDriverType,
  StorageDriverInfo,
  StorageFileInfo,
  StorageUploadResult,
} from '@nirmaanify/types';

export class StorageService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all storage drivers status and the currently active driver
   */
  async getStatus(): Promise<{
    activeDriver: StorageDriverType;
    drivers: StorageDriverInfo[];
  }> {
    return this.http.get<{
      activeDriver: StorageDriverType;
      drivers: StorageDriverInfo[];
    }>(API_ENDPOINTS.STORAGE.STATUS);
  }

  /**
   * Switch active storage driver (local, s3, or vercel-blob)
   */
  async switchDriver(driver: StorageDriverType): Promise<{
    message: string;
    driver: StorageDriverInfo;
  }> {
    return this.http.post<{
      message: string;
      driver: StorageDriverInfo;
    }>(API_ENDPOINTS.STORAGE.SWITCH, { driver });
  }

  /**
   * List files stored in the active driver
   */
  async listFiles(): Promise<{
    activeDriver: StorageDriverType;
    count: number;
    files: StorageFileInfo[];
  }> {
    return this.http.get<{
      activeDriver: StorageDriverType;
      count: number;
      files: StorageFileInfo[];
    }>(API_ENDPOINTS.STORAGE.FILES);
  }

  /**
   * Upload file to active storage driver
   */
  async uploadFile(
    file: File | Blob,
    filename?: string,
    folder: string = 'uploads'
  ): Promise<StorageUploadResult> {
    const formData = new FormData();
    if (file instanceof File) {
      formData.append('file', file);
    } else {
      formData.append('file', file, filename || 'upload.bin');
    }
    formData.append('folder', folder);

    return this.http.postFormData<StorageUploadResult>(
      API_ENDPOINTS.STORAGE.UPLOAD,
      formData
    );
  }

  /**
   * Get file streaming / download URL
   */
  getFileUrl(key: string): string {
    return this.http.resolveUrl(API_ENDPOINTS.STORAGE.FILE(key));
  }

  /**
   * Delete file from active storage
   */
  async deleteFile(key: string): Promise<{ key: string; deleted: boolean }> {
    return this.http.delete<{ key: string; deleted: boolean }>(
      API_ENDPOINTS.STORAGE.DELETE(key)
    );
  }
}
