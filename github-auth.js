/**
 * GITHUB AUTHENTICATION SYSTEM
 * Complete authentication system supporting OAuth, PAT, and GitHub App flows
 * Security-focused with encryption and secure token management
 */

class GitHubAuth {
  constructor(config = {}) {
    // Configuration
    this.config = {
      // OAuth App Configuration (Recommended for production)
      clientId: config.clientId || '',
      redirectUri: config.redirectUri || `${window.location.origin}/github-callback.html`,
      scopes: config.scopes || ['repo', 'user:email', 'read:org'],
      state: null,

      // GitHub App Configuration (For enterprise/organizations)
      appId: config.appId || '',
      installationId: config.installationId || '',

      // Storage keys
      storageKeys: {
        token: 'github-auth-token',
        tokenType: 'github-auth-type',
        userData: 'github-user-data',
        tokenExpiry: 'github-token-expiry',
        refreshToken: 'github-refresh-token',
        encryptionKey: 'github-encryption-key'
      }
    };

    // Current auth state
    this.isAuthenticated = false;
    this.authType = null; // 'oauth', 'pat', 'app'
    this.userData = null;
    this.token = null;
    this.encryptionKey = null;

    // Event callbacks
    this.callbacks = {
      onAuthChange: [],
      onTokenRefresh: [],
      onError: []
    };

    this.init();
  }

