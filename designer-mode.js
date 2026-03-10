/**
 * DESIGNER MODE - Embedded CMS Prototype
 * Toggle: Ctrl+Shift+E (or Cmd+Shift+E on Mac)
 */

class DesignerMode {
  constructor() {
    this.isActive = false;
    this.storageKey = 'loonix-cms-content';
    this.historyKey = 'loonix-cms-history';
    this.schema = null;
    this.currentContent = null;
    this.editableElements = [];
    this.versionHistory = [];

    // GitHub Authentication (PAT-based for GitHub Pages)
    this.githubClient = null;
    this.patAuthUI = null;

    // Visual Style Editor
    this.visualStyleEditor = null;

    // Media Manager
    this.mediaManager = null;
    this.mediaManagerUI = null;

    // OODA Controller
    this.oodaController = null;
    this.oodaDashboard = null;

    // Drag-Drop Manager
    this.dragDropManager = null;

    this.init();
  }

  async init() {
    // Initialize GitHub Authentication
    this.initGitHubAuth();

    // Initialize Visual Style Editor
    this.initVisualStyleEditor();

    // Initialize OODA Controller
    this.initOODAController();

    // Initialize Drag-Drop Manager
    this.initDragDropManager();

    // Load content schema
    try {
      const response = await fetch('content-schema.json');
      this.schema = await response.json();
    } catch (error) {
      console.error('Failed to load schema:', error);
      return;
    }

    // Load saved content from localStorage
    this.loadContent();

    // Apply saved content to page
    this.applyContent();

    // Setup keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        this.toggle();
      }
    });

    console.log('🎨 Designer Mode ready. Press Ctrl+Shift+E to activate.');
  }

  /**
   * Initialize GitHub Authentication (PAT-based)
   */
  initGitHubAuth() {
    // Check if PatAuthUI is available
    if (typeof PatAuthUI === 'undefined') {
      console.warn('PatAuthUI not available. Make sure pat-auth-ui.js is loaded.');
      return;
    }

    // Initialize PAT authentication UI
    this.patAuthUI = new PatAuthUI(this.githubClient);

    // Set up success callback
    this.patAuthUI.onAuthSuccess = (token, userData) => {
      console.log('✅ Authentication successful for:', userData.login);
      // Initialize GitHub client with the new token
      this.initGitHubClient(token);
      // Update the auth status display
      this.updateAuthStatusDisplay();
    };

    // Make it globally accessible for the onclick handlers
    window.patAuthUI = this.patAuthUI;

    // Check if already authenticated
    console.log('🔍 Checking authentication status...');
    const isAuth = this.patAuthUI.isAuthenticated();
    console.log('📊 Is authenticated:', isAuth);

    if (isAuth) {
      const token = this.patAuthUI.getToken();
      console.log('🔑 Token found:', token ? 'Yes (' + token.substring(0, 10) + '...)' : 'No');
      if (token) {
        this.initGitHubClient(token);
      }
    } else {
      console.log('⚠️ No token found in localStorage');
    }

    console.log('🔐 GitHub PAT authentication initialized');
  }

  /**
   * Initialize GitHub API client with token
   */
  initGitHubClient(token) {
    if (typeof GitHubApiClient === 'undefined') {
      console.warn('GitHubApiClient not available. Make sure github-client.js is loaded.');
      return;
    }

    if (!token) {
      console.warn('No token available for GitHub client');
      return;
    }

    // Get repo info from current page
    const owner = 'loonix'; // GitHub username/organization
    const repo = 'website'; // Repository name

    this.githubClient = new GitHubApiClient({
      token: token,
      owner: owner,
      repo: repo,
      branch: 'main',
      authType: 'pat',
      enableLogging: true
    });

    console.log('✅ GitHub API client initialized');
  }

  /**
   * Check if user is authenticated via PAT
   */
  isAuthenticated() {
    return this.patAuthUI && this.patAuthUI.isAuthenticated();
  }

  /**
   * Get the current access token
   */
  getAccessToken() {
    if (!this.isAuthenticated()) {
      return null;
    }
    return this.patAuthUI.getToken();
  }

  /**
   * Initialize Visual Style Editor
   */
  initVisualStyleEditor() {
    // Check if VisualStyleEditor is available
    if (typeof VisualStyleEditor !== 'undefined') {
      this.visualStyleEditor = new VisualStyleEditor(this);
      console.log('🎨 Visual Style Editor initialized');
    } else {
      console.warn('Visual Style Editor not available. Make sure visual-editor.js is loaded.');
    }
  }

  /**
   * Initialize OODA Controller
   */
  initOODAController() {
    // Check if OODAController is available
    if (typeof OODAController === 'undefined') {
      console.warn('OODAController not available. Make sure ooda-controller.js is loaded.');
      return;
    }

    // Wait for GitHub auth to potentially be ready
    setTimeout(() => {
      if (this.isAuthenticated() && this.githubClient) {
        // Initialize OODA Controller with full configuration
        this.oodaController = new OODAController({
          githubClient: this.githubClient,
          contentManager: this,
          syncManager: this,
          ui: this,
          intervalMs: 30000, // 30 seconds
          autoSync: true,
          notifyConflicts: true,
          logLevel: 'info',
          enableDashboard: true
        });

        // Initialize Dashboard
        if (typeof OODADashboard !== 'undefined') {
          this.oodaDashboard = new OODADashboard(this.oodaController);
        }

        // Start OODA loop
        this.oodaController.start();

        console.log('🔄 OODA Loop Monitor initialized and started');
      } else {
        console.log('🔄 OODA Loop ready (will start when GitHub is authenticated)');
      }
    }, 1000);
  }

  /**
   * Initialize Drag-Drop Manager
   */
  initDragDropManager() {
    // Check if DragDropManager is available
    if (typeof DragDropManager === 'undefined') {
      console.warn('DragDropManager not available. Make sure drag-drop-manager.js is loaded.');
      return;
    }

    // Initialize drag-drop manager with configuration
    this.dragDropManager = new DragDropManager({
      containerSelector: '#articles .article-grid',
      itemSelector: '.article-card',
      handleSelector: '.drag-handle',
      storageKey: 'loonix-article-order',
      requiredPermission: 'admin',
      enableTouch: true,
      enableKeyboard: true,
      autoSave: true,
      saveDelay: 1000,

      // Authentication checker - checks both OAuth and Device Flow
      authChecker: () => {
        return this.isAuthenticated();
      },

      // Permission checker - checks both OAuth and Device Flow
      permissionChecker: (requiredPermission) => {
        if (!this.isAuthenticated()) {
          return false;
        }

        // Check if user has admin permissions
        // You can customize this based on your permission system
        return true;
      },

      // Callbacks
      onDragStart: (item) => {
        console.log('🎯 Drag started:', item.dataset.articleId);
      },

      onDragEnd: (item) => {
        console.log('✅ Drag ended:', item.dataset.articleId);
      },

      onReorder: (newOrder) => {
        console.log('📊 Articles reordered:', newOrder);
        this.handleArticleReorder(newOrder);
      }
    });

    console.log('🔄 Drag-Drop Manager initialized');
  }

  /**
   * Handle article reordering
   */
  async handleArticleReorder(newOrder) {
    // Update content schema with new order
    if (this.currentContent && this.currentContent.articles && this.currentContent.articles.items) {
      const items = this.currentContent.articles.items;

      // Create map of current items
      const itemMap = new Map(items.map(item => [item.id, item]));

      // Reorder items based on new order
      const reorderedItems = newOrder.map(id => itemMap.get(id)).filter(item => item);

      // Update items array
      this.currentContent.articles.items = reorderedItems;

      // Save to storage
      this.saveToStorage();

      // Show success indicator
      this.showReorderIndicator();
    }
  }

  /**
   * Show reorder success indicator
   */
  showReorderIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'save-indicator drag-success';
    indicator.textContent = '🔄 Articles reordered';
    document.body.appendChild(indicator);

    setTimeout(() => indicator.remove(), 2000);
  }

  loadContent() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.currentContent = JSON.parse(saved);
      } catch (e) {
        this.currentContent = JSON.parse(JSON.stringify(this.schema.content));
      }
    } else {
      this.currentContent = JSON.parse(JSON.stringify(this.schema.content));
    }

    // Load version history
    const history = localStorage.getItem(this.historyKey);
    if (history) {
      try {
        this.versionHistory = JSON.parse(history);
      } catch (e) {
        this.versionHistory = [];
      }
    }
  }

  applyContent() {
    if (!this.currentContent) return;

    // Apply all content from schema
    Object.keys(this.currentContent).forEach(section => {
      const sectionData = this.currentContent[section];

      if (sectionData.items) {
        // Handle arrays (like articles)
        sectionData.items.forEach((item, index) => {
          this.applyItemContent(item, index);
        });
      } else {
        // Handle individual items
        Object.keys(sectionData).forEach(key => {
          this.applyItemContent(sectionData[key]);
        });
      }
    });
  }

  applyItemContent(item, index = 0) {
    if (!item || !item.selector) return;

    const elements = document.querySelectorAll(item.selector);
    const element = elements[index] || elements[0];

    if (!element) return;

    if (item.type === 'link') {
      element.textContent = item.content;
      if (item.href) element.href = item.href;
    } else if (item.type === 'article' && item.title && item.description) {
      // For article cards with title and description
      const titleEl = element.querySelector('h3');
      const descEl = element.querySelector('p');
      const linkEl = element.querySelector('a');
      if (titleEl) titleEl.textContent = item.title;
      if (descEl) descEl.textContent = item.description;
      if (linkEl && item.link) linkEl.href = item.link;
    } else if (item.title && item.content) {
      // For feature cards with title and content
      const titleEl = element.querySelector('h3');
      const contentEl = element.querySelector('p');
      if (titleEl) titleEl.textContent = item.title;
      if (contentEl) {
        if (item.link) {
          contentEl.innerHTML = `${item.content}—<a href="${item.link}" target="_blank">see my work</a>`;
        } else {
          contentEl.textContent = item.content;
        }
      }
    } else if (item.content) {
      element.textContent = item.content;
    }
  }

  toggle() {
    this.isActive = !this.isActive;

    if (this.isActive) {
      this.activate();
    } else {
      this.deactivate();
    }
  }

  activate() {
    document.body.classList.add('designer-mode');

    // Create admin panel
    this.createAdminPanel();

    // Make elements editable
    this.makeEditable();

    // Show visual indicators
    this.showIndicators();

    // Save current state before editing
    this.saveVersion('Before editing session');

    console.log('✨ Designer Mode activated');
  }

  deactivate() {
    document.body.classList.remove('designer-mode');

    // Remove admin panel
    const panel = document.getElementById('designer-admin-panel');
    if (panel) panel.remove();

    // Remove editable attributes
    this.editableElements.forEach(el => {
      el.removeAttribute('contenteditable');
      el.classList.remove('cms-editable');
      el.removeEventListener('blur', this.handleBlur);
    });

    this.editableElements = [];

    console.log('🔒 Designer Mode deactivated');
  }

  createAdminPanel() {
    // Remove existing panel
    const existing = document.getElementById('designer-admin-panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'designer-admin-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <h3>🎨 Designer Mode</h3>
        <button id="close-panel" class="panel-btn">×</button>
      </div>
      <div class="panel-content">
        <div class="panel-section">
          <h4>Actions</h4>
          <div class="panel-buttons">
            <button id="save-all" class="panel-btn primary">💾 Save All</button>
            <button id="view-history" class="panel-btn">📜 History</button>
            <button id="export-content" class="panel-btn">📤 Export</button>
            <button id="import-content" class="panel-btn">📥 Import</button>
            <button id="toggle-style-editor" class="panel-btn style-editor">🎨 Style Editor</button>
            <button id="toggle-drag-drop" class="panel-btn drag-drop">🔄 Drag & Drop</button>
          </div>
        </div>
        <div class="panel-section">
          <h4>GitHub Sync</h4>
          <div class="panel-buttons">
            <div id="auth-status">
              <span class="auth-text">🔐 Authenticate GitHub</span>
              <button id="auth-github" class="panel-btn github auth">Sign In</button>
            </div>
            <button id="sync-github" class="panel-btn github">⬆️ Sync to GitHub</button>
            <button id="load-github" class="panel-btn github">⬇️ Load from GitHub</button>
          </div>
        </div>
        <div class="panel-section">
          <h4>Stats</h4>
          <div class="panel-stats">
            <span>Editable elements: <strong id="element-count">0</strong></span>
            <span>Versions: <strong id="version-count">0</strong></span>
          </div>
        </div>
        <div class="panel-section">
          <h4>Info</h4>
          <p class="panel-info">Click any highlighted text to edit. Changes auto-save on blur.</p>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Update auth status display
    this.updateAuthStatusDisplay();

    // Add event listeners
    document.getElementById('close-panel').addEventListener('click', () => this.toggle());
    document.getElementById('save-all').addEventListener('click', () => this.saveAll());
    document.getElementById('view-history').addEventListener('click', () => this.showHistory());
    document.getElementById('export-content').addEventListener('click', () => this.exportContent());
    document.getElementById('import-content').addEventListener('click', () => this.importContent());

    // Style Editor button
    document.getElementById('toggle-style-editor').addEventListener('click', () => this.toggleStyleEditor());

    // Drag-Drop button
    document.getElementById('toggle-drag-drop').addEventListener('click', () => this.toggleDragDrop());

    // GitHub sync buttons
    document.getElementById('auth-github').addEventListener('click', () => this.authenticateGitHub());
    document.getElementById('sync-github').addEventListener('click', () => this.syncToGitHub());
    document.getElementById('load-github').addEventListener('click', () => this.loadFromGitHub());
  }

  /**
   * Authenticate with GitHub using PAT
   */
  authenticateGitHub() {
    if (!this.patAuthUI) {
      alert('PAT Auth UI not available. Make sure pat-auth-ui.js is loaded.');
      return;
    }

    this.patAuthUI.show();
  }

  /**
   * Update authentication status display in panel
   */
  updateAuthStatusDisplay() {
    const authStatusEl = document.getElementById('auth-status');
    if (!authStatusEl) return;

    if (this.isAuthenticated()) {
      // Get user data from localStorage
      const userDataStr = localStorage.getItem('github-user-data');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          authStatusEl.innerHTML = '<span class="auth-text">✅ Logged in as <strong>' + userData.login + '</strong></span><button id="auth-github" class="panel-btn github logout">Sign Out</button>';
        } catch (e) {
          authStatusEl.innerHTML = '<span class="auth-text">✅ Authenticated</span><button id="auth-github" class="panel-btn github logout">Sign Out</button>';
        }
      } else {
        authStatusEl.innerHTML = '<span class="auth-text">✅ Authenticated</span><button id="auth-github" class="panel-btn github logout">Sign Out</button>';
      }
      // Update event listener for logout button
      document.getElementById('auth-github').addEventListener('click', () => this.logoutGitHub());
    } else {
      authStatusEl.innerHTML = '<span class="auth-text">🔐 Authenticate GitHub</span><button id="auth-github" class="panel-btn github auth">Sign In</button>';
      // Update event listener for login button
      document.getElementById('auth-github').addEventListener('click', () => this.authenticateGitHub());
    }
  }

  /**
   * Logout from GitHub
   */
  logoutGitHub() {
    if (this.patAuthUI) {
      this.patAuthUI.logout();
    } else {
      // Fallback: just clear storage
      localStorage.removeItem('github-pat-token');
      localStorage.removeItem('github-token');
      localStorage.removeItem('github-token-type');
      localStorage.removeItem('github-user-data');
      window.location.reload();
    }
  }


  makeEditable() {
    const content = this.currentContent;

    Object.keys(content).forEach(section => {
      const sectionData = content[section];

      if (sectionData.items) {
        sectionData.items.forEach((item, index) => {
          this.makeElementEditable(item, index);
        });
      } else {
        Object.keys(sectionData).forEach(key => {
          this.makeElementEditable(sectionData[key]);
        });
      }
    });

    // Update stats
    setTimeout(() => {
      const countEl = document.getElementById('element-count');
      if (countEl) countEl.textContent = this.editableElements.length;
    }, 100);
  }

  makeElementEditable(item, index = 0) {
    if (!item || !item.selector || !item.id) return;

    const elements = document.querySelectorAll(item.selector);
    const element = elements[index] || elements[0];

    if (!element) return;

    element.classList.add('cms-editable');
    element.setAttribute('contenteditable', 'true');
    element.dataset.cmsId = item.id;

    // Save original content
    element.dataset.originalContent = element.textContent;

    // Add blur handler for auto-save
    element.addEventListener('blur', () => this.handleBlur(element, item));

    this.editableElements.push(element);
  }

  handleBlur(element, item) {
    const newContent = element.textContent.trim();
    const originalContent = element.dataset.originalContent;

    if (newContent !== originalContent) {
      // Update content object
      item.content = newContent;

      // Save to localStorage
      this.saveToStorage();

      // Update original content reference
      element.dataset.originalContent = newContent;

      // Show save indicator
      this.showSaveIndicator(element);

      console.log(`💾 Saved: ${item.id}`);
    }
  }

  saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.currentContent));
  }

  saveAll() {
    this.saveToStorage();
    this.saveVersion('Manual save');
    alert('✅ All changes saved!');
  }

  saveVersion(description) {
    const version = {
      timestamp: new Date().toISOString(),
      description: description,
      content: JSON.parse(JSON.stringify(this.currentContent))
    };

    this.versionHistory.unshift(version);

    // Keep only last 50 versions
    if (this.versionHistory.length > 50) {
      this.versionHistory = this.versionHistory.slice(0, 50);
    }

    localStorage.setItem(this.historyKey, JSON.stringify(this.versionHistory));

    // Update stats
    const countEl = document.getElementById('version-count');
    if (countEl) countEl.textContent = this.versionHistory.length;
  }

  showHistory() {
    if (this.versionHistory.length === 0) {
      alert('No version history yet.');
      return;
    }

    let historyText = 'Version History:\n\n';
    this.versionHistory.forEach((v, i) => {
      const date = new Date(v.timestamp).toLocaleString();
      historyText += `${i + 1}. ${date}\n   ${v.description}\n\n`;
    });

    const versionNum = prompt(
      historyText + '\nEnter version number to restore (or cancel):',
      this.versionHistory.length
    );

    if (versionNum && !isNaN(versionNum)) {
      const index = parseInt(versionNum) - 1;
      if (index >= 0 && index < this.versionHistory.length) {
        this.restoreVersion(index);
      }
    }
  }

  restoreVersion(index) {
    const version = this.versionHistory[index];
    this.currentContent = JSON.parse(JSON.stringify(version.content));
    this.saveToStorage();
    this.applyContent();

    // Re-apply editability if in designer mode
    if (this.isActive) {
      this.editableElements = [];
      this.makeEditable();
    }

    alert(`✅ Restored version from ${new Date(version.timestamp).toLocaleString()}`);
  }

  exportContent() {
    const dataStr = JSON.stringify(this.currentContent, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `loonix-content-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  importContent() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          this.currentContent = imported;
          this.saveToStorage();
          this.applyContent();

          if (this.isActive) {
            this.editableElements = [];
            this.makeEditable();
          }

          alert('✅ Content imported successfully!');
        } catch (error) {
          alert('❌ Failed to import content. Invalid JSON.');
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }

  showIndicators() {
    // Add pulsing border to all editable elements
    const style = document.createElement('style');
    style.id = 'designer-mode-styles';
    style.textContent = `
      .cms-editable {
        outline: 2px dashed #00ff41 !important;
        outline-offset: 2px;
        transition: all 0.2s ease;
      }
      .cms-editable:hover {
        outline: 2px solid #00ff41 !important;
        background: rgba(0, 255, 65, 0.05);
      }
      .cms-editable:focus {
        outline: 2px solid #ff00ff !important;
        background: rgba(255, 0, 255, 0.05);
      }
      .save-indicator {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #00ff41;
        color: #000;
        padding: 10px 20px;
        border-radius: 4px;
        font-weight: bold;
        animation: fadeInOut 2s ease forwards;
        z-index: 10000;
      }
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-10px); }
        20% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  showSaveIndicator(element) {
    const indicator = document.createElement('div');
    indicator.className = 'save-indicator';
    indicator.textContent = '💾 Saved';
    document.body.appendChild(indicator);

    setTimeout(() => indicator.remove(), 2000);
  }

  /**
   * Toggle Visual Style Editor
   */
  toggleStyleEditor() {
    if (!this.visualStyleEditor) {
      alert('Visual Style Editor is not available. Please ensure visual-editor.js is loaded.');
      return;
    }

    this.visualStyleEditor.toggle();
  }

  /**
   * Toggle Drag-Drop Mode
   */
  toggleDragDrop() {
    if (!this.dragDropManager) {
      alert('Drag-Drop Manager is not available. Please ensure drag-drop-manager.js is loaded.');
      return;
    }

    const button = document.getElementById('toggle-drag-drop');

    if (this.dragDropManager.isEnabled) {
      // Disable drag-drop
      this.dragDropManager.disable();
      button.classList.remove('active');
      button.textContent = '🔄 Drag & Drop';
      console.log('🔒 Drag-Drop disabled');
    } else {
      // Enable drag-drop
      const success = this.dragDropManager.enable();

      if (success) {
        button.classList.add('active');
        button.textContent = '✓ Drag & Drop ON';
        console.log('✅ Drag-Drop enabled');

        // Show help message
        this.showDragDropHelp();
      } else {
        alert('❌ Failed to enable Drag & Drop. Please check authentication and permissions.');
      }
    }
  }

  /**
   * Show Drag-Drop help message
   */
  showDragDropHelp() {
    const helpText = `
🎯 DRAG & DROP MODE ACTIVE

• Drag articles using the handle that appears on hover
• Use arrow keys to move articles (when focused)
• Home/End keys move to first/last position
• Changes auto-save after 1 second
• Press the button again to disable

💡 Tip: On mobile, touch and drag the handle to reorder
    `;

    alert(helpText);
  }

  /**
   * Sync content to GitHub
   */
  async syncToGitHub() {
    if (!this.isAuthenticated()) {
      alert('Please authenticate with GitHub first');
      return;
    }

    if (!this.githubClient) {
      const token = this.getAccessToken();
      this.initGitHubClient(token);
      if (!this.githubClient) {
        alert('Failed to initialize GitHub client');
        return;
      }
    }

    try {
      const content = this.currentContent;

      if (!content) {
        throw new Error('No content to sync');
      }

      // Convert content to JSON string
      const contentString = JSON.stringify(content, null, 2);

      // Try to get the file first to check if it exists
      let sha = null;
      try {
        const existingFile = await this.githubClient.getFile('content-schema.json');
        sha = existingFile.sha;
        console.log('📄 File exists, updating with SHA:', sha);
      } catch (error) {
        console.log('📄 File does not exist, creating new file');
        // File doesn't exist, sha stays null
      }

      // Update or create file in GitHub repository
      await this.githubClient.updateFile(
        'content-schema.json',
        contentString,
        'Update content via Designer Mode',
        sha
      );

      alert('✅ Content synced to GitHub successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('❌ Sync failed: ' + error.message);
    }
  }

  /**
   * Load content from GitHub
   */
  async loadFromGitHub() {
    if (!this.isAuthenticated()) {
      alert('Please authenticate with GitHub first');
      return;
    }

    if (!this.githubClient) {
      const token = this.getAccessToken();
      this.initGitHubClient(token);
      if (!this.githubClient) {
        alert('Failed to initialize GitHub client');
        return;
      }
    }

    try {
      // Get file content from GitHub
      const file = await this.githubClient.getFile('content-schema.json');

      if (!file || !file.content) {
        throw new Error('No content found in repository');
      }

      // Parse JSON content
      const content = JSON.parse(file.content);

      this.currentContent = content;
      this.saveToStorage();
      this.applyContent();

      // Re-apply editability if in designer mode
      if (this.isActive) {
        this.editableElements = [];
        this.makeEditable();
      }

      alert('✅ Content loaded from GitHub successfully');
    } catch (error) {
      console.error('Load failed:', error);
      alert('❌ Load failed: ' + error.message);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.designerMode = new DesignerMode();
  });
} else {
  window.designerMode = new DesignerMode();
}
