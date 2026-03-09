/**
 * SECURE DRAG-AND-DROP MANAGER
 * HTML5 drag-and-drop with security, CSRF protection, input validation,
 * permission checks, persistent ordering, mobile touch support, and accessibility
 */

class DragDropManager {
  constructor(config = {}) {
    // Configuration
    this.config = {
      containerSelector: config.containerSelector || '#articles .article-grid',
      itemSelector: config.itemSelector || '.article-card',
      handleSelector: config.handleSelector || '.drag-handle',
      dragClass: config.dragClass || 'dragging',
      overClass: config.overClass || 'drag-over',
      disabledClass: config.disabledClass || 'drag-disabled',
      storageKey: config.storageKey || 'article-order',
      csrfToken: config.csrfToken || null,
      csrfHeader: config.csrfHeader || 'X-CSRF-Token',
      requiredPermission: config.requiredPermission || 'admin',
      onDragStart: config.onDragStart || null,
      onDragEnd: config.onDragEnd || null,
      onReorder: config.onReorder || null,
      enableTouch: config.enableTouch !== false,
      enableKeyboard: config.enableKeyboard !== false,
      autoSave: config.autoSave !== false,
      saveDelay: config.saveDelay || 500
    };

    // State
    this.isEnabled = false;
    this.isDragging = false;
    this.draggedItem = null;
    this.placeholder = null;
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.currentItem = null;
    this.originalOrder = [];
    this.newOrder = [];
    this.saveTimeout = null;

    // Permission and auth
    this.authChecker = config.authChecker || null;
    this.permissionChecker = config.permissionChecker || null;

    // Mobile touch support
    this.touchHandlers = {
      touchStart: this.handleTouchStart.bind(this),
      touchMove: this.handleTouchMove.bind(this),
      touchEnd: this.handleTouchEnd.bind(this)
    };

    // Keyboard support
    this.keyboardHandlers = {
      keyDown: this.handleKeyDown.bind(this)
    };

    this.init();
  }

  /**
   * Initialize the drag-drop manager
   */
  init() {
    // Load saved order
    this.loadOrder();

    // Apply saved order
    this.applyOrder();

    console.log('🔄 Drag-Drop Manager initialized');
  }

  /**
   * Enable drag-and-drop functionality
   */
  async enable() {
    // Check authentication and permissions
    if (!this.checkPermissions()) {
      console.warn('❌ Insufficient permissions for drag-and-drop');
      return false;
    }

    this.isEnabled = true;

    // Get container and items
    const container = document.querySelector(this.config.containerSelector);
    if (!container) {
      console.error('❌ Drag container not found');
      return false;
    }

    const items = container.querySelectorAll(this.config.itemSelector);
    if (items.length === 0) {
      console.warn('⚠️ No draggable items found');
      return false;
    }

    // Store original order
    this.originalOrder = Array.from(items).map(item => item.dataset.articleId);
    this.newOrder = [...this.originalOrder];

    // Add drag handles and attributes
    items.forEach(item => this.setupDraggable(item));

    // Add event listeners to container
    container.addEventListener('dragstart', this.handleDragStart.bind(this));
    container.addEventListener('dragend', this.handleDragEnd.bind(this));
    container.addEventListener('dragover', this.handleDragOver.bind(this));
    container.addEventListener('dragenter', this.handleDragEnter.bind(this));
    container.addEventListener('dragleave', this.handleDragLeave.bind(this));
    container.addEventListener('drop', this.handleDrop.bind(this));

    // Enable touch support for mobile
    if (this.config.enableTouch) {
      this.enableTouchSupport(container);
    }

    // Enable keyboard support
    if (this.config.enableKeyboard) {
      this.enableKeyboardSupport(items);
    }

    // Add visual indicators
    container.classList.add('drag-enabled');

    console.log('✅ Drag-and-drop enabled');
    return true;
  }

  /**
   * Disable drag-and-drop functionality
   */
  disable() {
    this.isEnabled = false;

    const container = document.querySelector(this.config.containerSelector);
    if (!container) return;

    const items = container.querySelectorAll(this.config.itemSelector);

    // Remove draggable attributes and handlers
    items.forEach(item => {
      item.removeAttribute('draggable');
      item.removeEventListener('dragstart', this.handleDragStart);
      item.removeEventListener('dragend', this.handleDragEnd);
      item.removeEventListener('keydown', this.keyboardHandlers.keyDown);

      const handle = item.querySelector(this.config.handleSelector);
      if (handle) {
        handle.removeEventListener('touchstart', this.touchHandlers.touchStart);
        handle.removeEventListener('touchmove', this.touchHandlers.touchMove);
        handle.removeEventListener('touchend', this.touchHandlers.touchEnd);
      }

      item.classList.remove(this.config.dragClass, this.config.overClass);
      item.removeAttribute('aria-grabbed');
      item.removeAttribute('tabindex');
    });

    // Remove container event listeners
    container.removeEventListener('dragstart', this.handleDragStart);
    container.removeEventListener('dragend', this.handleDragEnd);
    container.removeEventListener('dragover', this.handleDragOver);
    container.removeEventListener('dragenter', this.handleDragEnter);
    container.removeEventListener('dragleave', this.handleDragLeave);
    container.removeEventListener('drop', this.handleDrop);

    // Disable touch support
    if (this.config.enableTouch) {
      this.disableTouchSupport(container);
    }

    // Remove visual indicators
    container.classList.remove('drag-enabled');

    console.log('🔒 Drag-and-drop disabled');
  }

