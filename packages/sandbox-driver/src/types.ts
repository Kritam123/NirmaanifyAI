import { SandboxProvider, SandboxStatus } from '@nirmaanify/types';

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface SandboxInstance {
  id: string;
  provider: SandboxProvider;
  status: SandboxStatus;
  webUrl: string;
  apiUrl: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface SandboxOptions {
  projectId: string;
  initialFiles?: Record<string, string>;
  env?: Record<string, string>;
  timeoutMs?: number;
}

export interface ISandboxDriver {
  readonly provider: SandboxProvider;
  start(options?: SandboxOptions): Promise<SandboxInstance>;
  stop(): Promise<void>;
  writeFile(filePath: string, content: string): Promise<void>;
  writeFiles(files: Record<string, string>): Promise<void>;
  readFile(filePath: string): Promise<string>;
  readFiles(paths: string[]): Promise<Record<string, string>>;
  listFiles(directory?: string): Promise<string[]>;
  execCommand(cmd: string): Promise<ExecResult>;
  getPreviewUrls(): { webUrl: string; apiUrl: string };
  getStatus(): Promise<SandboxStatus>;
}
