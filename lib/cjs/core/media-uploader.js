"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpoImageUploader = void 0;
const ImagePicker = __importStar(require("expo-image-picker"));
const react_native_1 = require("react-native");
const uploader_1 = require("./uploader");
class ExpoImageUploader {
    constructor(config) {
        this.uploader = new uploader_1.AzureBlobUploader(config);
    }
    /**
     * Request permission to access media library
     */
    async requestMediaLibraryPermission() {
        if (react_native_1.Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            return status === 'granted';
        }
        return true;
    }
    /**
     * Request permission to access camera
     */
    async requestCameraPermission() {
        if (react_native_1.Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            return status === 'granted';
        }
        return true;
    }
    /**
     * Check if permissions are already granted
     */
    async checkPermissions() {
        if (react_native_1.Platform.OS === 'web') {
            return { camera: true, mediaLibrary: true };
        }
        const [cameraStatus, mediaLibraryStatus] = await Promise.all([
            ImagePicker.getCameraPermissionsAsync(),
            ImagePicker.getMediaLibraryPermissionsAsync()
        ]);
        return {
            camera: cameraStatus.status === 'granted',
            mediaLibrary: mediaLibraryStatus.status === 'granted'
        };
    }
    /**
     * Pick image from library with customizable options
     */
    async pickImageFromLibrary(options = {}) {
        const permissionGranted = await this.requestMediaLibraryPermission();
        if (!permissionGranted) {
            throw new Error('Permission to access media library was denied');
        }
        const defaultOptions = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        };
        return ImagePicker.launchImageLibraryAsync({
            ...defaultOptions,
            ...options,
        });
    }
    /**
     * Pick multiple images from library
     */
    async pickMultipleImagesFromLibrary(options = {}) {
        const permissionGranted = await this.requestMediaLibraryPermission();
        if (!permissionGranted) {
            throw new Error('Permission to access media library was denied');
        }
        return ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
            allowsMultipleSelection: true,
            selectionLimit: 5,
            ...options,
        });
    }
    /**
     * Take photo with camera
     */
    async takePhoto(options = {}) {
        const permissionGranted = await this.requestCameraPermission();
        if (!permissionGranted) {
            throw new Error('Permission to access camera was denied');
        }
        return ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
            ...options,
        });
    }
    /**
     * Process and upload single image from picker result
     */
    async processAndUploadImage(result, fileName, onProgress) {
        if (result.canceled || !result.assets || result.assets.length === 0) {
            return null;
        }
        try {
            const selectedAsset = result.assets[0];
            const imageUri = selectedAsset.uri;
            return onProgress
                ? await this.uploader.uploadWithProgress(imageUri, fileName, 'image', onProgress)
                : await this.uploader.uploadFile(imageUri, fileName, 'image');
        }
        catch (error) {
            console.error('Error processing and uploading image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Process and upload multiple images from picker result
     */
    async processAndUploadMultipleImages(result, fileNamePrefix = 'image', onProgress, onFileComplete) {
        if (result.canceled || !result.assets || result.assets.length === 0) {
            return [];
        }
        const files = result.assets.map((asset, index) => ({
            uri: asset.uri,
            name: `${fileNamePrefix}-${index + 1}-${Date.now()}.jpg`,
            type: 'image'
        }));
        return this.uploader.uploadMultipleFiles(files, onProgress, onFileComplete);
    }
    /**
     * Quick upload: pick and upload in one step
     */
    async quickUploadFromLibrary(fileName, options = {}, onProgress) {
        const pickerResult = await this.pickImageFromLibrary(options);
        return this.processAndUploadImage(pickerResult, fileName || `image-${Date.now()}.jpg`, onProgress);
    }
    /**
     * Quick upload: take photo and upload in one step
     */
    async quickUploadFromCamera(fileName, options = {}, onProgress) {
        const photoResult = await this.takePhoto(options);
        return this.processAndUploadImage(photoResult, fileName || `photo-${Date.now()}.jpg`, onProgress);
    }
    /**
     * Get the underlying uploader instance for advanced usage
     */
    getUploader() {
        return this.uploader;
    }
    /**
     * Update SAS token
     */
    updateSasToken(newSasToken) {
        this.uploader.updateSasToken(newSasToken);
    }
}
exports.ExpoImageUploader = ExpoImageUploader;
//# sourceMappingURL=media-uploader.js.map