  /**
   * Setup draggable item
   */
  setupDraggable(item) {
    // Add draggable attribute
    item.setAttribute('draggable', 'true');

    // Add accessibility attributes
    item.setAttribute('role', 'listitem');
    item.setAttribute('aria-grabbed', 'false');
    item.setAttribute('tabindex', '0');

    // Ensure item has an ID
    if (!item.dataset.articleId) {
      item.dataset.articleId = `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Add drag handle if it doesn't exist
    let handle = item.querySelector(this.config.handleSelector);
    if (!handle) {
      handle = this.createDragHandle(item);
    }

    // Add visual styling
    item.classList.add('drag-item');
  }

  /**
   * Create drag handle for item
   */
  createDragHandle(item) {
    const handle = document.createElement('div');
    handle.className = 'drag-handle';

    // Create SVG icon safely
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('aria-hidden', 'true');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z');

    svg.appendChild(path);
    handle.appendChild(svg);

    handle.setAttribute('aria-label', 'Drag to reorder');
    handle.setAttribute('role', 'button');
    handle.setAttribute('tabindex', '0');

    // Insert at the beginning of the item
    item.insertBefore(handle, item.firstChild);

    return handle;
  }

  /**
   * Check user permissions
   */
  checkPermissions() {
    // Check authentication
    if (this.authChecker && !this.authChecker()) {
      console.warn('❌ User not authenticated');
      return false;
    }

    // Check specific permissions
    if (this.permissionChecker && !this.permissionChecker(this.config.requiredPermission)) {
      console.warn('❌ User lacks required permissions');
      return false;
    }

    return true;
  }

  /**
   * Validate input data
   */
  validateInput(data) {
    if (!data || typeof data !== 'object') {
      console.error('❌ Invalid input data');
      return false;
    }

    if (!data.order || !Array.isArray(data.order)) {
      console.error('❌ Invalid order data');
      return false;
    }

    // Check for duplicate IDs
    const uniqueIds = new Set(data.order);
    if (uniqueIds.size !== data.order.length) {
      console.error('❌ Duplicate article IDs detected');
      return false;
    }

    // Validate each ID
    for (const id of data.order) {
      if (!id || typeof id !== 'string') {
        console.error('❌ Invalid article ID');
        return false;
      }
    }

    return true;
  }

  /**
   * Get CSRF token
   */
  getCSRFToken() {
    // Check config first
    if (this.config.csrfToken) {
      return this.config.csrfToken;
    }

    // Try to get from meta tag
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      return metaTag.getAttribute('content');
    }

    // Try to get from cookie
    const match = document.cookie.match(/csrf-token=([^;]+)/);
    if (match) {
      return match[1];
    }

    console.warn('⚠️ CSRF token not found');
    return null;
  }

  /**
   * Handle drag start
   */
  handleDragStart(e) {
    if (!this.isEnabled) return;

    const item = e.target.closest(this.config.itemSelector);
    if (!item) return;

    this.isDragging = true;
    this.draggedItem = item;

    // Add visual feedback
    item.classList.add(this.config.dragClass);
    item.setAttribute('aria-grabbed', 'true');

    // Create placeholder
    this.placeholder = document.createElement('div');
    this.placeholder.className = 'drag-placeholder';
    this.placeholder.style.height = `${item.offsetHeight}px`;

    // Set drag effect
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', item.innerHTML);

    // Store reference for drag events
    e.dataTransfer.setData('text/plain', item.dataset.articleId);

    // Callback
    if (this.config.onDragStart) {
      this.config.onDragStart(item);
    }

    // Add drag image styling
    setTimeout(() => {
      item.style.opacity = '0.4';
    }, 0);
  }

  /**
   * Handle drag end
   */
  handleDragEnd(e) {
    if (!this.isDragging) return;

    const item = e.target.closest(this.config.itemSelector);
    if (!item) return;

    // Remove visual feedback
    item.classList.remove(this.config.dragClass);
    item.style.opacity = '';
    item.setAttribute('aria-grabbed', 'false');

    // Remove placeholder
    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.parentNode.removeChild(this.placeholder);
    }

    // Clear all drag-over states
    document.querySelectorAll(`.${this.config.overClass}`).forEach(el => {
      el.classList.remove(this.config.overClass);
    });

    this.isDragging = false;
    this.draggedItem = null;

    // Callback
    if (this.config.onDragEnd) {
      this.config.onDragEnd(item);
    }

    // Auto-save if enabled
    if (this.config.autoSave) {
      this.scheduleSave();
    }
  }

  /**
   * Handle drag over
   */
  handleDragOver(e) {
    if (!this.isDragging) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const item = e.target.closest(this.config.itemSelector);
    if (!item || item === this.draggedItem) return;

    // Visual feedback
    item.classList.add(this.config.overClass);
  }

  /**
   * Handle drag enter
   */
  handleDragEnter(e) {
    if (!this.isDragging) return;

    e.preventDefault();

    const item = e.target.closest(this.config.itemSelector);
    if (!item || item === this.draggedItem) return;

    // Insert placeholder
    const container = document.querySelector(this.config.containerSelector);
    const rect = item.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;

    if (e.clientY < midY) {
      container.insertBefore(this.placeholder, item);
    } else {
      container.insertBefore(this.placeholder, item.nextSibling);
    }
  }

  /**
   * Handle drag leave
   */
  handleDragLeave(e) {
    if (!this.isDragging) return;

    const item = e.target.closest(this.config.itemSelector);
    if (item) {
      item.classList.remove(this.config.overClass);
    }
  }

  /**
   * Handle drop
   */
  handleDrop(e) {
    if (!this.isDragging) return;

    e.preventDefault();
    e.stopPropagation();

    const item = e.target.closest(this.config.itemSelector);
    if (!item || item === this.draggedItem) return;

    // Get container
    const container = document.querySelector(this.config.containerSelector);

    // Remove placeholder
    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.parentNode.removeChild(this.placeholder);
    }

    // Move dragged item to new position
    const rect = item.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;

    if (e.clientY < midY) {
      container.insertBefore(this.draggedItem, item);
    } else {
      container.insertBefore(this.draggedItem, item.nextSibling);
    }

    // Update order
    this.updateOrder();

    // Remove visual feedback
    item.classList.remove(this.config.overClass);

    // Callback
    if (this.config.onReorder) {
      this.config.onReorder(this.newOrder);
    }
  }

  /**
   * Enable touch support for mobile
   */
  enableTouchSupport(container) {
    const items = container.querySelectorAll(this.config.itemSelector);

    items.forEach(item => {
      const handle = item.querySelector(this.config.handleSelector);
      if (handle) {
        handle.addEventListener('touchstart', this.touchHandlers.touchStart, { passive: false });
        handle.addEventListener('touchmove', this.touchHandlers.touchMove, { passive: false });
        handle.addEventListener('touchend', this.touchHandlers.touchEnd);
      }
    });

    console.log('📱 Touch support enabled');
  }

  /**
   * Disable touch support
   */
  disableTouchSupport(container) {
    const items = container.querySelectorAll(this.config.itemSelector);

    items.forEach(item => {
      const handle = item.querySelector(this.config.handleSelector);
      if (handle) {
        handle.removeEventListener('touchstart', this.touchHandlers.touchStart);
        handle.removeEventListener('touchmove', this.touchHandlers.touchMove);
        handle.removeEventListener('touchend', this.touchHandlers.touchEnd);
      }
    });
  }

  /**
   * Handle touch start
   */
  handleTouchStart(e) {
    if (!this.isEnabled) return;

    const touch = e.touches[0];
    this.touchStartY = touch.clientY;
    this.touchStartX = touch.clientX;
    this.currentItem = e.target.closest(this.config.itemSelector);

    if (this.currentItem) {
      this.currentItem.classList.add(this.config.dragClass);
      e.preventDefault();
    }
  }

  /**
   * Handle touch move
   */
  handleTouchMove(e) {
    if (!this.currentItem || !this.isEnabled) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - this.touchStartY;

    // Only start dragging if moved more than 10px vertically
    if (Math.abs(deltaY) > 10) {
      e.preventDefault();

      // Find element below touch point
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const targetItem = elementBelow?.closest(this.config.itemSelector);

      if (targetItem && targetItem !== this.currentItem) {
        const container = document.querySelector(this.config.containerSelector);
        const rect = targetItem.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;

        if (touch.clientY < midY) {
          container.insertBefore(this.currentItem, targetItem);
        } else {
          container.insertBefore(this.currentItem, targetItem.nextSibling);
        }

        // Update order
        this.updateOrder();
      }
    }
  }

  /**
   * Handle touch end
   */
  handleTouchEnd(e) {
    if (this.currentItem) {
      this.currentItem.classList.remove(this.config.dragClass);
      this.currentItem = null;

      // Auto-save if enabled
      if (this.config.autoSave) {
        this.scheduleSave();
      }
    }
  }

  /**
   * Enable keyboard support
   */
  enableKeyboardSupport(items) {
    items.forEach(item => {
      item.addEventListener('keydown', this.keyboardHandlers.keyDown);
    });

    console.log('⌨️ Keyboard support enabled');
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyDown(e) {
    if (!this.isEnabled) return;

    const item = e.target.closest(this.config.itemSelector);
    if (!item) return;

    const container = document.querySelector(this.config.containerSelector);
    const items = Array.from(container.querySelectorAll(this.config.itemSelector));
    const currentIndex = items.indexOf(item);

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        if (currentIndex > 0) {
          container.insertBefore(item, items[currentIndex - 1]);
          this.updateOrder();
          item.focus();
          if (this.config.autoSave) this.scheduleSave();
        }
        break;

      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          container.insertBefore(items[currentIndex + 1], item);
          this.updateOrder();
          item.focus();
          if (this.config.autoSave) this.scheduleSave();
        }
        break;

      case 'Home':
        e.preventDefault();
        if (currentIndex !== 0) {
          container.insertBefore(item, items[0]);
          this.updateOrder();
          item.focus();
          if (this.config.autoSave) this.scheduleSave();
        }
        break;

      case 'End':
        e.preventDefault();
        if (currentIndex !== items.length - 1) {
          container.appendChild(item);
          this.updateOrder();
          item.focus();
          if (this.config.autoSave) this.scheduleSave();
        }
        break;
    }
  }

  /**
   * Update order array
   */
  updateOrder() {
    const container = document.querySelector(this.config.containerSelector);
    const items = container.querySelectorAll(this.config.itemSelector);

    this.newOrder = Array.from(items).map(item => item.dataset.articleId);

    console.log('📊 Order updated:', this.newOrder);
  }

  /**
   * Schedule auto-save with debounce
   */
  scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.saveOrder();
    }, this.config.saveDelay);
  }

  /**
   * Save order to storage
   */
  saveOrder() {
    const orderData = {
      order: this.newOrder,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    // Validate before saving
    if (!this.validateInput(orderData)) {
      console.error('❌ Invalid order data, not saving');
      return false;
    }

    try {
      // Save to localStorage
      localStorage.setItem(this.config.storageKey, JSON.stringify(orderData));

      console.log('💾 Order saved to storage');

      // Trigger callback for server sync
      if (this.config.onReorder) {
        this.config.onReorder(this.newOrder);
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to save order:', error);
      return false;
    }
  }

  /**
   * Load order from storage
   */
  loadOrder() {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const data = JSON.parse(stored);

        // Validate loaded data
        if (this.validateInput(data)) {
          this.newOrder = data.order;
          console.log('📥 Order loaded from storage:', this.newOrder);
          return true;
        } else {
          console.warn('⚠️ Invalid stored order data, ignoring');
          localStorage.removeItem(this.config.storageKey);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load order:', error);
    }

    return false;
  }

  /**
   * Apply saved order to DOM
   */
  applyOrder() {
    if (this.newOrder.length === 0) return;

    const container = document.querySelector(this.config.containerSelector);
    if (!container) return;

    const items = container.querySelectorAll(this.config.itemSelector);
    const itemsArray = Array.from(items);

    // Sort items according to saved order
    itemsArray.sort((a, b) => {
      const aIndex = this.newOrder.indexOf(a.dataset.articleId);
      const bIndex = this.newOrder.indexOf(b.dataset.articleId);
      return aIndex - bIndex;
    });

    // Re-append items in new order
    itemsArray.forEach(item => {
      container.appendChild(item);
    });

    console.log('✅ Order applied to DOM');
  }

  /**
   * Reset order to original
   */
  resetOrder() {
    if (this.originalOrder.length === 0) return;

    this.newOrder = [...this.originalOrder];
    this.applyOrder();
    this.saveOrder();

    console.log('🔄 Order reset to original');
  }

  /**
   * Get current order
   */
  getOrder() {
    this.updateOrder();
    return [...this.newOrder];
  }

  /**
   * Set order programmatically
   */
  setOrder(order) {
    if (!this.validateInput({ order })) {
      console.error('❌ Invalid order data');
      return false;
    }

    this.newOrder = [...order];
    this.applyOrder();
    this.saveOrder();

    return true;
  }

  /**
   * Destroy drag-drop manager
   */
  destroy() {
    this.disable();

    // Clear timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    console.log('🗑️ Drag-Drop Manager destroyed');
  }
}

// Export for use
window.DragDropManager = DragDropManager;
