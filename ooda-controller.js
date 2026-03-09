/**
 * OODA LOOP CONTROLLER
 * Observe-Orient-Decide-Act Monitoring System for Designer Mode CMS
 *
 * Based on John Boyd's decision cycle for continuous monitoring and intelligent sync
 *
 * Phases:
 * - OBSERVE: Detect changes in environment (GitHub, local, network, activity)
 * - ORIENT: Analyze context and assess situation (conflicts, risks, strategies)
 * - DECIDE: Choose course of action (auto-sync, prompt, queue, wait)
 * - ACT: Execute the decision (sync operations, UI updates, logging)
 */

class OODAController {
  constructor(config = {}) {
    // Configuration
    this.config = {
      intervalMs: config.intervalMs || 30000, // 30 seconds default
      maxHistory: config.maxHistory || 100,
      autoSync: config.autoSync !== false,
      notifyConflicts: config.notifyConflicts !== false,
      logLevel: config.logLevel || 'info', // 'debug', 'info', 'warn', 'error'
      enableDashboard: config.enableDashboard !== false
    };

    // Dependencies
    this.githubAuth = config.githubAuth || null;
    this.contentManager = config.contentManager || null;
    this.syncManager = config.syncManager || null;
    this.ui = config.ui || null;

    // OODA Modules
    this.observe = new ObserveModule(this.githubAuth, this.contentManager);
    this.orient = new OrientModule();
    this.decide = new DecideModule();
    this.act = new ActModule(this.syncManager, this.ui);

    // State
    this.running = false;
    this.interval = null;
    this.history = [];
    this.currentPhase = 'idle'; // 'idle', 'observe', 'orient', 'decide', 'act'

    // Metrics
    this.metrics = {
      totalCycles: 0,
      successfulCycles: 0,
      failedCycles: 0,
      syncCount: 0,
      conflictCount: 0,
      autoSyncCount: 0,
      manualSyncCount: 0,
      averageCycleTime: 0,
      lastCycleTime: null
    };

    // State tracking
    this.state = {
      lastGitHubCheck: null,
      lastLocalCheck: null,
      pendingChanges: [],
      activeConflicts: [],
      networkOnline: navigator.onLine,
      userActive: true,
      lastUserActivity: Date.now()
    };

    // Logging
    this.logs = [];
    this.maxLogs = 200;

    // Event listeners
    this.setupEventListeners();

    this.log('info', 'OODA Controller initialized', {
      interval: this.config.intervalMs,
      autoSync: this.config.autoSync
    });
  }

