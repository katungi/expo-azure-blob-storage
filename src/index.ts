import { ExpoImageUploader } from "./core/media-uploader";
import { AzureBlobUploader } from "./core/uploader";
import { AzureBlobConfig } from "./types";

export type {
  AzureBlobConfig,
  ImagePickerOptions,
  MediaItem,
  MediaType,
  UploadProgress,
  UploadResult,
} from "./types";
export { AzureBlobUploader, ExpoImageUploader };

export const createAzureBlobUploader = (config: AzureBlobConfig) => {
  return new AzureBlobUploader(config);
};

export const createExpoImageUploader = (config: AzureBlobConfig) => {
  return new ExpoImageUploader(config);
};
