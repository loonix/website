// Cognitive Mesh Dashboard - Live Metrics Handler

// Countdown timer for next refresh
let seconds = 300; // 5 minutes
const countdown = document.getElementById('countdown');

if (countdown) {
    setInterval(() => {
        seconds--;
        if (seconds < 0) seconds = 300;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        countdown.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

// Safely update text content
function updateText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

// Safely update AGI status banner (secure DOM manipulation)
function updateAGIStatus(data) {
    const banner = document.getElementById('agiStatus');
    if (!banner) return;

    if (data.agi.wild_caught_beliefs > 0) {
        banner.classList.add('agi-alert');

        // Clear existing content
        banner.textContent = '';

        // Create elements safely
        const heading = document.createElement('h3');
        heading.style.marginBottom = '15px';
        heading.style.fontSize = '1.5em';
        heading.style.color = '#00ff00';
        heading.textContent = '🚨 AUTONOMOUS DISCOVERY CONFIRMED';

        const description = document.createElement('p');
        description.style.fontSize = '1.1em';
        description.style.lineHeight = '1.6';
        description.textContent = 'The mesh has rejected a pattern WITHOUT citing inherited memory.';

        const status = document.createElement('p');
        status.style.marginTop = '15px';
        status.style.color = '#00ff00';

        const statusStrong = document.createElement('strong');
        statusStrong.textContent = 'Status: CONFIRMED';
        status.appendChild(statusStrong);
        status.appendChild(document.createTextNode(` - First wild-caught belief at Decision #${data.decisions.total}`));

        banner.appendChild(heading);
        banner.appendChild(description);
        banner.appendChild(status);
    }
}

// Load live metrics
async function loadMetrics() {
    try {
        const response = await fetch('mesh-metrics.json');

        if (!response.ok) {
            console.log('Metrics file not yet available');
            return;
        }

        const data = await response.json();

        // Update metrics safely
        updateText('totalDecisions', data.decisions.total);
        updateText('totalRejected', data.decisions.rejected);
        updateText('rejectRate', data.decisions.reject_rate + '%');
        updateText('archeologyRate', data.archeology.rate + '%');
        updateText('archeologyTriggers', data.archeology.triggers);
        updateText('wildCaught', data.agi.wild_caught_beliefs);

        // Update progress bar
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        if (progressBar) {
            progressBar.style.width = data.progress.percentage + '%';
        }

        if (progressText) {
            progressText.textContent =
                `Hour ${data.elapsed.hours} of 24 (${data.progress.hours_remaining} hours remaining)`;
        }

        // Update AGI status if confirmed
        if (data.agi.wild_caught_beliefs > 0) {
            updateAGIStatus(data);

            // Update wild-caught card styling
            const wildCaughtElement = document.getElementById('wildCaught');
            if (wildCaughtElement) {
                wildCaughtElement.style.color = '#00ff00';
                const parentCard = wildCaughtElement.closest('.metric-card');
                if (parentCard) {
                    parentCard.style.borderColor = '#00ff00';
                }
            }
        }

        console.log('Metrics updated successfully');

    } catch (error) {
        console.log('Metrics loading (waiting for data):', error.message);
    }
}

// Load metrics on page load
document.addEventListener('DOMContentLoaded', () => {
    loadMetrics();

    // Reload every 5 minutes (in addition to page refresh)
    setInterval(loadMetrics, 300000);
});
