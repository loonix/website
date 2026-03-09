/**
 * PERSONAL ACCESS TOKEN (PAT) AUTHENTICATION UI
 * Simple authentication for GitHub Pages using PAT
 */

class PatAuthUI {
  constructor(githubClient) {
    this.githubClient = githubClient;
    this.panel = null;
    this.backdrop = null;
    this.isActive = false;
    this.storageKey = 'github-pat-token';
  }

  /**
   * Show PAT authentication panel
   */
  show() {
    if (this.isActive) {
      this.hide();
      return;
    }

    this.isActive = true;
    this.createBackdrop();
    this.createPanel();
  }

  /**
   * Hide PAT panel
   */
  hide() {
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
    this.isActive = false;
  }

  /**
   * Create modal backdrop
   */
  createBackdrop() {
    // Remove existing backdrop
    if (this.backdrop) {
      this.backdrop.remove();
    }

    // Create backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop';
    this.backdrop.onclick = () => this.hide();

    document.body.appendChild(this.backdrop);
  }

  /**
   * Create the PAT panel
   */
  createPanel() {
    // Remove existing panel
    if (this.panel) {
      this.panel.remove();
    }

    // Create main panel
    this.panel = document.createElement('div');
    this.panel.id = 'pat-auth-panel';

    // Create content container
    const content = document.createElement('div');
    content.className = 'pat-auth-content';

    // Create header
    const header = document.createElement('div');
    header.className = 'pat-auth-header';

    const title = document.createElement('h2');
    title.textContent = '🔑 GitHub Authentication';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'pat-auth-close';
    closeBtn.textContent = '×';
    closeBtn.onclick = () => this.hide();

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Create instructions
    const instructions = document.createElement('div');
    instructions.className = 'pat-instructions';

    const step1 = document.createElement('h3');
    step1.textContent = 'Step 1: Generate a Personal Access Token';

    const step1Text = document.createElement('p');
    const step1Link = document.createElement('a');
    step1Link.href = 'https://github.com/settings/tokens';
    step1Link.target = '_blank';
    step1Link.textContent = 'github.com/settings/tokens';
    step1Text.appendChild(step1Link);

    const step2 = document.createElement('h3');
    step2.textContent = 'Step 2: Create token';

    const step2Text = document.createElement('p');
    step2Text.textContent = 'Click "Generate new token" → "Generate new token (classic)"';

    const step3 = document.createElement('h3');
    step3.textContent = 'Step 3: Configure token';

    const step3List = document.createElement('ul');
    const noteItem = document.createElement('li');
    noteItem.innerHTML = 'Note: <strong>Designer Mode CMS</strong>';
    const expItem = document.createElement('li');
    expItem.textContent = 'Expiration: No expiration (or your choice)';
    const scopeItem = document.createElement('li');
    scopeItem.innerHTML = 'Scopes: Check <strong>repo</strong> (full control)';
    step3List.appendChild(noteItem);
    step3List.appendChild(expItem);
    step3List.appendChild(scopeItem);

    const step4 = document.createElement('h3');
    step4.textContent = 'Step 4: Paste token below';

    const step4Text = document.createElement('p');
    step4Text.textContent = 'Click "Generate token" at the bottom, then paste it here:';

    // Create input container
    const inputContainer = document.createElement('div');
    inputContainer.className = 'pat-input-container';

    const input = document.createElement('input');
    input.type = 'password';
    input.id = 'pat-token-input';
    input.className = 'pat-token-input';
    input.placeholder = 'ghp_xxxxxxxxxxxxxxxxxxxx';
    input.autocomplete = 'off';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'pat-save-button';
    saveBtn.textContent = 'Save & Authenticate';
    saveBtn.onclick = () => this.saveToken();

    inputContainer.appendChild(input);
    inputContainer.appendChild(saveBtn);

    // Assemble panel
    instructions.appendChild(step1);
    instructions.appendChild(step1Text);
    instructions.appendChild(step2);
    instructions.appendChild(step2Text);
    instructions.appendChild(step3);
    instructions.appendChild(step3List);
    instructions.appendChild(step4);
    instructions.appendChild(step4Text);
    instructions.appendChild(inputContainer);

    content.appendChild(header);
    content.appendChild(instructions);
    this.panel.appendChild(content);

    document.body.appendChild(this.panel);

    // Focus input
    setTimeout(() => input.focus(), 100);
  }

  /**
   * Save and validate the token
   */
  async saveToken() {
    const input = document.getElementById('pat-token-input');
    const token = input.value.trim();

    if (!token) {
      alert('Please enter a token');
      return;
    }

    if (!token.startsWith('ghp_')) {
      alert('Invalid token format. GitHub PATs start with "ghp_"');
      return;
    }

    // Show loading
    const saveBtn = document.querySelector('.pat-save-button');
    saveBtn.textContent = 'Validating...';
    saveBtn.disabled = true;

    try {
      // Test the token by making a simple API call
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': 'token ' + token,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const userData = await response.json();

      // Save token to localStorage
      localStorage.setItem(this.storageKey, token);
      localStorage.setItem('github-user-data', JSON.stringify(userData));

      // Save to github-client storage format
      localStorage.setItem('github-token', token);
      localStorage.setItem('github-token-type', 'pat');

      // Hide panel
      this.hide();

      // Call success callback if provided
      if (this.onAuthSuccess) {
        this.onAuthSuccess(token, userData);
      }

      // Show success message
      console.log('Successfully authenticated as ' + userData.login + '!');

    } catch (error) {
      console.error('Token validation failed:', error);
      alert('Invalid token. Please check and try again.');

      saveBtn.textContent = 'Save & Authenticate';
      saveBtn.disabled = false;
    }
  }

  /**
   * Check if already authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem(this.storageKey);
    return !!token;
  }

  /**
   * Get stored token
   */
  getToken() {
    return localStorage.getItem(this.storageKey);
  }

  /**
   * Clear token (logout)
   */
  logout() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem('github-token');
    localStorage.removeItem('github-token-type');
    localStorage.removeItem('github-user-data');
    window.location.reload();
  }
}

// Make it available globally
window.patAuthUI = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log('PAT Auth UI loaded');
});
