# 🚀 Expo Azure Blob Storage

<p align="center">
  <img src="https://img.shields.io/npm/v/expo-azure-blob-storage" alt="npm version" />
  <img src="https://img.shields.io/npm/dt/expo-azure-blob-storage" alt="npm downloads" />
  <img src="https://img.shields.io/npm/l/expo-azure-blob-storage" alt="license" />
  <img src="https://img.shields.io/github/issues/katungi/expo-azure-blob-storage" alt="issues" />
</p>

<p align="center">
  <strong>Easy Azure Blob Storage uploads for Expo and React Native applications</strong>
</p>

<p align="center">
  A powerful, type-safe library that simplifies Azure Blob Storage integration with built-in Expo ImagePicker support, progress tracking, and comprehensive error handling.
</p>

---

## ✨ Features

- 🔥 **Easy Integration** - Simple setup with Azure Blob Storage
- 📱 **Expo ImagePicker Support** - Built-in image/camera functionality
- 📊 **Progress Tracking** - Real-time upload progress monitoring
- 🔒 **SAS Token Management** - Secure token handling and refresh
- 📝 **Full TypeScript Support** - Complete type definitions
- 🔄 **Multiple File Uploads** - Batch upload with progress tracking
- ⚡ **Framework Agnostic** - Core uploader works with any React Native app
- 🛡️ **Error Handling** - Comprehensive error management
- 🎯 **Permission Management** - Automatic permission requests
- 📱 **Cross-Platform** - Works on iOS, Android, and Web

## 📦 Installation

```bash
npm install expo-azure-blob-storage
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npx expo install expo-file-system expo-image-picker
```

**Manual Installation:**
```bash
npm install expo-file-system expo-image-picker
```

## 🚀 Quick Start

### Basic File Upload

```typescript
import { AzureBlobUploader } from 'expo-azure-blob-storage';

const uploader = new AzureBlobUploader({
  storageAccount: 'your-storage-account',
  containerName: 'your-container',
  sasToken: 'your-sas-token'
});

const uploadFile = async (fileUri: string) => {
  const result = await uploader.uploadFile(fileUri, 'my-image.jpg', 'image');
  
  if (result.success) {
    console.log('✅ Upload successful!');
    console.log('📂 File URL:', result.url);
    console.log('📊 File Size:', result.size, 'bytes');
  } else {
    console.error('❌ Upload failed:', result.error);
  }
};
```

### Expo Image Picker Integration

```typescript
import { ExpoImageUploader } from 'expo-azure-blob-storage';

const imageUploader = new ExpoImageUploader({
  storageAccount: 'your-storage-account',
  containerName: 'your-container',
  sasToken: 'your-sas-token'
});

const uploadFromLibrary = async () => {
  const result = await imageUploader.quickUploadFromLibrary(
    'my-photo.jpg',
    { quality: 0.8 },
    (progress) => {
      const percent = Math.round((progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100);
      console.log(`Upload progress: ${percent}%`);
    }
  );
  
  if (result?.success) {
    console.log('🎉 Image uploaded:', result.url);
  }
};
```

## 📚 API Reference

### AzureBlobUploader

The core uploader class for Azure Blob Storage operations.

#### Constructor

```typescript
new AzureBlobUploader(config: AzureBlobConfig)
```

#### Methods

##### `uploadFile(fileUri, fileName, mediaType?)`

Upload a single file to Azure Blob Storage.

```typescript
const result = await uploader.uploadFile(
  'file:///path/to/file.jpg',
  'my-image.jpg',
  'image'
);
```

##### `uploadWithProgress(fileUri, fileName, mediaType?, onProgress?)`

Upload a file with progress tracking.

```typescript
const result = await uploader.uploadWithProgress(
  fileUri,
  'image.jpg',
  'image',
  (progress) => console.log(`${progress.totalBytesWritten}/${progress.totalBytesExpectedToWrite}`)
);
```

##### `uploadMultipleFiles(files, onProgress?, onFileComplete?)`

Upload multiple files with batch progress tracking.

