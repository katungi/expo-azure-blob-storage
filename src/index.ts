import { ExpoImageUploader } from "./core/media-uploader.ts";
import { AzureBlobUploader } from "./core/uploader.ts";
import type {
	AzureBlobConfig,
	AzureBlobUploaderInterface,
	ExpoImageUploaderInterface,
} from "./types/index.ts";

export { ExpoImageUploader } from "./core/media-uploader.ts";
export { AzureBlobUploader } from "./core/uploader.ts";
export type {
	AzureBlobConfig,
	AzureBlobUploaderInterface,
	AzureUploadOptions,
	Config,
	ExpoImageUploaderInterface,
	ImagePickerOptions,
	MediaItem,
	MediaType,
	UploadOptions,
	UploadProgress,
	UploadResult,
} from "./types/index.ts";

export const createAzureBlobUploader = (
	config: AzureBlobConfig,
): AzureBlobUploaderInterface => {
	return new AzureBlobUploader(config);
};

export const createExpoImageUploader = (
	config: AzureBlobConfig,
): ExpoImageUploaderInterface => {
	return new ExpoImageUploader(config);
};
