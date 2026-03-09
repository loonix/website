# Media Manager - Quick Start Guide

## 5-Minute Setup

### Step 1: Add Files to HTML

Add these lines to your HTML `<head>` section:

```html
<!-- Media Manager CSS -->
<link rel="stylesheet" href="media-manager.css">
```

Add these before closing `</body>`:

```html
<!-- Media Manager Scripts (must be after github-auth.js) -->
<script src="media-manager.js"></script>
<script src="media-manager-ui.js"></script>
<script src="designer-mode-media-integration.js"></script>
```

### Step 2: Initialize (Automatic)

If you're using Designer Mode, the media manager initializes automatically when you activate it (Ctrl+Shift+E).

Manual initialization:

```javascript
// After GitHub authentication
const mediaManager = new MediaManager(githubAuth, {
  assetsPath: 'cms/assets/images',
  indexFile: 'cms/assets-index.json'
});

await mediaManager.init();

const mediaManagerUI = new MediaManagerUI(mediaManager);
```

### Step 3: Open Media Library

**From Designer Mode:**
1. Activate Designer Mode (Ctrl+Shift+E)
2. Click "🖼️ Media Library" button

**Programmatically:**
```javascript
mediaManagerUI.open();
```

## Common Tasks

### Upload an Image

```javascript
// Via UI - easiest
mediaManagerUI.open(); // Then click Upload button

// Programmatically
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';
input.onchange = async (e) => {
  const metadata = await mediaManager.uploadImage(e.target.files[0]);
  console.log('CDN URL:', metadata.cdnUrl);
};
input.click();
```

### List All Images

```javascript
const images = mediaManager.listImages();
images.forEach(img => {
  console.log(img.filename, img.cdnUrl);
});
```

### Search Images

```javascript
const results = mediaManager.searchImages('profile');
```

### Get Image URL

```javascript
const image = mediaManager.getImageById('img-123');
if (image) {
  console.log(image.cdnUrl); // Use this in your HTML
}
```

### Delete an Image

```javascript
await mediaManager.deleteImage('img-123');
```

### Insert Image into Content

```javascript
// Set up callback
mediaManagerUI.onImageInsert = (imageData) => {
  const img = `<img src="${imageData.cdnUrl}" alt="${imageData.originalName}">`;
  document.execCommand('insertHTML', false, img);
};

// Open library for selection
mediaManagerUI.open();
```

## Keyboard Shortcuts

In Designer Mode:
- `Ctrl+Shift+E` - Toggle Designer Mode
- Double-click any image - Open Media Library

## File Structure

After upload, files are stored in GitHub:

```
your-repo/
├── cms/
│   ├── assets/
│   │   └── images/
│   │       ├── 1234567890-abc123.webp
│   │       ├── 1234567891-def456.webp
│   │       └── ...
│   └── assets-index.json
```

## CDN URLs

All images get automatic CDN URLs:

```
https://cdn.jsdelivr.net/gh/username/repo@main/cms/assets/images/filename.webp
```

Use these URLs in your HTML for optimal performance.

## Configuration

Default settings (in `media-manager.js`):

```javascript
{
  maxWidth: 1920,        // Max image width
  quality: 0.85,         // JPEG quality
  maxFileSize: 5 * 1024 * 1024,  // 5MB limit
  assetsPath: 'cms/assets/images',
  indexFile: 'cms/assets-index.json'
}
```

Override at initialization:

```javascript
new MediaManager(githubAuth, {
  maxWidth: 1280,        // Smaller images
  quality: 0.9,          // Higher quality
  maxFileSize: 10 * 1024 * 1024  // 10MB limit
});
```

## Troubleshooting

### "GitHub authentication required"
- Sign in to GitHub first
- Check that github-auth.js is loaded

### "Upload failed"
- Check file size (max 5MB)
- Verify file type (images only)
- Check repository permissions

### Images not loading
- Verify repository is public
- Check CDN URL is correct
- Clear browser cache

### Can't see Media Library button
- Activate Designer Mode (Ctrl+Shift+E)
- Check media-manager-ui.js is loaded
- Check browser console for errors

## Testing

Open test page:

```bash
open test-media-manager.html
```

Or run tests manually:

1. Authenticate with GitHub
2. Initialize Media Manager
3. Upload test images
4. Browse gallery
5. Search images
6. Copy URLs
7. Delete images

## Next Steps

- Read full documentation: `MEDIA-MANAGER-README.md`
- Check test suite: `test-media-manager.html`
- Review code: `media-manager.js`, `media-manager-ui.js`
- Integrate with your content: Use CDN URLs in HTML

## Quick Reference

```javascript
// Initialize
const mm = new MediaManager(githubAuth);
await mm.init();

// Upload
const meta = await mm.uploadImage(file);

// List
const images = mm.listImages();

// Search
const results = mm.searchImages('query');

// Delete
await mm.deleteImage('img-id');

// Stats
const stats = mm.getStorageStats();

// UI
const ui = new MediaManagerUI(mm);
ui.open();
ui.close();
```

## Support

For detailed documentation, see `MEDIA-MANAGER-README.md`

For issues, check browser console and verify:
1. GitHub authentication
2. File permissions
3. Network connectivity
4. File size and type
