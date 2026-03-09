/**
 * GITHUB DEVICE FLOW AUTHENTICATION
 * Device-based authentication for client-side apps (no backend needed!)
 * More secure than PATs, simpler than OAuth
 */

class GitHubDeviceAuth {
  constructor(config = {}) {
    this.config = {
      clientId: config.clientId || '', // You'll get this from GitHub
      scopes: config.scopes || ['repo', 'user:email', 'read:org'],
      pollInterval: config.pollInterval || 5, // Seconds between polls
      maxPollAttempts: config.maxPollAttempts || 60 // 5 minutes max
    };

    // Storage keys
    this.storageKeys = {
      token: 'github-device-token',
      userData: 'github-device-user',
      tokenExpiry: 'github-device-expiry'
    };

    // Current state
    this.isAuthenticated = false;
    this.userData = null;
    this.deviceCode = null;
    this.userCode = null;
    this.verificationUri = 'https://github.com/devices';
    this.pollingTimer = null;

    this.init();
  }

  async init() {
    // Check if already authenticated
    await this.loadSavedSession();

    if (this.isAuthenticated) {
      console.log('✅ Device Auth: Already authenticated');
      this.notifyAuthChange();
    } else {
      console.log('🔐 Device Auth: Ready to authenticate');
    }
  }

