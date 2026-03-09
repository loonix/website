# GitHub Admin Panel for Designer Mode CMS

A comprehensive GitHub repository management interface integrated into the Designer Mode CMS, providing full control over your GitHub operations directly from your website.

## Features

### 🔄 Sync Controls
- **Sync to GitHub**: Push local changes to your repository
- **Load from GitHub**: Pull remote changes to your local environment
- **Auto-Sync**: Automatic synchronization at configurable intervals
- **Conflict Detection**: Automatic detection and resolution of merge conflicts

### 🌿 Branch Management
- **Current Branch Display**: Always see which branch you're on
- **Create Draft Branches**: Quickly create draft branches for experimentation
- **Branch Comparison**: Compare any branch with main
- **Merge to Main**: Publish draft branches with one click
- **Branch Switcher**: Easy switching between branches

### 📜 Commit History
- **Recent Commits**: View last 10 commits with full details
- **Rollback Functionality**: Revert to any previous commit
- **Commit Details**: View author, message, and SHA for each commit
- **Full History Access**: Link to complete GitHub commit history

### ⚠️ Conflict Resolution
- **Conflict Alerts**: Visual warnings when conflicts are detected
- **Comparison View**: See differences between local and remote
- **Resolution Options**: Keep Local, Keep Remote, or Merge
- **Manual Merge Editor**: Fine-grained control over conflict resolution

### 📊 Statistics Dashboard
- **Total Commits**: Track your contribution count
- **Content Changes**: Daily, weekly, and monthly change statistics
- **Assets Uploaded**: Track media file uploads
- **Sync Success Rate**: Monitor synchronization health
- **API Rate Limit**: Stay within GitHub API limits

### 🎯 OODA Loop Monitor
Real-time OODA (Observe-Orient-Decide-Act) cycle monitoring:

#### Observe
- Last check timestamp
- Changes detected count
- Repository connection status
- Remote changes monitoring

#### Orient
- Conflict assessment
- Pending sync status
- Branch comparison (ahead/behind)
- Sync necessity evaluation

#### Decide
- Recommended action (push/pull/none)
- Decision reasoning
- Confidence level
- Decision timestamp

#### Act
- Last action performed
- Action result (success/failed/pending)
- Execution duration
- Timestamp

### ⚡ Quick Actions
- **Open in GitHub**: Launch repository in new tab
- **Create Issue**: Quick issue creation
- **View Pull Requests**: Access PR list
- **Refresh Status**: Manual status refresh
- **View Actions/Workflows**: GitHub Actions integration

## Installation

### 1. Include Required Files

Add these files to your HTML `<head>`:

```html
<!-- CSS -->
<link rel="stylesheet" href="github-admin-panel.css">

<!-- JavaScript (must load before designer-mode.js) -->
<script src="github-admin-panel.js"></script>
```

### 2. Ensure Dependencies

The GitHub Admin Panel requires:
- `github-auth.js` - GitHub authentication system
- `designer-mode.js` - Designer Mode CMS

### 3. Configure GitHub Authentication

Make sure your GitHub authentication is properly configured:

```javascript
// In designer-mode.js
this.githubAuth = new GitHubAuth({
  clientId: 'your-client-id', // Optional for OAuth
  scopes: ['repo', 'user:email', 'read:org']
});
```

## Usage

### Activating the Panel

1. **Activate Designer Mode**: Press `Ctrl+Shift+E` (or `Cmd+Shift+E` on Mac)
2. **GitHub Admin Panel Opens Automatically** if authenticated
3. **Manual Access**: Panel is also available via `window.githubAdminPanel`

### Navigation

The panel has 5 main tabs:

#### 1. Sync Tab
- View connection status
- Sync to/from GitHub
- Configure auto-sync
- Monitor conflicts

#### 2. Branches Tab
- View all branches
- Create draft branches
- Compare with main
- Merge branches

#### 3. History Tab
- View recent commits
- Rollback to previous versions
- View commit details

#### 4. Stats Tab
- View repository statistics
- Monitor sync success rate
- Check API rate limits

#### 5. OODA Tab
- Monitor OODA loop cycles
- View decision logic
- Track activity logs

## API Reference

### GitHubAdminPanel Class

#### Constructor
```javascript
constructor(designerMode)
```
Creates a new GitHub Admin Panel instance.

**Parameters:**
- `designerMode` - The Designer Mode instance

#### Methods

##### `create()`
Creates and displays the panel UI.

```javascript
panel.create();
```

##### `destroy()`
Removes the panel and cleans up resources.

```javascript
panel.destroy();
```

##### `updateStatus()`
Refreshes all GitHub status information.

