// Organism Evolution Live Feed

let lastDecisionId = 0;
const MAX_DECISIONS_DISPLAY = 10;

async function loadOrganismMetrics() {
    try {
        const response = await fetch('organism-metrics.json?t=' + Date.now());
        const data = await response.json();

        // Update core integrity
        document.getElementById('coreIntegrity').textContent = data.coreIntegrity.toFixed(2);

        // Update trauma counters
        document.getElementById('arianeCounter').textContent = data.traumaDefenses.ariane5 || 0;
        document.getElementById('knightCounter').textContent = data.traumaDefenses.knightCapital || 0;
        document.getElementById('theracCounter').textContent = data.traumaDefenses.therac25 || 0;
        document.getElementById('totalDefenses').textContent = data.traumaDefenses.total || 0;

        // Update logic feed with recent decisions
        if (data.recentDecisions && data.recentDecisions.length > 0) {
            updateLogicFeed(data.recentDecisions);
        }

        // Update organism's choice
        if (data.firstLimb && data.firstLimb !== 'pending') {
            const limbEl = document.getElementById('firstLimb');
            limbEl.textContent = data.firstLimb;
            limbEl.style.color = 'var(--green)';
        }

        // Update feed status
        const now = new Date();
        const updateTime = new Date(data.lastUpdate);
        const secondsAgo = Math.floor((now - updateTime) / 1000);

        let timeText;
        if (secondsAgo < 10) {
            timeText = 'Just now';
        } else if (secondsAgo < 60) {
            timeText = `${secondsAgo}s ago`;
        } else {
            const minutesAgo = Math.floor(secondsAgo / 60);
            timeText = `${minutesAgo}m ago`;
        }

        document.getElementById('feedUpdate').textContent = timeText;

    } catch (error) {
        console.error('Failed to load organism metrics:', error);
    }
}

function updateLogicFeed(decisions) {
    const feedContent = document.getElementById('logicFeed');

    // Clear loading message on first load
    const loadingMessage = feedContent.querySelector('p');
    if (loadingMessage) {
        feedContent.removeChild(loadingMessage);
    }

    // Get only new decisions
    const newDecisions = decisions.filter(d => d.id > lastDecisionId);

    if (newDecisions.length === 0) {
        return; // No new decisions
    }

    // Update last decision ID
    lastDecisionId = Math.max(...decisions.map(d => d.id));

    // Prepend new decisions (newest first)
    newDecisions.reverse().forEach(decision => {
        const entry = createDecisionEntry(decision);
        feedContent.insertBefore(entry, feedContent.firstChild);
    });

    // Keep only last MAX_DECISIONS_DISPLAY
    const entries = feedContent.querySelectorAll('.decision-entry');
    if (entries.length > MAX_DECISIONS_DISPLAY) {
        for (let i = MAX_DECISIONS_DISPLAY; i < entries.length; i++) {
            entries[i].remove();
        }
    }
}

function createDecisionEntry(decision) {
    const entry = document.createElement('div');
    entry.className = 'decision-entry';

    // Decision number
    const decisionNumber = document.createElement('div');
    decisionNumber.className = 'decision-number';
    decisionNumber.textContent = `Decision #${decision.id}`;
    entry.appendChild(decisionNumber);

    // Decision question
    const decisionQuestion = document.createElement('div');
    decisionQuestion.className = 'decision-question';
    decisionQuestion.textContent = decision.question;
    entry.appendChild(decisionQuestion);

    // Node votes
    decision.nodes.forEach(node => {
        const nodeVote = document.createElement('div');
        nodeVote.className = 'node-vote';

        const nodeName = document.createElement('span');
        nodeName.className = 'node-name';
        nodeName.textContent = node.name;
        nodeVote.appendChild(nodeName);

        const nodeVerdict = document.createElement('span');
        nodeVerdict.className = 'node-verdict';
        if (node.verdict.toLowerCase() === 'reject') {
            nodeVerdict.classList.add('reject');
        }
        nodeVerdict.textContent = node.verdict;
        nodeVote.appendChild(nodeVerdict);

        const nodeWeight = document.createElement('span');
        nodeWeight.style.color = 'var(--text-dim)';
        nodeWeight.style.marginLeft = 'auto';
        nodeWeight.textContent = node.weight.toFixed(2);
        nodeVote.appendChild(nodeWeight);

        entry.appendChild(nodeVote);
    });

    // Consensus badge
    const consensusBadge = document.createElement('div');
    consensusBadge.className = 'consensus-badge';
    if (decision.consensus === 'rejected') {
        consensusBadge.classList.add('reject');
        consensusBadge.textContent = '❌ CONSENSUS REJECTED';
    } else if (decision.consensus === 'approved') {
        consensusBadge.textContent = '✅ CONSENSUS REACHED';
    } else {
        consensusBadge.textContent = '⚡ OPTIMIZED';
    }
    entry.appendChild(consensusBadge);

    return entry;
}

// Initial load
loadOrganismMetrics();

// Refresh every 30 seconds
setInterval(loadOrganismMetrics, 30000);

// Add smooth fade-in animation for new entries
const style = document.createElement('style');
style.textContent = `
    .decision-entry {
        animation: fadeInSlide 0.5s ease-out;
    }

    @keyframes fadeInSlide {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