```typescript
const files = [
  { uri: 'file:///path/1.jpg', name: 'image1.jpg', type: 'image' },
  { uri: 'file:///path/2.jpg', name: 'image2.jpg', type: 'image' }
];

const results = await uploader.uploadMultipleFiles(
  files,
  (fileIndex, progress) => console.log(`File ${fileIndex + 1} progress:`, progress),
  (fileIndex, result) => console.log(`File ${fileIndex + 1} completed:`, result)
);
```

### ExpoImageUploader

Expo-specific image handling built on top of AzureBlobUploader.

#### Methods

##### `quickUploadFromLibrary(fileName?, options?, onProgress?)`

Pick an image from the library and upload in one step.

```typescript
const result = await imageUploader.quickUploadFromLibrary(
  'profile-pic.jpg',
  { quality: 0.8, allowsEditing: true },
  (progress) => console.log('Progress:', progress)
);
```

##### `quickUploadFromCamera(fileName?, options?, onProgress?)`

Take a photo and upload in one step.

```typescript
const result = await imageUploader.quickUploadFromCamera(
  'camera-photo.jpg',
  { quality: 0.9, aspect: [16, 9] }
);
```

##### `pickMultipleImagesFromLibrary(options?)`

Pick multiple images from the library.

```typescript
const pickerResult = await imageUploader.pickMultipleImagesFromLibrary({
  selectionLimit: 5,
  quality: 0.8
});
```

## 🔧 Configuration

### AzureBlobConfig

```typescript
interface AzureBlobConfig {
  storageAccount: string;    // Azure storage account name
  containerName: string;     // Blob container name
  sasToken: string;          // SAS token with required permissions
}
```

### ImagePickerOptions

```typescript
interface ImagePickerOptions {
  quality?: number;                    // Image quality (0-1)
  aspect?: [number, number];           // Aspect ratio [width, height]
  allowsEditing?: boolean;             // Allow editing after selection
  allowsMultipleSelection?: boolean;   // Allow multiple image selection
  selectionLimit?: number;             // Maximum number of images to select
}
```

## 🎯 Advanced Usage

### Upload with Progress Tracking

```typescript
const uploadWithProgressBar = async (fileUri: string) => {
  const result = await uploader.uploadWithProgress(
    fileUri,
    'document.pdf',
    'document',
    (progress) => {
      const percentage = Math.round(
        (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100
      );
      
      // Update your UI progress bar
      setUploadProgress(percentage);
      
      console.log(`📊 Upload Progress: ${percentage}%`);
    }
  );
  
  return result;
};
```

### Multiple File Upload with Error Handling

```typescript
const uploadMultipleWithErrorHandling = async (files: Array<{uri: string, name: string}>) => {
  const results = await uploader.uploadMultipleFiles(
    files.map(f => ({ ...f, type: 'image' as const })),
    (fileIndex, progress) => {
      console.log(`File ${fileIndex + 1} progress:`, progress);
    },
    (fileIndex, result) => {
      if (result.success) {
        console.log(`✅ File ${fileIndex + 1} uploaded successfully`);
      } else {
        console.error(`❌ File ${fileIndex + 1} failed:`, result.error);
      }
    }
  );
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`📊 Upload Summary: ${successful.length} successful, ${failed.length} failed`);
  
  return { successful, failed };
};
```

## 📱 React Native Integration

### Complete Upload Component

```typescript
import React, { useState } from 'react';
import { View, Button, Text, ProgressBarAndroid } from 'react-native';
import { ExpoImageUploader } from 'expo-azure-blob-storage';

const ImageUploadComponent = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const uploader = new ExpoImageUploader({
    storageAccount: 'your-account',
    containerName: 'your-container',
    sasToken: 'your-sas-token'
  });

  const handleUpload = async () => {
    setUploading(true);
    setProgress(0);
    
    try {
      const result = await uploader.quickUploadFromLibrary(
        undefined, // Auto-generate filename
        { quality: 0.8, allowsEditing: true },
        (progressData) => {
          const percentage = Math.round(
            (progressData.totalBytesWritten / progressData.totalBytesExpectedToWrite) * 100
          );
          setProgress(percentage);
        }
      );
      
      if (result?.success) {
        setUploadedUrl(result.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View>
      <Button title="Upload Image" onPress={handleUpload} disabled={uploading} />
      
      {uploading && (
        <View>
          <Text>Uploading... {progress}%</Text>
          <ProgressBarAndroid styleAttr="Horizontal" progress={progress / 100} />
        </View>
      )}
      
      {uploadedUrl && (
        <Text>✅ Upload successful! URL: {uploadedUrl}</Text>
      )}
    </View>
  );
};
```

