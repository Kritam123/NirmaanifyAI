import { HttpClient } from '../http-client';
import { API_ENDPOINTS } from '../endpoints';
import {
  CmsCollectionDto,
  CmsCollectionType,
  CmsContentItemDto,
  CmsFieldDto,
  CmsFilterOptions,
  CmsPaginatedResult,
  CreateCmsCollectionDto,
  CreateCmsContentItemDto,
  CreateCmsFieldDto,
  UpdateCmsCollectionDto,
  UpdateCmsContentItemDto,
  UpdateCmsFieldDto,
} from '@nirmaanify/types';

export class CmsService {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all CMS collections for a given project
   */
  async listCollections(projectId: string): Promise<CmsCollectionDto[]> {
    return this.http.get<CmsCollectionDto[]>(API_ENDPOINTS.CMS.COLLECTIONS(projectId));
  }

  /**
   * Get CMS collection by ID or slug
   */
  async getCollection(projectId: string, idOrSlug: string): Promise<CmsCollectionDto> {
    return this.http.get<CmsCollectionDto>(API_ENDPOINTS.CMS.COLLECTION(projectId, idOrSlug));
  }

  /**
   * Create a new CMS collection
   */
  async createCollection(
    projectId: string,
    dto: CreateCmsCollectionDto
  ): Promise<CmsCollectionDto> {
    return this.http.post<CmsCollectionDto>(API_ENDPOINTS.CMS.COLLECTIONS(projectId), dto);
  }

  /**
   * Update CMS collection metadata
   */
  async updateCollection(
    projectId: string,
    collectionId: string,
    dto: UpdateCmsCollectionDto
  ): Promise<CmsCollectionDto> {
    return this.http.patch<CmsCollectionDto>(
      API_ENDPOINTS.CMS.COLLECTION(projectId, collectionId),
      dto
    );
  }

  /**
   * Delete CMS collection
   */
  async deleteCollection(
    projectId: string,
    collectionId: string
  ): Promise<{ success: boolean; id: string }> {
    return this.http.delete<{ success: boolean; id: string }>(
      API_ENDPOINTS.CMS.COLLECTION(projectId, collectionId)
    );
  }

  /**
   * Add a new field schema definition to a collection
   */
  async addField(
    projectId: string,
    collectionId: string,
    dto: CreateCmsFieldDto
  ): Promise<CmsFieldDto> {
    return this.http.post<CmsFieldDto>(
      API_ENDPOINTS.CMS.FIELDS(projectId, collectionId),
      dto
    );
  }

  /**
   * Update an existing field schema definition
   */
  async updateField(
    projectId: string,
    collectionId: string,
    fieldId: string,
    dto: UpdateCmsFieldDto
  ): Promise<CmsFieldDto> {
    return this.http.patch<CmsFieldDto>(
      API_ENDPOINTS.CMS.FIELD(projectId, collectionId, fieldId),
      dto
    );
  }

  /**
   * Delete a field from a collection
   */
  async deleteField(
    projectId: string,
    collectionId: string,
    fieldId: string
  ): Promise<{ success: boolean; id: string }> {
    return this.http.delete<{ success: boolean; id: string }>(
      API_ENDPOINTS.CMS.FIELD(projectId, collectionId, fieldId)
    );
  }

  /**
   * List content items in a collection with pagination & filters
   */
  async listContent(
    projectId: string,
    collectionIdOrSlug: string,
    filters?: CmsFilterOptions
  ): Promise<CmsPaginatedResult<CmsContentItemDto>> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.http.get<CmsPaginatedResult<CmsContentItemDto>>(
      `${API_ENDPOINTS.CMS.CONTENT(projectId, collectionIdOrSlug)}${query}`
    );
  }

  /**
   * Get single content item by ID
   */
  async getContentItem(
    projectId: string,
    collectionIdOrSlug: string,
    itemId: string
  ): Promise<CmsContentItemDto> {
    return this.http.get<CmsContentItemDto>(
      API_ENDPOINTS.CMS.CONTENT_ITEM(projectId, collectionIdOrSlug, itemId)
    );
  }

  /**
   * Create a new content item in collection
   */
  async createContentItem(
    projectId: string,
    collectionIdOrSlug: string,
    dto: CreateCmsContentItemDto
  ): Promise<CmsContentItemDto> {
    return this.http.post<CmsContentItemDto>(
      API_ENDPOINTS.CMS.CONTENT(projectId, collectionIdOrSlug),
      dto
    );
  }

  /**
   * Update an existing content item
   */
  async updateContentItem(
    projectId: string,
    collectionIdOrSlug: string,
    itemId: string,
    dto: UpdateCmsContentItemDto
  ): Promise<CmsContentItemDto> {
    return this.http.patch<CmsContentItemDto>(
      API_ENDPOINTS.CMS.CONTENT_ITEM(projectId, collectionIdOrSlug, itemId),
      dto
    );
  }

  /**
   * Delete a content item
   */
  async deleteContentItem(
    projectId: string,
    collectionIdOrSlug: string,
    itemId: string
  ): Promise<{ success: boolean; id: string }> {
    return this.http.delete<{ success: boolean; id: string }>(
      API_ENDPOINTS.CMS.CONTENT_ITEM(projectId, collectionIdOrSlug, itemId)
    );
  }

  /**
   * Publish a content item immediately
   */
  async publishContentItem(
    projectId: string,
    collectionIdOrSlug: string,
    itemId: string
  ): Promise<CmsContentItemDto> {
    return this.http.post<CmsContentItemDto>(
      API_ENDPOINTS.CMS.PUBLISH(projectId, collectionIdOrSlug, itemId),
      {}
    );
  }

  /**
   * Unpublish a content item (revert to DRAFT)
   */
  async unpublishContentItem(
    projectId: string,
    collectionIdOrSlug: string,
    itemId: string
  ): Promise<CmsContentItemDto> {
    return this.http.post<CmsContentItemDto>(
      API_ENDPOINTS.CMS.UNPUBLISH(projectId, collectionIdOrSlug, itemId),
      {}
    );
  }

  /**
   * Schedule publication for a future date/time
   */
  async schedulePublish(
    projectId: string,
    collectionIdOrSlug: string,
    itemId: string,
    scheduledAt: string
  ): Promise<CmsContentItemDto> {
    return this.http.post<CmsContentItemDto>(
      API_ENDPOINTS.CMS.SCHEDULE(projectId, collectionIdOrSlug, itemId),
      { scheduledAt }
    );
  }

  /**
   * Initialize a preset collection (Posts, Products, Categories, Authors) with standard fields
   */
  async seedPresetCollection(
    projectId: string,
    type: CmsCollectionType
  ): Promise<CmsCollectionDto> {
    return this.http.post<CmsCollectionDto>(
      API_ENDPOINTS.CMS.SEED_PRESET(projectId),
      { type }
    );
  }

  /**
   * Public content delivery query (used by generated frontend sites and preview)
   */
  async getPublicCollectionContent(
    projectId: string,
    collectionSlug: string,
    limit?: number
  ): Promise<CmsContentItemDto[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.http.get<CmsContentItemDto[]>(
      `${API_ENDPOINTS.CMS.PUBLIC_CONTENT(projectId, collectionSlug)}${query}`
    );
  }
}
