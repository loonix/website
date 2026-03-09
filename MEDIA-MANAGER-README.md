# Media Manager System - Complete Documentation

## Overview

The Media Manager is a comprehensive image and media management system for the Designer Mode CMS. It provides drag-and-drop upload, client-side optimization, GitHub storage integration, and a beautiful gallery UI for managing all your website assets.

## Features

### 1. Image Upload
- **Drag & Drop**: Intuitive drag-and-drop interface
- **File Picker**: Traditional file selection as fallback
- **Multiple Files**: Batch upload support
- **Format Support**: JPG, PNG, GIF, SVG, WebP
- **Size Limit**: 5MB per file (configurable)

### 2. Client-Side Optimization
- **Auto-Resize**: Maximum width 1920px (configurable)
- **Compression**: 85% quality (configurable)
- **WebP Conversion**: Automatic conversion to WebP for better compression
- **Canvas-Based**: Fast client-side processing
- **Progress Tracking**: Real-time upload progress

### 3. GitHub Storage
- **Repository Storage**: Images stored in `cms/assets/images/`
- **Index File**: `cms/assets-index.json` tracks all assets
- **Metadata Tracking**: Filename, size, type, dimensions, SHA, upload date
- **CDN URLs**: Automatic jsDelivr CDN URL generation
- **Version Control**: Full Git history of all changes

### 4. Image Browser & Gallery
- **Grid View**: Visual grid of thumbnails
- **List View**: Detailed list view
- **Search**: Real-time search by filename
- **Filter**: Filter by image type
- **Preview Modal**: Full-size preview with metadata
- **Quick Actions**: Copy URL, delete, view properties

### 5. Image Properties
- **Dimensions**: Width and height
- **File Size**: Human-readable size format
- **Type**: MIME type
- **Upload Date**: Timestamp of upload
- **SHA**: Git SHA for version tracking
- **CDN URL**: Ready-to-use CDN link

## Installation

### 1. Include Required Files

Add these files to your HTML in the following order:

```html
<!-- Core Dependencies -->
<script src="github-client.js"></script>
<script src="github-auth.js"></script>

<!-- Media Manager -->
<script src="media-manager.js"></script>
<script src="media-manager-ui.js"></script>
<link rel="stylesheet" href="media-manager.css">
```

### 2. Initialize Media Manager

```javascript
// After GitHub authentication
const mediaManager = new MediaManager(githubAuth, {
  assetsPath: 'cms/assets/images',
  indexFile: 'cms/assets-index.json',
  maxWidth: 1920,
  quality: 0.85,
  maxFileSize: 5 * 1024 * 1024 // 5MB
});

// Initialize
await mediaManager.init();

// Create UI
const mediaManagerUI = new MediaManagerUI(mediaManager);
```

## Usage

### Opening the Media Library

```javascript
// Open media library
mediaManagerUI.open();

// Close media library
mediaManagerUI.close();
```

### Uploading Images

#### Via UI
1. Click "Upload" button
2. Drag and drop images or click to browse
3. Wait for upload progress
4. View uploaded images in gallery

#### Programmatically
```javascript
// Upload single image
const fileInput = document.querySelector('input[type="file"]');
const metadata = await mediaManager.uploadImage(fileInput.files[0]);

console.log('Uploaded:', metadata.filename);
console.log('CDN URL:', metadata.cdnUrl);
```

### Listing Images

```javascript
// Get all images
const images = mediaManager.listImages();

// Search images
const results = mediaManager.searchImages('profile');

// Get statistics
const stats = mediaManager.getStorageStats();
console.log('Total images:', stats.totalImages);
console.log('Total size:', stats.totalSizeFormatted);
```

### Deleting Images

```javascript
// Delete by ID
await mediaManager.deleteImage('img-1234567890-abc123');

// Batch delete
const results = await mediaManager.batchDelete(['id1', 'id2', 'id3']);
```

### Inserting Images into Content

