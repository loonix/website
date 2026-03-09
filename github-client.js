/**
 * GitHub API Client for Designer Mode CMS
 * Handles all GitHub repository operations with authentication,
 * content management, and OODA Loop integration
 */

class GitHubApiClient {
  constructor(config = {}) {
    // Configuration
    this.baseUrl = config.baseUrl || 'https://api.github.com';
    this.token = config.token || null;
    this.owner = config.owner || null;
    this.repo = config.repo || null;
    this.branch = config.branch || 'main';
    this.authType = config.authType || 'pat'; // 'pat', 'oauth', 'app'

    // Token storage keys
    this.tokenKey = 'github-token';
    this.tokenTypeKey = 'github-token-type';
    this.tokenExpiryKey = 'github-token-expiry';

    // Rate limiting
    this.rateLimit = {
      remaining: 5000,
      reset: null,
      limit: 5000
    };

    // Retry configuration
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000
    };

    // OODA Loop state
    this.oodaState = {
      observing: false,
      lastCommit: null,
      pendingChanges: [],
      conflicts: []
    };

    // Logging
    this.enableLogging = config.enableLogging !== false;
    this.logLevel = config.logLevel || 'info'; // 'debug', 'info', 'warn', 'error'

    this.init();
  }

  /**
   * Initialize the client
   */
  async init() {
    // Only load from storage if no token was provided in config
    if (!this.token) {
      this.loadStoredToken();
    } else {
      // Token provided in config, use it directly
      this.log('info', 'Using token from config');
    }
    this.log('info', 'GitHub API Client initialized');
  }

  // ========================================================================
  // AUTHENTICATION
  // ========================================================================

  /**
   * Load stored token from localStorage
   */
  loadStoredToken() {
    try {
      const token = localStorage.getItem(this.tokenKey);
      const tokenType = localStorage.getItem(this.tokenTypeKey);
      const expiry = localStorage.getItem(this.tokenExpiryKey);

      if (token) {
        this.token = this.decryptToken(token);
        this.authType = tokenType || 'pat';

        // Check if token expired
        if (expiry && new Date(expiry) < new Date()) {
          this.log('warn', 'Stored token has expired');
          this.clearToken();
          return false;
        }

        this.log('info', `Loaded ${this.authType} token from storage`);
        return true;
      }
    } catch (error) {
      this.log('error', 'Failed to load stored token', error);
    }
    return false;
  }

  /**
   * Store token with encryption
   */
  storeToken(token, type = 'pat', expiryHours = 8) {
    try {
      const encrypted = this.encryptToken(token);
      const expiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

      localStorage.setItem(this.tokenKey, encrypted);
      localStorage.setItem(this.tokenTypeKey, type);
      localStorage.setItem(this.tokenExpiryKey, expiry.toISOString());

      this.token = token;
      this.authType = type;

      this.log('info', `Stored ${type} token (expires: ${expiry.toLocaleString()})`);
      return true;
    } catch (error) {
      this.log('error', 'Failed to store token', error);
      return false;
    }
  }

  /**
   * Clear stored token
   */
  clearToken() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenTypeKey);
    localStorage.removeItem(this.tokenExpiryKey);
    this.token = null;
    this.log('info', 'Token cleared');
  }

  /**
   * Encrypt token (simple base64 encoding - use proper encryption in production)
   */
  encryptToken(token) {
    // In production, use proper encryption like Web Crypto API
    return btoa(token);
  }

  /**
   * Decrypt token
   */
  decryptToken(encrypted) {
    try {
      return atob(encrypted);
    } catch (error) {
      this.log('error', 'Failed to decrypt token', error);
      return null;
    }
  }

  /**
   * Set Personal Access Token
   */
  setPAT(token, expiryHours = 8) {
    this.storeToken(token, 'pat', expiryHours);
  }

  /**
   * OAuth flow - Step 1: Get authorization URL
   */
  getOAuthURL(clientId, scope = 'repo', redirectUri = window.location.origin) {
    const params = new URLSearchParams({
      client_id: clientId,
      scope: scope,
      redirect_uri: redirectUri,
      state: this.generateState()
    });

    const url = `https://github.com/login/oauth/authorize?${params.toString()}`;
    this.log('debug', 'Generated OAuth URL', { url, scope });
    return url;
  }

  /**
   * OAuth flow - Step 2: Exchange code for token
   */
  async exchangeCodeForToken(code, clientId, clientSecret, state = null) {
    try {
      // Verify state if provided
      if (state && !this.verifyState(state)) {
        throw new Error('Invalid state parameter');
      }

      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code
        })
      });

      if (!response.ok) {
        throw new Error(`OAuth exchange failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`OAuth error: ${data.error_description || data.error}`);
      }

      // Store token (OAuth tokens typically don't expire)
      this.storeToken(data.access_token, 'oauth', 8760); // 1 year

      this.log('info', 'OAuth authentication successful');
      return data.access_token;
    } catch (error) {
      this.log('error', 'OAuth exchange failed', error);
      throw error;
    }
  }

  /**
   * GitHub App authentication - Get installation token
   */
  async getAppInstallationToken(installationId, jwt) {
    try {
      const response = await this.request(
        `POST /app/installations/${installationId}/access_tokens`,
        { headers: { Authorization: `Bearer ${jwt}` } }
      );

      this.storeToken(response.token, 'app', 1); // App tokens expire in 1 hour
      this.log('info', 'GitHub App authentication successful');
      return response.token;
    } catch (error) {
      this.log('error', 'GitHub App authentication failed', error);
      throw error;
    }
  }

  /**
   * Refresh token if needed
   */
  async refreshToken() {
    this.log('info', `Attempting to refresh ${this.authType} token`);

    switch (this.authType) {
      case 'oauth':
        // OAuth tokens don't expire, but we can validate
        return await this.validateToken();
      case 'app':
        // App tokens need to be refreshed
        this.log('warn', 'App tokens require re-authentication');
        this.clearToken();
        return false;
      case 'pat':
      default:
        return await this.validateToken();
    }
  }

  /**
   * Validate current token
   */
  async validateToken() {
    try {
      const response = await this.request('GET /user');
      this.log('info', `Token validated for user: ${response.login}`);
      return true;
    } catch (error) {
      this.log('error', 'Token validation failed', error);
      this.clearToken();
      return false;
    }
  }

  /**
   * Generate random state for OAuth
   */
  generateState() {
    const state = Math.random().toString(36).substring(2, 15) +
                 Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('oauth-state', state);
    return state;
  }

  /**
   * Verify OAuth state
   */
  verifyState(state) {
    const stored = sessionStorage.getItem('oauth-state');
    sessionStorage.removeItem('oauth-state');
    return stored === state;
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    if (!this.token) {
      throw new Error('No authentication token available');
    }

    return {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DesignerMode-CMS/1.0'
    };
  }

  // ========================================================================
  // CORE API REQUESTS
  // ========================================================================

  /**
   * Make authenticated request to GitHub API
   */
  async request(endpoint, options = {}) {
    const url = this.buildUrl(endpoint);
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    };

    this.log('debug', `Request: ${config.method || 'GET'} ${url}`);

    let attempt = 0;
    let lastError = null;

    while (attempt < this.retryConfig.maxRetries) {
      try {
        const response = await fetch(url, config);

        // Update rate limit info
        this.updateRateLimit(response);

        // Handle rate limiting
        if (response.status === 403 || response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          if (retryAfter) {
            const waitTime = parseInt(retryAfter) * 1000;
            this.log('warn', `Rate limited, waiting ${waitTime}ms`);
            await this.sleep(waitTime);
            continue;
          }
        }

        // Handle other errors with retry
        if (!response.ok && this.shouldRetry(response.status, attempt)) {
          const delay = this.calculateRetryDelay(attempt);
          this.log('warn', `Request failed, retrying in ${delay}ms (attempt ${attempt + 1})`);
          await this.sleep(delay);
          attempt++;
          continue;
        }

        if (!response.ok) {
          const error = await this.parseError(response);
          throw error;
        }

        // Handle 204 No Content
        if (response.status === 204) {
          return null;
        }

        return await response.json();
      } catch (error) {
        lastError = error;

        // Don't retry on network errors that indicate real problems
        if (error.name === 'AbortError' || error.message.includes('CORS')) {
          throw error;
        }

        attempt++;
        if (attempt < this.retryConfig.maxRetries) {
          const delay = this.calculateRetryDelay(attempt);
          this.log('warn', `Network error, retrying in ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Build full URL from endpoint
   */
  buildUrl(endpoint) {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    // Check if endpoint already includes full URL
    if (cleanEndpoint.startsWith('http')) {
      return cleanEndpoint;
    }

    // Parse GitHub API endpoint format (METHOD /path)
    const parts = cleanEndpoint.split(' ');
    const path = parts[parts.length - 1];

    return `${this.baseUrl}/${path}`;
  }

  /**
   * Update rate limit information
   */
  updateRateLimit(response) {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    const limit = response.headers.get('X-RateLimit-Limit');

    if (remaining !== null) {
      this.rateLimit.remaining = parseInt(remaining);
    }
    if (reset !== null) {
      this.rateLimit.reset = new Date(parseInt(reset) * 1000);
    }
    if (limit !== null) {
      this.rateLimit.limit = parseInt(limit);
    }

    this.log('debug', 'Rate limit', {
      remaining: this.rateLimit.remaining,
      reset: this.rateLimit.reset
    });
  }

  /**
   * Determine if request should be retried
   */
  shouldRetry(statusCode, attempt) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(statusCode) && attempt < this.retryConfig.maxRetries;
  }

  /**
   * Calculate exponential backoff delay
   */
  calculateRetryDelay(attempt) {
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(2, attempt),
      this.retryConfig.maxDelay
    );
    return delay + Math.random() * 1000; // Add jitter
  }

  /**
   * Parse error response
   */
  async parseError(response) {
    try {
      const data = await response.json();
      return new Error(
        data.message || `GitHub API error: ${response.status} ${response.statusText}`
      );
    } catch {
      return new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========================================================================
  // REPOSITORY OPERATIONS
  // ========================================================================

  /**
   * Get repository information
   */
  async getRepository(owner = this.owner, repo = this.repo) {
    try {
      return await this.request(`GET /repos/${owner}/${repo}`);
    } catch (error) {
      this.log('error', 'Failed to get repository', error);
      throw error;
    }
  }

  /**
   * List branches
   */
  async listBranches(owner = this.owner, repo = this.repo, protectedOnly = false) {
    try {
      const params = new URLSearchParams();
      if (protectedOnly) {
        params.append('protected', 'true');
      }

      const endpoint = `GET /repos/${owner}/${repo}/branches${params.toString() ? '?' + params.toString() : ''}`;
      return await this.request(endpoint);
    } catch (error) {
      this.log('error', 'Failed to list branches', error);
      throw error;
    }
  }

  /**
   * Get branch information
   */
  async getBranch(branch = this.branch, owner = this.owner, repo = this.repo) {
    try {
      return await this.request(`GET /repos/${owner}/${repo}/branches/${branch}`);
    } catch (error) {
      this.log('error', 'Failed to get branch', error);
      throw error;
    }
  }

  /**
   * Create branch
   */
  async createBranch(branchName, fromBranch = this.branch, owner = this.owner, repo = this.repo) {
    try {
      // Get the SHA of the branch to create from
      const fromBranchData = await this.getBranch(fromBranch, owner, repo);
      const sha = fromBranchData.commit.sha;

      return await this.request(`POST /repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: sha
        })
      });
    } catch (error) {
      this.log('error', 'Failed to create branch', error);
      throw error;
    }
  }

  /**
   * Delete branch
   */
  async deleteBranch(branchName, owner = this.owner, repo = this.repo) {
    try {
      return await this.request(`DELETE /repos/${owner}/${repo}/git/refs/heads/${branchName}`, {
        method: 'DELETE'
      });
    } catch (error) {
      this.log('error', 'Failed to delete branch', error);
      throw error;
    }
  }

  /**
   * Merge branches
   */
  async mergeBranches(base, head, commitMessage = null, owner = this.owner, repo = this.repo) {
    try {
      const body = {
        base: base,
        head: head
      };

      if (commitMessage) {
        body.commit_message = commitMessage;
      }

      return await this.request(`POST /repos/${owner}/${repo}/merges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (error) {
      this.log('error', 'Failed to merge branches', error);
      throw error;
    }
  }

  /**
   * Get commit history
   */
  async getCommits(path = null, sha = this.branch, owner = this.owner, repo = this.repo, perPage = 30, page = 1) {
    try {
      const params = new URLSearchParams({
        per_page: perPage.toString(),
        page: page.toString(),
        sha: sha
      });

      if (path) {
        params.append('path', path);
      }

      const endpoint = `GET /repos/${owner}/${repo}/commits?${params.toString()}`;
      return await this.request(endpoint);
    } catch (error) {
      this.log('error', 'Failed to get commits', error);
      throw error;
    }
  }

  /**
   * Get single commit
   */
  async getCommit(sha, owner = this.owner, repo = this.repo) {
    try {
      return await this.request(`GET /repos/${owner}/${repo}/git/commits/${sha}`);
    } catch (error) {
      this.log('error', 'Failed to get commit', error);
      throw error;
    }
  }

  /**
   * Create pull request
   */
  async createPullRequest(title, head, base = this.branch, body = null, owner = this.owner, repo = this.repo) {
    try {
      const prData = {
        title: title,
        head: head,
        base: base
      };

      if (body) {
        prData.body = body;
      }

      return await this.request(`POST /repos/${owner}/${repo}/pulls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prData)
      });
    } catch (error) {
      this.log('error', 'Failed to create pull request', error);
      throw error;
    }
  }

  /**
   * List pull requests
   */
  async listPullRequests(state = 'open', owner = this.owner, repo = this.repo, perPage = 30, page = 1) {
    try {
      const params = new URLSearchParams({
        state: state,
        per_page: perPage.toString(),
        page: page.toString()
      });

      const endpoint = `GET /repos/${owner}/${repo}/pulls?${params.toString()}`;
      return await this.request(endpoint);
    } catch (error) {
      this.log('error', 'Failed to list pull requests', error);
      throw error;
    }
  }

  /**
   * Merge pull request
   */
  async mergePullRequest(pullNumber, commitTitle = null, commitMessage = null, mergeMethod = 'merge', owner = this.owner, repo = this.repo) {
    try {
      const body = {};

      if (commitTitle) {
        body.commit_title = commitTitle;
      }
      if (commitMessage) {
        body.commit_message = commitMessage;
      }
      body.merge_method = mergeMethod;

      return await this.request(`PUT /repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (error) {
      this.log('error', 'Failed to merge pull request', error);
      throw error;
    }
  }

  // ========================================================================
  // CONTENT OPERATIONS
  // ========================================================================

  /**
   * Get file contents
   */
  async getFile(path, ref = this.branch, owner = this.owner, repo = this.repo) {
    try {
      const params = new URLSearchParams({ ref: ref });
      const endpoint = `GET /repos/${owner}/${repo}/contents/${path}?${params.toString()}`;
      const response = await this.request(endpoint);

      // Handle directory response
      if (Array.isArray(response)) {
        return response;
      }

      // Handle single file response
      if (response.type === 'file') {
        if (response.encoding === 'base64') {
          response.content = atob(response.content);
        } else {
          response.content = decodeURIComponent(escape(response.content));
        }
      }

      return response;
    } catch (error) {
      this.log('error', `Failed to get file: ${path}`, error);
      throw error;
    }
  }

  /**
   * Get content-schema.json
   */
  async getContentSchema(ref = this.branch, owner = this.owner, repo = this.repo) {
    try {
      const response = await this.getFile('content-schema.json', ref, owner, repo);
      return JSON.parse(response.content);
    } catch (error) {
      this.log('error', 'Failed to get content schema', error);
      throw error;
    }
  }

  /**
   * Create or update file
   */
  async updateFile(path, content, message, sha = null, branch = this.branch, owner = this.owner, repo = this.repo) {
    try {
      const body = {
        message: message,
        content: this.base64Encode(content),
        branch: branch
      };

      if (sha) {
        body.sha = sha;
      }

      const response = await this.request(`PUT /repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      this.log('info', `File updated: ${path}`, {
        commit: response.commit.sha,
        content: response.content.sha
      });

      return response;
    } catch (error) {
      this.log('error', `Failed to update file: ${path}`, error);
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(path, message, sha, branch = this.branch, owner = this.owner, repo = this.repo) {
    try {
      const body = {
        message: message,
        sha: sha,
        branch: branch
      };

      const response = await this.request(`DELETE /repos/${owner}/${repo}/contents/${path}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      this.log('info', `File deleted: ${path}`);
      return response;
    } catch (error) {
      this.log('error', `Failed to delete file: ${path}`, error);
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(path, ref = this.branch, owner = this.owner, repo = this.repo) {
    try {
      const file = await this.getFile(path, ref, owner, repo);

      // Get commit history for the file
      const commits = await this.getCommits(path, ref, owner, repo, 1);

      return {
        path: path,
        sha: file.sha,
        size: file.size,
        type: file.type,
        lastModified: commits[0] ? commits[0].commit.committer.date : null,
        lastCommitSha: commits[0] ? commits[0].sha : null
      };
    } catch (error) {
      this.log('error', `Failed to get file metadata: ${path}`, error);
      throw error;
    }
  }

  /**
   * List directory contents
   */
  async listDirectory(path, ref = this.branch, owner = this.owner, repo = this.repo) {
    try {
      const response = await this.getFile(path, ref, owner, repo);

      if (!Array.isArray(response)) {
        throw new Error(`${path} is not a directory`);
      }

      return response;
    } catch (error) {
      this.log('error', `Failed to list directory: ${path}`, error);
      throw error;
    }
  }

  // ========================================================================
  // IMAGE UPLOADS
  // ========================================================================

  /**
   * Upload image as blob
   */
  async uploadImage(path, base64Content, message, branch = this.branch, owner = this.owner, repo = this.repo) {
    try {
      // Remove data URL prefix if present
      let cleanContent = base64Content;
      if (base64Content.startsWith('data:')) {
        cleanContent = base64Content.split(',')[1];
      }

      return await this.updateFile(path, cleanContent, message, null, branch, owner, repo);
    } catch (error) {
      this.log('error', `Failed to upload image: ${path}`, error);
      throw error;
    }
  }

  /**
   * Upload image from File object
   */
  async uploadImageFromFile(file, path, message, branch = this.branch, owner = this.owner, repo = this.repo) {
    try {
      const base64 = await this.fileToBase64(file);
      return await this.uploadImage(path, base64, message, branch, owner, repo);
    } catch (error) {
      this.log('error', `Failed to upload image from file: ${path}`, error);
      throw error;
    }
  }

  /**
   * Create git blob for large files
   */
  async createBlob(content, encoding = 'base64', owner = this.owner, repo = this.repo) {
    try {
      return await this.request(`POST /repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content,
          encoding: encoding
        })
      });
    } catch (error) {
      this.log('error', 'Failed to create blob', error);
      throw error;
    }
  }

  // ========================================================================
  // UTILITIES
  // ========================================================================

  /**
   * Base64 encode string
   */
  base64Encode(str) {
    try {
      // Handle Unicode characters
      return btoa(unescape(encodeURIComponent(str)));
    } catch (error) {
      this.log('error', 'Failed to base64 encode', error);
      throw error;
    }
  }

  /**
   * Base64 decode string
   */
  base64Decode(str) {
    try {
      return decodeURIComponent(escape(atob(str)));
    } catch (error) {
      this.log('error', 'Failed to base64 decode', error);
      throw error;
    }
  }

  /**
   * Convert file to base64
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Check for conflicts
   */
  async detectConflicts(path, localSha, owner = this.owner, repo = this.repo) {
    try {
      const currentFile = await this.getFile(path, this.branch, owner, repo);

      if (currentFile.sha !== localSha) {
        this.log('warn', `Conflict detected in ${path}`, {
          local: localSha,
          remote: currentFile.sha
        });
        return {
          hasConflict: true,
          localSha: localSha,
          remoteSha: currentFile.sha,
          path: path
        };
      }

      return { hasConflict: false };
    } catch (error) {
      this.log('error', 'Failed to detect conflicts', error);
      throw error;
    }
  }

  /**
   * Resolve conflict by using remote version
   */
  async resolveConflictUseRemote(path, owner = this.owner, repo = this.repo) {
    try {
      const remoteFile = await this.getFile(path, this.branch, owner, repo);
      return remoteFile;
    } catch (error) {
      this.log('error', 'Failed to resolve conflict', error);
      throw error;
    }
  }

  /**
   * Batch operations - update multiple files
   */
  async batchUpdate(files, branch = this.branch, owner = this.owner, repo = this.repo) {
    try {
      const results = [];

      // Get current tree
      const refData = await this.getBranch(branch, owner, repo);
      const treeSha = refData.commit.commit.tree.sha;

      // Create blobs for each file
      const blobs = [];
      for (const file of files) {
        const blob = await this.createBlob(file.content, 'base64', owner, repo);
        blobs.push({
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blob.sha
        });
      }

      // Create new tree
      const tree = await this.request(`POST /repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_tree: treeSha,
          tree: blobs
        })
      });

      // Create commit
      const commit = await this.request(`POST /repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: files.length > 1 ? `Batch update: ${files.length} files` : `Update ${files[0].path}`,
          tree: tree.sha,
          parents: [refData.commit.sha]
        })
      });

      // Update reference
      await this.request(`PATCH /repos/${owner}/${repo}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sha: commit.sha
        })
      });

      this.log('info', `Batch update completed: ${files.length} files`);
      return commit;
    } catch (error) {
      this.log('error', 'Batch update failed', error);
      throw error;
    }
  }

  // ========================================================================
  // OODA LOOP INTEGRATION
  // ========================================================================

  /**
   * OODA Loop - Observe: Watch for changes
   */
  async observe(interval = 30000) {
    if (this.oodaState.observing) {
      this.log('warn', 'Already observing');
      return;
    }

    this.oodaState.observing = true;
    this.log('info', `Starting observation (interval: ${interval}ms)`);

    const observeLoop = async () => {
      if (!this.oodaState.observing) return;

      try {
        // Get latest commit
        const commits = await this.getCommits(null, this.branch, null, null, 1);

        if (commits.length > 0) {
          const latestCommit = commits[0];

          // Check if there's a new commit
          if (this.oodaState.lastCommit !== latestCommit.sha) {
            this.log('info', 'New commit detected', latestCommit.sha);
            this.oodaState.lastCommit = latestCommit.sha;

            // Trigger orient phase
            await this.orient(latestCommit);
          }
        }
      } catch (error) {
        this.log('error', 'Observation error', error);
      }

      // Schedule next observation
      setTimeout(observeLoop, interval);
    };

    // Start observation loop
    observeLoop();
  }

  /**
   * OODA Loop - Stop observing
   */
  stopObserving() {
    this.oodaState.observing = false;
    this.log('info', 'Stopped observation');
  }

  /**
   * OODA Loop - Orient: Assess context and conflicts
   */
  async orient(commit) {
    this.log('info', 'Orienting to changes', commit.sha);

    try {
      // Get commit details
      const commitDetails = await this.getCommit(commit.sha);

      // Analyze changed files
      const changedFiles = commitDetails.files.map(file => file.filename);

      // Check for conflicts with pending changes
      const conflicts = [];
      for (const change of this.oodaState.pendingChanges) {
        if (changedFiles.includes(change.path)) {
          const conflict = await this.detectConflicts(change.path, change.sha);
          if (conflict.hasConflict) {
            conflicts.push(conflict);
          }
        }
      }

      this.oodaState.conflicts = conflicts;

      if (conflicts.length > 0) {
        this.log('warn', `Detected ${conflicts.length} conflicts`);
      }

      // Trigger decide phase
      await this.decide(commitDetails, conflicts);
    } catch (error) {
      this.log('error', 'Orientation failed', error);
    }
  }

  /**
   * OODA Loop - Decide: Choose sync strategy
   */
  async decide(commit, conflicts) {
    this.log('info', 'Deciding on sync strategy');

    let strategy = 'merge';

    if (conflicts.length > 0) {
      // Conflicts detected - need resolution
      strategy = 'resolve';
      this.log('warn', 'Conflict resolution required');
    } else if (this.oodaState.pendingChanges.length > 0) {
      // We have pending changes
      strategy = 'sync';
      this.log('info', 'Syncing pending changes');
    } else {
      // No conflicts, just pull latest
      strategy = 'pull';
      this.log('info', 'Pulling latest changes');
    }

    // Trigger act phase
    await this.act(strategy, commit, conflicts);
  }

  /**
   * OODA Loop - Act: Execute operations
   */
  async act(strategy, commit, conflicts) {
    this.log('info', `Executing strategy: ${strategy}`);

    try {
      switch (strategy) {
        case 'pull':
          // Notify application to reload content
          this.notifyChange('pull', commit);
          break;

        case 'sync':
          // Push pending changes
          await this.syncPendingChanges();
          this.notifyChange('sync', commit);
          break;

        case 'resolve':
          // Handle conflicts
          await this.resolveConflicts(conflicts);
          this.notifyChange('resolve', commit);
          break;

        default:
          this.log('warn', `Unknown strategy: ${strategy}`);
      }
    } catch (error) {
      this.log('error', 'Action failed', error);
    }
  }

  /**
   * Sync pending changes
   */
  async syncPendingChanges() {
    this.log('info', `Syncing ${this.oodaState.pendingChanges.length} pending changes`);

    for (const change of this.oodaState.pendingChanges) {
      try {
        await this.updateFile(
          change.path,
          change.content,
          change.message,
          null,
          this.branch,
          this.owner,
          this.repo
        );

        // Remove synced change from pending
        const index = this.oodaState.pendingChanges.indexOf(change);
        if (index > -1) {
          this.oodaState.pendingChanges.splice(index, 1);
        }
      } catch (error) {
        this.log('error', `Failed to sync ${change.path}`, error);
      }
    }
  }

  /**
   * Resolve conflicts
   */
  async resolveConflicts(conflicts) {
    this.log('info', `Resolving ${conflicts.length} conflicts`);

    for (const conflict of conflicts) {
      try {
        // Use remote version (conservative approach)
        const remoteFile = await this.resolveConflictUseRemote(conflict.path);
        this.log('info', `Resolved conflict using remote: ${conflict.path}`);

        // Notify application of resolution
        this.notifyChange('conflict-resolved', { path: conflict.path, content: remoteFile.content });
      } catch (error) {
        this.log('error', `Failed to resolve conflict: ${conflict.path}`, error);
      }
    }

    this.oodaState.conflicts = [];
  }

  /**
   * Add pending change
   */
  addPendingChange(path, content, message, sha) {
    this.oodaState.pendingChanges.push({
      path,
      content,
      message,
      sha
    });

    this.log('info', `Added pending change: ${path}`);
  }

  /**
   * Notify application of changes
   */
  notifyChange(type, data) {
    const event = new CustomEvent('github-change', {
      detail: { type, data }
    });

    window.dispatchEvent(event);
    this.log('info', `Change notification: ${type}`);
  }

  // ========================================================================
  // LOGGING
  // ========================================================================

  /**
   * Log message
   */
  log(level, message, data = null) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };

    if (levels[level] < levels[this.logLevel]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    if (this.enableLogging) {
      const logMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[logMethod](`[GitHub API ${level.toUpperCase()}] ${message}`, data || '');
    }

    // Store in session for debugging
    const logs = JSON.parse(sessionStorage.getItem('github-api-logs') || '[]');
    logs.push(logEntry);

    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.shift();
    }

    sessionStorage.setItem('github-api-logs', JSON.stringify(logs));
  }

  /**
   * Get logs
   */
  getLogs() {
    return JSON.parse(sessionStorage.getItem('github-api-logs') || '[]');
  }

  /**
   * Clear logs
   */
  clearLogs() {
    sessionStorage.removeItem('github-api-logs');
    this.log('info', 'Logs cleared');
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus() {
    return {
      remaining: this.rateLimit.remaining,
      limit: this.rateLimit.limit,
      reset: this.rateLimit.reset,
      resetTime: this.rateLimit.reset ? this.rateLimit.reset.toISOString() : null
    };
  }

  /**
   * Get client status
   */
  getStatus() {
    return {
      authenticated: !!this.token,
      authType: this.authType,
      owner: this.owner,
      repo: this.repo,
      branch: this.branch,
      rateLimit: this.getRateLimitStatus(),
      observing: this.oodaState.observing,
      lastCommit: this.oodaState.lastCommit,
      pendingChanges: this.oodaState.pendingChanges.length,
      conflicts: this.oodaState.conflicts.length
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GitHubApiClient;
}
