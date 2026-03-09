/**
 * GITHUB AUTHENTICATION CONFIGURATION EXAMPLE
 *
 * Copy this file to github-auth-config.js and update with your credentials
 */

const GitHubAuthConfig = {
  // OAuth App Configuration
  oauth: {
    // Create an OAuth App at: https://github.com/settings/developers
    clientId: 'YOUR_GITHUB_CLIENT_ID', // e.g., 'Iv1a1b2c3d4e5f6g7h'

    // The URL where users will be redirected after authorization
    redirectUri: window.location.origin + '/github-callback.html',

    // Scopes determine what permissions your app requests
    // Available scopes: https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps
    scopes: [
      'repo',              // Full control of private repositories
      'user:email',        // Access user email addresses (read-only)
      'read:org'           // Read org and team membership (read-only)
    ]
  },

  // GitHub App Configuration (Optional - for enterprise use)
  githubApp: {
    // Create a GitHub App at: https://github.com/settings/apps
    appId: 'YOUR_GITHUB_APP_ID', // e.g., '123456'
    installationId: 'YOUR_INSTALLATION_ID', // Optional
    webhookSecret: 'YOUR_WEBHOOK_SECRET', // Optional, for webhook verification

    // Permissions requested by the GitHub App
    permissions: {
      contents: 'write',    // Read/write repository contents
      metadata: 'read',     // Read repository metadata
      pull_requests: 'write' // Create and manage pull requests
    }
  },

  // Backend API Configuration
  // OAuth requires a backend to exchange authorization codes for access tokens
  backend: {
    // Your backend API endpoint for OAuth token exchange
    tokenExchangeUrl: '/api/github/oauth',

    // Alternative: Use a proxy server for GitHub API requests
    apiProxy: '/api/github/proxy'
  },

  // Storage Configuration
  storage: {
    // Prefix for all localStorage keys
    prefix: 'github-auth-',

    // Token expiration time in milliseconds (1 hour)
    tokenExpiration: 3600 * 1000,

    // Whether to persist sessions across browser restarts
    persistSession: true
  },

  // UI Configuration
  ui: {
    // Position of the auth status indicator
    position: 'bottom-right', // 'bottom-right' or 'bottom-left'

    // Whether to show notifications
    showNotifications: true,

    // Notification duration in milliseconds
    notificationDuration: 3000
  },

  // Feature Flags
  features: {
    // Enable OAuth authentication
    enableOAuth: true,

    // Enable PAT authentication
    enablePAT: true,

    // Enable GitHub App authentication
    enableGitHubApp: false,

    // Enable content sync functionality
    enableSync: true,

    // Enable automatic token refresh
    enableTokenRefresh: false
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GitHubAuthConfig;
} else {
  window.GitHubAuthConfig = GitHubAuthConfig;
}
