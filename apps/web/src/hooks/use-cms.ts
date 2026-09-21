'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CmsCollectionDto,
  CmsCollectionType,
  CmsContentItemDto,
  CmsContentStatus,
  CmsFieldDto,
  CreateCmsCollectionDto,
  CreateCmsContentItemDto,
  CreateCmsFieldDto,
  UpdateCmsCollectionDto,
  UpdateCmsContentItemDto,
  UpdateCmsFieldDto,
} from '@nirmaanify/types';
import { apiClient } from '../lib/api';
import { useToast } from '@nirmaanify/ui';

export interface UseCmsOptions {
  projectId?: string;
  workspaceId?: string;
}

export function useCms(target: string | UseCmsOptions) {
  const { toast } = useToast();

  const projectId = typeof target === 'string' ? target : target.projectId;
  const workspaceId = typeof target === 'object' ? target.workspaceId : undefined;
  const isWorkspaceMode = Boolean(workspaceId && !projectId);

  const [collections, setCollections] = useState<CmsCollectionDto[]>([]);
  const [activeCollectionSlug, setActiveCollectionSlug] = useState<string>('');
  const [contentItems, setContentItems] = useState<CmsContentItemDto[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<CmsContentStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isLoadingCollections, setIsLoadingCollections] = useState<boolean>(false);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const activeCollection =
    collections.find((c) => c.slug === activeCollectionSlug || c.id === activeCollectionSlug) ||
    (collections.length > 0 ? collections[0] : null);

  // 1. Fetch all collections
  const fetchCollections = useCallback(async () => {
    if (!projectId && !workspaceId) return;
    setIsLoadingCollections(true);
    try {
      let res: CmsCollectionDto[];
      if (isWorkspaceMode && workspaceId) {
        res = await apiClient.cms.listWorkspaceCollections(workspaceId);
      } else if (projectId) {
        res = await apiClient.cms.listCollections(projectId);
      } else {
        res = [];
      }
      setCollections(res || []);
      if (res && res.length > 0 && !activeCollectionSlug) {
        setActiveCollectionSlug(res[0].slug);
      }
    } catch (err: any) {
      console.error('Failed to load CMS collections:', err);
    } finally {
      setIsLoadingCollections(false);
    }
  }, [projectId, workspaceId, isWorkspaceMode, activeCollectionSlug]);

  // 2. Fetch content items for the currently selected collection
  const fetchContent = useCallback(async () => {
    if ((!projectId && !workspaceId) || !activeCollection) {
      setContentItems([]);
      setTotalItems(0);
      return;
    }
    setIsLoadingContent(true);
    try {
      let res;
      if (isWorkspaceMode && workspaceId) {
        res = await apiClient.cms.listWorkspaceContent(workspaceId, activeCollection.slug, {
          status: statusFilter,
          search: searchQuery,
          page,
          limit,
        });
      } else if (projectId) {
        res = await apiClient.cms.listContent(projectId, activeCollection.slug, {
          status: statusFilter,
          search: searchQuery,
          page,
          limit,
        });
      }
      setContentItems(res?.items || []);
      setTotalItems(res?.total || 0);
      setTotalPages(res?.totalPages || 1);
    } catch (err: any) {
      console.error('Failed to load CMS content items:', err);
    } finally {
      setIsLoadingContent(false);
    }
  }, [projectId, workspaceId, isWorkspaceMode, activeCollection, statusFilter, searchQuery, page, limit]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    if (activeCollection) {
      fetchContent();
    }
  }, [activeCollection?.slug, fetchContent]);

  // 3. Collection Actions
  const createCollection = async (dto: CreateCmsCollectionDto): Promise<CmsCollectionDto | null> => {
    setIsSaving(true);
    try {
      const col = isWorkspaceMode && workspaceId
        ? await apiClient.cms.createWorkspaceCollection(workspaceId, dto)
        : await apiClient.cms.createCollection(projectId!, dto);
      toast({
        title: 'Collection Created',
        description: `CMS Collection "${col.name}" has been created successfully.`,
        type: 'success',
      });
      await fetchCollections();
      setActiveCollectionSlug(col.slug);
      return col;
    } catch (err: any) {
      toast({
        title: 'Failed to create collection',
        description: err.message || 'An unexpected error occurred',
        type: 'error',
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updateCollection = async (
    collectionId: string,
    dto: UpdateCmsCollectionDto
  ): Promise<CmsCollectionDto | null> => {
    setIsSaving(true);
    try {
      const col = isWorkspaceMode && workspaceId
        ? await apiClient.cms.updateWorkspaceCollection(workspaceId, collectionId, dto)
        : await apiClient.cms.updateCollection(projectId!, collectionId, dto);
      toast({
        title: 'Collection Updated',
        description: `Collection schema updated successfully.`,
        type: 'success',
      });
      await fetchCollections();
      return col;
    } catch (err: any) {
      toast({
        title: 'Failed to update collection',
        description: err.message || 'Could not update collection',
        type: 'error',
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCollection = async (collectionId: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      if (isWorkspaceMode && workspaceId) {
        await apiClient.cms.deleteWorkspaceCollection(workspaceId, collectionId);
      } else {
        await apiClient.cms.deleteCollection(projectId!, collectionId);
      }
      toast({
        title: 'Collection Deleted',
        description: 'Collection and all associated items were removed.',
        type: 'success',
      });
      const remaining = collections.filter((c) => c.id !== collectionId);
      setCollections(remaining);
      if (remaining.length > 0) {
        setActiveCollectionSlug(remaining[0].slug);
      } else {
        setActiveCollectionSlug('');
      }
      return true;
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err.message || 'Could not delete collection',
        type: 'error',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const seedPreset = async (type: CmsCollectionType): Promise<CmsCollectionDto | null> => {
    setIsSaving(true);
    try {
      const col = isWorkspaceMode && workspaceId
        ? await apiClient.cms.seedWorkspacePresetCollection(workspaceId, type)
        : await apiClient.cms.seedPresetCollection(projectId!, type);
      toast({
        title: `Seeded ${type} Collection`,
        description: `Created "${col.name}" with standard fields and sample entries.`,
        type: 'success',
      });
      await fetchCollections();
      setActiveCollectionSlug(col.slug);
      return col;
    } catch (err: any) {
      toast({
        title: 'Seeding Failed',
        description: err.message || 'Could not initialize preset collection',
        type: 'error',
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Field Schema Actions
  const addField = async (
    collectionId: string,
    dto: CreateCmsFieldDto
  ): Promise<CmsFieldDto | null> => {
    setIsSaving(true);
    try {
      const f = isWorkspaceMode && workspaceId
        ? await apiClient.cms.addWorkspaceField(workspaceId, collectionId, dto)
        : await apiClient.cms.addField(projectId!, collectionId, dto);
      toast({
        title: 'Field Added',
        description: `Added "${f.name}" to schema.`,
        type: 'success',
      });
      await fetchCollections();
      return f;
    } catch (err: any) {
      toast({
        title: 'Failed to add field',
        description: err.message || 'Error creating field',
        type: 'error',
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = async (
    collectionId: string,
    fieldId: string,
    dto: UpdateCmsFieldDto
  ): Promise<CmsFieldDto | null> => {
    setIsSaving(true);
    try {
      const f = isWorkspaceMode && workspaceId
        ? await apiClient.cms.updateWorkspaceField(workspaceId, collectionId, fieldId, dto)
        : await apiClient.cms.updateField(projectId!, collectionId, fieldId, dto);
      toast({
        title: 'Field Updated',
        description: `Field schema updated.`,
        type: 'success',
      });
      await fetchCollections();
      return f;
    } catch (err: any) {
      toast({
        title: 'Failed to update field',
        description: err.message || 'Error updating field',
        type: 'error',
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteField = async (collectionId: string, fieldId: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      if (isWorkspaceMode && workspaceId) {
        await apiClient.cms.deleteWorkspaceField(workspaceId, collectionId, fieldId);
      } else {
        await apiClient.cms.deleteField(projectId!, collectionId, fieldId);
      }
      toast({
        title: 'Field Removed',
        description: 'Field deleted from schema.',
        type: 'success',
      });
      await fetchCollections();
      return true;
    } catch (err: any) {
      toast({
        title: 'Failed to delete field',
        description: err.message || 'Could not remove field',
        type: 'error',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Content Item CRUD & Publishing Workflow
  const createContentItem = async (
    dto: CreateCmsContentItemDto
  ): Promise<CmsContentItemDto | null> => {
    if (!activeCollection) return null;
    setIsSaving(true);
    try {
      const item = isWorkspaceMode && workspaceId
        ? await apiClient.cms.createWorkspaceContentItem(workspaceId, activeCollection.slug, dto)
        : await apiClient.cms.createContentItem(projectId!, activeCollection.slug, dto);
      toast({
        title: 'Item Created',
        description: `Content item saved as ${dto.status || 'DRAFT'}.`,
        type: 'success',
      });
      await fetchContent();
      return item;
    } catch (err: any) {
      toast({
        title: 'Failed to save item',
        description: err.message || 'Error saving content item',
        type: 'error',
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updateContentItem = async (
    itemId: string,
    dto: UpdateCmsContentItemDto
  ): Promise<CmsContentItemDto | null> => {
    if (!activeCollection) return null;
    setIsSaving(true);
    try {
      const item = isWorkspaceMode && workspaceId
        ? await apiClient.cms.updateWorkspaceContentItem(workspaceId, activeCollection.slug, itemId, dto)
        : await apiClient.cms.updateContentItem(projectId!, activeCollection.slug, itemId, dto);
      toast({
        title: 'Item Updated',
        description: 'Content updates saved.',
        type: 'success',
      });
      await fetchContent();
      return item;
    } catch (err: any) {
      toast({
        title: 'Failed to update item',
        description: err.message || 'Error updating content item',
        type: 'error',
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteContentItem = async (itemId: string): Promise<boolean> => {
    if (!activeCollection) return false;
    setIsSaving(true);
    try {
      if (isWorkspaceMode && workspaceId) {
        await apiClient.cms.deleteWorkspaceContentItem(workspaceId, activeCollection.slug, itemId);
      } else {
        await apiClient.cms.deleteContentItem(projectId!, activeCollection.slug, itemId);
      }
      toast({
        title: 'Item Deleted',
        description: 'Entry removed successfully.',
        type: 'success',
      });
      await fetchContent();
      return true;
    } catch (err: any) {
      toast({
        title: 'Failed to delete item',
        description: err.message || 'Error deleting content item',
        type: 'error',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const publishItem = async (itemId: string): Promise<boolean> => {
    if (!activeCollection) return false;
    try {
      if (isWorkspaceMode && workspaceId) {
        await apiClient.cms.publishWorkspaceContentItem(workspaceId, activeCollection.slug, itemId);
      } else {
        await apiClient.cms.publishContentItem(projectId!, activeCollection.slug, itemId);
      }
      toast({
        title: 'Published',
        description: 'Content item is now live!',
        type: 'success',
      });
      await fetchContent();
      return true;
    } catch (err: any) {
      toast({
        title: 'Publishing Failed',
        description: err.message || 'Could not publish item',
        type: 'error',
      });
      return false;
    }
  };

  const unpublishItem = async (itemId: string): Promise<boolean> => {
    if (!activeCollection) return false;
    try {
      if (isWorkspaceMode && workspaceId) {
        await apiClient.cms.unpublishWorkspaceContentItem(workspaceId, activeCollection.slug, itemId);
      } else {
        await apiClient.cms.unpublishContentItem(projectId!, activeCollection.slug, itemId);
      }
      toast({
        title: 'Unpublished',
        description: 'Entry reverted to draft.',
        type: 'info',
      });
      await fetchContent();
      return true;
    } catch (err: any) {
      toast({
        title: 'Unpublish Failed',
        description: err.message || 'Could not unpublish item',
        type: 'error',
      });
      return false;
    }
  };

  const schedulePublish = async (itemId: string, scheduledAt: string): Promise<boolean> => {
    if (!activeCollection) return false;
    try {
      if (isWorkspaceMode && workspaceId) {
        await apiClient.cms.scheduleWorkspacePublish(workspaceId, activeCollection.slug, itemId, scheduledAt);
      } else {
        await apiClient.cms.schedulePublish(projectId!, activeCollection.slug, itemId, scheduledAt);
      }
      toast({
        title: 'Scheduled',
        description: `Publication scheduled for ${new Date(scheduledAt).toLocaleString()}.`,
        type: 'success',
      });
      await fetchContent();
      return true;
    } catch (err: any) {
      toast({
        title: 'Scheduling Failed',
        description: err.message || 'Could not schedule item',
        type: 'error',
      });
      return false;
    }
  };

  return {
    collections,
    activeCollection,
    activeCollectionSlug,
    setActiveCollectionSlug,
    contentItems,
    totalItems,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    isLoadingCollections,
    isLoadingContent,
    isSaving,
    createCollection,
    updateCollection,
    deleteCollection,
    seedPreset,
    addField,
    updateField,
    deleteField,
    createContentItem,
    updateContentItem,
    deleteContentItem,
    publishItem,
    unpublishItem,
    schedulePublish,
    refreshCollections: fetchCollections,
    refreshContent: fetchContent,
  };
}