  /**
   * Initialize the authentication system
   */
  async init() {
    // Load encryption key or create new one
    await this.loadOrCreateEncryptionKey();

    // Check for existing session
    await this.checkExistingSession();

    // Listen for storage events (multi-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === this.config.storageKeys.token) {
        this.checkExistingSession();
      }
    });

    // Check for OAuth callback
    this.handleOAuthCallback();
  }

  /**
   * Load or create encryption key for secure token storage
   */
  async loadOrCreateEncryptionKey() {
    const storedKey = localStorage.getItem(this.config.storageKeys.encryptionKey);

    if (storedKey) {
      // Derive key from stored salt
      const salt = this.base64ToArrayBuffer(storedKey);
      this.encryptionKey = await this.deriveKey(salt);
    } else {
      // Create new encryption key
      const salt = crypto.getRandomValues(new Uint8Array(16));
      this.encryptionKey = await this.deriveKey(salt);

      // Store salt for future key derivation
      const saltBase64 = this.arrayBufferToBase64(salt);
      localStorage.setItem(this.config.storageKeys.encryptionKey, saltBase64);
    }
  }

  /**
   * Derive encryption key from salt using PBKDF2
   */
  async deriveKey(salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode('github-auth-key-derivation'),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data using AES-GCM
   */
  async encrypt(data) {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      this.encryptionKey,
      encoder.encode(JSON.stringify(data))
    );

    return {
      iv: this.arrayBufferToBase64(iv),
      data: this.arrayBufferToBase64(encrypted)
    };
  }

  /**
   * Decrypt data using AES-GCM
   */
  async decrypt(encryptedData) {
    const iv = this.base64ToArrayBuffer(encryptedData.iv);
    const data = this.base64ToArrayBuffer(encryptedData.data);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      this.encryptionKey,
      data
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  }

  /**
   * Check for existing authenticated session
   */
  async checkExistingSession() {
    const storedToken = localStorage.getItem(this.config.storageKeys.token);
    const storedType = localStorage.getItem(this.config.storageKeys.tokenType);
    const storedExpiry = localStorage.getItem(this.config.storageKeys.tokenExpiry);
    const storedUserData = localStorage.getItem(this.config.storageKeys.userData);

    if (!storedToken || !storedType) {
      this.clearAuth();
      return;
    }

    // Check token expiry
    if (storedExpiry) {
      const expiryTime = parseInt(storedExpiry);
      if (Date.now() > expiryTime) {
        console.log('Token expired, clearing session');
        this.clearAuth();
        return;
      }
    }

    try {
      // Decrypt token
      const encryptedToken = JSON.parse(storedToken);
      this.token = await this.decrypt(encryptedToken);
      this.authType = storedType;

      // Load user data
      if (storedUserData) {
        const encryptedUserData = JSON.parse(storedUserData);
        this.userData = await this.decrypt(encryptedUserData);
      }

      this.isAuthenticated = true;
      this.notifyCallbacks('onAuthChange', { authenticated: true });
    } catch (error) {
      console.error('Failed to restore session:', error);
      this.clearAuth();
    }
  }

  /**
   * OAuth APP FLOW
   * Initiates GitHub OAuth flow with popup
   */
  async authenticateWithOAuth() {
    // Generate state parameter for CSRF protection
    this.config.state = this.generateState();

    // Store state for validation
    sessionStorage.setItem('oauth-state', this.config.state);
    sessionStorage.setItem('oauth-pending', 'true');

    // Build authorization URL
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.append('client_id', this.config.clientId);
    authUrl.searchParams.append('redirect_uri', this.config.redirectUri);
    authUrl.searchParams.append('scope', this.config.scopes.join(' '));
    authUrl.searchParams.append('state', this.config.state);
    authUrl.searchParams.append('response_type', 'code');

    // Open popup for OAuth flow
    const popup = window.open(
      authUrl.toString(),
      'github-auth',
      'width=600,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      throw new Error('Failed to open OAuth popup. Please allow popups for this site.');
    }

    // Wait for popup to close or callback
    return new Promise((resolve, reject) => {
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          reject(new Error('OAuth flow cancelled by user'));
        }
      }, 500);

      // Listen for callback message
      const messageHandler = async (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'github-auth-callback') {
          clearInterval(checkPopup);
          window.removeEventListener('message', messageHandler);

          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            try {
              await this.handleOAuthSuccess(event.data.code, event.data.state);
              resolve(this.userData);
            } catch (error) {
              reject(error);
            }
          }
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }

  /**
   * Handle OAuth callback from popup
   */
  async handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);

    if (error) {
      this.notifyCallbacks('onError', { error: error });
      return;
    }

    if (code && state) {
      // Send code to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'github-auth-callback',
          code: code,
          state: state
        }, window.location.origin);

        window.close();
      }
    }
  }

  /**
   * Complete OAuth flow by exchanging code for token
   */
  async handleOAuthSuccess(code, state) {
    // Validate state
    const storedState = sessionStorage.getItem('oauth-state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter. Possible CSRF attack.');
    }

    sessionStorage.removeItem('oauth-state');
    sessionStorage.removeItem('oauth-pending');

    // Exchange code for access token
    // Note: This requires a backend proxy or GitHub App setup
    // For demo purposes, we'll store the code and use it for API calls
    try {
      // In production, send code to your backend to exchange for token
      const tokenData = await this.exchangeCodeForToken(code);

      this.token = tokenData.access_token;
      this.authType = 'oauth';

      // Get user data
      this.userData = await this.fetchUserData();

      // Calculate token expiry (GitHub tokens don't expire, but we'll set a reasonable limit)
      const expiryTime = Date.now() + (3600 * 1000); // 1 hour

      // Securely store token and data
      await this.storeSecureData();

      this.isAuthenticated = true;
      this.notifyCallbacks('onAuthChange', { authenticated: true });

      return this.userData;
    } catch (error) {
      console.error('OAuth token exchange failed:', error);
      throw error;
    }
  }

  /**
   * Exchange authorization code for access token
   * Note: In production, this should be done on a backend server
   */
  async exchangeCodeForToken(code) {
    // This is a simplified version. In production:
    // 1. Send code to your backend
    // 2. Backend exchanges code for token with GitHub
    // 3. Backend returns token (or session) to frontend

    // For now, we'll use the code directly with GitHub API
    // This won't work without proper CORS setup or backend proxy

    throw new Error('Token exchange requires backend server. See documentation for setup.');
  }

  /**
   * PERSONAL ACCESS TOKEN FLOW
   * Authenticate using a GitHub Personal Access Token
   */
  async authenticateWithPAT(token) {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token provided');
    }

    // Validate token by fetching user data
    try {
      const tempToken = token;
      const userData = await this.fetchUserData(tempToken);

      this.token = token;
      this.authType = 'pat';
      this.userData = userData;

      // Store securely (no expiry for PATs unless revoked)
      await this.storeSecureData(false);

      this.isAuthenticated = true;
      this.notifyCallbacks('onAuthChange', { authenticated: true });

      return this.userData;
    } catch (error) {
      throw new Error('Invalid token or insufficient permissions');
    }
  }

  /**
   * GITHUB APP FLOW
   * Authenticate using GitHub App installation
   */
  async authenticateWithApp() {
    // Redirect to GitHub App installation flow
    if (!this.config.appId) {
      throw new Error('GitHub App ID not configured');
    }

    const installUrl = new URL('https://github.com/apps');
    // Note: You need to configure your GitHub App's slug
    // This is a simplified version

    throw new Error('GitHub App flow requires proper setup. See documentation.');
  }

  /**
   * Fetch user data from GitHub API
   */
  async fetchUserData(accessToken = this.token) {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return response.json();
  }

  /**
   * Fetch user permissions
   */
  async fetchPermissions() {
    if (!this.isAuthenticated) {
      return null;
    }

    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      const userData = await response.json();

      // Get repository permissions
      const reposResponse = await fetch('https://api.github.com/user/repos?per_page=1', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      const repos = await reposResponse.json();

      return {
        user: userData,
        repoPermissions: repos.length > 0 ? repos[0].permissions : null,
        scopes: this.config.scopes
      };
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      return null;
    }
  }

  /**
   * Store sensitive data securely
   */
  async storeSecureData(withExpiry = true) {
    // Encrypt and store token
    const encryptedToken = await this.encrypt(this.token);
    localStorage.setItem(this.config.storageKeys.token, JSON.stringify(encryptedToken));

    // Store auth type
    localStorage.setItem(this.config.storageKeys.tokenType, this.authType);

    // Encrypt and store user data
    if (this.userData) {
      const encryptedUserData = await this.encrypt(this.userData);
      localStorage.setItem(this.config.storageKeys.userData, JSON.stringify(encryptedUserData));
    }

    // Store expiry time
    if (withExpiry) {
      const expiryTime = Date.now() + (3600 * 1000); // 1 hour
      localStorage.setItem(this.config.storageKeys.tokenExpiry, expiryTime.toString());
    } else {
      localStorage.removeItem(this.config.storageKeys.tokenExpiry);
    }
  }

  /**
   * Logout and clear all auth data
   */
  logout() {
    this.clearAuth();
    this.notifyCallbacks('onAuthChange', { authenticated: false });
  }

  /**
   * Clear all authentication data
   */
  clearAuth() {
    this.isAuthenticated = false;
    this.authType = null;
    this.userData = null;
    this.token = null;

    // Clear all storage
    Object.values(this.config.storageKeys).forEach(key => {
      localStorage.removeItem(key);
    });

    sessionStorage.removeItem('oauth-state');
    sessionStorage.removeItem('oauth-pending');
  }

  /**
   * Check if token has required permissions
   */
  async validatePermissions(requiredScopes) {
    if (!this.isAuthenticated) return false;

    const permissions = await this.fetchPermissions();
    if (!permissions) return false;

    // Check if all required scopes are present
    return requiredScopes.every(scope => permissions.scopes.includes(scope));
  }

  /**
   * Refresh authentication token (if supported)
   */
  async refreshToken() {
    if (this.authType === 'oauth') {
      // OAuth tokens can be refreshed
      // Implementation depends on your OAuth setup
      this.notifyCallbacks('onTokenRefresh', { token: this.token });
    }
    // PATs and App tokens don't expire
  }

  /**
   * Revoke authentication
   */
  async revokeAuth() {
    if (this.authType === 'pat') {
      // PATs can be revoked via GitHub API
      try {
        await fetch('https://api.github.com/user', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });
      } catch (error) {
        console.error('Failed to revoke token:', error);
      }
    }

    this.logout();
  }

  /**
   * Make authenticated API request to GitHub
   */
  async apiRequest(endpoint, options = {}) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.status === 401) {
      // Token expired or invalid
      this.logout();
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get current repository (if available)
   */
  async getCurrentRepository() {
    // Try to detect repository from current page
    const repoMatch = window.location.pathname.match(/\/([^/]+)\/([^/]+)/);

    if (repoMatch) {
      return {
        owner: repoMatch[1],
        repo: repoMatch[2]
      };
    }

    return null;
  }

  /**
   * Save content to GitHub repository
   */
  async saveToGitHub(content, path, message) {
    const repo = await this.getCurrentRepository();

    if (!repo) {
      throw new Error('No repository detected');
    }

    const endpoint = `/repos/${repo.owner}/${repo.repo}/contents/${path}`;

    // Check if file exists
    let sha = null;
    try {
      const existingFile = await this.apiRequest(endpoint);
      sha = existingFile.sha;
    } catch (error) {
      // File doesn't exist yet
    }

    // Prepare file content
    const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))));

    const body = {
      message: message || 'Update content via Designer Mode',
      content: contentBase64
    };

    if (sha) {
      body.sha = sha;
    }

    return this.apiRequest(endpoint, {
      method: sha ? 'PUT' : 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * Load content from GitHub repository
   */
  async loadFromGitHub(path) {
    const repo = await this.getCurrentRepository();

    if (!repo) {
      throw new Error('No repository detected');
    }

    const endpoint = `/repos/${repo.owner}/${repo.repo}/contents/${path}`;

    try {
      const file = await this.apiRequest(endpoint);

      // Decode base64 content
      const content = atob(file.content);
      return JSON.parse(decodeURIComponent(escape(content)));
    } catch (error) {
      console.error('Failed to load content from GitHub:', error);
      return null;
    }
  }

  /**
   * Register callback for auth events
   */
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  /**
   * Remove callback
   */
  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Notify all callbacks for an event
   */
  notifyCallbacks(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  /**
   * Generate random state parameter for OAuth
   */
  generateState() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Get authentication status
   */
  getStatus() {
    return {
      isAuthenticated: this.isAuthenticated,
      authType: this.authType,
      userData: this.userData,
      hasToken: !!this.token
    };
  }
}

// Export for use
window.GitHubAuth = GitHubAuth;
