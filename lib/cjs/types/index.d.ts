export interface UploadProgress {
    totalBytesWritten: number;
    totalBytesExpectedToWrite: number;
}
export interface UploadResult {
    success: boolean;
    fileName?: string;
    url?: string;
    size?: number;
    contentType?: string;
    error?: string;
    response?: any;
}
export interface MediaItem {
    id: string;
    url: string;
    type: 'image' | 'video';
    width?: number;
    height?: number;
}
export interface AzureBlobConfig {
    storageAccount: string;
    containerName: string;
    sasToken: string;
}
export type MediaType = 'image' | 'video';
export interface AzureUploadOptions {
    generateUniqueFileName?: boolean;
    customFileName?: string;
    mediaType?: MediaType;
    onProgress?: (progress: UploadProgress) => void;
}
export interface ImagePickerOptions {
    quality?: number;
    aspect?: [number, number];
    allowsEditing?: boolean;
    allowsMultipleSelection?: boolean;
    selectionLimit?: number;
}
//# sourceMappingURL=index.d.ts.map