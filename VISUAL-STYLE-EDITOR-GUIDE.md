# Visual Style Editor Guide

## Overview

The Visual Style Editor is a comprehensive, cyberpunk-themed visual editing interface for the Designer Mode CMS. It allows you to customize every aspect of your website's appearance without touching code.

## Features

### 🎨 Color Editing
- **Primary Colors**: Neon Blue, Neon Pink, Neon Purple
- **Background Colors**: Dark background, card backgrounds
- **Live Color Pickers**: Native color picker for precise color selection
- **Hex Code Input**: Type exact color values for precision

### 🔤 Typography Controls
- **Font Family**: Change fonts (default: Orbitron)
- **Font Sizes**: Adjust H1, H2, H3, and base text sizes
- **Font Weights**: Normal (400) and Bold (700)
- **Line Height**: Adjust text line spacing
- **Letter Spacing**: Control character spacing

### 📏 Spacing Controls
- **Container Padding**: Adjust main container padding
- **Section Padding**: Control spacing between sections
- **Gap**: Adjust grid and flex gaps
- **Card Padding**: Customize card internal padding

### ✨ Effects Panel
- **Glow Intensity**: Control neon glow effects
- **Shadow Blur**: Adjust shadow blur radius
- **Shadow Spread**: Control shadow spread
- **Text Shadow**: Customize text shadow effects
- **Box Shadow**: Adjust element shadow effects
- **Animation Speed**: Control transition and animation durations

### 📐 Layout Controls
- **Max Width**: Set container maximum widths
- **Grid Columns**: Customize responsive grid layouts
- **Border Radius**: Adjust corner roundness
- **Border Width**: Control border thickness

### 🧩 Component Styling

#### Buttons
- Background color and transparency
- Border styling
- Text color
- Padding
- Hover states (background and color)

#### Inputs
- Background color
- Border styling
- Text color
- Padding
- Focus shadow effects

#### Cards
- Background color
- Border styling
- Padding
- Hover transform effects
- Hover shadow effects

## How to Use

### Activating the Style Editor

1. **Activate Designer Mode**: Press `Ctrl+Shift+E` (or `Cmd+Shift+E` on Mac)
2. **Open Style Editor**: Click the "🎨 Style Editor" button in the Designer Mode panel
3. **Edit Styles**: Use the categorized controls to adjust visual properties
4. **Live Preview**: All changes are applied instantly to the page
5. **Save Changes**: Click "💾 Save Changes" to persist your edits

### Navigation

The editor is organized into collapsible sections:
- **Colors** 🌈
- **Typography** 🔤
- **Spacing** 📏
- **Effects** ✨
- **Layout** 📐
- **Components** 🧩

Click on a section header to expand or collapse it.

### Control Types

#### Color Pickers
- Click the color swatch to open the native color picker
- Or type the hex code directly in the text field
- Changes apply instantly

#### Sliders
- Drag the slider to adjust numeric values
- For sizes (px, rem): Drag from 0 to 100 (or appropriate max)
- The value updates in real-time

#### Text Inputs
- For complex values (like grid layouts)
- Type exact values and press Enter or click away
- Supports CSS syntax

### Saving & Resetting

#### Save Changes
- Click "💾 Save Changes" to save all current styles to localStorage
- Saved styles persist across browser sessions
- A save indicator appears briefly

#### Reset to Defaults
- Click "↺ Reset" to restore all default values
- **Warning**: This cannot be undone!
- A confirmation dialog will appear

### Undo/Redo

- **Undo**: Click "↶" to undo the last change
- **Redo**: Click "↷" to redo a previously undone change
- History is maintained for up to 50 changes

### Export CSS

- Click "📤 Export CSS" to download current styles as a CSS file
- The file contains all current CSS custom properties
- Can be imported into other projects or used as a backup

## CSS Custom Properties

The editor uses CSS custom properties (CSS variables) for live preview:

