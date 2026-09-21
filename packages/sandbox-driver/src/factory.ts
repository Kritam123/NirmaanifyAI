import { SandboxProvider } from '@nirmaanify/types';
import { ISandboxDriver } from './types';
import { E2BCloudDriver } from './drivers/e2b-cloud.driver';
import { LocalDockerDriver } from './drivers/local-docker.driver';

export class SandboxDriverFactory {
  private static drivers: Map<string, ISandboxDriver> = new Map();

  static createDriver(provider: SandboxProvider, e2bApiKey?: string): ISandboxDriver {
    switch (provider) {
      case 'E2B_CLOUD':
        return new E2BCloudDriver(e2bApiKey);
      case 'LOCAL_DOCKER':
      case 'WEBCONTAINER':
      default:
        return new LocalDockerDriver();
    }
  }

  static getOrCreateForProject(
    projectId: string,
    provider: SandboxProvider = 'E2B_CLOUD',
    e2bApiKey?: string,
  ): ISandboxDriver {
    const key = `${projectId}:${provider}`;
    if (!this.drivers.has(key)) {
      this.drivers.set(key, this.createDriver(provider, e2bApiKey));
    }
    return this.drivers.get(key)!;
  }

  static removeDriver(projectId: string, provider: SandboxProvider): void {
    const key = `${projectId}:${provider}`;
    this.drivers.delete(key);
  }
}