  /**
   * Start Device Flow authentication
   */
  async startDeviceFlow() {
    try {
      console.log('🔄 Starting GitHub Device Flow...');

      // Step 1: Request device code from GitHub
      const response = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: this.config.clientId,
          scope: this.config.scopes.join(' ')
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get device code');
      }

      const data = await response.json();

      // Step 2: Store device data
      this.deviceCode = data.device_code;
      this.userCode = data.user_code;
      this.verificationUri = data.verification_uri;
      this.expiresIn = data.expires_in;
      this.pollInterval = data.interval;

      console.log('✅ Device code received');
      console.log(`📱 User Code: ${this.userCode}`);
      console.log(`🔗 Verify at: ${this.verificationUri}`);

      // Step 3: Start polling for authentication
      this.startPolling();

      // Return instructions for user
      return {
        success: true,
        userCode: this.userCode,
        verificationUri: this.verificationUri,
        expiresIn: this.expiresIn
      };

    } catch (error) {
      console.error('❌ Device Flow failed:', error);
      throw error;
    }
  }

  /**
   * Poll GitHub for authentication status
   */
  async startPolling() {
    let attempts = 0;
    const maxAttempts = this.config.maxPollAttempts;

    this.pollingTimer = setInterval(async () => {
      attempts++;

      try {
        // Check status with GitHub
        const response = await fetch('https://github.com/login/device/status', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            client_id: this.config.clientId,
            device_code: this.deviceCode
          })
        });

        if (!response.ok) {
          throw new Error('Status check failed');
        }

        const data = await response.json();

        // Check if user has authorized
        if (data.access_token) {
          // Success! User authenticated
          await this.handleAuthSuccess(data);
          this.stopPolling();
        } else if (data.error) {
          // Error occurred
          console.error('❌ Device flow error:', data.error);
          this.stopPolling();
          this.notifyError(data.error);
        } else {
          // Still waiting...
          console.log(`⏳ Polling... (${attempts}/${maxAttempts})`);
        }

      } catch (error) {
        console.error('❌ Polling error:', error);

        // Don't stop on network errors, just log them
        if (attempts >= maxAttempts) {
          console.error('❌ Max polling attempts reached');
          this.stopPolling();
          this.notifyError('Authentication timed out');
        }
      }

      // Stop if max attempts reached
      if (attempts >= maxAttempts) {
        this.stopPolling();
        this.notifyError('Authentication timed out. Please try again.');
      }

    }, this.pollInterval * 1000);
  }

  /**
   * Stop polling for authentication
   */
  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
      console.log('🛑 Polling stopped');
    }
  }

  /**
   * Handle successful authentication
   */
  async handleAuthSuccess(data) {
    console.log('✅ Authentication successful!');

    // Store token
    this.token = data.access_token;
    localStorage.setItem(this.storageKeys.token, this.token);

    // Store token type
    localStorage.setItem('github-device-type', 'device');

    // Get user data
    await this.fetchUserData();

    // Store expiry
    if (data.expires_in) {
      const expiryTime = Date.now() + (data.expires_in * 1000);
      localStorage.setItem(this.storageKeys.tokenExpiry, expiryTime.toString());
    }

    this.isAuthenticated = true;

    // Notify listeners
    this.notifyAuthChange();

    console.log('✅ Device Auth complete!');
  }

  /**
   * Fetch user data from GitHub
   */
  async fetchUserData() {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      this.userData = await response.json();
      localStorage.setItem(this.storageKeys.userData, JSON.stringify(this.userData));

      console.log('👤 User data fetched:', this.userData.login);

    } catch (error) {
      console.error('❌ Failed to fetch user data:', error);
      throw error;
    }
  }

  /**
   * Load saved session from localStorage
   */
  async loadSavedSession() {
    const token = localStorage.getItem(this.storageKeys.token);
    const expiry = localStorage.getItem(this.storageKeys.tokenExpiry);

    if (!token) {
      return false;
    }

    // Check if token expired
    if (expiry && Date.now() > parseInt(expiry)) {
      console.log('⏰ Token expired');
      this.logout();
      return false;
    }

    this.token = token;

    // Load user data
    const userData = localStorage.getItem(this.storageKeys.userData);
    if (userData) {
      this.userData = JSON.parse(userData);
    }

    this.isAuthenticated = true;
    return true;
  }

  /**
   * Save content to GitHub
   */
  async saveToGitHub(content, path, message) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    // Get current SHA
    const shaResponse = await fetch(`https://api.github.com/repos/danielcarneiro/website/contents/${path}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let sha = null;
    if (shaResponse.ok) {
      const fileData = await shaResponse.json();
      sha = fileData.sha;
    }

    // Update file
    const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))));

    const response = await fetch(`https://api.github.com/repos/danielcarneiro/website/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        content: contentBase64,
        sha: sha
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save to GitHub');
    }

    return await response.json();
  }

  /**
   * Load content from GitHub
   */
  async loadFromGitHub(path) {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`https://api.github.com/repos/danielcarneiro/website/contents/${path}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load from GitHub');
    }

    const data = await response.json();

    // Decode base64 content
    if (data.content) {
      const content = decodeURIComponent(escape(atob(data.content)));
      return JSON.parse(content);
    }

    return null;
  }

  /**
   * Logout
   */
  logout() {
    this.stopPolling();

    // Clear storage
    localStorage.removeItem(this.storageKeys.token);
    localStorage.removeItem(this.storageKeys.userData);
    localStorage.removeItem(this.storageKeys.tokenExpiry);
    localStorage.removeItem('github-device-type');

    this.isAuthenticated = false;
    this.token = null;
    this.userData = null;
    this.deviceCode = null;
    this.userCode = null;

    console.log('👋 Logged out');
    this.notifyAuthChange();
  }

  /**
   * Notify authentication state changes
   */
  notifyAuthChange() {
    const event = new CustomEvent('github-auth-changed', {
      detail: {
        isAuthenticated: this.isAuthenticated,
        userData: this.userData,
        authType: 'device'
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Notify errors
   */
  notifyError(error) {
    const event = new CustomEvent('github-auth-error', {
      detail: { error }
    });
    window.dispatchEvent(event);
  }

  /**
   * Get authentication status
   */
  getStatus() {
    return {
      isAuthenticated: this.isAuthenticated,
      userData: this.userData,
      authType: 'device',
      hasToken: !!this.token
    };
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GitHubDeviceAuth;
}
