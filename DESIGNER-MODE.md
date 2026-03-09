# 🎨 Designer Mode - Embedded CMS

A next-generation content management system built directly into your website. Edit content on the fly with no CI/CD pipeline required.

## Features

- **In-place Editing**: Click any highlighted text to edit it directly
- **Auto-save**: Changes save automatically when you click away
- **Version History**: Track all changes and rollback to any previous version
- **Import/Export**: Backup and restore your content
- **Risk-based Persistence**: Text changes save instantly, structural changes prompt confirmation
- **Zero Downtime**: No deployment pipeline needed

## How to Use

### Activating Designer Mode

1. Open your website in a browser
2. Press `Ctrl+Shift+E` (Windows/Linux) or `Cmd+Shift+E` (Mac)
3. The admin panel will appear in the top-right corner
4. Editable elements will be highlighted with a dashed green border

### Editing Content

1. Click on any highlighted text to start editing
2. Make your changes
3. Click outside the element (blur) to auto-save
4. A "Saved" indicator will appear confirming the save

### Admin Panel Functions

- **💾 Save All**: Manually save all changes and create a version checkpoint
- **📜 History**: View and restore previous versions
- **📤 Export**: Download your content as a JSON file
- **📥 Import**: Upload previously exported content

### Version History

1. Click "History" in the admin panel
2. View all saved versions with timestamps
3. Enter a version number to restore it
4. Confirm the restore operation

## Data Structure

Content is stored in `content-schema.json` with the following structure:

```json
{
  "version": "1.0",
  "lastModified": null,
  "content": {
    "hero": {
      "title": { "id": "hero-title", "type": "text", "content": "...", "selector": ".hero h1" },
      "subtitle": { "id": "hero-subtitle", "type": "text", "content": "...", "selector": ".hero p" }
    }
  }
}
```

## Storage

- **localStorage**: Content is persisted in the browser's localStorage
- **Storage Keys**:
  - `loonix-cms-content`: Current content
  - `loonix-cms-history`: Version history (last 50 versions)

## Adding New Editable Elements

To make a new element editable:

1. Open `content-schema.json`
2. Add your element to the appropriate section:

```json
{
  "mySection": {
    "myElement": {
      "id": "unique-id",
      "type": "text",
      "content": "Default content",
      "selector": ".my-element-class"
    }
  }
}
```

3. Save the file
4. Refresh the page
5. Activate designer mode

## Element Types

- **text**: Plain text content
- **richtext**: Text with HTML support
- **link**: Link with href attribute
- **article**: Article card with title, description, and link

## Keyboard Shortcuts

- `Ctrl+Shift+E` / `Cmd+Shift+E`: Toggle designer mode
- `Tab`: Navigate between editable elements
- `Escape`: Exit editing mode

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile: Limited support (admin panel adapts to mobile)

## Security Notes

⚠️ **Important**: This is a client-side CMS. For production use:

1. Implement server-side authentication
2. Add CSRF protection
3. Sanitize HTML input to prevent XSS
4. Implement proper access controls
5. Use HTTPS only

## Future Enhancements

Potential features to add:

- [ ] User authentication and authorization
- [ ] Multi-user collaboration with presence
- [ ] Rich text editor (WYSIWYG)
- [ ] Media management (images, videos)
- [ ] SEO meta tags editing
- [ ] A/B testing framework
- [ ] Scheduled publishing
- [ ] Backend API integration
- [ ] Real-time preview
- [ ] Component library editor

## Troubleshooting

**Changes not saving?**
- Check browser console for errors
- Verify localStorage is enabled
- Check storage quota (usually 5-10MB)

**Can't activate designer mode?**
- Ensure `designer-mode.js` is loaded
- Check browser console for errors
- Try refreshing the page

**Lost all content?**
- Use "History" to restore a previous version
- Import a previously exported JSON file
- Check browser localStorage for the content keys

## Credits

Inspired by Geoffrey Huntley's embedded software factory approach:
https://ghuntley.com/rad/

Built with ❤️ for the future of web development.