```javascript
await panel.updateStatus();
```

##### `syncToGitHub()`
Pushes local changes to GitHub.

```javascript
await panel.syncToGitHub();
```

##### `loadFromGitHub()`
Pulls changes from GitHub.

```javascript
await panel.loadFromGitHub();
```

##### `showTab(tabName)`
Switches to a specific tab.

**Parameters:**
- `tabName` - One of: 'sync', 'branches', 'history', 'stats', 'ooda'

```javascript
panel.showTab('sync');
```

##### `createDraftBranch()`
Creates a new draft branch.

```javascript
await panel.createDraftBranch();
```

##### `compareBranch(branchName)`
Compares a branch with main.

**Parameters:**
- `branchName` - Name of the branch to compare

```javascript
panel.compareBranch('feature-branch');
```

##### `rollbackToCommit(sha)`
Rolls back to a specific commit.

**Parameters:**
- `sha` - Commit SHA to rollback to

```javascript
await panel.rollbackToCommit('abc123...');
```

## Configuration

### Auto-Sync Intervals

Available intervals:
- 30 seconds
- 1 minute
- 5 minutes (default)
- 10 minutes

### OODA Cycle Timing

Default OODA cycle runs every 5 seconds. To modify:

```javascript
// In github-admin-panel.js
setInterval(() => {
  this.runOODACycle();
}, 5000); // Change this value
```

## Customization

### Styling

The panel uses CSS custom properties for theming. Override these in your CSS:

```css
:root {
  --gap-primary: #00ff41;
  --gap-secondary: #ff00ff;
  --gap-bg: #0a0a0a;
  --gap-border: #00ff41;
}
```

### Panel Position

To change panel position:

```css
.github-admin-panel {
  top: 20px;
  right: 20px;
  /* or */
  bottom: 20px;
  left: 20px;
}
```

## Troubleshooting

### Panel Not Appearing

**Issue**: Panel doesn't show when Designer Mode is activated.

**Solutions**:
1. Check browser console for errors
2. Verify all script files are loaded
3. Ensure GitHub authentication is working
4. Check that `github-admin-panel.js` loads before `designer-mode.js`

### Authentication Errors

**Issue**: "Please authenticate with GitHub first" error.

**Solutions**:
1. Initialize GitHub authentication
2. Check token permissions
3. Verify repository access
4. Check API rate limits

### Sync Failures

**Issue**: Changes not syncing to GitHub.

**Solutions**:
1. Check internet connection
2. Verify repository exists
3. Check file permissions
4. Review conflict messages
5. Check API rate limit status

## Security Considerations

### Token Storage
- Tokens are encrypted using AES-GCM
- Encryption keys derived from PBKDF2
- Tokens stored in localStorage (encrypted)

### Permissions
Required GitHub scopes:
- `repo` - Full repository access
- `user:email` - Email access
- `read:org` - Organization read access

### Best Practices
1. Use Personal Access Tokens (PATs) for development
2. Use OAuth Apps for production
3. Regularly rotate tokens
4. Monitor API rate limits
5. Use draft branches for experiments

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Performance

### Optimizations
- Debounced API calls
- Lazy-loaded commit history
- Efficient DOM updates
- Optimized rendering loops

### Memory Management
- Auto-cleanup on destroy
- Limited history (50 commits max)
- Efficient event listener management
- RequestAnimationFrame for animations

## Integration Examples

### Custom Sync Button

```javascript
const syncButton = document.getElementById('my-sync-button');
syncButton.addEventListener('click', async () => {
  if (window.githubAdminPanel) {
    await window.githubAdminPanel.syncToGitHub();
  }
});
```

### Status Monitoring

```javascript
setInterval(async () => {
  if (window.githubAdminPanel) {
    await window.githubAdminPanel.updateStatus();
    const status = window.githubAdminPanel.oodaStatus;
    console.log('OODA Status:', status);
  }
}, 10000);
```

### Custom OODA Actions

```javascript
// Extend OODA decision logic
const originalDecide = window.githubAdminPanel.oodaDecide;
window.githubAdminPanel.oodaDecide = async function() {
  await originalDecide.call(this);

  // Custom logic
  if (this.oodaStatus.decide.action === 'push') {
    console.log('Auto-syncing changes...');
    await this.syncToGitHub();
  }
};
```

## Contributing

To extend the GitHub Admin Panel:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This component is part of the Designer Mode CMS project.

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review code comments
- Test in development environment first

## Changelog

### Version 1.0.0
- Initial release
- Full GitHub integration
- OODA loop monitoring
- Branch management
- Commit history
- Statistics dashboard
- Conflict resolution
- Auto-sync capabilities