```javascript
// Set up insert callback
mediaManagerUI.onImageInsert = (imageData) => {
  const imgHtml = `<img src="${imageData.cdnUrl}" alt="${imageData.originalName}">`;
  document.execCommand('insertHTML', false, imgHtml);
};

// Open media library for selection
mediaManagerUI.open();
```

## API Reference

### MediaManager Class

#### Constructor
```javascript
new MediaManager(githubAuth, config)
```

**Parameters:**
- `githubAuth` (Object): Authenticated GitHubAuth instance
- `config` (Object): Configuration options
  - `assetsPath` (String): Path to store images (default: 'cms/assets/images')
  - `indexFile` (String): Path to index file (default: 'cms/assets-index.json')
  - `maxWidth` (Number): Maximum image width (default: 1920)
  - `quality` (Number): JPEG quality 0-1 (default: 0.85)
  - `maxFileSize` (Number): Max file size in bytes (default: 5MB)

#### Methods

##### `init()`
Initialize the media manager and load assets index.

```javascript
await mediaManager.init();
```

##### `uploadImage(file)`
Upload a single image to GitHub.

```javascript
const metadata = await mediaManager.uploadImage(file);
```

**Returns:** Object with image metadata

##### `uploadMultipleImages(files)`
Upload multiple images.

```javascript
const results = await mediaManager.uploadMultipleImages([file1, file2]);
```

**Returns:** Array of metadata objects

##### `listImages()`
Get all images sorted by upload date.

```javascript
const images = mediaManager.listImages();
```

**Returns:** Array of image metadata objects

##### `searchImages(query)`
Search images by filename.

```javascript
const results = mediaManager.searchImages('profile');
```

**Returns:** Array of matching images

##### `deleteImage(id)`
Delete an image by ID.

```javascript
await mediaManager.deleteImage('img-123');
```

##### `getStorageStats()`
Get storage statistics.

```javascript
const stats = mediaManager.getStorageStats();
```

**Returns:** Statistics object with total images, size, and type breakdown

### MediaManagerUI Class

#### Constructor
```javascript
new MediaManagerUI(mediaManager, config)
```

**Parameters:**
- `mediaManager` (Object): MediaManager instance
- `config` (Object): Configuration options
  - `containerId` (String): Container element ID (default: 'media-manager-container')
  - `maxThumbnails` (Number): Max thumbnails to display (default: 50)
  - `thumbnailSize` (Number): Thumbnail size in pixels (default: 200)

#### Methods

##### `open()`
Open the media library UI.

##### `close()`
Close the media library UI.

##### `showUpload()`
Show upload panel.

##### `showGallery()`
Show gallery panel.

##### `refreshGallery()`
Refresh the gallery with latest images.

#### Events

##### `onImageSelect`
Called when an image is selected.

```javascript
mediaManagerUI.onImageSelect = (imageData) => {
  console.log('Selected:', imageData);
};
```

##### `onImageInsert`
Called when an image is inserted into content.

```javascript
mediaManagerUI.onImageInsert = (imageData) => {
  console.log('Insert:', imageData);
};
```

## Image Metadata

Each uploaded image has the following metadata:

```javascript
{
  id: 'img-1234567890-abc123',     // Unique ID
  filename: '1234567890-abc123.webp', // Stored filename
  originalName: 'photo.jpg',          // Original filename
  size: 123456,                       // File size in bytes
  type: 'image/webp',                 // MIME type
  width: 1920,                        // Image width
  height: 1080,                       // Image height
  uploadDate: '2024-03-09T...',      // ISO timestamp
  sha: 'abc123...',                   // Git SHA
  cdnUrl: 'https://cdn.jsdelivr.net/gh/...', // CDN URL
  rawUrl: 'https://raw.githubusercontent.com/...' // Raw URL
}
```

## CDN URLs

Images are automatically served through jsDelivr CDN for optimal performance:

