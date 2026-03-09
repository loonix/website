# 🚀 START NOW - Quick Setup Guide

## Get Your GitHub CMS Running in 5 Minutes!

### Step 1: Create GitHub Token (1 minute)

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it: "Designer Mode CMS"
4. Select scopes:
   - ✅ repo (full control)
   - ✅ user:email
   - ✅ read:org
5. Click "Generate token"
6. **Copy the token** (starts with `ghp_`)

### Step 2: Initialize Your GitHub Repository (2 minutes)

```bash
# Create a new repo on GitHub first (name it anything you want)

# Then in your terminal:
cd /Users/danielcarneiro/Development/website

# Initialize git if needed
git init

# Add your GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Create CMS directory structure
mkdir -p cms/assets/images

# Commit everything
git add .
git commit -m "Initial CMS setup with Designer Mode"

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Configure Your Site (1 minute)

Edit `/Users/danielcarneiro/Development/website/designer-mode.js` at line 57:

```javascript
this.githubAuth = new GitHubAuth({
  clientId: '', // Leave empty for Personal Access Token
  owner: 'YOUR_GITHUB_USERNAME',      // ← Add your username
  repo: 'YOUR_REPO_NAME',             // ← Add your repo name
  branch: 'main'
});
```

**Example:**
```javascript
this.githubAuth = new GitHubAuth({
  clientId: '',
  owner: 'danielcarneiro',
  repo: 'website',
  branch: 'main'
});
```

### Step 4: Start Your Server (10 seconds)

```bash
cd /Users/danielcarneiro/Development/website
python3 -m http.server 8000
```

### Step 5: Open and Authenticate! (1 minute)

1. Open browser: **http://localhost:8000**
2. Press **`Ctrl+Shift+E`** (Mac: **`Cmd+Shift+E`**)
3. Click the **GitHub** button (bottom-right corner)
4. Click **"Enter Personal Access Token"**
5. Paste your token from Step 1
6. Click **"Authenticate"**

### Step 6: Start Editing! (Doing it! 🎉)

1. **Edit Text**: Click any highlighted text
2. **Edit Styles**: Click "🎨 Style Editor" button
3. **Sync to GitHub**: Click "⬆️ Sync to GitHub" button

**That's it! You're running the CMS of the future!** 🚀

---

## 🎯 What You Can Do Now

### Edit Content
- Click the hero title "WELCOME TO THE FUTURE"
- Type something new
- Click outside (it saves!)
- Click "⬆️ Sync to GitHub"

### Change Colors
- Click "🎨 Style Editor"
- Click the "Neon Blue" color picker
- Choose a new color
- See it change instantly!
- Click "💾 Save Changes"

### Upload an Image
- Click "📷 Media Library" (if available)
- Drag and drop an image
- See it optimize automatically
- Get the CDN URL

---

## 📁 Files You Should Know

**Core Files:**
- `designer-mode.js` - Main CMS (already configured!)
- `content-schema.json` - All your content + styles
- `github-auth.js` - GitHub authentication
- `visual-editor.js` - Visual style editor

**Documentation:**
- `GITHUB-CMS-INTEGRATION-SUMMARY.md` - Complete overview
- `START-NOW.md` - This file!

---

## 🧪 Test Everything Works

1. **Authentication**: ✅ You should see your GitHub avatar
2. **Content Edit**: ✅ Change some text
3. **Style Edit**: ✅ Change a color
4. **Sync**: ✅ Click "Sync to GitHub"
5. **Verify**: ✅ Check your GitHub repo for `content-schema.json`

---

## 🎨 Keyboard Shortcuts

- **`Ctrl+Shift+E`** - Toggle Designer Mode
- **`Tab`** - Navigate between editable elements
- **`Escape`** - Exit editing mode

---

## ⚡ Pro Tips

1. **Auto-sync is coming!** For now, manually sync after editing
2. **Version history** is automatic (50 versions)
3. **Undo/redo** works in Style Editor (Ctrl+Z / Ctrl+Y)
4. **Export CSS** from Style Editor for backup
5. **Import/Export** content for portability

---

## 🔒 Security Notes

- Your token is encrypted in localStorage
- Never share your Personal Access Token
- Token expires based on GitHub settings
- You can revoke tokens anytime in GitHub settings

---

## 🆘 Need Help?

**Something not working?**

1. **Check browser console** (F12 → Console tab)
2. **Verify token** has correct scopes
3. **Check network** connection
4. **Clear localStorage** and re-authenticate
5. **Check GitHub repo** exists and is accessible

**Still stuck?**
- Check the documentation files
- Review `GITHUB-CMS-INTEGRATION-SUMMARY.md`
- Look at browser DevTools for errors

---

## 🎉 Congratulations!

You're now running a **next-generation CMS** with:
- ✅ GitHub backend
- ✅ Visual editing
- ✅ Version control
- ✅ Real-time sync
- ✅ Zero infrastructure

**Built for the future. Ready now.**

---

**Press Ctrl+Shift+E and start creating!** 🚀
