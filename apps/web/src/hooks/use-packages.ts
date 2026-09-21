import { useState, useCallback, useEffect } from 'react';
import {
  ProjectPackageDto,
  PackageDefinition,
  CompatibilityCheckResponse,
  NpmRegistrySearchResult,
  InstallPackageDto,
  SwitchPresetDto,
} from '@nirmaanify/types';
import { apiClient } from '../lib/api';

export function usePackages(projectId: string) {
  const [packages, setPackages] = useState<ProjectPackageDto[]>([]);
  const [presets, setPresets] = useState<Record<string, PackageDefinition>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearchingNpm, setIsSearchingNpm] = useState<boolean>(false);
  const [npmSearchResults, setNpmSearchResults] = useState<NpmRegistrySearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.packages.listPackages(projectId);
      setPackages(data || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching packages');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const fetchPresets = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await apiClient.packages.getPresets(projectId);
      setPresets(data || {});
    } catch (err) {
      console.warn('Could not fetch curated presets', err);
    }
  }, [projectId]);

  useEffect(() => {
    fetchPackages();
    fetchPresets();
  }, [fetchPackages, fetchPresets]);

  const checkCompatibility = async (
    packageName: string,
    version?: string
  ): Promise<CompatibilityCheckResponse> => {
    return apiClient.packages.checkCompatibility(projectId, packageName, version);
  };

  const installPackage = async (dto: InstallPackageDto): Promise<ProjectPackageDto> => {
    const pkg = await apiClient.packages.installPackage(projectId, dto);
    await fetchPackages();
    return pkg;
  };

  const removePackage = async (packageName: string): Promise<void> => {
    await apiClient.packages.removePackage(projectId, packageName);
    await fetchPackages();
  };

  const switchPreset = async (dto: SwitchPresetDto): Promise<{ success: boolean; activePreset: string }> => {
    const res = await apiClient.packages.switchPreset(projectId, dto);
    await fetchPackages();
    return res;
  };

  const searchNpm = async (query: string): Promise<NpmRegistrySearchResult[]> => {
    if (!query || query.trim().length < 2) {
      setNpmSearchResults([]);
      return [];
    }
    setIsSearchingNpm(true);
    try {
      const results = await apiClient.packages.searchNpm(projectId, query);
      setNpmSearchResults(results || []);
      return results || [];
    } catch (err) {
      return [];
    } finally {
      setIsSearchingNpm(false);
    }
  };

  return {
    packages,
    presets,
    isLoading,
    isSearchingNpm,
    npmSearchResults,
    error,
    fetchPackages,
    checkCompatibility,
    installPackage,
    removePackage,
    switchPreset,
    searchNpm,
  };
}
