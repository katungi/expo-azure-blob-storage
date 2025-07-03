import { ExpoImageUploader } from './core/media-uploader';
import { AzureBlobUploader } from './core/uploader';
export { AzureBlobUploader, ExpoImageUploader };
export const createAzureBlobUploader = (config) => {
    return new AzureBlobUploader(config);
};
export const createExpoImageUploader = (config) => {
    return new ExpoImageUploader(config);
};
//# sourceMappingURL=index.js.map