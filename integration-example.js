/**
 * GITHUB ADMIN PANEL INTEGRATION EXAMPLE
 *
 * This file demonstrates how to integrate the GitHub Admin Panel
 * into your Designer Mode CMS setup.
 */

// ============================================================================
// METHOD 1: Automatic Integration (Recommended)
// ============================================================================

// The GitHub Admin Panel is automatically initialized when Designer Mode
// is activated, provided that:
// 1. GitHub authentication is set up
// 2. The user is authenticated
// 3. github-admin-panel.js is loaded before designer-mode.js

// No additional code needed! The panel will appear when you press Ctrl+Shift+E

// ============================================================================
// METHOD 2: Manual Integration
// ============================================================================

// If you need more control over when the panel is created, you can
// manually initialize it:

class DesignerModeWithManualPanel {
  constructor() {
    this.githubAuth = null;
    this.githubAdminPanel = null;
    this.init();
  }

  async init() {
    // Initialize GitHub Auth
    this.githubAuth = new GitHubAuth({
      clientId: 'your-client-id',
      scopes: ['repo', 'user:email']
    });

    // Wait for authentication
    this.githubAuth.on('onAuthChange', (data) => {
      if (data.authenticated) {
        // Manually create the panel
        if (typeof GitHubAdminPanel !== 'undefined') {
          this.githubAdminPanel = new GitHubAdminPanel(this);
          // Don't call create() yet - wait for Designer Mode activation
        }
      }
    });
  }

  activate() {
    // Your activation logic
    document.body.classList.add('designer-mode');

    // Now create the panel
    if (this.githubAdminPanel) {
      this.githubAdminPanel.create();
      // Make globally accessible
      window.githubAdminPanel = this.githubAdminPanel;
    }
  }

  deactivate() {
    // Your deactivation logic
    document.body.classList.remove('designer-mode');

    // Destroy the panel
    if (this.githubAdminPanel) {
      this.githubAdminPanel.destroy();
    }
  }
}

// ============================================================================
// METHOD 3: Event-Based Integration
// ============================================================================

// Listen for Designer Mode activation events and create panel accordingly

document.addEventListener('designer-mode-activated', () => {
  if (window.designerMode && window.designerMode.githubAuth) {
    if (!window.githubAdminPanel) {
      window.githubAdminPanel = new GitHubAdminPanel(window.designerMode);
      window.githubAdminPanel.create();
    }
  }
});

document.addEventListener('designer-mode-deactivated', () => {
  if (window.githubAdminPanel) {
    window.githubAdminPanel.destroy();
  }
});

// ============================================================================
// ADVANCED: Custom Panel Configuration
// ============================================================================

class CustomGitHubAdminPanel extends GitHubAdminPanel {
  constructor(designerMode) {
    super(designerMode);

    // Override default settings
    this.autoSyncInterval = 60000; // 1 minute instead of 5 minutes
    this.oodaCycleInterval = 10000; // 10 seconds instead of 5
  }

  // Override sync behavior
  async syncToGitHub() {
    // Add custom pre-sync logic
    console.log('Starting custom sync...');

    // Validate content before syncing
    if (!this.validateContent()) {
      this.showError('Content validation failed');
      return;
    }

    // Call parent sync method
    await super.syncToGitHub();

    // Add custom post-sync logic
    this.logSyncMetrics();
  }

  validateContent() {
    // Your validation logic
    return true;
  }

  logSyncMetrics() {
    // Your metrics logging
    console.log('Sync metrics logged');
  }

  // Customize OODA decision logic
  async oodaDecide() {
    await super.oodaDecide();

    // Add custom decision logic
    if (this.oodaStatus.decide.action === 'push') {
      // Check if auto-sync is enabled
      if (this.shouldAutoSync()) {
        console.log('Auto-syncing based on OODA decision');
        await this.syncToGitHub();
      }
    }
  }