  /**
   * Setup event listeners for system events
   */
  setupEventListeners() {
    // Network status
    window.addEventListener('online', () => {
      this.state.networkOnline = true;
      this.log('info', 'Network connection restored');
      this.notify('network-online', { online: true });
    });

    window.addEventListener('offline', () => {
      this.state.networkOnline = false;
      this.log('warn', 'Network connection lost');
      this.notify('network-offline', { online: false });
    });

    // User activity tracking
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.state.lastUserActivity = Date.now();
        if (!this.state.userActive) {
          this.state.userActive = true;
          this.log('debug', 'User became active');
        }
      }, { passive: true });
    });

    // Check for idle user
    setInterval(() => {
      const idleTime = Date.now() - this.state.lastUserActivity;
      if (idleTime > 300000 && this.state.userActive) { // 5 minutes
        this.state.userActive = false;
        this.log('debug', 'User went idle');
      }
    }, 60000);

    // Listen for manual sync requests
    window.addEventListener('ooda-force-sync', () => {
      this.runCycle('manual');
    });

    // Listen for pause/resume
    window.addEventListener('ooda-pause', () => this.stop());
    window.addEventListener('ooda-resume', () => this.start());

    // Listen for interval changes
    window.addEventListener('ooda-set-interval', (e) => {
      this.setInterval(e.detail.intervalMs);
    });
  }

  /**
   * Start the OODA loop
   */
  start() {
    if (this.running) {
      this.log('warn', 'OODA loop already running');
      return;
    }

    this.running = true;
    this.log('info', 'Starting OODA loop');

    // Run initial cycle
    this.runCycle();

    // Start interval
    this.interval = setInterval(() => {
      this.runCycle();
    }, this.config.intervalMs);

    // Notify listeners
    this.notify('ooda-started', {
      interval: this.config.intervalMs,
      autoSync: this.config.autoSync
    });
  }

  /**
   * Stop the OODA loop
   */
  stop() {
    if (!this.running) {
      this.log('warn', 'OODA loop not running');
      return;
    }

    this.running = false;
    this.currentPhase = 'idle';

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.log('info', 'OODA loop stopped');

    // Notify listeners
    this.notify('ooda-stopped', { reason: 'manual' });
  }

  /**
   * Run a single OODA cycle
   */
  async runCycle(trigger = 'scheduled') {
    if (!this.running && trigger === 'scheduled') {
      return;
    }

    const cycle = {
      id: Date.now(),
      trigger: trigger,
      started: new Date().toISOString(),
      status: 'pending'
    };

    try {
      // Update phase
      this.currentPhase = 'observe';
      this.notify('ooda-phase', { phase: 'observe' });

      // OBSERVE
      const observations = await this.observe.observe();
      cycle.observe = observations;

      // Update phase
      this.currentPhase = 'orient';
      this.notify('ooda-phase', { phase: 'orient' });

      // ORIENT
      const orientation = this.orient.orient(observations);
      cycle.orient = orientation;

      // Update phase
      this.currentPhase = 'decide';
      this.notify('ooda-phase', { phase: 'decide' });

      // DECIDE
      const decision = this.decide.decide(orientation, observations, this.config);
      cycle.decide = decision;

      // Update phase
      this.currentPhase = 'act';
      this.notify('ooda-phase', { phase: 'act' });

      // ACT
      const action = await this.act.act(decision, orientation, observations);
      cycle.act = action;

      // Complete cycle
      cycle.completed = new Date().toISOString();
      cycle.duration = new Date(cycle.completed) - new Date(cycle.started);
      cycle.status = action.status === 'error' ? 'error' : 'success';

      // Update metrics
      this.updateMetrics(cycle);

      // Store history
      this.addToHistory(cycle);

      // Update state
      this.updateState(observations, orientation, decision, action);

    } catch (error) {
      cycle.status = 'error';
      cycle.error = error.message;
      cycle.stack = error.stack;
      cycle.completed = new Date().toISOString();
      cycle.duration = new Date(cycle.completed) - new Date(cycle.started);

      this.log('error', 'OODA cycle failed', error);
      this.metrics.failedCycles++;
    }

    // Reset phase
    this.currentPhase = 'idle';
    this.notify('ooda-phase', { phase: 'idle' });

    // Notify cycle complete
    this.notify('ooda-cycle', cycle);

    return cycle;
  }

  /**
   * Update metrics based on cycle completion
   */
  updateMetrics(cycle) {
    this.metrics.totalCycles++;

    if (cycle.status === 'success') {
      this.metrics.successfulCycles++;
    } else {
      this.metrics.failedCycles++;
    }

    if (cycle.decide && cycle.decide.action === 'sync') {
      this.metrics.syncCount++;
      if (cycle.decide.auto) {
        this.metrics.autoSyncCount++;
      } else {
        this.metrics.manualSyncCount++;
      }
    }

    if (cycle.orient && cycle.orient.conflicts && cycle.orient.conflicts.length > 0) {
      this.metrics.conflictCount += cycle.orient.conflicts.length;
    }

    if (cycle.duration) {
      const totalTime = this.metrics.averageCycleTime * (this.metrics.totalCycles - 1) + cycle.duration;
      this.metrics.averageCycleTime = totalTime / this.metrics.totalCycles;
    }

    this.metrics.lastCycleTime = cycle.duration;
  }

  /**
   * Add cycle to history
   */
  addToHistory(cycle) {
    this.history.unshift(cycle);

    // Trim history if needed
    if (this.history.length > this.config.maxHistory) {
      this.history = this.history.slice(0, this.config.maxHistory);
    }
  }

  /**
   * Update internal state based on cycle results
   */
  updateState(observations, orientation, decision, action) {
    if (observations && observations.github) {
      this.state.lastGitHubCheck = observations.github.timestamp;
    }

    if (observations && observations.local) {
      this.state.lastLocalCheck = observations.local.timestamp;
    }

    if (orientation && orientation.conflicts) {
      this.state.activeConflicts = orientation.conflicts;
    }

    if (observations && observations.network) {
      this.state.networkOnline = observations.network.online;
    }
  }

  /**
   * Set the cycle interval
   */
  setInterval(intervalMs) {
    this.config.intervalMs = intervalMs;

    if (this.running) {
      // Restart with new interval
      this.stop();
      this.start();
    }

    this.log('info', `Interval updated to ${intervalMs}ms`);
    this.notify('ooda-interval-changed', { intervalMs });
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      running: this.running,
      phase: this.currentPhase,
      interval: this.config.intervalMs,
      config: this.config,
      metrics: this.metrics,
      state: this.state,
      lastCycle: this.history[0] || null
    };
  }

  /**
   * Get cycle history
   */
  getHistory(limit = 50) {
    return this.history.slice(0, limit);
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalCycles > 0
        ? ((this.metrics.successfulCycles / this.metrics.totalCycles) * 100).toFixed(2) + '%'
        : '0%',
      averageCycleTimeFormatted: this.formatDuration(this.metrics.averageCycleTime),
      lastCycleTimeFormatted: this.metrics.lastCycleTime
        ? this.formatDuration(this.metrics.lastCycleTime)
        : '--'
    };
  }

  /**
   * Get logs
   */
  getLogs(level = null, limit = 100) {
    let logs = this.logs;

    if (level) {
      logs = logs.filter(log => log.level === level);
    }

    return logs.slice(0, limit);
  }

  /**
   * Notify listeners of events
   */
  notify(event, data) {
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  }

  /**
   * Log message
   */
  log(level, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      phase: this.currentPhase
    };

    this.logs.unshift(logEntry);

    // Trim logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console output
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const configLevel = levels[this.config.logLevel] || 1;

    if (levels[level] >= configLevel) {
      const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[method](`[OODA ${level.toUpperCase()}] ${message}`, data || '');
    }
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(ms) {
    if (!ms) return '--';

    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.round((ms % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  }

  /**
   * Export state for debugging
   */
  exportState() {
    return {
      status: this.getStatus(),
      history: this.getHistory(),
      logs: this.getLogs(),
      metrics: this.getMetrics()
    };
  }

  /**
   * Clear history and logs
   */
  clearHistory() {
    this.history = [];
    this.logs = [];
    this.metrics = {
      totalCycles: 0,
      successfulCycles: 0,
      failedCycles: 0,
      syncCount: 0,
      conflictCount: 0,
      autoSyncCount: 0,
      manualSyncCount: 0,
      averageCycleTime: 0,
      lastCycleTime: null
    };

    this.log('info', 'History and metrics cleared');
    this.notify('ooda-history-cleared', {});
  }
}

/**
 * OBSERVE MODULE
 * Detect changes in environment
 */
class ObserveModule {
  constructor(githubAuth, contentManager) {
    this.githubAuth = githubAuth;
    this.contentManager = contentManager;
    this.lastGitHubETag = null;
    this.lastLocalHash = null;
  }

  async observe() {
    const observations = {
      github: await this.observeGitHub(),
      local: await this.observeLocal(),
      network: await this.observeNetwork(),
      activity: await this.observeActivity(),
      timestamp: new Date().toISOString()
    };

    return observations;
  }

  /**
   * Observe GitHub repository for changes
   */
  async observeGitHub() {
    const result = {
      hasChanges: false,
      commits: [],
      error: null
    };

    if (!this.githubAuth || !this.githubAuth.isAuthenticated) {
      result.authenticated = false;
      return result;
    }

    result.authenticated = true;

    try {
      // Get latest commits
      const repo = await this.githubAuth.getCurrentRepository();
      if (!repo) {
        result.error = 'No repository detected';
        return result;
      }

      // Get recent commits for content-schema.json
      const commits = await this.githubAuth.apiRequest(
        `/repos/${repo.owner}/${repo.repo}/commits?path=content-schema.json&per_page=5`
      );

      result.commits = commits;

      // Check for new commits
      if (commits && commits.length > 0) {
        const latestCommit = commits[0];
        if (this.lastGitHubETag !== latestCommit.sha) {
          result.hasChanges = true;
          result.newCommit = latestCommit;
          result.previousSha = this.lastGitHubETag;
          this.lastGitHubETag = latestCommit.sha;
        }
      }

      // Get file metadata
      try {
        const file = await this.githubAuth.apiRequest(
          `/repos/${repo.owner}/${repo.repo}/contents/content-schema.json`
        );
        result.fileSha = file.sha;
        result.fileSize = file.size;
      } catch (error) {
        // File might not exist yet
        result.fileExists = false;
      }

    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  /**
   * Observe local storage for changes
   */
  async observeLocal() {
    const result = {
      hasChanges: false,
      modifiedSections: [],
      unsavedEdits: false
    };

    if (!this.contentManager) {
      return result;
    }

    try {
      // Get current content
      const content = this.contentManager.currentContent;

      if (content) {
        // Calculate hash of current content
        const hash = this.hashContent(content);

        if (this.lastLocalHash && this.lastLocalHash !== hash) {
          result.hasChanges = true;
          result.previousHash = this.lastLocalHash;
        }

        this.lastLocalHash = hash;
        result.currentHash = hash;

        // Check for unsaved edits
        const editableElements = document.querySelectorAll('.cms-editable');
        const unsaved = [];

        editableElements.forEach(el => {
          const original = el.dataset.originalContent;
          const current = el.textContent;

          if (original && current !== original) {
            unsaved.push({
              id: el.dataset.cmsId,
              selector: el.tagName.toLowerCase(),
              original: original,
              current: current
            });
          }
        });

        result.unsavedEdits = unsaved.length > 0;
        result.unsavedCount = unsaved.length;
      }

      // Get last save time
      const saved = localStorage.getItem(this.contentManager.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        result.lastSaved = data._lastSaved || null;
      }

    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  /**
   * Observe network status
   */
  async observeNetwork() {
    const result = {
      online: navigator.onLine,
      latency: null,
      githubReachable: false
    };

    if (result.online) {
      try {
        // Test GitHub API connectivity
        const start = Date.now();
        const response = await fetch('https://api.github.com', {
          method: 'HEAD',
          cache: 'no-cache'
        });
        result.latency = Date.now() - start;
        result.githubReachable = response.ok || response.status === 304;
      } catch (error) {
        result.githubReachable = false;
        result.error = error.message;
      }
    }

    return result;
  }

  /**
   * Observe user activity
   */
  async observeActivity() {
    return {
      lastActivity: new Date().toISOString(),
      // More detailed tracking could be added here
      editing: document.activeElement &&
                document.activeElement.hasAttribute('contenteditable'),
      activeElement: document.activeElement ?
                       document.activeElement.tagName.toLowerCase() :
                       null
    };
  }

  /**
   * Hash content for comparison
   */
  hashContent(content) {
    const str = JSON.stringify(content);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
}

/**
 * ORIENT MODULE
 * Analyze context and assess situation
 */
class OrientModule {
  orient(observations) {
    const orientation = {
      conflicts: this.detectConflicts(observations),
      syncNeeded: this.assessSyncNeed(observations),
      riskLevel: this.calculateRisk(observations),
      strategy: this.determineStrategy(observations),
      canProceed: this.checkPreconditions(observations),
      assessment: this.generateAssessment(observations)
    };

    return orientation;
  }

  /**
   * Detect conflicts between local and remote
   */
  detectConflicts(observations) {
    const conflicts = [];

    // Check GitHub vs local changes
    if (observations.github.hasChanges && observations.local.hasChanges) {
      conflicts.push({
        type: 'divergence',
        severity: 'high',
        description: 'Both local and remote have changes',
        githubSha: observations.github.newCommit ? observations.github.newCommit.sha : null,
        localHash: observations.local.currentHash
      });
    }

    // Check for unsaved edits
    if (observations.local.unsavedEdits) {
      conflicts.push({
        type: 'unsaved',
        severity: 'low',
        description: 'Unsaved edits detected',
        count: observations.local.unsavedCount
      });
    }

    // Check network issues
    if (!observations.network.online) {
      conflicts.push({
        type: 'network',
        severity: 'critical',
        description: 'Network offline'
      });
    }

    // Check GitHub reachability
    if (observations.network.online && !observations.network.githubReachable) {
      conflicts.push({
        type: 'github-unreachable',
        severity: 'high',
        description: 'GitHub API unreachable'
      });
    }

    return conflicts;
  }

  /**
   * Assess if sync is needed
   */
  assessSyncNeed(observations) {
    // Need sync if:
    // - GitHub has changes
    // - Local has unsaved changes
    // - There are conflicts
    return observations.github.hasChanges ||
           observations.local.hasChanges ||
           observations.local.unsavedEdits;
  }

  /**
   * Calculate risk level
   */
  calculateRisk(observations) {
    let riskScore = 0;

    // Offline = high risk
    if (!observations.network.online) {
      riskScore += 50;
    }

    // Unsaved edits = medium risk
    if (observations.local.unsavedEdits) {
      riskScore += 20;
    }

    // GitHub changes = low risk
    if (observations.github.hasChanges) {
      riskScore += 10;
    }

    // GitHub unreachable = high risk
    if (observations.network.online && !observations.network.githubReachable) {
      riskScore += 40;
    }

    if (riskScore >= 50) return 'high';
    if (riskScore >= 30) return 'medium';
    return 'low';
  }

  /**
   * Determine sync strategy
   */
  determineStrategy(observations) {
    if (!observations.network.online) {
      return 'queue';
    }

    if (observations.github.hasChanges && observations.local.hasChanges) {
      return 'merge';
    }

    if (observations.github.hasChanges) {
      return 'pull';
    }

    if (observations.local.hasChanges) {
      return 'push';
    }

    return 'none';
  }

  /**
   * Check if preconditions are met
   */
  checkPreconditions(observations) {
    return {
      networkOk: observations.network.online,
      githubOk: observations.network.githubReachable,
      authenticated: observations.github.authenticated,
      canSync: observations.network.online && observations.network.githubReachable
    };
  }

  /**
   * Generate overall assessment
   */
  generateAssessment(observations) {
    const parts = [];

    if (observations.github.hasChanges) {
      parts.push('Remote changes detected');
    }

    if (observations.local.hasChanges) {
      parts.push('Local changes detected');
    }

    if (observations.local.unsavedEdits) {
      parts.push('Unsaved edits present');
    }

    if (!observations.network.online) {
      parts.push('Offline mode');
    }

    return parts.length > 0 ? parts.join(', ') : 'No changes detected';
  }
}

/**
 * DECIDE MODULE
 * Choose course of action
 */
class DecideModule {
  decide(orientation, observations, config) {
    const decision = {
      action: null,
      reason: null,
      auto: false,
      priority: 'normal',
      estimatedTime: 0,
      requiresUserAction: false
    };

    // Decision tree
    const criticalConflicts = orientation.conflicts.filter(c => c.severity === 'critical');

    if (criticalConflicts.length > 0) {
      decision.action = 'wait';
      decision.auto = true;
      decision.reason = 'Critical issues detected - waiting';
      decision.priority = 'critical';
    } else if (orientation.conflicts.length > 0) {
      decision.action = 'resolve-conflict';
      decision.auto = !config.notifyConflicts;
      decision.requiresUserAction = config.notifyConflicts;
      decision.reason = 'Conflicts require resolution';
      decision.priority = 'high';
    } else if (orientation.syncNeeded && orientation.canProceed.canSync) {
      decision.action = 'sync';
      decision.auto = config.autoSync;
      decision.reason = 'Safe to sync';
      decision.priority = orientation.riskLevel === 'high' ? 'high' : 'normal';
      decision.estimatedTime = this.estimateSyncTime(observations, orientation);
    } else if (!orientation.canProceed.networkOk) {
      decision.action = 'queue';
      decision.auto = true;
      decision.reason = 'Offline - queuing for later';
      decision.priority = 'low';
    } else {
      decision.action = 'none';
      decision.auto = true;
      decision.reason = 'No action needed';
      decision.priority = 'low';
    }

    return decision;
  }

  /**
   * Estimate sync operation time
   */
  estimateSyncTime(observations, orientation) {
    let baseTime = 1000; // 1 second base

    if (orientation.strategy === 'merge') {
      baseTime += 2000; // Merge takes longer
    }

    if (observations.network.latency) {
      baseTime += observations.network.latency;
    }

    return baseTime;
  }
}

/**
 * ACT MODULE
 * Execute decisions
 */
class ActModule {
  constructor(syncManager, ui) {
    this.syncManager = syncManager;
    this.ui = ui;
  }

  async act(decision, orientation, observations) {
    const result = {
      action: decision.action,
      status: 'pending',
      started: new Date().toISOString(),
      completed: null,
      error: null,
      data: null
    };

    try {
      switch (decision.action) {
        case 'sync':
          result.data = await this.performSync(orientation, observations);
          break;

        case 'resolve-conflict':
          result.data = await this.handleConflicts(orientation.conflicts, decision);
          break;

        case 'queue':
          result.data = await this.queueOperation(orientation);
          break;

        case 'wait':
          result.data = { message: 'Waiting for critical issues to resolve' };
          break;

        case 'none':
          result.status = 'skipped';
          result.data = { message: 'No action taken' };
          break;

        default:
          result.status = 'unknown';
          result.data = { message: `Unknown action: ${decision.action}` };
      }

      if (result.status === 'pending') {
        result.status = 'success';
      }

    } catch (error) {
      result.status = 'error';
      result.error = error.message;
      result.stack = error.stack;
    }

    result.completed = new Date().toISOString();
    return result;
  }

  /**
   * Perform sync operation
   */
  async performSync(orientation, observations) {
    const strategy = orientation.strategy;
    const results = {
      strategy: strategy,
      operations: []
    };

    switch (strategy) {
      case 'pull':
        results.operations.push(await this.pullChanges());
        break;

      case 'push':
        results.operations.push(await this.pushChanges());
        break;

      case 'merge':
        results.operations.push(await this.mergeChanges());
        break;

      case 'none':
        results.message = 'No sync needed';
        break;
    }

    return results;
  }

  /**
   * Pull changes from GitHub
   */
  async pullChanges() {
    if (this.ui && this.ui.loadFromGitHub) {
      await this.ui.loadFromGitHub();
      return { operation: 'pull', success: true, message: 'Changes loaded from GitHub' };
    }

    return { operation: 'pull', success: false, message: 'Load function not available' };
  }

  /**
   * Push changes to GitHub
   */
  async pushChanges() {
    if (this.ui && this.ui.syncToGitHub) {
      await this.ui.syncToGitHub();
      return { operation: 'push', success: true, message: 'Changes synced to GitHub' };
    }

    return { operation: 'push', success: false, message: 'Sync function not available' };
  }

  /**
   * Merge changes
   */
  async mergeChanges() {
    // For now, we'll pull changes and let user handle merge
    if (this.ui && this.ui.loadFromGitHub) {
      await this.ui.loadFromGitHub();
      return {
        operation: 'merge',
        success: true,
        message: 'Remote changes loaded - please review and merge manually'
      };
    }

    return { operation: 'merge', success: false, message: 'Merge function not available' };
  }

  /**
   * Handle conflicts
   */
  async handleConflicts(conflicts, decision) {
    if (decision.requiresUserAction) {
      // Show conflict resolution dialog
      return {
        operation: 'resolve-conflict',
        requiresAction: true,
        conflicts: conflicts,
        message: 'Please resolve conflicts manually'
      };
    }

    // Auto-resolve if configured
    return {
      operation: 'resolve-conflict',
      autoResolved: true,
      message: 'Conflicts auto-resolved (conservative approach)'
    };
  }

  /**
   * Queue operation for later
   */
  async queueOperation(orientation) {
    const queued = {
      timestamp: new Date().toISOString(),
      strategy: orientation.strategy,
      reason: 'Offline'
    };

    // Store in localStorage for later
    const queue = JSON.parse(localStorage.getItem('ooda-queue') || '[]');
    queue.push(queued);
    localStorage.setItem('ooda-queue', JSON.stringify(queue));

    return {
      operation: 'queue',
      success: true,
      message: 'Operation queued for when online',
      queuedCount: queue.length
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OODAController, ObserveModule, OrientModule, DecideModule, ActModule };
}
