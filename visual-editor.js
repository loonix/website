/**
 * VISUAL STYLE EDITOR
 * Comprehensive visual property editor for the cyberpunk website
 * Integrates with Designer Mode CMS
 */

class VisualStyleEditor {
  constructor(designerMode) {
    this.designerMode = designerMode;
    this.isActive = false;
    this.currentStyles = null;
    this.defaultStyles = null;
    this.storageKey = 'loonix-visual-styles';
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 50;

    // CSS Custom Properties mapping
    this.cssVarMap = new Map();

    this.init();
  }

  async init() {
    // Load default styles from schema
    await this.loadDefaultStyles();

    // Load saved styles from localStorage
    this.loadSavedStyles();

    // Build CSS variable mapping
    this.buildCSSVarMapping();

    // Apply saved styles
    this.applyStyles(this.currentStyles);

    console.log('🎨 Visual Style Editor ready');
  }

  /**
   * Load default styles from content-schema.json
   */
  async loadDefaultStyles() {
    try {
      const response = await fetch('content-schema.json');
      const schema = await response.json();

      if (schema.styles) {
        this.defaultStyles = JSON.parse(JSON.stringify(schema.styles));
      } else {
        // Use hardcoded defaults if schema doesn't have styles
        this.defaultStyles = this.getDefaultStyles();
      }

      // Initialize current styles
      this.currentStyles = JSON.parse(JSON.stringify(this.defaultStyles));
    } catch (error) {
      console.error('Failed to load default styles:', error);
      this.defaultStyles = this.getDefaultStyles();
      this.currentStyles = JSON.parse(JSON.stringify(this.defaultStyles));
    }
  }

  /**
   * Get default cyberpunk styles
   */
  getDefaultStyles() {
    return {
      colors: {
        primary: { value: '#0ff', cssVar: '--neon-blue', label: 'Neon Blue' },
        secondary: { value: '#f0f', cssVar: '--neon-pink', label: 'Neon Pink' },
        accent: { value: '#c526ff', cssVar: '--neon-purple', label: 'Neon Purple' },
        background: { value: '#0a0a0f', cssVar: '--dark-bg', label: 'Dark Background' },
        text: { value: '#ffffff', cssVar: '--text-color', label: 'Text Color' },
        cardBackground: { value: 'rgba(255, 255, 255, 0.05)', cssVar: '--card-bg', label: 'Card Background' }
      },
      typography: {
        fontFamily: { value: "'Orbitron', sans-serif", cssVar: '--font-family', label: 'Font Family' },
        baseSize: { value: '1rem', cssVar: '--font-size-base', label: 'Base Size' },
        h1Size: { value: '4rem', cssVar: '--font-size-h1', label: 'H1 Size' },
        h2Size: { value: '3rem', cssVar: '--font-size-h2', label: 'H2 Size' },
        h3Size: { value: '2rem', cssVar: '--font-size-h3', label: 'H3 Size' },
        weightNormal: { value: '400', cssVar: '--font-weight-normal', label: 'Normal Weight' },
        weightBold: { value: '700', cssVar: '--font-weight-bold', label: 'Bold Weight' },
        lineHeight: { value: '1.6', cssVar: '--line-height', label: 'Line Height' },
        letterSpacing: { value: '0px', cssVar: '--letter-spacing', label: 'Letter Spacing' }
      },
      spacing: {
        containerPadding: { value: '2rem', cssVar: '--spacing-container', label: 'Container Padding' },
        sectionPadding: { value: '5rem', cssVar: '--spacing-section', label: 'Section Padding' },
        gap: { value: '2rem', cssVar: '--spacing-gap', label: 'Gap' },
        cardPadding: { value: '2rem', cssVar: '--spacing-card', label: 'Card Padding' }
      },
      effects: {
        glowIntensity: { value: '10px', cssVar: '--glow-intensity', label: 'Glow Intensity' },
        shadowBlur: { value: '20px', cssVar: '--shadow-blur', label: 'Shadow Blur' },
        shadowSpread: { value: '0px', cssVar: '--shadow-spread', label: 'Shadow Spread' },
        textShadow: { value: '0 0 10px', cssVar: '--text-shadow', label: 'Text Shadow' },
        boxShadow: { value: '0 0 15px', cssVar: '--box-shadow', label: 'Box Shadow' },
        animationSpeed: { value: '0.3s', cssVar: '--animation-speed', label: 'Animation Speed' }
      },
      layout: {
        maxWidth: { value: '1200px', cssVar: '--max-width', label: 'Max Width' },
        gridColumns: { value: 'repeat(auto-fit, minmax(300px, 1fr))', cssVar: '--grid-columns', label: 'Grid Columns' },
        borderRadius: { value: '8px', cssVar: '--border-radius', label: 'Border Radius' },
        borderWidth: { value: '1px', cssVar: '--border-width', label: 'Border Width' }
      },
      components: {
        button: {
          background: { value: 'transparent', cssVar: '--button-bg', label: 'Button Background' },
          border: { value: '2px solid var(--neon-blue)', cssVar: '--button-border', label: 'Button Border' },
          color: { value: 'var(--neon-blue)', cssVar: '--button-color', label: 'Button Color' },
          padding: { value: '1rem 2rem', cssVar: '--button-padding', label: 'Button Padding' },
          hoverBackground: { value: 'var(--neon-blue)', cssVar: '--button-hover-bg', label: 'Button Hover BG' },
          hoverColor: { value: 'var(--dark-bg)', cssVar: '--button-hover-color', label: 'Button Hover Color' }
        },
        input: {
          background: { value: 'rgba(0, 255, 255, 0.05)', cssVar: '--input-bg', label: 'Input Background' },
          border: { value: '1px solid var(--neon-blue)', cssVar: '--input-border', label: 'Input Border' },
          color: { value: 'var(--neon-blue)', cssVar: '--input-color', label: 'Input Color' },
          padding: { value: '0.75rem 1rem', cssVar: '--input-padding', label: 'Input Padding' },
          focusShadow: { value: '0 0 10px var(--neon-blue)', cssVar: '--input-focus-shadow', label: 'Input Focus Shadow' }
        },
        card: {
          background: { value: 'rgba(255, 255, 255, 0.05)', cssVar: '--card-bg', label: 'Card Background' },
          border: { value: '1px solid var(--neon-blue)', cssVar: '--card-border', label: 'Card Border' },
          padding: { value: '2rem', cssVar: '--card-padding', label: 'Card Padding' },
          hoverTransform: { value: 'translateY(-5px)', cssVar: '--card-hover-transform', label: 'Card Hover Transform' },
          hoverShadow: { value: '0 0 20px var(--neon-blue)', cssVar: '--card-hover-shadow', label: 'Card Hover Shadow' }
        }
      }
    };
  }

