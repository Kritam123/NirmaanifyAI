import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import {
  CmsCollection,
  CmsEntry,
  CreateCollectionDto,
  UpdateCollectionDto,
  CreateEntryDto,
  UpdateEntryDto,
} from '@nirmaanify/types';

export const cmsApi = {
  async getTemplates(projectId: string) {
    return apiClient.get<any[]>(ENDPOINTS.CMS.TEMPLATES(projectId));
  },

  async listCollections(projectId: string): Promise<CmsCollection[]> {
    return apiClient.get<CmsCollection[]>(ENDPOINTS.CMS.COLLECTIONS(projectId));
  },

  async createCollection(projectId: string, dto: CreateCollectionDto): Promise<CmsCollection> {
    return apiClient.post<CmsCollection>(ENDPOINTS.CMS.COLLECTIONS(projectId), dto);
  },

  async getCollection(projectId: string, collectionId: string): Promise<CmsCollection> {
    return apiClient.get<CmsCollection>(ENDPOINTS.CMS.COLLECTION_DETAIL(projectId, collectionId));
  },

  async updateCollection(projectId: string, collectionId: string, dto: UpdateCollectionDto): Promise<CmsCollection> {
    return apiClient.put<CmsCollection>(ENDPOINTS.CMS.COLLECTION_DETAIL(projectId, collectionId), dto);
  },

  async deleteCollection(projectId: string, collectionId: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(ENDPOINTS.CMS.COLLECTION_DETAIL(projectId, collectionId));
  },

  async listEntries(
    projectId: string,
    collectionId: string,
    params?: { status?: string; search?: string; limit?: number; offset?: number }
  ): Promise<{ entries: CmsEntry[]; total: number }> {
    return apiClient.get<{ entries: CmsEntry[]; total: number }>(
      ENDPOINTS.CMS.ENTRIES(projectId, collectionId),
      { params: params as any }
    );
  },

  async createEntry(projectId: string, collectionId: string, dto: CreateEntryDto): Promise<CmsEntry> {
    return apiClient.post<CmsEntry>(ENDPOINTS.CMS.ENTRIES(projectId, collectionId), dto);
  },

  async getEntry(projectId: string, entryId: string): Promise<CmsEntry> {
    return apiClient.get<CmsEntry>(ENDPOINTS.CMS.ENTRY_DETAIL(projectId, entryId));
  },

  async updateEntry(projectId: string, entryId: string, dto: UpdateEntryDto): Promise<CmsEntry> {
    return apiClient.put<CmsEntry>(ENDPOINTS.CMS.ENTRY_DETAIL(projectId, entryId), dto);
  },

  async deleteEntry(projectId: string, entryId: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(ENDPOINTS.CMS.ENTRY_DETAIL(projectId, entryId));
  },

  async publishEntry(projectId: string, entryId: string): Promise<CmsEntry> {
    return apiClient.post<CmsEntry>(ENDPOINTS.CMS.ENTRY_PUBLISH(projectId, entryId));
  },

  async archiveEntry(projectId: string, entryId: string): Promise<CmsEntry> {
    return apiClient.post<CmsEntry>(ENDPOINTS.CMS.ENTRY_ARCHIVE(projectId, entryId));
  },

  async getPublicData(projectSlug: string, collectionSlug: string, params?: { limit?: number; offset?: number }) {
    return apiClient.get<any>(ENDPOINTS.CMS.PUBLIC_QUERY(projectSlug, collectionSlug), {
      params: params as any,
      skipAuth: true,
    });
  },
};
