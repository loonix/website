# 🔐 GitHub Device Flow Setup Guide

## What is Device Flow?

GitHub Device Flow is an authentication flow designed for devices with limited input capabilities (like smart TVs or command-line apps). It's **perfect for client-side web apps** because:

- ✅ **No backend server needed** - Works entirely in the browser
- ✅ **More secure than PATs** - Tokens are scoped and temporary
- ✅ **Better UX than OAuth** - No popup windows needed
- ✅ **Easy to implement** - Just polling and a simple UI

## How It Works

```
1. Your app requests a device code from GitHub
2. GitHub returns: user_code (8 characters) + verification URL
3. User opens github.com/devices (while logged into GitHub)
4. User enters the code and clicks "Authorize"
5. Your app polls GitHub for authentication status
6. GitHub returns access_token when user approves
7. Your app can now make API calls!
```

## Setup Instructions

### Step 1: Create GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click **"OAuth Apps"** → **"New OAuth App"**
3. Fill in:
   - **App name:** "Designer Mode CMS"
   - **Homepage URL:** `http://localhost:8000`
   - **Authorization callback URL:** `http://localhost:8000/github-callback.html` (required but won't be used)
   - **Enable Device Flow:** ✅ CHECK THIS BOX!
4. Click **"Register application"**

### Step 2: Get Your Client ID

1. After registering, you'll see your app details
2. Copy the **Client ID** (looks like `Iv1abcd123456`)
3. You'll need this for the next step

### Step 3: Update Your Code

Edit `/Users/danielcarneiro/Development/website/designer-mode.js`:

```javascript
// Around line 88, update the clientId
this.githubAuth = new GitHubAuth({
  clientId: 'YOUR_CLIENT_ID_HERE', // ← Paste your Client ID here
  scopes: ['repo', 'user:email', 'read:org']
});

// Also update the Device Auth (below it)
this.githubDeviceAuth = new GitHubDeviceAuth({
  clientId: 'YOUR_CLIENT_ID_HERE', // ← Same Client ID
  scopes: ['repo', 'user:email', 'read:org']
});
```

### Step 4: Update HTML

Add these files to your `index.html` (in the `<head>` and before `</body>`):

```html
<!-- In <head> -->
<link rel="stylesheet" href="device-flow.css">

<!-- Before </body> -->
<script src="github-device-auth.js"></script>
<script src="device-flow-ui.js"></script>
```

### Step 5: Test It!

1. Refresh your browser: http://localhost:8000
2. Press `Ctrl+Shift+E` (Designer Mode)
3. Click **GitHub** button
4. Click **"Use Device Flow"**
5. **You'll see:** A panel with an 8-character code
6. **Click:** "Copy code" button (or copy manually)
7. **Go to:** https://github.com/devices
8. **Paste** the code and click "Authorize"
9. **Watch:** Your site will detect authorization automatically!
10. ✅ Done!

## Advantages of Device Flow

### vs Personal Access Token (PAT)
- ✅ **More secure** - Temporary tokens, can be revoked
- ✅ **Scoped permissions** - Only what you need
- ✅ **User-friendly** - No copy-pasting long tokens
- ❌ PAT is simpler but less secure

### vs OAuth (with popup)
- ✅ **No popup windows** - Better UX
- ✅ **No callback URL handling** - Simpler code
- ✅ **Works without backend** - OAuth needs backend for token exchange
- ❌ OAuth is better for multi-user production apps

## Security Benefits

- **Token is temporary** - Can expire
- **Scoped permissions** - Limited access
- **Revocable** - Can be deactivated anytime
- **No secrets in code** - Client ID is public
- **User-controlled** - User explicitly approves

## Troubleshooting

### "Client ID is empty"
- You need to create a GitHub OAuth App first
- Copy the Client ID from your app settings

### "Device Flow not enabled"
- Make sure you checked "Enable Device Flow" when creating the OAuth App
- You can edit your OAuth App to enable it

### "Authorization timed out"
- The user code expires in ~15 minutes (depending on GitHub)
- Just try again to get a new code

### "Polling stopped"
- Check browser console for errors
- Verify Client ID is correct
- Make sure you have the required scopes

## Production Deployment

For production (when you deploy to a real domain):

1. **Update Homepage URL** in OAuth App to your production URL
2. **Update Callback URL** to your production github-callback.html
3. **Update redirect_uri** in `designer-mode.js` to match production URL
4. **Test** thoroughly before deploying!

## Code Reference

### Device Flow API Endpoints

**Request Device Code:**
```
POST https://github.com/login/device/code
Body: {
  "client_id": "YOUR_CLIENT_ID",
  "scope": "repo user:email read:org"
}
```

**Response:**
```json
{
  "device_code": "abcd1234",
  "user_code": "ABCD-1234",
  "verification_uri": "https://github.com/devices",
  "expires_in": 900,
  "interval": 5
}
```

**Poll for Status:**
```
POST https://github.com/login/device/status
Body: {
  "client_id": "YOUR_CLIENT_ID",
  "device_code": "abcd1234"
}
```

**Authorized Response:**
```json
{
  "access_token": "ghp_...",
  "token_type": "bearer",
  "scope": "repo,user:email,read:org"
}
```

## Next Steps

1. **Create your GitHub OAuth App** (5 minutes)
2. **Copy your Client ID** (10 seconds)
3. **Update designer-mode.js** (30 seconds)
4. **Test Device Flow** (1 minute)
5. **Enjoy secure GitHub authentication!** ✅

---

**Need help?** Check:
- GitHub OAuth Docs: https://docs.github.com/en/developers/apps/building-oauth-apps/
- Device Flow Guide: https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps/#device-flow

**Ready to enable Device Flow?** Let me know when you've created your OAuth App!