  /**
   * Build mapping of CSS variables to style properties
   */
  buildCSSVarMapping() {
    this.cssVarMap.clear();

    const traverseStyles = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const item = obj[key];

        if (item.cssVar) {
          this.cssVarMap.set(item.cssVar, item);
        }

        if (typeof item === 'object' && !item.cssVar) {
          traverseStyles(item, prefix + key + '.');
        }
      });
    };

    traverseStyles(this.currentStyles);
  }

  /**
   * Load saved styles from localStorage
   */
  loadSavedStyles() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const savedStyles = JSON.parse(saved);
        this.currentStyles = this.mergeStyles(this.defaultStyles, savedStyles);
      } catch (e) {
        console.error('Failed to parse saved styles:', e);
      }
    }
  }

  /**
   * Merge saved styles with defaults
   */
  mergeStyles(defaults, saved) {
    const merged = JSON.parse(JSON.stringify(defaults));

    const merge = (defaultObj, savedObj) => {
      Object.keys(savedObj).forEach(key => {
        if (defaultObj[key] && typeof defaultObj[key] === 'object' && !defaultObj[key].cssVar) {
          merge(defaultObj[key], savedObj[key]);
        } else {
          defaultObj[key] = savedObj[key];
        }
      });
    };

    merge(merged, saved);
    return merged;
  }

  /**
   * Save current styles to localStorage
   */
  saveStyles() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.currentStyles));
    this.addToHistory();
    this.showSaveIndicator();
  }

  /**
   * Apply styles to the document
   */
  applyStyles(styles) {
    const root = document.documentElement;

    const applyToRoot = (obj) => {
      Object.keys(obj).forEach(key => {
        const item = obj[key];

        if (item.cssVar && item.value) {
          root.style.setProperty(item.cssVar, item.value);
        }

        if (typeof item === 'object' && !item.cssVar) {
          applyToRoot(item);
        }
      });
    };

    applyToRoot(styles);
  }

  /**
   * Toggle style editor panel
   */
  toggle() {
    this.isActive = !this.isActive;

    if (this.isActive) {
      this.createEditorPanel();
    } else {
      this.removeEditorPanel();
    }
  }

  /**
   * Create the visual editor panel
   */
  createEditorPanel() {
    // Remove existing panel
    this.removeEditorPanel();

    const panel = document.createElement('div');
    panel.id = 'visual-style-editor';
    panel.innerHTML = `
      <div class="vse-header">
        <h3>🎨 Visual Style Editor</h3>
        <div class="vse-header-actions">
          <button id="vse-undo" class="vse-btn" title="Undo">↶</button>
          <button id="vse-redo" class="vse-btn" title="Redo">↷</button>
          <button id="vse-reset" class="vse-btn" title="Reset to Defaults">↺</button>
          <button id="vse-close" class="vse-btn" title="Close">×</button>
        </div>
      </div>
      <div class="vse-content">
        <div class="vse-actions">
          <button id="vse-save" class="vse-btn primary">💾 Save Changes</button>
          <button id="vse-export" class="vse-btn">📤 Export CSS</button>
        </div>
        \${this.createCategorySections()}
      </div>
    \`;

    document.body.appendChild(panel);

    // Add event listeners
    document.getElementById('vse-close').addEventListener('click', () => this.toggle());
    document.getElementById('vse-save').addEventListener('click', () => this.saveStyles());
    document.getElementById('vse-reset').addEventListener('click', () => this.resetToDefaults());
    document.getElementById('vse-export').addEventListener('click', () => this.exportCSS());
    document.getElementById('vse-undo').addEventListener('click', () => this.undo());
    document.getElementById('vse-redo').addEventListener('click', () => this.redo());

    // Initialize collapsible sections
    this.initCollapsibleSections();

    // Initialize all inputs
    this.initializeInputs();
  }

  /**
   * Create category sections for the editor
   */
  createCategorySections() {
    const categories = [
      { id: 'colors', name: 'Colors', icon: '🌈' },
      { id: 'typography', name: 'Typography', icon: '🔤' },
      { id: 'spacing', name: 'Spacing', icon: '📏' },
      { id: 'effects', name: 'Effects', icon: '✨' },
      { id: 'layout', name: 'Layout', icon: '📐' },
      { id: 'components', name: 'Components', icon: '🧩' }
    ];

    return categories.map(cat => \`
      <div class="vse-section" data-category="\${cat.id}">
        <div class="vse-section-header">
          <span class="vse-section-title">\${cat.icon} \${cat.name}</span>
          <span class="vse-section-toggle">▼</span>
        </div>
        <div class="vse-section-content">
          \${this.createCategoryContent(cat.id)}
        </div>
      </div>
    \`).join('');
  }

  /**
   * Create content for each category
   */
  createCategoryContent(category) {
    const styles = this.currentStyles[category];
    if (!styles) return '<p>No styles defined</p>';

    let html = '';

    const createControls = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const item = obj[key];

        if (item.cssVar && item.label) {
          html += this.createControl(item, prefix + key);
        } else if (typeof item === 'object') {
          createControls(item, prefix + key + '.');
        }
      });
    };

    createControls(styles);
    return html;
  }

  /**
   * Create individual control for a style property
   */
  createControl(item, key) {
    const isColor = item.value && (
      item.value.startsWith('#') ||
      item.value.startsWith('rgb') ||
      item.value.startsWith('rgba') ||
      item.value.startsWith('hsl')
    );

    const isSize = item.value && (
      item.value.endsWith('px') ||
      item.value.endsWith('rem') ||
      item.value.endsWith('em') ||
      item.value.endsWith('%')
    );

    const controlClass = 'vse-control';
    const dataVar = item.cssVar;
    const dataKey = key;

    if (isColor) {
      return \`
        <div class="\${controlClass}" data-css-var="\${dataVar}" data-key="\${dataKey}">
          <label>\${item.label}</label>
          <div class="vse-color-input">
            <input type="color" value="\${this.hexToRgb(item.value)}" class="vse-color-picker">
            <input type="text" value="\${item.value}" class="vse-text-input">
          </div>
        </div>
      \`;
    } else if (isSize) {
      const numValue = this.extractNumericValue(item.value);
      const unit = this.extractUnit(item.value);
      return \`
        <div class="\${controlClass}" data-css-var="\${dataVar}" data-key="\${dataKey}">
          <label>\${item.label}</label>
          <div class="vse-size-input">
            <input type="range" min="0" max="100" value="\${numValue}" class="vse-slider" data-unit="\${unit}">
            <input type="text" value="\${item.value}" class="vse-text-input">
          </div>
        </div>
      \`;
    } else if (item.value && item.value.includes('rem') && item.value !== '1rem') {
      // For font sizes with specific rem values
      const numValue = parseFloat(item.value);
      return \`
        <div class="\${controlClass}" data-css-var="\${dataVar}" data-key="\${dataKey}">
          <label>\${item.label}</label>
          <div class="vse-size-input">
            <input type="range" min="0.5" max="6" step="0.1" value="\${numValue}" class="vse-slider" data-unit="rem">
            <input type="text" value="\${item.value}" class="vse-text-input">
          </div>
        </div>
      \`;
    } else {
      // Text input for complex values
      return \`
        <div class="\${controlClass}" data-css-var="\${dataVar}" data-key="\${dataKey}">
          <label>\${item.label}</label>
          <input type="text" value="\${item.value}" class="vse-text-input">
        </div>
      \`;
    }
  }

  /**
   * Initialize all input controls
   */
  initializeInputs() {
    // Color pickers
    document.querySelectorAll('.vse-color-picker').forEach(picker => {
      picker.addEventListener('input', (e) => {
        const control = e.target.closest('.vse-control');
        const textInput = control.querySelector('.vse-text-input');
        textInput.value = e.target.value;
        this.updateStyle(control, e.target.value);
      });
    });

    // Sliders
    document.querySelectorAll('.vse-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const control = e.target.closest('.vse-control');
        const unit = e.target.dataset.unit || 'px';
        const value = e.target.value + unit;
        const textInput = control.querySelector('.vse-text-input');
        textInput.value = value;
        this.updateStyle(control, value);
      });
    });

    // Text inputs
    document.querySelectorAll('.vse-text-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const control = e.target.closest('.vse-control');
        this.updateStyle(control, e.target.value);
      });
    });
  }

  /**
   * Update a single style property
   */
  updateStyle(control, value) {
    const cssVar = control.dataset.cssVar;
    const key = control.dataset.key;

    // Update CSS variable
    document.documentElement.style.setProperty(cssVar, value);

    // Update internal state
    const keys = key.split('.');
    let obj = this.currentStyles;

    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }

    obj[keys[keys.length - 1]].value = value;
  }

  /**
   * Initialize collapsible sections
   */
  initCollapsibleSections() {
    document.querySelectorAll('.vse-section-header').forEach(header => {
      header.addEventListener('click', () => {
        const section = header.parentElement;
        const content = section.querySelector('.vse-section-content');
        const toggle = header.querySelector('.vse-section-toggle');

        section.classList.toggle('collapsed');

        if (section.classList.contains('collapsed')) {
          content.style.display = 'none';
          toggle.textContent = '▶';
        } else {
          content.style.display = 'block';
          toggle.textContent = '▼';
        }
      });
    });

    // Collapse all sections except first by default
    document.querySelectorAll('.vse-section:not(:first-child) .vse-section-header').forEach(header => {
      header.click();
    });
  }

  /**
   * Reset to default styles
   */
  resetToDefaults() {
    if (confirm('Reset all styles to default values? This cannot be undone.')) {
      this.currentStyles = JSON.parse(JSON.stringify(this.defaultStyles));
      this.applyStyles(this.currentStyles);
      this.removeEditorPanel();
      this.createEditorPanel();
      this.showNotification('Styles reset to defaults');
    }
  }

  /**
   * Export current styles as CSS
   */
  exportCSS() {
    let css = ':root {\n';

    const generateCSS = (obj) => {
      Object.keys(obj).forEach(key => {
        const item = obj[key];

        if (item.cssVar && item.value) {
          css += \`  \${item.cssVar}: \${item.value};\n\`;
        }

        if (typeof item === 'object' && !item.cssVar) {
          generateCSS(item);
        }
      });
    };

    generateCSS(this.currentStyles);
    css += '}\n';

    // Download file
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'visual-styles.css';
    link.click();
    URL.revokeObjectURL(url);

    this.showNotification('CSS exported successfully');
  }

  /**
   * Add to history for undo/redo
   */
  addToHistory() {
    // Remove any future history if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(JSON.parse(JSON.stringify(this.currentStyles)));

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  /**
   * Undo last change
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.currentStyles = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.applyStyles(this.currentStyles);
      this.removeEditorPanel();
      this.createEditorPanel();
      this.showNotification('Undone');
    }
  }

  /**
   * Redo last undone change
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.currentStyles = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.applyStyles(this.currentStyles);
      this.removeEditorPanel();
      this.createEditorPanel();
      this.showNotification('Redone');
    }
  }

  /**
   * Remove editor panel
   */
  removeEditorPanel() {
    const panel = document.getElementById('visual-style-editor');
    if (panel) panel.remove();
  }

  /**
   * Show save indicator
   */
  showSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'vse-save-indicator';
    indicator.textContent = '💾 Styles Saved';
    document.body.appendChild(indicator);

    setTimeout(() => indicator.remove(), 2000);
  }

  /**
   * Show notification
   */
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'vse-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
  }

  /**
   * Helper: Convert color to hex for color picker
   */
  hexToRgb(color) {
    if (color.startsWith('#')) {
      if (color.length === 4) {
        return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
      }
      return color;
    }

    // Handle rgb/rgba
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
      return \`#\${r}\${g}\${b}\`;
    }

    return '#000000';
  }

  /**
   * Helper: Extract numeric value from size string
   */
  extractNumericValue(value) {
    const match = value.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Helper: Extract unit from size string
   */
  extractUnit(value) {
    const match = value.match(/[a-z%]+$/);
    return match ? match[0] : 'px';
  }
}

// Export for use in designer-mode.js
window.VisualStyleEditor = VisualStyleEditor;
