import { ExpoImageUploader } from './core/media-uploader';
import { AzureBlobUploader } from './core/uploader';
import { AzureBlobConfig } from './types';
export { AzureBlobConfig, ImagePickerOptions, MediaItem, MediaType, UploadProgress, UploadResult } from './types';
export { AzureBlobUploader, ExpoImageUploader };
export declare const createAzureBlobUploader: (config: AzureBlobConfig) => AzureBlobUploader;
export declare const createExpoImageUploader: (config: AzureBlobConfig) => ExpoImageUploader;
//# sourceMappingURL=index.d.ts.map