  shouldAutoSync() {
    // Your auto-sync logic
    return false; // Default: require manual sync
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

// Example 1: Monitor OODA Status
function monitorOODAStatus() {
  setInterval(() => {
    if (window.githubAdminPanel) {
      const ooda = window.githubAdminPanel.oodaStatus;
      console.log('OODA Cycle:', ooda.decide.action);
      console.log('Confidence:', ooda.decide.confidence + '%');
      console.log('Cycle Time:', ooda.cycleTime + 'ms');
    }
  }, 5000);
}

// Example 2: Custom Sync Button
document.getElementById('custom-sync-btn').addEventListener('click', async () => {
  if (window.githubAdminPanel) {
    try {
      await window.githubAdminPanel.syncToGitHub();
      alert('Sync successful!');
    } catch (error) {
      alert('Sync failed: ' + error.message);
    }
  }
});

// Example 3: Branch Operations
async function createFeatureBranch(featureName) {
  if (window.githubAdminPanel) {
    const branchName = `feature/${featureName}-${Date.now()}`;

    // Create branch
    await window.githubAdminPanel.createDraftBranch();

    // Switch to new branch (requires additional implementation)
    console.log(`Created and switched to branch: ${branchName}`);
  }
}

// Example 4: Listen to Panel Events
function setupPanelEventListeners() {
  if (window.githubAdminPanel) {
    // Listen for sync completion
    window.githubAdminPanel.onSyncComplete = (result) => {
      console.log('Sync completed:', result);
    };

    // Listen for conflicts
    window.githubAdminPanel.onConflictDetected = (conflicts) => {
      console.log('Conflicts detected:', conflicts);
      // Handle conflicts
    };

    // Listen for branch changes
    window.githubAdminPanel.onBranchChanged = (branch) => {
      console.log('Switched to branch:', branch);
    };
  }
}

// Example 5: Statistics Dashboard
function displayGitHubStats() {
  if (window.githubAdminPanel) {
    const stats = window.githubAdminPanel.stats;

    console.log('Total Commits:', stats.totalCommits);
    console.log('Changes Today:', stats.changesToday);
    console.log('Changes This Week:', stats.changesWeek);
    console.log('Assets Uploaded:', stats.assetsUploaded);
    console.log('Sync Success Rate:', stats.syncSuccessRate + '%');
    console.log('API Rate Limit:', stats.apiRateLimit.remaining + '/' + stats.apiRateLimit.limit);
  }
}

// Example 6: Custom Conflict Resolution
async function resolveConflictsAutomatically() {
  if (window.githubAdminPanel) {
    const conflicts = window.githubAdminPanel.conflicts;

    for (const conflict of conflicts) {
      // Your conflict resolution logic
      if (conflict.type === 'content') {
        // Use local version for content conflicts
        await conflict.resolve('local');
      } else if (conflict.type === 'structure') {
        // Use remote version for structure conflicts
        await conflict.resolve('remote');
      } else {
        // Manual merge for complex conflicts
        await conflict.resolve('merge');
      }
    }
  }
}

// Example 7: Backup Before Sync
async function safeSyncWithBackup() {
  if (window.githubAdminPanel) {
    // Create backup
    const backup = {
      timestamp: new Date().toISOString(),
      content: window.designerMode.currentContent
    };

    localStorage.setItem('last-backup', JSON.stringify(backup));

    try {
      // Attempt sync
      await window.githubAdminPanel.syncToGitHub();
      console.log('Sync successful, backup kept');
    } catch (error) {
      console.error('Sync failed, backup available:', backup);
      throw error;
    }
  }
}

// Example 8: Scheduled Auto-Sync
function setupScheduledAutoSync(intervalMinutes) {
  const interval = intervalMinutes * 60 * 1000;

  setInterval(async () => {
    if (window.githubAdminPanel && window.githubAdminPanel.githubAuth.isAuthenticated) {
      try {
        console.log('Running scheduled sync...');
        await window.githubAdminPanel.syncToGitHub();
        console.log('Scheduled sync completed');
      } catch (error) {
        console.error('Scheduled sync failed:', error);
      }
    }
  }, interval);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Your initialization code here
    console.log('GitHub Admin Panel integration ready');
  });
} else {
  // DOM already loaded
  console.log('GitHub Admin Panel integration ready');
}
