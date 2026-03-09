# 🧪 TEST GUIDE - GitHub CMS Integration

## Test Your System Step by Step

### ✅ Step 1: Verify Server is Running
```
✅ Server running at: http://localhost:8000
```

**Open in browser:** http://localhost:8000

---

### ✅ Step 2: Test Designer Mode Activation

1. **Press** `Ctrl+Shift+E` (Windows/Linux) or `Cmd+Shift+E` (Mac)
2. **What you should see:**
   - Admin panel appears in top-right corner
   - Green dashed borders around editable text
   - Edit elements get highlighted on hover
   - Small edit icon (✎) appears on hover

**Expected result:** ✅ Designer Mode activates with admin panel

---

### ✅ Step 3: Test Text Editing

1. **Click** on the hero title: "WELCOME TO THE FUTURE"
2. **Type** something new: "WELCOME TO MY FUTURE"
3. **Click** outside the text (blur)
4. **What you should see:**
   - "💾 Saved" indicator appears
   - Content changes

**Expected result:** ✅ Text edits and auto-saves

---

### ✅ Step 4: Test GitHub Authentication

1. **Look** for the GitHub button (bottom-right corner)
2. **Click** the GitHub button
3. **Click** "Enter Personal Access Token"
4. **What happens:**
   - Token input dialog appears
   - You'll need a GitHub token (see below)

**To get a token for testing:**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: "Designer Mode Test"
4. Select scopes: `repo`, `user:email`, `read:org`
5. Click "Generate token"
6. Copy the token (starts with `ghp_`)
7. Paste it in the dialog
8. Click "Authenticate"

**Expected result:** ✅ You should see your GitHub avatar and username

---

### ✅ Step 5: Test Content Sync to GitHub

**After authentication:**

1. **Make an edit** (change any text)
2. **Click** "⬆️ Sync to GitHub" button in admin panel
3. **What you should see:**
   - "✅ Content synced to GitHub successfully"
   - No errors in console

**Verify on GitHub:**
- Go to your GitHub repository
- Look for `content-schema.json`
- Open it and check if your changes are there

**Expected result:** ✅ Content syncs to GitHub

---

### ✅ Step 6: Test Visual Style Editor

1. **Click** "🎨 Style Editor" button in admin panel
2. **What you should see:**
   - Style Editor panel appears
   - Collapsible sections (Colors, Typography, Spacing, etc.)
   - Color pickers and sliders

3. **Test color change:**
   - Go to "Colors" section
   - Click the color picker next to "Neon Blue"
   - Choose a different color (e.g., red)
   - **Watch:** The site changes instantly!

4. **Click** "💾 Save Changes"
5. **Click** "⬆️ Sync to GitHub"

**Expected result:** ✅ Styles change live and sync to GitHub

---

### ✅ Step 7: Test Version History

1. **Click** "📜 History" button in admin panel
2. **What you should see:**
   - List of all saved versions
   - Timestamps and descriptions
   - Version numbers

3. **Test restore:**
   - Enter a version number
   - Click to restore
   - **Watch:** Content reverts to that version

**Expected result:** ✅ Version history works

---

### ✅ Step 8: Test Import/Export

**Export:**
1. **Click** "📤 Export" button
2. **What happens:** JSON file downloads
3. **Check:** File contains your current content

**Import:**
1. **Click** "📥 Import" button
2. **Select** the JSON you just exported
3. **What happens:** Content loads successfully

**Expected result:** ✅ Import/export works

---

### ✅ Step 9: Check GitHub Admin Panel

If GitHub Admin Panel is available:

1. **Look** for "🐙 GitHub" button or tab
2. **Click** it
3. **What you should see:**
   - Connection status indicator
   - Your GitHub username/avatar
   - Repository name
   - Sync controls
   - OODA status (if available)

**Expected result:** ✅ GitHub panel shows connection info

---

## 📊 Test Results Checklist

Mark each as you test:

- [ ] Server loads at http://localhost:8000
- [ ] Designer Mode activates with Ctrl+Shift+E
- [ ] Admin panel appears
- [ ] Text can be edited
- [ ] Changes auto-save
- [ ] GitHub authentication works
- [ ] Content syncs to GitHub
- [ ] Style Editor opens
- [ ] Colors change live
- [ ] Style changes save
- [ ] Version history works
- [ ] Import/export works
- [ ] GitHub Admin Panel shows info

---

## 🐛 Troubleshooting

**Designer Mode won't activate?**
- Check browser console (F12)
- Look for JavaScript errors
- Try refreshing the page

**Can't authenticate?**
- Make sure you have a GitHub token
- Check token has correct scopes (repo, user:email, read:org)
- Try generating a new token

**Sync fails?**
- Check you're authenticated
- Verify network connection
- Check browser console for errors

**Style Editor not working?**
- Check if visual-editor.js is loaded
- Look for CSS custom properties in styles.css
- Check browser console

---

## 🎯 Quick Test Path

**Fast test (2 minutes):**
1. Open http://localhost:8000
2. Press Ctrl+Shift+E
3. Click hero title
4. Type "TESTING"
5. Click outside
6. See "💾 Saved"
7. ✅ Working!

**Full test (10 minutes):**
1. Do fast test above
2. Get GitHub token
3. Authenticate
4. Sync to GitHub
5. Open Style Editor
6. Change a color
7. Save and sync
8. Check GitHub repo
9. ✅ Everything working!

---

**Ready to test? Start at Step 1!** 🚀
