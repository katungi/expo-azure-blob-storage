import * as ImagePicker from 'expo-image-picker';   
import { Platform } from 'react-native';
import { AzureBlobUploader } from './uploader';
import { UploadProgress, UploadResult, AzureBlobConfig, ImagePickerOptions } from '../types';

export class ExpoImageUploader {
  private uploader: AzureBlobUploader;

  constructor(config: AzureBlobConfig) {
    this.uploader = new AzureBlobUploader(config);
  }

  /**
   * Request permission to access media library
   */
  async requestMediaLibraryPermission(): Promise<boolean> {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    }
    return true;
  }

  /**
   * Request permission to access camera
   */
  async requestCameraPermission(): Promise<boolean> {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    }
    return true;
  }

  /**
   * Check if permissions are already granted
   */
  async checkPermissions(): Promise<{ camera: boolean; mediaLibrary: boolean }> {
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
  async pickImageFromLibrary(options: ImagePickerOptions = {}): Promise<ImagePicker.ImagePickerResult> {
    const permissionGranted = await this.requestMediaLibraryPermission();

    if (!permissionGranted) {
      throw new Error('Permission to access media library was denied');
    }

    const defaultOptions: ImagePicker.ImagePickerOptions = {
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
  async pickMultipleImagesFromLibrary(options: ImagePickerOptions & { selectionLimit?: number } = {}): Promise<ImagePicker.ImagePickerResult> {
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
  async takePhoto(options: ImagePickerOptions = {}): Promise<ImagePicker.ImagePickerResult> {
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
  async processAndUploadImage(
    result: ImagePicker.ImagePickerResult,
    fileName: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult | null> {
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    try {
      const selectedAsset = result.assets[0];
      const imageUri = selectedAsset.uri;

      return onProgress
        ? await this.uploader.uploadWithProgress(imageUri, fileName, 'image', onProgress)
        : await this.uploader.uploadFile(imageUri, fileName, 'image');
    } catch (error) {
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
  async processAndUploadMultipleImages(
    result: ImagePicker.ImagePickerResult,
    fileNamePrefix: string = 'image',
    onProgress?: (fileIndex: number, progress: UploadProgress) => void,
    onFileComplete?: (fileIndex: number, result: UploadResult) => void
  ): Promise<UploadResult[]> {
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return [];
    }

    const files = result.assets.map((asset, index) => ({
      uri: asset.uri,
      name: `${fileNamePrefix}-${index + 1}-${Date.now()}.jpg`,
      type: 'image' as const
    }));

    return this.uploader.uploadMultipleFiles(files, onProgress, onFileComplete);
  }

  /**
   * Quick upload: pick and upload in one step
   */
  async quickUploadFromLibrary(
    fileName?: string,
    options: ImagePickerOptions = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult | null> {
    const pickerResult = await this.pickImageFromLibrary(options);
    return this.processAndUploadImage(
      pickerResult,
      fileName || `image-${Date.now()}.jpg`,
      onProgress
    );
  }

  /**
   * Quick upload: take photo and upload in one step
   */
  async quickUploadFromCamera(
    fileName?: string,
    options: ImagePickerOptions = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult | null> {
    const photoResult = await this.takePhoto(options);
    return this.processAndUploadImage(
      photoResult,
      fileName || `photo-${Date.now()}.jpg`,
      onProgress
    );
  }

  /**
   * Get the underlying uploader instance for advanced usage
   */
  getUploader(): AzureBlobUploader {
    return this.uploader;
  }

  /**
   * Update SAS token
   */
  updateSasToken(newSasToken: string): void {
    this.uploader.updateSasToken(newSasToken);
  }
}
