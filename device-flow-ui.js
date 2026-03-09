/**
 * DEVICE FLOW UI
 * Simple UI for GitHub Device Flow authentication
 */

class DeviceFlowUI {
  constructor(deviceAuth) {
    this.deviceAuth = deviceAuth;
    this.panel = null;
    this.isActive = false;

    // Listen for authentication changes
    if (this.deviceAuth && typeof this.deviceAuth.on === 'function') {
      this.deviceAuth.on('authChange', () => this.onAuthChange());
    }
  }

  /**
   * Show Device Flow panel
   */
  async show() {
    if (this.isActive) {
      this.hide();
      return;
    }

    this.isActive = true;
    this.createPanel();
    await this.startFlow();
  }

  /**
   * Hide Device Flow panel
   */
  hide() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
    this.isActive = false;
  }

  /**
   * Create the Device Flow panel using DOM methods
   */
  createPanel() {
    // Remove existing panel
    if (this.panel) {
      this.panel.remove();
    }

    // Create main panel
    this.panel = document.createElement('div');
    this.panel.id = 'device-flow-panel';

    // Create content container
    const content = document.createElement('div');
    content.className = 'device-flow-content';

    // Create header
    const header = document.createElement('div');
    header.className = 'device-flow-header';

    const title = document.createElement('h2');
    title.textContent = '🔐 GitHub Authentication';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'device-flow-close';
    closeBtn.textContent = '×';
    closeBtn.onclick = () => this.hide();

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Create status container
    const status = document.createElement('div');
    status.id = 'device-flow-status';
    status.className = 'device-flow-status';

    // Add loading state
    const loading = document.createElement('div');
    loading.className = 'device-flow-loading';

    const spinner = document.createElement('div');
    spinner.className = 'spinner';

    const loadingText = document.createElement('p');
    loadingText.textContent = 'Initializing...';

    loading.appendChild(spinner);
    loading.appendChild(loadingText);
    status.appendChild(loading);

    // Assemble panel
    content.appendChild(header);
    content.appendChild(status);
    this.panel.appendChild(content);

    document.body.appendChild(this.panel);
  }

  /**
   * Start Device Flow
   */
  async startFlow() {
    try {
      const statusEl = document.getElementById('device-flow-status');

      // Start Device Flow
      const result = await this.deviceAuth.startDeviceFlow();

      if (result.success) {
        this.showInstructions(result, statusEl);
      }
    } catch (error) {
      console.error('Device Flow error:', error);
      this.showError(error, statusEl);
    }
  }

  /**
   * Show Device Flow instructions
   */
  showInstructions(result, statusEl) {
    statusEl.innerHTML = '';

    const instructions = document.createElement('div');
    instructions.className = 'device-flow-instructions';

    // Step 1
    const step1 = document.createElement('h3');
    step1.textContent = 'Step 1: Copy the code';
    instructions.appendChild(step1);

    const codeContainer = document.createElement('div');
    codeContainer.className = 'device-code-container';

    const codeEl = document.createElement('code');
    codeEl.id = 'device-code';
    codeEl.textContent = result.userCode;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-button';
    copyBtn.textContent = 'Copy';
    copyBtn.onclick = () => this.copyCode();

    codeContainer.appendChild(codeEl);
    codeContainer.appendChild(copyBtn);
    instructions.appendChild(codeContainer);

    // Step 2
    const step2 = document.createElement('h3');
    step2.textContent = 'Step 2: Enter the code';
    instructions.appendChild(step2);

    const step2Text = document.createElement('p');
    step2Text.textContent = 'Go to GitHub and enter the code:';
    instructions.appendChild(step2Text);

    const link = document.createElement('a');
    link.href = result.verificationUri;
    link.target = '_blank';
    link.className = 'github-link';
    link.textContent = result.verificationUri + ' →';
    instructions.appendChild(link);

    // Polling status
    const polling = document.createElement('div');
    polling.className = 'polling-status';

    const pollSpinner = document.createElement('div');
    pollSpinner.className = 'spinner';

    const pollText = document.createElement('p');
    pollText.textContent = 'Waiting for you to authorize...';

    polling.appendChild(pollSpinner);
    polling.appendChild(pollText);
    instructions.appendChild(polling);

    // Expires
    const expires = document.createElement('p');
    expires.className = 'expires';
    expires.textContent = `Expires in ${Math.floor(result.expiresIn / 60)} minutes`;
    instructions.appendChild(expires);

    statusEl.appendChild(instructions);
  }

  /**
   * Show error message
   */
  showError(error, statusEl) {
    statusEl.innerHTML = '';

    const errorDiv = document.createElement('div');
    errorDiv.className = 'device-flow-error';

    const errorTitle = document.createElement('h3');
    errorTitle.textContent = '❌ Error';

    const errorText = document.createElement('p');
    errorText.textContent = error.message || 'An error occurred';

    const retryBtn = document.createElement('button');
    retryBtn.className = 'retry-button';
    retryBtn.textContent = 'Try Again';
    retryBtn.onclick = () => this.startFlow();

    errorDiv.appendChild(errorTitle);
    errorDiv.appendChild(errorText);
    errorDiv.appendChild(retryBtn);

    statusEl.appendChild(errorDiv);
  }

  /**
   * Copy device code to clipboard
   */
  copyCode() {
    const codeEl = document.getElementById('device-code');
    if (!codeEl) return;

    const code = codeEl.textContent;

    navigator.clipboard.writeText(code).then(() => {
      const button = document.querySelector('.copy-button');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy. Please copy manually: ' + code);
    });
  }

  /**
   * Handle authentication change
   */
  onAuthChange() {
    if (this.deviceAuth && this.deviceAuth.isAuthenticated) {
      this.hide();
      alert('✅ Successfully authenticated with GitHub!');
    }
  }
}

// Make it available globally
window.deviceFlowUI = null;

// Initialize when GitHubDeviceAuth is available
document.addEventListener('DOMContentLoaded', () => {
  // Will be initialized by DesignerMode
  console.log('Device Flow UI loaded');
});
