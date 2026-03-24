// The Organism - Real-Time Supabase Feed
// Safe DOM manipulation (no innerHTML)

const SUPABASE_URL = "https://juxpvltxdyxtbheuthtw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1eHB2bHR4ZHl4dGJoZXV0aHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTkzNjksImV4cCI6MjA4OTkzNTM2OX0.FfDTZZB9u9Z-xUam9hImWloQeQTkwnBJwhXIasUX_BE";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const feedEl = document.getElementById('decision-feed');
const journalFeedEl = document.getElementById('journal-feed');
const statDecisions = document.getElementById('stat-decisions');
const statRejected = document.getElementById('stat-rejected');
const statVetos = document.getElementById('stat-vetos');
const liveIndicator = document.getElementById('live-indicator');

// Safe DOM element creation
function createElement(tag, className, textContent) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
}

// Render Decision Card (safe DOM manipulation)
function renderDecision(d) {
    const card = createElement('div', 'decision-card');

    // Meta section
    const meta = createElement('div', 'decision-meta');
    const metaLeft = createElement('span');
    const metaLeftStrong = createElement('strong');
    metaLeftStrong.textContent = `Decision #${d.decision_index}`;
    metaLeft.appendChild(metaLeftStrong);

    const date = new Date(d.created_at * 1000);
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const metaRight = createElement('span', null, `${dateStr} ${timeStr}`);

    meta.appendChild(metaLeft);
    meta.appendChild(metaRight);
    card.appendChild(meta);

    // Task section (if available)
    if (d.symbol && d.symbol !== 'PROD') {
        const task = createElement('div', 'decision-task');
        task.textContent = d.symbol;
        if (d.market_price && d.market_price > 0) {
            task.textContent += ` (${d.market_price.toFixed(2)} SATs)`;
        }
        card.appendChild(task);
    }

    // Action section
    const action = createElement('div', 'decision-action');
    action.textContent = `→ ${d.mesh_action.toUpperCase()}`;
    card.appendChild(action);

    // Reasoning section
    const reasoning = createElement('div', 'reasoning');

    // Parse reasoning chain if it's an array
    if (d.reasoning_chain) {
        try {
            const chain = typeof d.reasoning_chain === 'string'
                ? JSON.parse(d.reasoning_chain)
                : d.reasoning_chain;

            if (Array.isArray(chain)) {
                // Group by node type
                const zealot = chain.filter(r => r.startsWith('ZEALOT:'));
                const auditor = chain.filter(r => r.startsWith('AUDITOR:'));
                const scavenger = chain.filter(r => r.startsWith('SCAVENGER:'));

                // Show key points only
                const keyPoints = [];
                if (zealot.length > 0) {
                    // Show first non-archeology zealot point or first archeology point
                    const archPoint = zealot.find(z => z.includes('Archeology') || z.includes('trauma'));
                    keyPoints.push(archPoint || zealot[0]);
                }
                if (auditor.length > 0) {
                    const vetoPoint = auditor.find(a => a.includes('VETO') || a.includes('acceptable'));
                    keyPoints.push(vetoPoint || auditor[0]);
                }
                if (scavenger.length > 0 && scavenger[0].includes('Optimization')) {
                    keyPoints.push(scavenger[0]);
                }

                reasoning.textContent = keyPoints.join(' • ').substring(0, 200);
            } else {
                reasoning.textContent = d.reasoning_chain;
            }
        } catch (e) {
            reasoning.textContent = d.reasoning_chain;
        }
    } else {
        reasoning.textContent = 'Autonomous deliberation via three-node consensus.';
    }

    card.appendChild(reasoning);

    // Execution result section (if exists)
    if (d.execution_result) {
        try {
            const result = typeof d.execution_result === 'string'
                ? JSON.parse(d.execution_result)
                : d.execution_result;

            const execResult = createElement('div', 'execution-result');
            execResult.style.marginTop = '12px';
            execResult.style.padding = '12px';
            execResult.style.borderRadius = '4px';
            execResult.style.fontSize = '13px';
            execResult.style.fontFamily = 'monospace';

            if (result.success) {
                // Success - green theme
                execResult.style.background = 'rgba(0, 255, 136, 0.05)';
                execResult.style.borderLeft = '3px solid var(--green)';

                const successLabel = createElement('strong');
                successLabel.textContent = '✅ ';
                successLabel.style.color = 'var(--green)';
                execResult.appendChild(successLabel);

                const outputText = document.createTextNode(result.output || 'Executed successfully');
                execResult.appendChild(outputText);

                if (result.duration_ms) {
                    const duration = createElement('span');
                    duration.textContent = ` (${result.duration_ms}ms)`;
                    duration.style.color = '#888';
                    duration.style.fontSize = '11px';
                    execResult.appendChild(duration);
                }
            } else {
                // Failure - red theme
                execResult.style.background = 'rgba(255, 0, 85, 0.05)';
                execResult.style.borderLeft = '3px solid var(--red)';

                const errorLabel = createElement('strong');
                errorLabel.textContent = '❌ ';
                errorLabel.style.color = 'var(--red)';
                execResult.appendChild(errorLabel);

                // Truncate long errors
                let errorMsg = result.error || 'Execution failed';
                if (errorMsg.length > 200) {
                    errorMsg = errorMsg.substring(0, 200) + '...';
                }

                const errorText = document.createTextNode(errorMsg);
                execResult.appendChild(errorText);
            }

            card.appendChild(execResult);
        } catch (e) {
            console.error('Failed to parse execution_result:', e);
        }
    }

    // Journal entry section (if exists)
    if (d.journal_entry) {
        const journal = createElement('div', 'reasoning');
        journal.style.borderLeft = '3px solid var(--amber)';
        journal.style.background = 'rgba(255, 165, 0, 0.05)';
        const journalLabel = createElement('strong');
        journalLabel.textContent = '📝 Journal: ';
        journalLabel.style.color = 'var(--amber)';
        journal.appendChild(journalLabel);
        const journalText = document.createTextNode(d.journal_entry);
        journal.appendChild(journalText);
        card.appendChild(journal);
    }

    // Badges section
    const badges = createElement('div', 'consensus-badges');

    const actionClass = d.mesh_action === 'rejected' ? 'badge-rejected' : 'badge-execute';
    const actionBadge = createElement('span', `badge ${actionClass}`);
    actionBadge.textContent = d.mesh_action.toUpperCase();
    badges.appendChild(actionBadge);

    if (d.auditor_veto_reason) {
        const vetoBadge = createElement('span', 'badge badge-rejected');
        vetoBadge.textContent = 'TRAUMA VETO';
        badges.appendChild(vetoBadge);
    }

    card.appendChild(badges);

    return card;
}

