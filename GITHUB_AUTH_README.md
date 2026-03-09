# GitHub Authentication System for Designer Mode

A complete, secure authentication system supporting multiple GitHub authentication methods with robust security features.

## Features

### Authentication Methods

1. **OAuth App Flow** (Recommended for Production)
   - Popup-based OAuth authentication
   - CSRF protection with state parameter
   - Configurable scopes (repo, user:email, read:org)
   - Automatic token handling
   - Session management

2. **Personal Access Token (PAT)** (For Development)
   - Simple token input
   - Automatic token validation
   - Permission verification
   - Secure encrypted storage

3. **GitHub App** (For Enterprise/Organizations)
   - Installation flow support
   - JWT authentication framework
   - Repository-level permissions
   - Organization management

### Security Features

- **AES-256-GCM Encryption**: All tokens encrypted using Web Crypto API
- **PBKDF2 Key Derivation**: 100,000 iterations for secure key generation
- **Secure Token Storage**: Encrypted tokens stored in localStorage
- **Session Management**: Automatic token expiration handling
- **CSRF Protection**: State parameter validation for OAuth flow
- **Token Validation**: Automatic permission verification
- **Multi-tab Sync**: Storage event listeners for session synchronization

### User Interface

- **Status Indicator**: Real-time connection status in bottom-right corner
- **Auth Panel**: Comprehensive authentication management interface
- **User Profile**: Display avatar, name, and auth type
- **Permission Display**: View granted scopes and permissions
- **Repository Info**: Show current repository context
- **Sync Actions**: Push/pull content from GitHub
- **Notifications**: Beautiful toast notifications for all actions

## Installation

### 1. Include Required Files

Add these lines to your HTML file (e.g., `index.html`):

```html
<!-- In <head> -->
<link rel="stylesheet" href="auth-ui.css">

<!-- Before closing </body> -->
<script src="github-auth.js"></script>
<script src="auth-ui.js"></script>
<script src="designer-mode.js"></script>
```

### 2. Configure OAuth (Optional)

For OAuth authentication, you need to create a GitHub OAuth App:

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: Your app name
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: `https://yourdomain.com/github-callback.html`
4. Copy the Client ID

Update the configuration in `designer-mode.js`:

```javascript
this.githubAuth = new GitHubAuth({
  clientId: 'YOUR_GITHUB_CLIENT_ID', // Add your Client ID here
  scopes: ['repo', 'user:email', 'read:org']
});
```

### 3. Set Up Backend (For OAuth)

OAuth requires a backend to exchange the authorization code for an access token. Here's a simple Node.js example:

```javascript
// server.js
const express = require('express');
const axios = require('axios');
const app = express();

app.post('/api/github/oauth', async (req, res) => {
  const { code } = req.body;

  // Exchange code for access token
  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: 'YOUR_CLIENT_ID',
      client_secret: 'YOUR_CLIENT_SECRET',
      code: code
    },
    {
      headers: { Accept: 'application/json' }
    }
  );

  res.json(response.data);
});

app.listen(3000);
```

## Usage

### Authenticating with OAuth

1. Click the GitHub button in the bottom-right corner
2. Select "OAuth App" method
3. Click "Sign in with GitHub"
4. Complete the OAuth flow in the popup
5. Your authentication will be saved automatically

### Authenticating with Personal Access Token

1. Click the GitHub button in the bottom-right corner
2. Select "Personal Access Token" method
3. Create a token at GitHub Settings > Developer settings > Personal access tokens
4. Select required scopes: `repo`, `user:email`, `read:org`
5. Paste the token into the input field
6. Click "Use Token"

### Syncing Content to GitHub

Once authenticated, you can sync content in two ways:

**Via Auth Panel:**
1. Click the GitHub button to open the panel
2. Click "Sync to GitHub" or "Load from GitHub"

**Via Designer Mode:**
1. Activate Designer Mode (Ctrl+Shift+E)
2. Click "Sync to GitHub" or "Load from GitHub" in the admin panel

## API Reference

### GitHubAuth Class

#### Constructor

```javascript
const auth = new GitHubAuth(config);
```

**Config Options:**
- `clientId` (string): GitHub OAuth App Client ID
- `redirectUri` (string): OAuth callback URL
- `scopes` (array): Requested OAuth scopes
- `appId` (string): GitHub App ID (for App flow)

