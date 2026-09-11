import { HttpClient } from '../http-client';
import { API_ENDPOINTS } from '../endpoints';
import {
  ProjectPackageDto,
  PackageDefinition,
  CompatibilityCheckResponse,
  NpmRegistrySearchResult,
  InstallPackageDto,
  SwitchPresetDto,
} from '@nirmaanify/types';

export class PackagesService {
  constructor(private readonly http: HttpClient) {}

  async listPackages(projectId: string): Promise<ProjectPackageDto[]> {
    const res = await this.http.get<{ packages: ProjectPackageDto[] }>(
      API_ENDPOINTS.PACKAGES.LIST(projectId)
    );
    return res.packages || [];
  }

  async getPresets(projectId: string): Promise<Record<string, PackageDefinition>> {
    const res = await this.http.get<{ presets: Record<string, PackageDefinition> }>(
      API_ENDPOINTS.PACKAGES.PRESETS(projectId)
    );
    return res.presets || {};
  }

  async checkCompatibility(
    projectId: string,
    packageName: string,
    version?: string
  ): Promise<CompatibilityCheckResponse> {
    return this.http.post<CompatibilityCheckResponse>(
      API_ENDPOINTS.PACKAGES.CHECK_COMPATIBILITY(projectId),
      { packageName, version }
    );
  }

  async installPackage(projectId: string, dto: InstallPackageDto): Promise<ProjectPackageDto> {
    const res = await this.http.post<{ package: ProjectPackageDto }>(
      API_ENDPOINTS.PACKAGES.INSTALL(projectId),
      dto
    );
    return res.package;
  }

  async removePackage(projectId: string, packageName: string): Promise<void> {
    await this.http.delete<void>(API_ENDPOINTS.PACKAGES.REMOVE(projectId, packageName));
  }

  async switchPreset(
    projectId: string,
    dto: SwitchPresetDto
  ): Promise<{ success: boolean; activePreset: string }> {
    return this.http.post<{ success: boolean; activePreset: string }>(
      API_ENDPOINTS.PACKAGES.SWITCH_PRESET(projectId),
      dto
    );
  }

  async searchNpm(projectId: string, query: string): Promise<NpmRegistrySearchResult[]> {
    const res = await this.http.get<{ results: NpmRegistrySearchResult[] }>(
      API_ENDPOINTS.PACKAGES.SEARCH_NPM(projectId, query)
    );
    return res.results || [];
  }
}