## 🛡️ Security Best Practices

### SAS Token Security

```typescript
// ✅ Good: Fetch SAS tokens from your secure backend
const fetchSasToken = async () => {
  const response = await fetch('https://your-api.com/sas-token', {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  return response.json();
};

// ❌ Bad: Never hardcode SAS tokens in your app
const badConfig = {
  storageAccount: 'account',
  containerName: 'container',
  sasToken: 'sv=2023-01-03&ss=b&srt=sco&sp=rwdlacx&se=2024-01-01T00:00:00Z&st=2023-01-01T00:00:00Z&spr=https&sig=...'
};
```

### Token Permissions

Create SAS tokens with minimal required permissions:

```bash
# Minimum permissions for uploads
az storage container generate-sas \
  --account-name youraccount \
  --name yourcontainer \
  --permissions acw \
  --start 2024-01-01T00:00:00Z \
  --expiry 2024-01-02T00:00:00Z
```

## 🔍 Error Handling

### Common Error Scenarios

```typescript
const handleUploadWithErrorHandling = async (fileUri: string) => {
  try {
    const result = await uploader.uploadFile(fileUri, 'image.jpg', 'image');
    
    if (!result.success) {
      switch (result.error) {
        case 'File does not exist':
          console.error('📁 File not found');
          break;
        case 'File is empty':
          console.error('📄 Empty file');
          break;
        case 'File size exceeds maximum':
          console.error('📊 File too large');
          break;
        default:
          console.error('❌ Upload failed:', result.error);
      }
    }
    
    return result;
  } catch (error) {
    if (error.message.includes('Network')) {
      console.error('🌐 Network error - check internet connection');
    } else if (error.message.includes('Permission')) {
      console.error('🔐 Permission denied - check SAS token');
    } else {
      console.error('💥 Unexpected error:', error);
    }
    
    return { success: false, error: error.message };
  }
};
```

## 🔧 Troubleshooting

### Common Issues

**1. "SAS token is invalid" Error**
```typescript
// Check token permissions and expiry
const config = uploader.getConfig();
console.log('Storage Account:', config.storageAccount);
console.log('Container:', config.containerName);
console.log('Base URL:', config.baseUrl);
```

**2. "Permission denied" on iOS**
```typescript
// Check and request permissions
const permissions = await imageUploader.checkPermissions();
if (!permissions.mediaLibrary) {
  await imageUploader.requestMediaLibraryPermission();
}
```

**3. "File not found" Error**
```typescript
// Verify file exists before upload
const fileInfo = await FileSystem.getInfoAsync(fileUri);
console.log('File exists:', fileInfo.exists);
console.log('File size:', fileInfo.size);
```

## 📝 TypeScript Support

This library is written in TypeScript and includes complete type definitions:

```typescript
import { 
  AzureBlobUploader, 
  ExpoImageUploader,
  AzureBlobConfig,
  UploadResult,
  UploadProgress,
  MediaType,
  ImagePickerOptions
} from 'expo-azure-blob-storage';
```

### Type Definitions

```typescript
interface UploadResult {
  success: boolean;
  fileName?: string;
  url?: string;
  size?: number;
  contentType?: string;
  error?: string;
}

interface UploadProgress {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
}

interface AzureBlobConfig {
  storageAccount: string;
  containerName: string;
  sasToken: string;
}

type MediaType = 'image' | 'video' | 'document';
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines for details on our code of conduct and development process.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/katungi/expo-azure-blob-storage.git

# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/katungi/expo-azure-blob-storage)
- [npm Package](https://www.npmjs.com/package/expo-azure-blob-storage)
- [Issues](https://github.com/katungi/expo-azure-blob-storage/issues)

## ❤️ Support

If you found this library helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📖 Improving documentation

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/katungi">Katungi Dennis</a>
</p> 