#### Methods

##### `authenticateWithOAuth()`

Initiates OAuth popup flow.

```javascript
try {
  const userData = await auth.authenticateWithOAuth();
  console.log('Authenticated as', userData.login);
} catch (error) {
  console.error('Auth failed:', error);
}
```

##### `authenticateWithPAT(token)`

Authenticates with a Personal Access Token.

```javascript
try {
  const userData = await auth.authenticateWithPAT('ghp_xxxxxxxxxxxx');
  console.log('Authenticated as', userData.login);
} catch (error) {
  console.error('Auth failed:', error);
}
```

##### `fetchUserData()`

Fetches user data from GitHub API.

```javascript
const userData = await auth.fetchUserData();
```

##### `fetchPermissions()`

Fetches user permissions and scopes.

```javascript
const permissions = await auth.fetchPermissions();
console.log(permissions.scopes, permissions.repoPermissions);
```

##### `apiRequest(endpoint, options)`

Makes an authenticated API request.

```javascript
const repos = await auth.apiRequest('/user/repos');
```

##### `saveToGitHub(content, path, message)`

Saves content to a GitHub repository.

```javascript
await auth.saveToGitHub(
  { title: 'Hello' },
  'content.json',
  'Update content'
);
```

##### `loadFromGitHub(path)`

Loads content from a GitHub repository.

```javascript
const content = await auth.loadFromGitHub('content.json');
```

##### `logout()`

Clears authentication and session data.

```javascript
auth.logout();
```

#### Events

Subscribe to authentication events:

```javascript
auth.on('onAuthChange', (data) => {
  console.log('Auth changed:', data.authenticated);
});

auth.on('onTokenRefresh', (data) => {
  console.log('Token refreshed:', data.token);
});

auth.on('onError', (data) => {
  console.error('Auth error:', data.error);
});
```

### AuthUI Class

#### Constructor

```javascript
const ui = new AuthUI(auth);
```

#### Methods

##### `showPanel()`

Displays the authentication panel.

```javascript
ui.showPanel();
```

##### `hidePanel()`

Hides the authentication panel.

```javascript
ui.hidePanel();
```

##### `togglePanel()`

Toggles panel visibility.

```javascript
ui.togglePanel();
```

##### `updateUI(isAuthenticated)`

Updates the UI based on authentication state.

```javascript
ui.updateUI(true);
```

## Security Considerations

### Token Storage

All tokens are encrypted using AES-256-GCM before storage:
- Encryption keys derived using PBKDF2 with 100,000 iterations
- Keys stored as salt in localStorage (not the actual key)
- Each session derives a new key from the salt

### OAuth Security

- State parameter prevents CSRF attacks
- Popup flow prevents token leakage via referer headers
- Automatic state validation on callback
- Secure token exchange (requires backend)

### Best Practices

1. **Use HTTPS** in production
2. **Keep Client Secret** on backend only
3. **Implement rate limiting** on your backend
4. **Validate scopes** before making API calls
5. **Handle token expiration** gracefully
6. **Use environment variables** for sensitive config
7. **Implement proper CORS** on your backend
8. **Log authentication events** for security monitoring

## Troubleshooting

### OAuth flow fails

- Ensure redirect URI matches your GitHub OAuth App configuration exactly
- Check that your backend is running and accessible
- Verify Client ID and Client Secret are correct
- Check browser console for error messages

### PAT authentication fails

- Verify token has required scopes (repo, user:email)
- Ensure token hasn't been revoked
- Check for typos in the token
- Verify token hasn't expired (GitHub tokens don't expire unless revoked)

### Content sync fails

- Ensure you're authenticated
- Verify repository exists and you have access
- Check file path is correct
- Ensure you have write permissions to the repository

### UI doesn't appear

- Check browser console for JavaScript errors
- Verify all CSS and JS files are loaded
- Ensure z-index doesn't conflict with other elements
- Check for CSS conflicts with existing styles

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Opera: ✅ Full support
- IE11: ❌ Not supported (requires Web Crypto API)

## License

MIT License - Feel free to use in your projects!

## Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

## Support

For issues or questions, please open an issue on the repository.
