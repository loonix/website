/**
 * AUTHENTICATION UI COMPONENTS
 * User interface for GitHub authentication system
 */

class AuthUI {
  constructor(auth) {
    this.auth = auth;
    this.elements = {};
    this.isVisible = false;
    this.currentView = 'login'; // 'login', 'manage'

    this.init();
  }

  init() {
    // Listen for auth changes
    this.auth.on('onAuthChange', (data) => {
      this.updateUI(data.authenticated);
    });

    // Create UI if it doesn't exist
    this.createAuthUI();
  }

  /**
   * Create authentication UI components
   */
  createAuthUI() {
    // Create main container
    const container = document.createElement('div');
    container.id = 'github-auth-ui';
    container.innerHTML = `
      <div class="auth-container">
        <!-- Auth Status Indicator -->
        <div class="auth-status" id="auth-status">
          <div class="auth-indicator" id="auth-indicator">
            <span class="status-dot"></span>
            <span class="status-text">Not Connected</span>
          </div>
          <button class="auth-toggle-btn" id="auth-toggle-btn">
            <i class="fab fa-github"></i>
          </button>
        </div>

        <!-- Auth Panel -->
        <div class="auth-panel" id="auth-panel">
          <div class="panel-header">
            <h3><i class="fab fa-github"></i> GitHub Authentication</h3>
            <button class="close-btn" id="close-auth-panel">×</button>
          </div>

          <!-- Login View -->
          <div class="auth-view" id="auth-login-view">
            <div class="auth-methods">
              <h4>Choose Authentication Method</h4>

              <!-- OAuth Method -->
              <div class="auth-method">
                <div class="method-header">
                  <h5>OAuth App</h5>
                  <span class="method-badge recommended">Recommended</span>
                </div>
                <p class="method-description">
                  Secure popup-based authentication with GitHub OAuth. Best for production use.
                </p>
                <button class="auth-btn oauth-btn" id="oauth-login-btn">
                  <i class="fab fa-github"></i>
                  Sign in with GitHub
                </button>
              </div>

              <!-- PAT Method -->
              <div class="auth-method">
                <div class="method-header">
                  <h5>Personal Access Token</h5>
                  <span class="method-badge dev">Development</span>
                </div>
                <p class="method-description">
                  Use a GitHub Personal Access Token. Good for development and testing.
                </p>
                <div class="pat-input-group">
                  <input
                    type="password"
                    id="pat-token-input"
                    placeholder="ghp_xxxxxxxxxxxx"
                    class="auth-input"
                  />
                  <button class="auth-btn pat-btn" id="pat-login-btn">
                    <i class="fas fa-key"></i>
                    Use Token
                  </button>
                </div>
                <a href="https://github.com/settings/tokens/new?scopes=repo,user:email"
                   target="_blank"
                   class="pat-create-link">
                  <i class="fas fa-external-link-alt"></i>
                  Create new token
                </a>
              </div>

              <!-- GitHub App Method -->
              <div class="auth-method">
                <div class="method-header">
                  <h5>GitHub App</h5>
                  <span class="method-badge enterprise">Enterprise</span>
                </div>
                <p class="method-description">
                  For organizations and enterprise use. Requires GitHub App installation.
                </p>
                <button class="auth-btn app-btn disabled" id="app-login-btn" disabled>
                  <i class="fas fa-building"></i>
                  Install GitHub App
                </button>
                <small class="method-note">Coming soon</small>
              </div>
            </div>
          </div>

          <!-- Manage View (when authenticated) -->
          <div class="auth-view hidden" id="auth-manage-view">
            <div class="user-info">
              <img id="user-avatar" src="" alt="User avatar" class="user-avatar" />
              <div class="user-details">
                <h4 id="user-name">User Name</h4>
                <p id="user-login">@username</p>
                <span class="auth-type-badge" id="auth-type-badge">OAuth</span>
              </div>
            </div>

            <div class="permissions-section">
              <h5>Permissions</h5>
              <div class="permissions-list" id="permissions-list">
                <div class="permission-item">
                  <i class="fas fa-check-circle"></i>
                  <span>Repository access</span>
                </div>
                <div class="permission-item">
                  <i class="fas fa-check-circle"></i>
                  <span>User email</span>
                </div>
                <div class="permission-item">
                  <i class="fas fa-check-circle"></i>
                  <span>Organization access</span>
                </div>
              </div>
            </div>

            <div class="repo-section">
              <h5>Repository</h5>
              <div class="repo-info" id="repo-info">
                <p class="repo-placeholder">No repository detected</p>
              </div>
            </div>

            <div class="auth-actions">
              <button class="action-btn sync-btn" id="sync-to-github-btn">
                <i class="fas fa-cloud-upload-alt"></i>
                Sync to GitHub
              </button>
              <button class="action-btn load-btn" id="load-from-github-btn">
                <i class="fas fa-cloud-download-alt"></i>
                Load from GitHub
              </button>
              <button class="action-btn logout-btn danger" id="logout-btn">
                <i class="fas fa-sign-out-alt"></i>
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Cache element references
    this.cacheElements();

    // Add event listeners
    this.addEventListeners();

    // Update initial state
    this.updateUI(this.auth.isAuthenticated);
  }

  /**
   * Cache DOM element references
   */
  cacheElements() {
    this.elements = {
      container: document.getElementById('github-auth-ui'),
      status: document.getElementById('auth-status'),
      indicator: document.getElementById('auth-indicator'),
      statusDot: document.querySelector('.status-dot'),
      statusText: document.querySelector('.status-text'),
      toggleBtn: document.getElementById('auth-toggle-btn'),
      panel: document.getElementById('auth-panel'),
      closeBtn: document.getElementById('close-auth-panel'),
      loginView: document.getElementById('auth-login-view'),
      manageView: document.getElementById('auth-manage-view'),

      // Login form elements
      oauthBtn: document.getElementById('oauth-login-btn'),
      patInput: document.getElementById('pat-token-input'),
      patBtn: document.getElementById('pat-login-btn'),
      appBtn: document.getElementById('app-login-btn'),

      // User info elements
      userAvatar: document.getElementById('user-avatar'),
      userName: document.getElementById('user-name'),
      userLogin: document.getElementById('user-login'),
      authTypeBadge: document.getElementById('auth-type-badge'),
      permissionsList: document.getElementById('permissions-list'),
      repoInfo: document.getElementById('repo-info'),

      // Action buttons
      syncBtn: document.getElementById('sync-to-github-btn'),
      loadBtn: document.getElementById('load-from-github-btn'),
      logoutBtn: document.getElementById('logout-btn')
    };
  }

  /**
   * Add event listeners
   */
  addEventListeners() {
    // Toggle panel
    this.elements.toggleBtn.addEventListener('click', () => this.togglePanel());
    this.elements.closeBtn.addEventListener('click', () => this.hidePanel());

    // OAuth login
    this.elements.oauthBtn.addEventListener('click', () => this.handleOAuthLogin());

    // PAT login
    this.elements.patBtn.addEventListener('click', () => this.handlePATLogin());
    this.elements.patInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handlePATLogin();
    });

    // GitHub App login
    this.elements.appBtn.addEventListener('click', () => this.handleAppLogin());

    // Sync actions
    this.elements.syncBtn.addEventListener('click', () => this.handleSyncToGitHub());
    this.elements.loadBtn.addEventListener('click', () => this.handleLoadFromGitHub());

    // Logout
    this.elements.logoutBtn.addEventListener('click', () => this.handleLogout());
  }

  /**
   * Update UI based on authentication state
   */
  updateUI(isAuthenticated) {
    if (isAuthenticated) {
      this.elements.statusDot.classList.add('authenticated');
      this.elements.statusText.textContent = 'Connected';
      this.elements.toggleBtn.classList.add('authenticated');

      this.currentView = 'manage';
      this.elements.loginView.classList.add('hidden');
      this.elements.manageView.classList.remove('hidden');

      this.updateUserInfo();
      this.updatePermissions();
      this.updateRepoInfo();
    } else {
      this.elements.statusDot.classList.remove('authenticated');
      this.elements.statusText.textContent = 'Not Connected';
      this.elements.toggleBtn.classList.remove('authenticated');

      this.currentView = 'login';
      this.elements.loginView.classList.remove('hidden');
      this.elements.manageView.classList.add('hidden');
    }
  }

  /**
   * Update user info display
   */
  updateUserInfo() {
    if (!this.auth.userData) return;

    const userData = this.auth.userData;

    this.elements.userAvatar.src = userData.avatar_url;
    this.elements.userName.textContent = userData.name || userData.login;
    this.elements.userLogin.textContent = `@${userData.login}`;

    // Update auth type badge
    const typeLabels = {
      'oauth': 'OAuth',
      'pat': 'Personal Access Token',
      'app': 'GitHub App'
    };

    this.elements.authTypeBadge.textContent = typeLabels[this.auth.authType] || 'Unknown';
  }

  /**
   * Update permissions display
   */
  async updatePermissions() {
    try {
      const permissions = await this.auth.fetchPermissions();

      if (!permissions) {
        this.elements.permissionsList.innerHTML = `
          <div class="permission-item error">
            <i class="fas fa-exclamation-circle"></i>
            <span>Failed to load permissions</span>
          </div>
        `;
        return;
      }

      let html = '';

      // Display scopes
      if (permissions.scopes && permissions.scopes.length > 0) {
        permissions.scopes.forEach(scope => {
          html += `
            <div class="permission-item">
              <i class="fas fa-check-circle"></i>
              <span>${this.formatScope(scope)}</span>
            </div>
          `;
        });
      }

      // Display repo permissions
      if (permissions.repoPermissions) {
        html += `
          <div class="permission-item">
            <i class="fas fa-check-circle"></i>
            <span>Admin access to repositories</span>
          </div>
        `;
      }

      this.elements.permissionsList.innerHTML = html;
    } catch (error) {
      console.error('Failed to update permissions:', error);
    }
  }

  /**
   * Format scope for display
   */
  formatScope(scope) {
    const scopeLabels = {
      'repo': 'Repository access',
      'user:email': 'User email',
      'read:org': 'Organization read access',
      'write:org': 'Organization write access',
      'admin:org': 'Organization admin access',
      'public_repo': 'Public repository access',
      'repo:status': 'Commit status access',
      'repo_deployment': 'Deployment status access',
      'repo:invite': 'Repository invitation access',
      'security_events': 'Security events access'
    };

    return scopeLabels[scope] || scope;
  }

  /**
   * Update repository info display
   */
  async updateRepoInfo() {
    try {
      const repo = await this.auth.getCurrentRepository();

      if (repo) {
        this.elements.repoInfo.innerHTML = `
          <div class="repo-details">
            <i class="fas fa-book"></i>
            <div class="repo-text">
              <strong>${repo.owner}</strong> / <strong>${repo.repo}</strong>
            </div>
          </div>
        `;
      } else {
        this.elements.repoInfo.innerHTML = `
          <p class="repo-placeholder">
            <i class="fas fa-info-circle"></i>
            No repository detected. Navigate to a GitHub repository page.
          </p>
        `;
      }
    } catch (error) {
      console.error('Failed to update repo info:', error);
    }
  }

  /**
   * Toggle auth panel visibility
   */
  togglePanel() {
    if (this.isVisible) {
      this.hidePanel();
    } else {
      this.showPanel();
    }
  }

  /**
   * Show auth panel
   */
  showPanel() {
    this.elements.panel.classList.add('visible');
    this.isVisible = true;
  }

  /**
   * Hide auth panel
   */
  hidePanel() {
    this.elements.panel.classList.remove('visible');
    this.isVisible = false;
  }

  /**
   * Handle OAuth login
   */
  async handleOAuthLogin() {
    try {
      this.elements.oauthBtn.disabled = true;
      this.elements.oauthBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';

      await this.auth.authenticateWithOAuth();

      this.showNotification('Successfully authenticated with GitHub', 'success');
      this.hidePanel();
    } catch (error) {
      console.error('OAuth login failed:', error);
      this.showNotification('Authentication failed: ' + error.message, 'error');
    } finally {
      this.elements.oauthBtn.disabled = false;
      this.elements.oauthBtn.innerHTML = '<i class="fab fa-github"></i> Sign in with GitHub';
    }
  }

  /**
   * Handle PAT login
   */
  async handlePATLogin() {
    const token = this.elements.patInput.value.trim();

    if (!token) {
      this.showNotification('Please enter a personal access token', 'error');
      return;
    }

    try {
      this.elements.patBtn.disabled = true;
      this.elements.patBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validating...';

      await this.auth.authenticateWithPAT(token);

      this.elements.patInput.value = '';
      this.showNotification('Successfully authenticated with token', 'success');
      this.hidePanel();
    } catch (error) {
      console.error('PAT login failed:', error);
      this.showNotification('Authentication failed: ' + error.message, 'error');
    } finally {
      this.elements.patBtn.disabled = false;
      this.elements.patBtn.innerHTML = '<i class="fas fa-key"></i> Use Token';
    }
  }

  /**
   * Handle GitHub App login
   */
  async handleAppLogin() {
    this.showNotification('GitHub App authentication is not yet implemented', 'info');
  }

  /**
   * Handle sync to GitHub
   */
  async handleSyncToGitHub() {
    if (!window.designerMode) {
      this.showNotification('Designer Mode not available', 'error');
      return;
    }

    try {
      this.elements.syncBtn.disabled = true;
      this.elements.syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';

      const content = window.designerMode.currentContent;

      if (!content) {
        throw new Error('No content to sync');
      }

      await this.auth.saveToGitHub(
        content,
        'content-schema.json',
        'Update content via Designer Mode'
      );

      this.showNotification('Content synced to GitHub successfully', 'success');
    } catch (error) {
      console.error('Sync failed:', error);
      this.showNotification('Sync failed: ' + error.message, 'error');
    } finally {
      this.elements.syncBtn.disabled = false;
      this.elements.syncBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Sync to GitHub';
    }
  }

  /**
   * Handle load from GitHub
   */
  async handleLoadFromGitHub() {
    if (!window.designerMode) {
      this.showNotification('Designer Mode not available', 'error');
      return;
    }

    try {
      this.elements.loadBtn.disabled = true;
      this.elements.loadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

      const content = await this.auth.loadFromGitHub('content-schema.json');

      if (!content) {
        throw new Error('No content found in repository');
      }

      window.designerMode.currentContent = content;
      window.designerMode.saveToStorage();
      window.designerMode.applyContent();

      this.showNotification('Content loaded from GitHub successfully', 'success');
      this.hidePanel();
    } catch (error) {
      console.error('Load failed:', error);
      this.showNotification('Load failed: ' + error.message, 'error');
    } finally {
      this.elements.loadBtn.disabled = false;
      this.elements.loadBtn.innerHTML = '<i class="fas fa-cloud-download-alt"></i> Load from GitHub';
    }
  }

  /**
   * Handle logout
   */
  handleLogout() {
    if (confirm('Are you sure you want to disconnect from GitHub?')) {
      this.auth.logout();
      this.showNotification('Disconnected from GitHub', 'info');
      this.hidePanel();
    }
  }

  /**
   * Show notification message
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'auth-notification ' + type;
    notification.innerHTML = `
      <i class="fas ${this.getNotificationIcon(type)}"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('visible'), 10);

    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type) {
    const icons = {
      'success': 'fa-check-circle',
      'error': 'fa-exclamation-circle',
      'info': 'fa-info-circle',
      'warning': 'fa-exclamation-triangle'
    };

    return icons[type] || icons.info;
  }
}

// Export for use
window.AuthUI = AuthUI;
