import * as ImagePicker from 'expo-image-picker';
import { AzureBlobUploader } from './uploader';
import { UploadProgress, UploadResult, AzureBlobConfig, ImagePickerOptions } from '../types';
export declare class ExpoImageUploader {
    private uploader;
    constructor(config: AzureBlobConfig);
    /**
     * Request permission to access media library
     */
    requestMediaLibraryPermission(): Promise<boolean>;
    /**
     * Request permission to access camera
     */
    requestCameraPermission(): Promise<boolean>;
    /**
     * Check if permissions are already granted
     */
    checkPermissions(): Promise<{
        camera: boolean;
        mediaLibrary: boolean;
    }>;
    /**
     * Pick image from library with customizable options
     */
    pickImageFromLibrary(options?: ImagePickerOptions): Promise<ImagePicker.ImagePickerResult>;
    /**
     * Pick multiple images from library
     */
    pickMultipleImagesFromLibrary(options?: ImagePickerOptions & {
        selectionLimit?: number;
    }): Promise<ImagePicker.ImagePickerResult>;
    /**
     * Take photo with camera
     */
    takePhoto(options?: ImagePickerOptions): Promise<ImagePicker.ImagePickerResult>;
    /**
     * Process and upload single image from picker result
     */
    processAndUploadImage(result: ImagePicker.ImagePickerResult, fileName: string, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult | null>;
    /**
     * Process and upload multiple images from picker result
     */
    processAndUploadMultipleImages(result: ImagePicker.ImagePickerResult, fileNamePrefix?: string, onProgress?: (fileIndex: number, progress: UploadProgress) => void, onFileComplete?: (fileIndex: number, result: UploadResult) => void): Promise<UploadResult[]>;
    /**
     * Quick upload: pick and upload in one step
     */
    quickUploadFromLibrary(fileName?: string, options?: ImagePickerOptions, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult | null>;
    /**
     * Quick upload: take photo and upload in one step
     */
    quickUploadFromCamera(fileName?: string, options?: ImagePickerOptions, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult | null>;
    /**
     * Get the underlying uploader instance for advanced usage
     */
    getUploader(): AzureBlobUploader;
    /**
     * Update SAS token
     */
    updateSasToken(newSasToken: string): void;
}
//# sourceMappingURL=media-uploader.d.ts.map