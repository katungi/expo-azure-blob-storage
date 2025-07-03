"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpoImageUploader = exports.createAzureBlobUploader = exports.ExpoImageUploader = exports.AzureBlobUploader = void 0;
const media_uploader_1 = require("./core/media-uploader");
Object.defineProperty(exports, "ExpoImageUploader", { enumerable: true, get: function () { return media_uploader_1.ExpoImageUploader; } });
const uploader_1 = require("./core/uploader");
Object.defineProperty(exports, "AzureBlobUploader", { enumerable: true, get: function () { return uploader_1.AzureBlobUploader; } });
const createAzureBlobUploader = (config) => {
    return new uploader_1.AzureBlobUploader(config);
};
exports.createAzureBlobUploader = createAzureBlobUploader;
const createExpoImageUploader = (config) => {
    return new media_uploader_1.ExpoImageUploader(config);
};
exports.createExpoImageUploader = createExpoImageUploader;
//# sourceMappingURL=index.js.map