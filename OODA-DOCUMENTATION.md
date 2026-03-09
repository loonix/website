# OODA Loop Monitoring System

## Overview

The OODA (Observe-Orient-Decide-Act) Loop Monitoring System is an intelligent, continuous monitoring system for the Designer Mode CMS GitHub integration. Based on military strategist John Boyd's decision cycle, it provides automated sync capabilities while maintaining control and transparency.

## Architecture

### Four Phases

1. **OBSERVE** - Detect changes in environment
   - GitHub repository changes (commits, file modifications)
   - Local content changes (localStorage updates)
   - Network status (online/offline, GitHub API reachability)
   - User activity (editing/idle states)
   - Conflict detection

2. **ORIENT** - Analyze context and assess situation
   - Compare local vs remote states
   - Detect conflicts and assess severity
   - Calculate risk levels (low/medium/high)
   - Determine optimal sync strategy
   - Generate comprehensive assessment

3. **DECIDE** - Choose course of action
   - Auto-sync if safe and enabled
   - Prompt user if conflicts detected
   - Queue operations if offline
   - Prioritize critical changes
   - Estimate operation time

4. **ACT** - Execute decisions
   - Perform sync operations (push/pull/merge)
   - Show user prompts for conflicts
   - Queue operations for later
   - Update UI with notifications
   - Log all actions

## Installation

### 1. Include Required Files

Add these script tags to your HTML, preferably before `designer-mode.js`:

```html
<!-- OODA Loop System -->
<link rel="stylesheet" href="ooda-dashboard.css">
<script src="ooda-controller.js"></script>
<script src="ooda-dashboard.js"></script>
```

### 2. Update index.html

Add the OODA files in the correct order in your `index.html`:

```html
<head>
  <!-- Existing styles -->
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="designer-mode.css">
  <link rel="stylesheet" href="auth-ui.css">
  <link rel="stylesheet" href="ooda-dashboard.css">  <!-- Add this -->

  <!-- Existing scripts -->
  <script src="github-auth.js"></script>
  <script src="github-client.js"></script>
  <script src="auth-ui.js"></script>
  <script src="ooda-controller.js"></script>  <!-- Add this -->
  <script src="ooda-dashboard.js"></script>  <!-- Add this -->
  <script src="designer-mode.js"></script>
</head>
```

## Configuration

### Basic Setup

The OODA Controller is automatically initialized in `designer-mode.js`:

```javascript
this.oodaController = new OODAController({
  githubAuth: this.githubAuth,      // Required: GitHub authentication
  contentManager: this,             // Required: Content manager instance
  syncManager: this,                // Required: Sync manager
  ui: this,                         // Required: UI controller
  intervalMs: 30000,                // Optional: Check interval (default: 30s)
  autoSync: true,                   // Optional: Auto-sync when safe (default: true)
  notifyConflicts: true,            // Optional: Notify on conflicts (default: true)
  logLevel: 'info',                 // Optional: Log level (default: 'info')
  enableDashboard: true             // Optional: Show dashboard (default: true)
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `intervalMs` | number | 30000 | Cycle interval in milliseconds |
| `autoSync` | boolean | true | Automatically sync when safe |
| `notifyConflicts` | boolean | true | Show user prompts for conflicts |
| `logLevel` | string | 'info' | Logging level: 'debug', 'info', 'warn', 'error' |
| `enableDashboard` | boolean | true | Enable visual dashboard |
| `maxHistory` | number | 100 | Maximum cycles to keep in history |

### Interval Presets

Recommended intervals based on use case:

- **5 seconds** (5000ms): Real-time collaboration
- **30 seconds** (30000ms): Default, balanced
- **1 minute** (60000ms): Less frequent updates
- **5 minutes** (300000ms): Minimal overhead

## Dashboard UI

### Features

The OODA Dashboard provides real-time monitoring and control:

1. **Phase Visualization**
   - Animated phase transitions
   - Color-coded status indicators
   - Progress tracking

2. **Live Metrics**
   - Total cycles completed
   - Success rate percentage
   - Last cycle duration
   - Average cycle time
   - Sync count
   - Conflict count

3. **Decision Log**
   - Recent decisions with timestamps
   - Action taken and reasoning
   - Filter by type (All/Sync/Conflicts)

4. **Conflict Queue**
   - Active conflicts display
   - Severity indicators (high/medium/low)
   - Conflict descriptions

5. **Performance Chart**
   - Visual performance over time
   - Success/error rate visualization

6. **Manual Controls**
   - Start/Pause OODA loop
   - Force immediate cycle
   - Clear history
   - Export state for debugging
   - Adjust interval slider
   - Interval preset buttons

7. **System Status**
   - Network status (online/offline)
   - GitHub reachability
   - Authentication status
   - Pending changes count

### Using the Dashboard

#### Toggle Dashboard
Click the minimize/maximize button in the header to collapse/expand.

#### Adjust Interval
- Use the slider to set custom interval (5-300 seconds)
- Use preset buttons for quick access to common intervals

#### Force Cycle
Click "Force Cycle" to run an immediate OODA cycle regardless of interval.

#### Export State
Click "Export State" to download a JSON file containing:
- Complete history
- All logs
- Current metrics
- System status

Useful for debugging and analysis.

## Decision Logic

### Decision Tree

```
1. Are there critical conflicts?
   ├─ YES → Wait (pause monitoring)
   └─ NO → Continue

