import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CompatibilityService } from './compatibility.service';
import { CURATED_PRESETS } from './preset-registry';
import {
  PackageCategory,
  PackageInstallStatus,
  ProjectPackageDto,
  InstallPackageDto,
  SwitchPresetDto,
  CompatibilityCheckResponse,
  NpmRegistrySearchResult,
} from '@nirmaanify/types';

@Injectable()
export class PackagesService {
  private readonly logger = new Logger(PackagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly compatibilityService: CompatibilityService
  ) {}

  public getCuratedPresets(): Record<string, any> {
    return CURATED_PRESETS;
  }

  public async listPackages(projectId: string): Promise<ProjectPackageDto[]> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Query database for installed packages
    let records = await (this.prisma as any).projectPackage.findMany({
      where: { projectId },
      orderBy: { installedAt: 'asc' },
    });

    // Auto-seed project defaults if brand new project with no package records
    if (records.length === 0) {
      const defaultUi = project.uiLibrary || 'shadcn/ui';
      const initialPresets = [
        defaultUi,
        'framer-motion',
        'react-hook-form',
        'lucide-react',
      ];

      for (const presetKey of initialPresets) {
        const preset = CURATED_PRESETS[presetKey];
        if (preset) {
          try {
            await (this.prisma as any).projectPackage.create({
              data: {
                projectId,
                name: preset.name,
                version: preset.version,
                category: preset.category as any,
                status: 'INSTALLED',
                metadata: { isInitialDefault: true },
              },
            });
          } catch (e) {
            // Ignore potential race conditions
          }
        }
      }

      records = await (this.prisma as any).projectPackage.findMany({
        where: { projectId },
        orderBy: { installedAt: 'asc' },
      });
    }

    return records.map(this.mapToDto);
  }

  public async checkCompatibility(
    projectId: string,
    packageName: string,
    version?: string
  ): Promise<CompatibilityCheckResponse> {
    const existing = await this.listPackages(projectId);
    return this.compatibilityService.checkCompatibility(
      { projectId, packageName, version },
      existing.map((p) => ({ name: p.name, version: p.version, category: p.category }))
    );
  }

  public async installPackage(
    projectId: string,
    dto: InstallPackageDto
  ): Promise<ProjectPackageDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const preset = CURATED_PRESETS[dto.name];
    const versionToInstall = dto.version || (preset ? preset.version : 'latest');
    const categoryToInstall: PackageCategory =
      dto.category || (preset ? preset.category : 'CUSTOM_NPM');

    // Run compatibility check
    const compat = await this.checkCompatibility(projectId, dto.name, versionToInstall);
    if (!compat.compatible) {
      const errorMsg = compat.issues
        .filter((i) => i.severity === 'error')
        .map((i) => i.message)
        .join('; ');
      throw new BadRequestException(`Cannot install package due to incompatibility: ${errorMsg}`);
    }

    // Upsert primary package
    const installed = await (this.prisma as any).projectPackage.upsert({
      where: {
        projectId_name: {
          projectId,
          name: dto.name,
        },
      },
      update: {
        version: versionToInstall,
        category: categoryToInstall,
        isDevDependency: dto.isDevDependency || false,
        status: 'INSTALLED' as PackageInstallStatus,
        metadata: {
          score: compat.score,
          issues: compat.issues,
        },
      },
      create: {
        projectId,
        name: dto.name,
        version: versionToInstall,
        category: categoryToInstall,
        isDevDependency: dto.isDevDependency || false,
        status: 'INSTALLED' as PackageInstallStatus,
        metadata: {
          score: compat.score,
          issues: compat.issues,
        },
      },
    });

    // Also auto-install any required peer dependencies from preset
    if (preset?.requiredPeerDeps) {
      for (const [peerName, peerVer] of Object.entries(preset.requiredPeerDeps)) {
        await (this.prisma as any).projectPackage.upsert({
          where: {
            projectId_name: {
              projectId,
              name: peerName,
            },
          },
          update: {
            version: peerVer,
            category: 'UTILITY' as PackageCategory,
            status: 'INSTALLED' as PackageInstallStatus,
          },
          create: {
            projectId,
            name: peerName,
            version: peerVer,
            category: 'UTILITY' as PackageCategory,
            status: 'INSTALLED' as PackageInstallStatus,
            metadata: { peerOf: dto.name },
          },
        });
      }
    }

    return this.mapToDto(installed);
  }

  public async removePackage(projectId: string, packageName: string): Promise<void> {
    const existing = await (this.prisma as any).projectPackage.findUnique({
      where: {
        projectId_name: {
          projectId,
          name: packageName,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Package "${packageName}" is not installed in project ${projectId}`);
    }

    await (this.prisma as any).projectPackage.delete({
      where: {
        projectId_name: {
          projectId,
          name: packageName,
        },
      },
    });
  }

  public async switchPreset(projectId: string, dto: SwitchPresetDto): Promise<{ success: boolean; activePreset: string }> {
    const target = CURATED_PRESETS[dto.targetPreset];
    if (!target) {
      throw new BadRequestException(`Preset "${dto.targetPreset}" is not recognized.`);
    }

    // Remove old packages in this category
    const currentPackages = await (this.prisma as any).projectPackage.findMany({
      where: {
        projectId,
        category: dto.category as any,
      },
    });

    for (const oldPkg of currentPackages) {
      if (oldPkg.name !== target.name) {
        await (this.prisma as any).projectPackage.delete({
          where: { id: oldPkg.id },
        });
      }
    }

    // Install new preset
    await this.installPackage(projectId, {
      name: target.name,
      version: target.version,
      category: target.category,
    });

    // If switching UI framework, update Project.uiLibrary column as well
    if (dto.category === 'UI_FRAMEWORK') {
      await this.prisma.project.update({
        where: { id: projectId },
        data: { uiLibrary: target.name },
      });
    }

    return { success: true, activePreset: target.name };
  }

  public async searchNpmRegistry(query: string): Promise<NpmRegistrySearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const response = await fetch(
        `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=10`
      );
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return (data.objects || []).map((item: any) => {
        const pkg = item.package;
        const isOfficial = pkg.name in CURATED_PRESETS;
        return {
          name: pkg.name,
          version: pkg.version,
          description: pkg.description || '',
          keywords: pkg.keywords || [],
          date: pkg.date,
          links: pkg.links || {},
          publisher: pkg.publisher || { username: 'unknown', email: '' },
          compatibilityScore: isOfficial ? 100 : 85,
          isOfficial,
        };
      });
    } catch (err: any) {
      this.logger.warn(`Failed to query NPM registry: ${err.message}`);
      return [];
    }
  }

  private mapToDto(record: any): ProjectPackageDto {
    return {
      id: record.id,
      projectId: record.projectId,
      name: record.name,
      version: record.version,
      resolvedVersion: record.resolvedVersion,
      category: record.category,
      isDevDependency: record.isDevDependency,
      status: record.status,
      metadata: record.metadata || {},
      installedAt: record.installedAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
