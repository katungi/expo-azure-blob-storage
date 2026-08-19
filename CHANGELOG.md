# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0]

### Breaking

- `quickUploadFromLibrary` and `quickUploadFromCamera` now take a single options
  object instead of positional arguments.

  ```diff
  - await uploader.quickUploadFromLibrary(
  -   'photo.jpg',
  -   { quality: 0.8 },
  -   (progress) => console.log(progress),
  - );
  + await uploader.quickUploadFromLibrary({
  +   fileName: 'photo.jpg',
  +   options: { quality: 0.8 },
  +   onProgress: (progress) => console.log(progress),
  + });
  ```

  Both arguments are optional, so `quickUploadFromLibrary()` still works.

- `expo-constants`, `expo-file-system` and `expo-image-picker` moved from
  `dependencies` to `peerDependencies` only. They were previously declared in
  both, which pulled the whole Expo toolchain into every install. Install them
  alongside the package if your project does not already have them:

  ```bash
  npx expo install expo-constants expo-file-system expo-image-picker
  ```

- `generateFileName`, `getContentType` and `ExpoImageUploader.processAndUploadImage`
  are now private. They were internal helpers not intended as public API.

### Added

- Published to JSR as `@katungi/expo-azure-blob-storage` alongside npm.
- `onProgress` on `uploadWithProgress` now actually fires. It was previously
  accepted and silently ignored, because `FileSystem.uploadAsync` has no
  progress hook; uploads that request progress now use
  `FileSystem.createUploadTask`.
- Exported the public interface types: `AzureBlobUploaderInterface`,
  `ExpoImageUploaderInterface`, `UploadOptions`, `AzureUploadOptions`, `Config`.

### Fixed

- `uploadMultipleFiles` no longer discards already-uploaded results when it hits
  an empty entry.
- `UploadResult.response` is typed as `FileSystemUploadResult` instead of `any`.
- The npm build no longer rewrites `package.json`. `tsdown --exports` was
  mutating the manifest in place, so running the JSR build collapsed `main`,
  `types` and `exports` to ESM-only and wiped the CJS entry points.
- The `exports` map now declares per-condition `types`, so CJS and ESM
  consumers resolve the matching declaration file.
- Refreshed transitive dependency overrides to clear all high and critical
  advisories in the toolchain.

## [0.0.2]

- Dependency updates and CI fixes.