```
https://cdn.jsdelivr.net/gh/username/repo@branch/cms/assets/images/filename.webp
```

This provides:
- Global CDN delivery
- Automatic caching
- Fast loading worldwide
- HTTPS support

## Responsive Images

Generate responsive image sets for automatic adaptation:

```javascript
const responsiveSet = mediaManager.generateResponsiveSet('image.webp');

// Use in HTML
<img srcset="${responsiveSet.srcset}"
     sizes="${responsiveSet.sizes}"
     src="${responsiveSet.src}"
     width="${responsiveSet.width}"
     height="${responsiveSet.height}"
     loading="lazy">
```

## Security

### File Validation
- **Type Checking**: Only allows image MIME types
- **Size Limits**: Configurable maximum file size
- **Sanitization**: Automatic filename sanitization

### GitHub Permissions
- **Scope**: Requires `repo` scope for write access
- **Authentication**: Must be authenticated before operations
- **Error Handling**: Graceful failure with user feedback

## Troubleshooting

### Upload Fails
1. Check GitHub authentication status
2. Verify repository permissions
3. Check file size (max 5MB)
4. Verify file type is supported

### Images Not Showing
1. Check CDN URL is accessible
2. Verify GitHub repository is public
3. Clear browser cache
4. Check browser console for errors

### Performance Issues
1. Reduce `maxWidth` setting
2. Lower `quality` setting
3. Use WebP format
4. Enable lazy loading

## Best Practices

### 1. Image Optimization
- Use appropriate dimensions for your use case
- Compress images before upload when possible
- Use WebP format for better compression
- Implement lazy loading for image-heavy pages

### 2. File Organization
- Use descriptive filenames before upload
- Group related images together
- Regular cleanup of unused images
- Monitor storage usage

### 3. CDN Usage
- Always use CDN URLs in production
- Implement cache busting for updates
- Use responsive images for better performance
- Add loading="lazy" to below-fold images

### 4. Error Handling
- Always wrap upload operations in try-catch
- Provide user feedback for long operations
- Handle network failures gracefully
- Implement retry logic for critical uploads

## Integration with Designer Mode

The Media Manager integrates seamlessly with Designer Mode:

```javascript
// In designer-mode.js
this.mediaManager = new MediaManager(this.githubAuth);
this.mediaManagerUI = new MediaManagerUI(this.mediaManager);

// Add to admin panel
const mediaButton = document.createElement('button');
mediaButton.textContent = '🖼️ Media Library';
mediaButton.onclick = () => this.mediaManagerUI.open();
```

## Testing

Use the included test suite to verify functionality:

```bash
# Open test page
open test-media-manager.html
```

Test coverage includes:
- Authentication
- Upload (single/multiple)
- Gallery browsing
- Search and filter
- Image deletion
- Statistics
- Insertion into content

## Performance Optimization

### Client-Side
- Canvas-based optimization is fast and efficient
- Images are resized before upload to reduce bandwidth
- WebP conversion provides better compression
- Lazy loading for thumbnails

### Server-Side
- GitHub storage provides unlimited scalability
- CDN delivery ensures fast loading worldwide
- Automatic caching through CDN
- Git-based version control

## Future Enhancements

Potential features for future versions:
- Video upload support
- Image editing (crop, rotate, filters)
- Bulk operations (tag, categorize)
- Advanced search (by size, date, type)
- Image gallery generation
- Automatic alt-text suggestion
- EXIF data preservation
- Watermarking support

## License

Part of the Designer Mode CMS project.

## Support

For issues and questions:
1. Check browser console for errors
2. Verify GitHub authentication
3. Review this documentation
4. Check test suite for examples
5. Open an issue on GitHub

## Changelog

### Version 1.0.0 (2024-03-09)
- Initial release
- Drag-and-drop upload
- GitHub storage integration
- Gallery UI
- Search and filter
- Image optimization
- CDN URL generation
- Statistics and metadata
