# Drag-and-Drop Quick Start Guide

## Enable Drag-and-Drop

1. **Activate Designer Mode**
   ```
   Press: Ctrl+Shift+E (Windows/Linux)
   Press: Cmd+Shift+E (Mac)
   ```

2. **Authenticate with GitHub**
   - Click "Sign In" button in admin panel
   - Enter GitHub Personal Access Token
   - Verify admin permissions

3. **Enable Drag-and-Drop**
   - Click "🔄 Drag & Drop" button
   - Wait for confirmation message
   - Drag handles appear on article cards

## Reorder Articles

### Mouse/Desktop
- Click and hold the drag handle (6-dot icon)
- Drag to new position
- Release to drop
- Auto-saves after 1 second

### Touch/Mobile
- Touch and hold the drag handle
- Drag to new position
- Release to drop
- Visual feedback shows position

### Keyboard
- Tab to an article card
- Use Arrow keys to move:
  - ↑/←: Move up/left
  - ↓/→: Move down/right
  - Home: Move to first
  - End: Move to last
- Changes auto-save

## Save & Sync

### Auto-Save
- Changes save automatically to localStorage
- 1-second delay after last change
- Green indicator confirms save

### Manual Save
- Click "💾 Save All" in admin panel
- Immediate save to localStorage
- Version history created

### GitHub Sync
- Click "⬆️ Sync to GitHub" to save order
- Order saved to content-schema.json
- Persists across devices and sessions
- Requires GitHub authentication

## Disable Drag-and-Drop

- Click "✓ Drag & Drop ON" button
- Button changes back to "🔄 Drag & Drop"
- Drag handles disappear
- Order remains saved

## Troubleshooting

**Drag handles not showing?**
- Check GitHub authentication
- Verify admin permissions
- Look for console errors

**Changes not saving?**
- Check localStorage availability
- Verify no validation errors
- Check browser console

**Can't enable drag-drop?**
- Ensure Designer Mode is active
- Check GitHub authentication
- Verify admin permissions

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Focus next article |
| Shift+Tab | Focus previous article |
| ↑/← | Move article up/back |
| ↓/→ | Move article down/forward |
| Home | Move to first position |
| End | Move to last position |
| Enter | Activate focused element |
| Escape | Cancel current operation |

## Visual Indicators

| State | Visual |
|-------|--------|
| Dragging | 40% opacity, glowing shadow |
| Drop Target | Dashed border, glow effect |
| Handle | 6-dot icon, appears on hover |
| Saved | Green flash indicator |
| Error | Red border, shake animation |

## Accessibility Features

- Full keyboard navigation
- Screen reader support
- ARIA labels and roles
- Focus indicators
- Reduced motion support
- High contrast mode
- Touch-friendly targets (40x40px)

## Mobile Support

- Touch-optimized drag handles
- Larger touch targets
- Smooth touch animations
- Gesture recognition
- Prevented accidental touches
- Responsive design

## Security Features

- GitHub authentication required
- Admin permission check
- CSRF token validation
- Input sanitization
- Duplicate detection
- Type validation
- Secure storage

## File Locations

- **Manager**: `/drag-drop-manager.js`
- **Styles**: `/drag-drop.css`
- **Config**: `/content-schema.json`
- **Integration**: `/designer-mode.js`
- **Docs**: `/DRAG-DROP-IMPLEMENTATION.md`

## Need Help?

Check the comprehensive documentation:
- Full Implementation Guide: `DRAG-DROP-IMPLEMENTATION.md`
- Code Comments: `drag-drop-manager.js`
- Example Usage: `designer-mode.js` (lines 157-245)
