import * as FileSystem from 'expo-file-system';
import { UploadResult, UploadProgress, MediaType, AzureBlobConfig, AzureUploadOptions } from '../types';

export class AzureBlobUploader {
  private storageAccount: string;
  private containerName: string;
  private sasToken: string;
  private baseUrl: string;

  constructor(config: AzureBlobConfig) {
    if (!config.storageAccount) {
      throw new Error('Storage account name is required');
    }
    if (!config.containerName) {
      throw new Error('Container name is required');
    }
    if (!config.sasToken) {
      throw new Error('SAS token is required');
    }

    this.storageAccount = config.storageAccount;
    this.containerName = config.containerName;
    this.sasToken = config.sasToken;
    this.baseUrl = `https://${config.storageAccount}.blob.core.windows.net/${config.containerName}`;
  }

  /**
   * Generate unique filename with timestamp
   */
  generateFileName(originalName: string, mediaType: MediaType = 'image'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = originalName.split('.').pop() || 'jpg';
    const prefix = mediaType === 'video' ? 'vid' : 'img';
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${randomSuffix}.${extension}`;
  }

  /**
   * Get content type based on file extension
   */
  getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypes: { [key: string]: string } = {
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'bmp': 'image/bmp',
      'svg': 'image/svg+xml',
      // Videos
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      'webm': 'video/webm',
      '3gp': 'video/3gpp',
      // Documents
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain'
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
  }

  /**
   * Validate file before upload
   */
  private async validateFile(fileUri: string): Promise<void> {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }
    if (!fileInfo.size || fileInfo.size === 0) {
      throw new Error('File is empty');
    }
    // Optional: Add size limits
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (fileInfo.size > maxSize) {
      throw new Error(`File size (${Math.round(fileInfo.size / 1024 / 1024)}MB) exceeds maximum allowed size (50MB)`);
    }
  }

  /**
   * Upload file to Azure Blob Storage
   */
  async uploadFile(
    fileUri: string,
    originalName: string,
    mediaType: MediaType = 'image'
  ): Promise<UploadResult> {
    try {
      await this.validateFile(fileUri);

      const fileName = this.generateFileName(originalName, mediaType);

      const fileData = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const binaryData = atob(fileData);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }

      const contentType = this.getContentType(fileName);
      const headers = {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': contentType,
        'Content-Length': bytes.length.toString(),
        'x-ms-blob-content-type': contentType
      };

      const uploadUrl = `${this.baseUrl}/${fileName}?${this.sasToken}`;

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: headers,
        body: bytes,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      return {
        success: true,
        fileName: fileName,
        url: `${this.baseUrl}/${fileName}`,
        size: bytes.length,
        contentType: contentType,
      };

    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Upload with progress tracking
   */
  async uploadWithProgress(
    fileUri: string,
    originalName: string,
    mediaType: MediaType = 'image',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      await this.validateFile(fileUri);

      const fileName = this.generateFileName(originalName, mediaType);
      const uploadUrl = `${this.baseUrl}/${fileName}?${this.sasToken}`;

      const uploadResult = await FileSystem.uploadAsync(uploadUrl, fileUri, {
        httpMethod: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': this.getContentType(fileName),
        },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      });

      if (uploadResult.status === 200 || uploadResult.status === 201) {
        return {
          success: true,
          fileName: fileName,
          url: `${this.baseUrl}/${fileName}`,
          response: uploadResult,
        };
      } else {
        throw new Error(`Upload failed with status: ${uploadResult.status}`);
      }

    } catch (error) {
      console.error('Upload with progress error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Upload multiple files with progress tracking
   */
  async uploadMultipleFiles(
    files: Array<{ uri: string; name: string; type?: MediaType }>,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void,
    onFileComplete?: (fileIndex: number, result: UploadResult) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await this.uploadWithProgress(
        file.uri,
        file.name,
        file.type || 'image',
        (progress) => onProgress?.(i, progress)
      );

      results.push(result);
      onFileComplete?.(i, result);
    }

    return results;
  }

  /**
   * Update SAS token (useful for token refresh)
   */
  updateSasToken(newSasToken: string): void {
    if (!newSasToken) {
      throw new Error('SAS token cannot be empty');
    }
    this.sasToken = newSasToken;
  }

  /**
   * Get blob URL for a filename
   */
  getBlobUrl(fileName: string): string {
    return `${this.baseUrl}/${fileName}`;
  }

  /**
   * Get configuration info (without sensitive data)
   */
  getConfig(): { storageAccount: string; containerName: string; baseUrl: string } {
    return {
      storageAccount: this.storageAccount,
      containerName: this.containerName,
      baseUrl: this.baseUrl
    };
  }
}
