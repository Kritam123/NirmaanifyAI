import { HttpClient } from '../http-client';
import { API_ENDPOINTS } from '../endpoints';
import {
  StorageDriverType,
  StorageDriverInfo,
  StorageFileInfo,
  StorageUploadResult,
  ProjectStorageConfig,
  UpdateProjectStorageConfigDto,
  TestStorageConnectionDto,
  TestStorageConnectionResult,
} from '@nirmaanify/types';

export class StorageService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all storage drivers status and the currently active driver (optionally scoped to a specific project)
   */
  async getStatus(projectId?: string): Promise<{
    activeDriver: StorageDriverType;
    drivers: StorageDriverInfo[];
    projectId?: string;
    projectName?: string;
    config?: ProjectStorageConfig;
  }> {
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return this.http.get<{
      activeDriver: StorageDriverType;
      drivers: StorageDriverInfo[];
      projectId?: string;
      projectName?: string;
      config?: ProjectStorageConfig;
    }>(`${API_ENDPOINTS.STORAGE.STATUS}${query}`);
  }

  /**
   * Switch active storage driver for a specific project or default (local, s3, or vercel-blob)
   */
  async switchDriver(driver: StorageDriverType, projectId?: string): Promise<{
    message: string;
    driver: StorageDriverInfo;
    projectId?: string;
  }> {
    return this.http.post<{
      message: string;
      driver: StorageDriverInfo;
      projectId?: string;
    }>(API_ENDPOINTS.STORAGE.SWITCH, { driver, projectId });
  }

  /**
   * Update storage credentials and driver configuration for an individual project
   */
  async updateConfig(dto: UpdateProjectStorageConfigDto): Promise<{
    message: string;
    projectId: string;
    driver: StorageDriverType;
    config: ProjectStorageConfig;
  }> {
    return this.http.put<{
      message: string;
      projectId: string;
      driver: StorageDriverType;
      config: ProjectStorageConfig;
    }>(API_ENDPOINTS.STORAGE.CONFIG, dto);
  }

  /**
   * Test connection to a storage provider using project credentials or submitted test credentials
   */
  async testConnection(dto: TestStorageConnectionDto): Promise<TestStorageConnectionResult> {
    return this.http.post<TestStorageConnectionResult>(
      API_ENDPOINTS.STORAGE.TEST_CONNECTION,
      dto
    );
  }

  /**
   * List files stored in the active driver (optionally scoped to a specific project)
   */
  async listFiles(projectId?: string): Promise<{
    activeDriver: StorageDriverType;
    count: number;
    files: StorageFileInfo[];
    projectId?: string;
  }> {
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return this.http.get<{
      activeDriver: StorageDriverType;
      count: number;
      files: StorageFileInfo[];
      projectId?: string;
    }>(`${API_ENDPOINTS.STORAGE.FILES}${query}`);
  }

  /**
   * Upload file to active storage driver (with individual project scoping)
   */
  async uploadFile(
    file: File | Blob,
    filename?: string,
    folder: string = 'uploads',
    projectId?: string
  ): Promise<StorageUploadResult> {
    const formData = new FormData();
    if (file instanceof File) {
      formData.append('file', file);
    } else {
      formData.append('file', file, filename || 'upload.bin');
    }
    formData.append('folder', folder);
    if (projectId) {
      formData.append('projectId', projectId);
    }

    return this.http.postFormData<StorageUploadResult>(
      API_ENDPOINTS.STORAGE.UPLOAD,
      formData
    );
  }

  /**
   * Get file streaming / download URL
   */
  getFileUrl(key: string, projectId?: string): string {
    const base = this.http.resolveUrl(API_ENDPOINTS.STORAGE.FILE(key));
    return projectId ? `${base}?projectId=${encodeURIComponent(projectId)}` : base;
  }

  /**
   * Delete file from active storage
   */
  async deleteFile(key: string, projectId?: string): Promise<{ key: string; deleted: boolean }> {
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return this.http.delete<{ key: string; deleted: boolean }>(
      `${API_ENDPOINTS.STORAGE.DELETE(key)}${query}`
    );
  }
}
