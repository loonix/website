# GitHub Authentication System - Quick Start Guide

Get started with GitHub authentication in 5 minutes!

## Quick Setup (No Backend Required)

The fastest way to get started is using Personal Access Tokens (PAT), which doesn't require any backend setup.

### Step 1: Create a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" (classic)
3. Give it a descriptive name (e.g., "Designer Mode")
4. Select the following scopes:
   - ✅ `repo` - Full control of private repositories
   - ✅ `user:email` - Access user email addresses
   - ✅ `read:org` - Read org and team membership
5. Click "Generate token"
6. **Copy the token immediately** (it won't be shown again!)

### Step 2: Authenticate

1. Open your website with Designer Mode
2. Click the GitHub button in the bottom-right corner
3. Select "Personal Access Token" method
4. Paste your token
5. Click "Use Token"

That's it! You're now authenticated and can sync content to/from GitHub.

## Production Setup (With OAuth)

For production use, you'll want to set up OAuth authentication.

### Step 1: Create a GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "OAuth Apps" > "New OAuth App"
3. Fill in the form:
   - **Application name**: Your app name
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: `https://yourdomain.com/github-callback.html`
4. Click "Register application"
5. Copy the **Client ID**

### Step 2: Configure Your Application

Edit `designer-mode.js` and update the configuration:

```javascript
this.githubAuth = new GitHubAuth({
  clientId: 'YOUR_CLIENT_ID_HERE', // Paste your Client ID
  scopes: ['repo', 'user:email', 'read:org']
});
```

### Step 3: Set Up a Backend (Optional but Recommended)

OAuth requires a backend to securely exchange the authorization code for an access token.

**Option 1: Use a Simple Node.js Server**

```bash
npm init -y
npm install express axios cors
```

Create `server.js`:

```javascript
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/github/oauth', async (req, res) => {
  try {
    const { code } = req.body;

    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code
      },
      {
        headers: { Accept: 'application/json' }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Backend running on port 3000');
});
```

**Option 2: Use Serverless Functions**

```javascript
// netlify/functions/github-oauth.js
const axios = require('axios');

exports.handler = async (event) => {
  const { code } = JSON.parse(event.body);

  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code
    },
    {
      headers: { Accept: 'application/json' }
    }
  );

  return {
    statusCode: 200,
    body: JSON.stringify(response.data)
  };
};
```

### Step 4: Update Backend URL in Code

Modify `github-auth.js` to use your backend:

```javascript
async exchangeCodeForToken(code) {
  const response = await fetch('/api/github/oauth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });

  const data = await response.json();
  return data;
}
```

## Testing Your Setup

### Test PAT Authentication

```javascript
// In browser console
const token = 'your_pat_here';
await window.designerMode.githubAuth.authenticateWithPAT(token);
console.log('Authenticated!');
```

### Test OAuth Authentication

```javascript
// In browser console
await window.designerMode.githubAuth.authenticateWithOAuth();
// This will open a popup for authentication
```

### Test GitHub Sync

```javascript
// Save content to GitHub
await window.designerMode.syncToGitHub();

// Load content from GitHub
await window.designerMode.loadFromGitHub();
```

## Common Issues

### "Failed to open OAuth popup"

**Solution**: Allow popups for your website in browser settings.

### "Invalid token or insufficient permissions"

**Solution**: Make sure your PAT has the required scopes (repo, user:email, read:org).

### "Token exchange requires backend server"

**Solution**: Use PAT authentication instead, or set up a backend server.

### "No repository detected"

**Solution**: The sync feature works best when you're on a GitHub repository page. You can also modify the code to specify a default repository.

## Next Steps

1. **Customize the UI**: Edit `auth-ui.css` to match your site's design
2. **Add more features**: Extend `github-auth.js` with additional API calls
3. **Implement webhooks**: Get notified of GitHub changes in real-time
4. **Add team features**: Use GitHub App for organization-wide features
5. **Set up CI/CD**: Automate deployment with GitHub Actions

## Example Use Cases

### Auto-Save to GitHub

```javascript
// Auto-save every 30 seconds
setInterval(async () => {
  if (window.designerMode.githubAuth.isAuthenticated) {
    await window.designerMode.syncToGitHub();
    console.log('Auto-saved to GitHub');
  }
}, 30000);
```

### Load Content on Page Load

```javascript
// Load from GitHub on initialization
if (window.designerMode.githubAuth.isAuthenticated) {
  window.designerMode.loadFromGitHub();
}
```

### Display Auth Status

```javascript
// Check authentication status
const auth = window.designerMode.githubAuth;
if (auth.isAuthenticated) {
  console.log('Logged in as:', auth.userData.login);
  console.log('Auth type:', auth.authType);
}
```

## Support

Need help? Check out:
- [Full Documentation](./GITHUB_AUTH_README.md)
- [Security Guide](./SECURITY_GUIDE.md)
- [GitHub API Docs](https://docs.github.com/en/rest)

## License

MIT License - Free to use in your projects!