2. Are there conflicts?
   ├─ YES → Resolve Conflict (prompt user if notifyConflicts=true)
   └─ NO → Continue

3. Is sync needed and network OK?
   ├─ YES → Sync (auto if autoSync=true)
   └─ NO → Continue

4. Is network offline?
   ├─ YES → Queue (store for later)
   └─ NO → No action
```

### Sync Strategies

The system determines the optimal strategy based on observations:

| Situation | Strategy | Description |
|-----------|----------|-------------|
| GitHub has changes, local unchanged | Pull | Load latest from GitHub |
| Local has changes, GitHub unchanged | Push | Sync to GitHub |
| Both have changes | Merge | Pull and prompt for manual merge |
| Network offline | Queue | Store operation for later |
| Conflicts detected | Resolve | Handle based on severity |

## API Reference

### OODAController

#### Methods

```javascript
// Start the OODA loop
oodaController.start()

// Stop the OODA loop
oodaController.stop()

// Run a single cycle immediately
await oodaController.runCycle('manual')

// Set cycle interval
oodaController.setInterval(60000) // 1 minute

// Get current status
const status = oodaController.getStatus()
// Returns: { running, phase, interval, config, metrics, state, lastCycle }

// Get metrics
const metrics = oodaController.getMetrics()
// Returns: { totalCycles, successfulCycles, failedCycles, syncCount, ... }

// Get history
const history = oodaController.getHistory(50) // Last 50 cycles

// Get logs
const logs = oodaController.getLogs('error', 100) // Error logs, last 100

// Export all state
const state = oodaController.exportState()

// Clear history and metrics
oodaController.clearHistory()
```

#### Events

Listen to OODA events:

```javascript
// Phase changes
window.addEventListener('ooda-phase', (e) => {
  console.log('Current phase:', e.detail.phase)
})

// Cycle completed
window.addEventListener('ooda-cycle', (e) => {
  console.log('Cycle result:', e.detail)
})

// OODA started
window.addEventListener('ooda-started', (e) => {
  console.log('OODA started with interval:', e.detail.interval)
})

// OODA stopped
window.addEventListener('ooda-stopped', (e) => {
  console.log('OODA stopped, reason:', e.detail.reason)
})

// Network status
window.addEventListener('network-online', () => {
  console.log('Back online')
})

window.addEventListener('network-offline', () => {
  console.log('Gone offline')
})
```

#### Trigger Actions

```javascript
// Force a sync cycle
window.dispatchEvent(new CustomEvent('ooda-force-sync'))

// Pause OODA loop
window.dispatchEvent(new CustomEvent('ooda-pause'))

// Resume OODA loop
window.dispatchEvent(new CustomEvent('ooda-resume'))

// Change interval
window.dispatchEvent(new CustomEvent('ooda-set-interval', {
  detail: { intervalMs: 60000 }
}))
```

### OODADashboard

#### Methods

```javascript
// Create dashboard (automatically done by OODAController)
const dashboard = new OODADashboard(oodaController)

// Show dashboard
dashboard.show()

// Hide dashboard
dashboard.hide()

