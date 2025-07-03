import { UploadResult, UploadProgress, MediaType, AzureBlobConfig } from '../types';
export declare class AzureBlobUploader {
    private storageAccount;
    private containerName;
    private sasToken;
    private baseUrl;
    constructor(config: AzureBlobConfig);
    /**
     * Generate unique filename with timestamp
     */
    generateFileName(originalName: string, mediaType?: MediaType): string;
    /**
     * Get content type based on file extension
     */
    getContentType(filename: string): string;
    /**
     * Validate file before upload
     */
    private validateFile;
    /**
     * Upload file to Azure Blob Storage
     */
    uploadFile(fileUri: string, originalName: string, mediaType?: MediaType): Promise<UploadResult>;
    /**
     * Upload with progress tracking
     */
    uploadWithProgress(fileUri: string, originalName: string, mediaType?: MediaType, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult>;
    /**
     * Upload multiple files with progress tracking
     */
    uploadMultipleFiles(files: Array<{
        uri: string;
        name: string;
        type?: MediaType;
    }>, onProgress?: (fileIndex: number, progress: UploadProgress) => void, onFileComplete?: (fileIndex: number, result: UploadResult) => void): Promise<UploadResult[]>;
    /**
     * Update SAS token (useful for token refresh)
     */
    updateSasToken(newSasToken: string): void;
    /**
     * Get blob URL for a filename
     */
    getBlobUrl(fileName: string): string;
    /**
     * Get configuration info (without sensitive data)
     */
    getConfig(): {
        storageAccount: string;
        containerName: string;
        baseUrl: string;
    };
}
//# sourceMappingURL=uploader.d.ts.map