// Render Journal Entry
function renderJournalEntry(d) {
    const entry = createElement('div', 'journal-entry');

    const meta = createElement('div', 'journal-meta');
    meta.textContent = `Decision #${d.decision_index}`;
    entry.appendChild(meta);

    const text = createElement('div', 'journal-text');
    text.textContent = d.journal_entry;
    entry.appendChild(text);

    return entry;
}

// Load Journal Entries
async function loadJournalEntries() {
    try {
        const { data, error } = await supabaseClient
            .from('mesh_decisions')
            .select('decision_index, journal_entry, created_at')
            .not('journal_entry', 'is', null)
            .order('decision_index', { ascending: false })
            .limit(10);

        if (error) throw error;

        if (data && data.length > 0) {
            journalFeedEl.textContent = '';
            data.forEach(d => {
                journalFeedEl.appendChild(renderJournalEntry(d));
            });
        } else {
            const loading = createElement('div', 'loading');
            loading.textContent = 'No journal entries yet. The organism writes every 10 decisions.';
            journalFeedEl.textContent = '';
            journalFeedEl.appendChild(loading);
        }
    } catch (error) {
        console.error('Journal load error:', error);
        const errorMsg = createElement('div', 'loading');
        errorMsg.textContent = '⚠️ Journal unavailable';
        journalFeedEl.textContent = '';
        journalFeedEl.appendChild(errorMsg);
    }
}

// Initial Load
async function loadInitialData() {
    try {
        const { data, error } = await supabaseClient
            .from('mesh_decisions')
            .select('decision_index, symbol, market_price, mesh_action, reasoning_chain, auditor_veto_reason, execution_result, journal_entry, created_at, timestamp')
            .order('decision_index', { ascending: false })
            .limit(20);

        if (error) throw error;

        if (data && data.length > 0) {
            // Clear loading message
            feedEl.textContent = '';

            // Add cards (already in descending order - newest first)
            data.forEach(d => {
                feedEl.appendChild(renderDecision(d));
            });

            // Update stats
            updateStats();
        } else {
            const loading = createElement('div', 'loading');
            loading.textContent = 'No decisions yet. Waiting for migration...';
            feedEl.textContent = '';
            feedEl.appendChild(loading);
        }
    } catch (error) {
        console.error('Load error:', error);
        const errorMsg = createElement('div', 'loading');
        errorMsg.textContent = `⚠️ Connection error: ${error.message}`;
        feedEl.textContent = '';
        feedEl.appendChild(errorMsg);
    }
}

// Update Statistics
async function updateStats() {
    try {
        const { data, error } = await supabaseClient
            .from('mesh_stats')
            .select('*')
            .single();

        if (error) throw error;

        if (data) {
            statDecisions.textContent = data.total_decisions.toLocaleString();
            statRejected.textContent = data.total_rejected.toLocaleString();
            statVetos.textContent = data.trauma_vetos.toLocaleString();
        }
    } catch (error) {
        console.error('Stats error:', error);
        // Silently fail - stats view might not exist yet
    }
}

// Real-Time Subscription
const channel = supabaseClient
    .channel('mesh-decisions-changes')
    .on(
        'postgres_changes',
        {
            event: 'INSERT',
            schema: 'public',
            table: 'mesh_decisions'
        },
        (payload) => {
            console.log('New decision:', payload.new);

            // Clear loading message if present
            const loadingMsg = feedEl.querySelector('.loading');
            if (loadingMsg) {
                feedEl.removeChild(loadingMsg);
            }

            // Add new card to top of feed
            const newCard = renderDecision(payload.new);
            feedEl.insertBefore(newCard, feedEl.firstChild);

            // Keep feed clean (max 20 cards)
            if (feedEl.children.length > 20) {
                feedEl.removeChild(feedEl.lastChild);
            }

            // Update stats
            updateStats();

            // Reload journal if this decision has a journal entry
            if (payload.new.journal_entry) {
                loadJournalEntries();
            }

            // Visual feedback
            liveIndicator.style.color = 'var(--magenta)';
            setTimeout(() => {
                liveIndicator.style.color = 'var(--green)';
            }, 500);
        }
    )
    .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
            console.log('✅ Real-time feed active');
        }
    });

// Initialize
loadInitialData();
loadJournalEntries();

// Refresh stats and journal every 30 seconds (backup in case realtime fails)
setInterval(updateStats, 30000);
setInterval(loadJournalEntries, 30000);
