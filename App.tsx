import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Image,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { createExpoImageUploader, createAzureBlobUploader, UploadResult, UploadProgress } from './src';

interface TestConfig {
  storageAccount: string;
  containerName: string;
  sasToken: string;
}

export default function App() {
  const [config, setConfig] = useState<TestConfig>({
    storageAccount: '', 
    containerName: '',
    sasToken: ''
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const validateConfig = (): boolean => {
    if (!config.storageAccount || !config.containerName || !config.sasToken) {
      Alert.alert('Configuration Error', 'Please fill in all Azure Blob Storage configuration fields');
      return false;
    }
    return true;
  };

  const handleUploadResult = (result: UploadResult) => {
    setUploadResults(prev => [result, ...prev]);
    
    if (result.success) {
      Alert.alert('Upload Success', `File uploaded successfully!\nURL: ${result.url}`);
    } else {
      Alert.alert('Upload Failed', result.error || 'Unknown error occurred');
    }
  };

  const handleProgress = (progress: UploadProgress) => {
    setUploadProgress(progress);
    console.log(`Upload Progress: ${Math.round((progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100)}%`);
  };

  const testPickAndUploadImage = async () => {
    if (!validateConfig()) return;
    
    setIsUploading(true);
    setUploadProgress(null);
    
    try {
      const uploader = createExpoImageUploader(config);
      
      // Check permissions first
      const permissions = await uploader.checkPermissions();
      console.log('Permissions:', permissions);
      
      const result = await uploader.quickUploadFromLibrary(
        `test-library-${Date.now()}.jpg`,
        { quality: 0.8 },
        handleProgress
      );
      
      if (result) {
        handleUploadResult(result);
        if (result.success && result.url) {
          setSelectedImage(result.url);
        }
      }
    } catch (error) {
      console.error('Pick and upload error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const testTakePhotoAndUpload = async () => {
    if (!validateConfig()) return;
    
    setIsUploading(true);
    setUploadProgress(null);
    
    try {
      const uploader = createExpoImageUploader(config);
      
      const result = await uploader.quickUploadFromCamera(
        `test-camera-${Date.now()}.jpg`,
        { quality: 0.8 },
        handleProgress
      );
      
      if (result) {
        handleUploadResult(result);
        if (result.success && result.url) {
          setSelectedImage(result.url);
        }
      }
    } catch (error) {
      console.error('Take photo and upload error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const testMultipleImageUpload = async () => {
    if (!validateConfig()) return;
    
    setIsUploading(true);
    setUploadProgress(null);
    
    try {
      const uploader = createExpoImageUploader(config);
      
      const pickerResult = await uploader.pickMultipleImagesFromLibrary({
        selectionLimit: 3,
        quality: 0.8
      });
      
      if (!pickerResult.canceled && pickerResult.assets) {
        const results = await uploader.processAndUploadMultipleImages(
          pickerResult,
          'test-multiple',
          (fileIndex, progress) => {
            console.log(`File ${fileIndex + 1} progress:`, progress);
            setUploadProgress(progress);
          },
          (fileIndex, result) => {
            console.log(`File ${fileIndex + 1} completed:`, result);
            handleUploadResult(result);
          }
        );
        
        console.log('All uploads completed:', results);
      }
    } catch (error) {
      console.error('Multiple upload error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const testDirectUpload = async () => {
    if (!validateConfig()) return;
    
    Alert.alert(
      'Direct Upload Test',
      'This would require a file URI. In a real scenario, you would have a file path to upload.',
      [
        { text: 'OK', onPress: () => console.log('Direct upload test acknowledged') }
      ]
    );
  };

  const clearResults = () => {
    setUploadResults([]);
    setSelectedImage(null);
  };

  const renderUploadButton = (title: string, onPress: () => void, disabled: boolean = false) => (
    <TouchableOpacity 
      style={[styles.button, disabled && styles.buttonDisabled]} 
      onPress={onPress}
      disabled={disabled || isUploading}
    >
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderProgress = () => {
    if (!uploadProgress) return null;
    
    const percentage = Math.round((uploadProgress.totalBytesWritten / uploadProgress.totalBytesExpectedToWrite) * 100);
    
    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Uploading... {percentage}%</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
      </View>
    );
  };

  const renderResults = () => {
    if (uploadResults.length === 0) return null;
    
    return (
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Upload Results</Text>
          <TouchableOpacity onPress={clearResults}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
        
        {uploadResults.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={[styles.resultStatus, { color: result.success ? '#4CAF50' : '#F44336' }]}>
              {result.success ? '✓ Success' : '✗ Failed'}
            </Text>
            {result.fileName && <Text style={styles.resultText}>File: {result.fileName}</Text>}
            {result.url && <Text style={styles.resultText}>URL: {result.url}</Text>}
            {result.size && <Text style={styles.resultText}>Size: {Math.round(result.size / 1024)} KB</Text>}
            {result.error && <Text style={styles.errorText}>Error: {result.error}</Text>}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Azure Blob Storage Test</Text>
        
        {/* Configuration Section */}
        <View style={styles.configSection}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Storage Account Name"
            value={config.storageAccount}
            onChangeText={(text) => setConfig(prev => ({ ...prev, storageAccount: text }))}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Container Name"
            value={config.containerName}
            onChangeText={(text) => setConfig(prev => ({ ...prev, containerName: text }))}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TextInput
            style={styles.input}
            placeholder="SAS Token"
            value={config.sasToken}
            onChangeText={(text) => setConfig(prev => ({ ...prev, sasToken: text }))}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
        </View>

        {/* Upload Testing Section */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Upload Tests</Text>
          
          {renderUploadButton('Pick Image from Library', testPickAndUploadImage)}
          {renderUploadButton('Take Photo & Upload', testTakePhotoAndUpload)}
          {renderUploadButton('Upload Multiple Images', testMultipleImageUpload)}
          {renderUploadButton('Direct Upload (Demo)', testDirectUpload)}
          
          {isUploading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Uploading...</Text>
            </View>
          )}
          
          {renderProgress()}
        </View>

        {/* Image Preview */}
        {selectedImage && (
          <View style={styles.imagePreview}>
            <Text style={styles.sectionTitle}>Last Uploaded Image</Text>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          </View>
        )}
        
        {/* Results Section */}
        {renderResults()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  configSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#666',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  progressContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  progressText: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  imagePreview: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  resultItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
  },
  resultStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 5,
  },
});
