import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { AzureBlobUploader } from './uploader';
export class ExpoImageUploader {
    constructor(config) {
        this.uploader = new AzureBlobUploader(config);
    }
    /**
     * Request permission to access media library
     */
    async requestMediaLibraryPermission() {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            return status === 'granted';
        }
        return true;
    }
    /**
     * Request permission to access camera
     */
    async requestCameraPermission() {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            return status === 'granted';
        }
        return true;
    }
    /**
     * Check if permissions are already granted
     */
    async checkPermissions() {
        if (Platform.OS === 'web') {
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
//# sourceMappingURL=media-uploader.js.map