/**
 * MEDIA MANAGER - Image and Media Management System for Designer Mode CMS
 * Handles image upload, optimization, storage, and retrieval via GitHub
 */

class MediaManager {
  constructor(githubAuth, config = {}) {
    this.githubAuth = githubAuth;
    this.assetsPath = config.assetsPath || 'cms/assets/images';
    this.indexFile = config.indexFile || 'cms/assets-index.json';
    this.assets = [];

    // Configuration
    this.maxWidth = config.maxWidth || 1920;
    this.quality = config.quality || 0.85;
    this.maxFileSize = config.maxFileSize || 5 * 1024 * 1024; // 5MB
    this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];

    // GitHub repository info (will be loaded from githubAuth)
    this.repoOwner = null;
    this.repoName = null;
    this.branch = 'main';

    // Event callbacks
    this.onUploadProgress = null;
    this.onUploadComplete = null;
    this.onUploadError = null;
  }

  /**
   * Initialize the media manager
   */
  async init() {
    if (!this.githubAuth || !this.githubAuth.isAuthenticated) {
      throw new Error('GitHub authentication required');
    }

    // Load repository info from githubAuth
    this.repoOwner = this.githubAuth.config?.owner;
    this.repoName = this.githubAuth.config?.repo;
    this.branch = this.githubAuth.config?.branch || 'main';

    // Load assets index
    await this.loadAssetsIndex();
  }

  /**
   * Load assets index from GitHub
   */
  async loadAssetsIndex() {
    try {
      const indexData = await this.githubAuth.loadFromGitHub(this.indexFile);
      if (indexData && Array.isArray(indexData.assets)) {
        this.assets = indexData.assets;
      } else {
        // Create new index if it doesn't exist
        this.assets = [];
        await this.saveAssetsIndex();
      }
    } catch (error) {
      console.log('Assets index not found, creating new one');
      this.assets = [];
      await this.saveAssetsIndex();
    }
  }

  /**
   * Save assets index to GitHub
   */
  async saveAssetsIndex() {
    const indexData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      assets: this.assets
    };

    await this.githubAuth.saveToGitHub(
      indexData,
      this.indexFile,
      'Update assets index'
    );
  }

  /**
   * Upload an image to GitHub
   * @param {File} file - The file to upload
   * @returns {Promise<Object>} - Metadata about the uploaded image
   */
  async uploadImage(file) {
    // Validate file
    this.validateFile(file);

    // Optimize image
    const optimizedBlob = await this.optimizeImage(file, this.maxWidth, this.quality);

    // Generate unique filename
    const filename = this.generateFilename(file.name, await this.getFileType(optimizedBlob));

    // Convert to base64
    const base64 = await this.fileToBase64(optimizedBlob);

    // Create file path
    const filePath = `${this.assetsPath}/${filename}`;

    // Upload to GitHub
    if (this.onUploadProgress) {
      this.onUploadProgress({ stage: 'uploading', progress: 0 });
    }

    try {
      const response = await this.githubAuth.api.repos.createOrUpdateFileContents({
        owner: this.repoOwner,
        repo: this.repoName,
        path: filePath,
        message: `Upload image: ${filename}`,
        content: base64,
        branch: this.branch
      });

      if (this.onUploadProgress) {
        this.onUploadProgress({ stage: 'uploading', progress: 100 });
      }

      // Get SHA from response
      const sha = response.data.content.sha;

      // Create metadata
      const metadata = {
        id: this.generateId(),
        filename: filename,
        originalName: file.name,
        size: optimizedBlob.size,
        type: optimizedBlob.type,
        width: 0,
        height: 0,
        uploadDate: new Date().toISOString(),
        sha: sha,
        cdnUrl: this.generateCDNUrl(filename),
        rawUrl: this.generateRawUrl(filename)
      };

      // Get dimensions
      const dimensions = await this.getImageDimensions(optimizedBlob);
      metadata.width = dimensions.width;
      metadata.height = dimensions.height;

      // Add to assets index
      this.assets.push(metadata);
      await this.saveAssetsIndex();

      if (this.onUploadComplete) {
        this.onUploadComplete(metadata);
      }

      return metadata;
    } catch (error) {
      if (this.onUploadError) {
        this.onUploadError(error);
      }
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple images
   * @param {File[]} files - Array of files to upload
   * @returns {Promise<Object[]>} - Array of metadata objects
   */
  async uploadMultipleImages(files) {
    const results = [];
    for (const file of files) {
      try {
        const metadata = await this.uploadImage(file);
        results.push(metadata);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        results.push({ error: error.message, file: file.name });
      }
    }
    return results;
  }

  /**
   * List all images
   * @returns {Array} - Array of image metadata
   */
  listImages() {
    return this.assets.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  }

  /**
   * Search images by filename
   * @param {string} query - Search query
   * @returns {Array} - Filtered array of image metadata
   */
  searchImages(query) {
    const lowerQuery = query.toLowerCase();
    return this.assets.filter(asset =>
      asset.filename.toLowerCase().includes(lowerQuery) ||
      asset.originalName.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get image metadata by ID
   * @param {string} id - Image ID
   * @returns {Object|null} - Image metadata or null
   */
  getImageById(id) {
    return this.assets.find(asset => asset.id === id) || null;
  }

  /**
   * Delete an image
   * @param {string} id - Image ID
   */
  async deleteImage(id) {
    const asset = this.getImageById(id);
    if (!asset) {
      throw new Error('Image not found');
    }

    const filePath = `${this.assetsPath}/${asset.filename}`;

    try {
      // Get current file SHA
      const fileData = await this.githubAuth.api.repos.getContent({
        owner: this.repoOwner,
        repo: this.repoName,
        path: filePath,
        ref: this.branch
      });

      // Delete file from GitHub
      await this.githubAuth.api.repos.deleteFile({
        owner: this.repoOwner,
        repo: this.repoName,
        path: filePath,
        message: `Delete image: ${asset.filename}`,
        sha: fileData.data.sha,
        branch: this.branch
      });

      // Remove from assets index
      this.assets = this.assets.filter(a => a.id !== id);
      await this.saveAssetsIndex();

      return { success: true };
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   */
  validateFile(file) {
    if (!this.allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${this.allowedTypes.join(', ')}`);
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`);
    }
  }

  /**
   * Optimize image using canvas
   * @param {File} file - Original file
   * @param {number} maxWidth - Maximum width
   * @param {number} quality - JPEG quality (0-1)
   * @returns {Promise<Blob>} - Optimized image blob
   */
  optimizeImage(file, maxWidth, quality) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to optimize image'));
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));

      // Load image from file
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Generate unique filename
   * @param {string} originalName - Original filename
   * @param {string} type - File type/extension
   * @returns {string} - Unique filename
   */
  generateFilename(originalName, type) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = type.split('/')[1] || 'webp';
    return `${timestamp}-${random}.${extension}`;
  }

  /**
   * Generate unique ID
   * @returns {string} - Unique ID
   */
  generateId() {
    return `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Convert file to base64
   * @param {Blob} blob - File blob
   * @returns {Promise<string>} - Base64 encoded string
   */
  fileToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get file type from blob
   * @param {Blob} blob - File blob
   * @returns {Promise<string>} - MIME type
   */
  async getFileType(blob) {
    return blob.type;
  }

  /**
   * Get image dimensions
   * @param {Blob} blob - Image blob
   * @returns {Promise<Object>} - Width and height
   */
  getImageDimensions(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Generate CDN URL for image
   * @param {string} filename - Image filename
   * @returns {string} - CDN URL
   */
  generateCDNUrl(filename) {
    return `https://cdn.jsdelivr.net/gh/${this.repoOwner}/${this.repoName}@${this.branch}/${this.assetsPath}/${filename}`;
  }

  /**
   * Generate raw GitHub URL for image
   * @param {string} filename - Image filename
   * @returns {string} - Raw URL
   */
  generateRawUrl(filename) {
    return `https://raw.githubusercontent.com/${this.repoOwner}/${this.repoName}/${this.branch}/${this.assetsPath}/${filename}`;
  }

  /**
   * Generate responsive image set
   * @param {string} filename - Image filename
   * @returns {Object} - Responsive image set with srcset and sizes
   */
  generateResponsiveSet(filename) {
    const asset = this.assets.find(a => a.filename === filename);
    if (!asset) return null;

    const baseUrl = this.generateCDNUrl(filename);
    const widths = [320, 640, 960, 1280, 1920];
    const srcset = widths
      .filter(w => w <= asset.width)
      .map(w => `${baseUrl}?w=${w} ${w}w`)
      .join(', ');

    return {
      srcset: srcset,
      src: baseUrl,
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      width: asset.width,
      height: asset.height
    };
  }

  /**
   * Get storage statistics
   * @returns {Object} - Storage statistics
   */
  getStorageStats() {
    const totalSize = this.assets.reduce((sum, asset) => sum + asset.size, 0);
    return {
      totalImages: this.assets.length,
      totalSize: totalSize,
      totalSizeFormatted: this.formatFileSize(totalSize),
      averageSize: this.assets.length > 0 ? totalSize / this.assets.length : 0,
      types: this.getTypeBreakdown()
    };
  }

  /**
   * Get breakdown by image type
   * @returns {Object} - Type breakdown
   */
  getTypeBreakdown() {
    const breakdown = {};
    this.assets.forEach(asset => {
      const type = asset.type.split('/')[1];
      if (!breakdown[type]) {
        breakdown[type] = { count: 0, size: 0 };
      }
      breakdown[type].count++;
      breakdown[type].size += asset.size;
    });
    return breakdown;
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Batch delete images
   * @param {string[]} ids - Array of image IDs to delete
   */
  async batchDelete(ids) {
    const results = [];
    for (const id of ids) {
      try {
        await this.deleteImage(id);
        results.push({ id, success: true });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }
    return results;
  }

  /**
   * Refresh assets index from GitHub
   */
  async refresh() {
    await this.loadAssetsIndex();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MediaManager;
}