```css
:root {
  /* Colors */
  --neon-blue: #0ff;
  --neon-pink: #f0f;
  --neon-purple: #c526ff;
  --dark-bg: #0a0a0f;
  --text-color: #ffffff;
  --card-bg: rgba(255, 255, 255, 0.05);

  /* Typography */
  --font-family: 'Orbitron', sans-serif;
  --font-size-base: 1rem;
  --font-size-h1: 4rem;
  --font-size-h2: 3rem;
  --font-size-h3: 2rem;
  --font-weight-normal: 400;
  --font-weight-bold: 700;
  --line-height: 1.6;
  --letter-spacing: 0px;

  /* Spacing */
  --spacing-container: 2rem;
  --spacing-section: 5rem;
  --spacing-gap: 2rem;
  --spacing-card: 2rem;

  /* Effects */
  --glow-intensity: 10px;
  --shadow-blur: 20px;
  --shadow-spread: 0px;
  --text-shadow: 0 0 10px;
  --box-shadow: 0 0 15px;
  --animation-speed: 0.3s;

  /* Layout */
  --max-width: 1200px;
  --grid-columns: repeat(auto-fit, minmax(300px, 1fr));
  --border-radius: 8px;
  --border-width: 1px;

  /* Components */
  --button-bg: transparent;
  --button-border: 2px solid var(--neon-blue);
  --button-color: var(--neon-blue);
  --button-padding: 1rem 2rem;
  --button-hover-bg: var(--neon-blue);
  --button-hover-color: var(--dark-bg);

  --input-bg: rgba(0, 255, 255, 0.05);
  --input-border: 1px solid var(--neon-blue);
  --input-color: var(--neon-blue);
  --input-padding: 0.75rem 1rem;
  --input-focus-shadow: 0 0 10px var(--neon-blue);

  --card-bg: rgba(255, 255, 255, 0.05);
  --card-border: 1px solid var(--neon-blue);
  --card-padding: 2rem;
  --card-hover-transform: translateY(-5px);
  --card-hover-shadow: 0 0 20px var(--neon-blue);
}
```

## Keyboard Shortcuts

- `Ctrl+Shift+E` / `Cmd+Shift+E`: Toggle Designer Mode
- `Escape`: Close Style Editor panel

## Data Persistence

Styles are automatically saved to localStorage:
- **Storage Key**: `loonix-visual-styles`
- **Format**: JSON
- **Capacity**: Up to 5-10MB (browser dependent)

## Schema Integration

Style definitions are stored in `content-schema.json`:

```json
{
  "styles": {
    "colors": { ... },
    "typography": { ... },
    "spacing": { ... },
    "effects": { ... },
    "layout": { ... },
    "components": { ... }
  }
}
```

## Cyberpunk Theme Presets

The editor comes with a default cyberpunk theme:
- **Neon Blue** (#0ff): Primary accent color
- **Neon Pink** (#f0f): Secondary accent color
- **Neon Purple** (#c526ff): Accent color
- **Dark Background** (#0a0a0f): Main background
- **Glow Effects**: Heavy use of box-shadow and text-shadow

## Best Practices

### Color Selection
- Maintain contrast ratios for accessibility
- Use the cyberpunk color palette for consistency
- Test changes on different sections of the site

### Typography
- Keep font sizes readable (minimum 14px for body text)
- Maintain proper line height (1.4-1.6)
- Use letter spacing sparingly

### Spacing
- Use consistent units (px or rem)
- Maintain breathing room between elements
- Test on mobile devices

### Effects
- Don't overdo glow effects (can impact performance)
- Keep animation speeds between 0.2s and 0.5s
- Test shadows on different backgrounds

## Troubleshooting

### Styles Not Applying
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify `content-schema.json` is loading
4. Clear browser cache and reload

### Changes Not Saving
1. Check localStorage is enabled
2. Verify storage quota (browser may limit localStorage)
3. Check browser console for errors

### Performance Issues
1. Reduce shadow blur values
2. Simplify complex grid layouts
3. Limit animation effects
4. Test on slower devices

## Integration with Designer Mode

The Visual Style Editor integrates seamlessly with Designer Mode:
- Both can be active simultaneously
- Content editing and style editing are independent
- Changes from both systems persist separately

## Future Enhancements

Potential features for future versions:
- Theme presets (Cyberpunk, Minimal, Dark, Light)
- Color palette generator
- Import/export theme files
- Gradient editor
- Animation timeline editor
- Device-specific styles
- A/B testing support

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Opera**: Full support
- **Mobile Browsers**: Supported with responsive UI

## Technical Details

### File Structure
```
visual-editor.js          # Main editor logic
visual-editor.css         # Editor UI styles
content-schema.json       # Style definitions
designer-mode.js          # Integration point
```

### Dependencies
- None (uses vanilla JavaScript)
- Requires Designer Mode CMS
- Uses localStorage for persistence

### Performance
- Minimal impact on page load time
- Live preview uses CSS custom properties (highly performant)
- History system limited to 50 entries to prevent memory issues

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all files are loaded correctly
3. Check localStorage availability
4. Review this guide for common solutions

## License

Part of the LOONIX Designer Mode CMS project.
