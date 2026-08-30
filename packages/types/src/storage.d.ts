export type StorageDriverType = 'local' | 's3' | 'vercel-blob';
export interface StorageDriverInfo {
    name: StorageDriverType;
    label: string;
    isActive: boolean;
    isConfigured: boolean;
    description: string;
    details?: {
        bucket?: string;
        endpoint?: string;
        region?: string;
    };
}
export interface FileUploadPayload {
    filename: string;
    buffer: Uint8Array | ArrayBuffer | any;
    mimeType: string;
    folder?: string;
}
export interface StorageUploadResult {
    key: string;
    url: string;
    size: number;
    driver: StorageDriverType;
    uploadedAt: string;
}
export interface StorageFileInfo {
    key: string;
    url: string;
    size?: number;
    uploadedAt?: string;
    driver: StorageDriverType;
}
export interface SwitchStorageDriverDto {
    driver: StorageDriverType;
}
//# sourceMappingURL=storage.d.ts.map