// Toggle visibility
dashboard.toggle()
```

## Monitoring & Debugging

### Log Levels

Set appropriate log level based on needs:

- **debug**: Detailed information for diagnostics
- **info**: General informational messages (default)
- **warn**: Warning messages
- **error**: Error messages only

### Accessing Logs

```javascript
// Get all logs
const allLogs = oodaController.getLogs()

// Get error logs only
const errorLogs = oodaController.getLogs('error')

// Get last 50 info logs
const infoLogs = oodaController.getLogs('info', 50)
```

### Console Output

Logs are automatically output to console based on log level:

```
[OODA INFO] Starting OODA loop { interval: 30000, autoSync: true }
[OODA INFO] OBSERVE: GitHub changes detected
[OODA INFO] ORIENT: Assessing situation
[OODA INFO] DECIDE: Safe to sync
[OODA INFO] ACT: Sync completed
```

## Best Practices

### 1. Choose Appropriate Interval

- **Development**: 30 seconds (default)
- **Production**: 1-5 minutes
- **Real-time collaboration**: 5-10 seconds

### 2. Handle Conflicts

Enable conflict notifications for important projects:

```javascript
const ooda = new OODAController({
  notifyConflicts: true,
  autoSync: false  // Manual approval for conflicts
})
```

### 3. Monitor Performance

Regularly check metrics:

```javascript
setInterval(() => {
  const metrics = ooda.getMetrics()
  if (metrics.failedCycles > metrics.totalCycles * 0.1) {
    console.warn('High failure rate detected')
  }
}, 60000)
```

### 4. Export State Regularly

For long-running applications, export state periodically:

```javascript
setInterval(() => {
  const state = ooda.exportState()
  localStorage.setItem('ooda-backup', JSON.stringify(state))
}, 300000) // Every 5 minutes
```

## Troubleshooting

### OODA not starting

**Problem**: OODA loop doesn't start automatically

**Solution**: Ensure GitHub authentication is working:

```javascript
// Check auth status
if (designerMode.githubAuth && designerMode.githubAuth.isAuthenticated) {
  // OODA should start
} else {
  console.log('Authenticate with GitHub first')
}
```

### High failure rate

**Problem**: Many cycles failing

**Solution**: Check network connectivity and GitHub API:

```javascript
// Check system status
const status = ooda.getStatus()
console.log('Network:', status.state.networkOnline)
console.log('GitHub reachable:', status.state.networkOnline)
```

### Conflicts not detected

**Problem**: Conflicts not being caught

**Solution**: Ensure proper SHA tracking:

```javascript
// Check observation data
const history = ooda.getHistory(1)
console.log('GitHub SHA:', history[0].observe.github.fileSha)
console.log('Local hash:', history[0].observe.local.currentHash)
```

### Dashboard not showing

**Problem**: Dashboard UI not visible

**Solution**: Check CSS is loaded:

```html
<link rel="stylesheet" href="ooda-dashboard.css">
```

And ensure OODADashboard class is available:

```javascript
console.log(typeof OODADashboard) // Should be 'function'
```

## Performance Considerations

### Memory Usage

- History limited to 100 cycles by default
- Logs limited to 200 entries
- Dashboard canvas limited to 20 data points

### Network Usage

- One GitHub API request per cycle
- ~1KB per request for commit data
- ETags used to minimize bandwidth

### CPU Usage

- Minimal: ~1-5ms per cycle
- Canvas rendering: ~10ms every 5 seconds
- DOM updates: ~5ms per cycle

## Security

### Token Storage

- Uses GitHubAuth's encrypted storage
- Never logs tokens
- Tokens never exported in state dumps

### API Access

- Respects GitHub rate limits
- Uses minimal API scope
- No sensitive data in logs

## Future Enhancements

Potential improvements:

1. **Webhook Support**: Real-time GitHub updates
2. **Conflict Resolution UI**: Interactive merge interface
3. **Advanced Analytics**: Performance trends and insights
4. **Custom Strategies**: User-defined decision logic
5. **Multi-repository**: Monitor multiple repos
6. **Branch Awareness**: Track multiple branches
7. **Collaborative Editing**: Real-time collaboration
8. **Offline Mode**: Full offline editing support

## License

Part of the Designer Mode CMS project.

## Support

For issues, questions, or contributions, please refer to the main project repository.
