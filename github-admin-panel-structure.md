# GitHub Admin Panel - Structure Overview

## Panel Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB ADMIN PANEL                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HEADER: 🐙 GitHub Control Center                   [×]  │   │
│  │         Status: ● Connected                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  TABS: [🔄 Sync] [🌿 Branches] [📜 History]            │   │
│  │        [📊 Stats] [🎯 OODA]                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                                                           │   │
│  │  TAB CONTENT AREA                                        │   │
│  │  (Changes based on selected tab)                         │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │  SYNC TAB                                       │     │   │
│  │  │  ├── Connection Status                          │     │   │
│  │  │  │   ├── User Avatar & Info                     │     │   │
│  │  │  │   ├── Repository Name                        │     │   │
│  │  │  │   ├── Last Sync Time                         │     │   │
│  │  │  │   └── Sync Status                            │     │   │
│  │  │  ├── Sync Controls                              │     │   │
│  │  │  │   ├── Sync to GitHub (Push)                  │     │   │
│  │  │  │   └── Load from GitHub (Pull)                │     │   │
│  │  │  ├── Auto-Sync Section                          │     │   │
│  │  │  │   ├── Toggle Switch                          │     │   │
│  │  │  │   └── Interval Selector                       │     │   │
│  │  │  └── Conflict Alert (when needed)               │     │   │
│  │  │      └── Conflict List                           │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │  BRANCHES TAB                                   │     │   │
│  │  │  ├── Branch Header                               │     │   │
│  │  │  │   ├── Current Branch Display                  │     │   │
│  │  │  │   └── Create Draft Branch Button             │     │   │
│  │  │  ├── Branch List                                  │     │   │
│  │  │  │   └── Branch Items (name, SHA, actions)      │     │   │
│  │  │  └── Branch Compare View (when active)           │     │   │
│  │  │      ├── Comparison Stats                        │     │   │
│  │  │      └── Merge Actions                           │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │  HISTORY TAB                                    │     │   │
│  │  │  ├── History Header                               │     │   │
│  │  │  │   └── View Full History Button                │     │   │
│  │  │  └── Commit List                                  │     │   │
│  │  │      └── Commit Items                            │     │   │
│  │  │          ├── Message & SHA                       │     │   │
│  │  │          ├── Author & Time                       │     │   │
│  │  │          └── Actions (Rollback, View)           │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │  STATS TAB                                      │     │   │
│  │  │  ├── Statistics Grid                              │     │   │
│  │  │  │   ├── Total Commits                           │     │   │
│  │  │  │   ├── Changes Today/Week/Month               │     │   │
│  │  │  │   ├── Assets Uploaded                        │     │   │
│  │  │  │   ├── Sync Success Rate                      │     │   │
│  │  │  │   └── API Rate Limit                         │     │   │
│  │  │  └── Repository Info                              │     │   │
│  │  │      ├── Repository Link                         │     │   │
│  │  │      ├── Owner Info                              │     │   │
│  │  │      └── Stats (Stars, Forks, Issues, PRs)      │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │  OODA TAB                                       │     │   │
│  │  │  ├── OODA Header                                  │     │   │
│  │  │  │   └── Cycle Time Display                      │     │   │
│  │  │  ├── OODA Stages                                  │     │   │
│  │  │  │   ├── 👁️ OBSERVE                              │     │   │
│  │  │  │   │   ├── Status                              │     │   │
│  │  │  │   │   ├── Last Check                          │     │   │
│  │  │  │   │   ├── Changes Detected                    │     │   │
│  │  │  │   │   └── Repository Status                   │     │   │
│  │  │  │   ├── 🧭 ORIENT                                │     │   │
│  │  │  │   │   ├── Status                              │     │   │
│  │  │  │   │   ├── Conflicts                           │     │   │
│  │  │  │   │   ├── Pending Sync                        │     │   │
│  │  │  │   │   └── Branch Status                       │     │   │
│  │  │  │   ├── 🎯 DECIDE                                │     │   │
│  │  │  │   │   ├── Action                              │     │   │
│  │  │  │   │   ├── Reason                              │     │   │
│  │  │  │   │   └── Confidence                           │     │   │
│  │  │  │   └── ⚡ ACT                                   │     │   │
│  │  │  │       ├── Last Action                         │     │   │
│  │  │  │       ├── Result                              │     │   │
│  │  │  │       └── Duration                            │     │   │
│  │  │  └── Activity Log                                 │     │   │
│  │  │      └── Log Entries (Time, Message)            │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  QUICK ACTIONS FOOTER                                    │   │
│  │  [🔗 Open] [📝 Issue] [🔀 PRs] [🔃 Refresh]             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Class Structure

```
GitHubAdminPanel
├── Properties
│   ├── designerMode: DesignerMode instance
│   ├── githubAuth: GitHubAuth instance
│   ├── panel: DOM element
│   ├── currentTab: string
│   ├── oodaStatus: OODAStatus object
│   ├── autoSyncInterval: number
│   ├── stats: Statistics object
│   ├── branches: Branch[] array
│   ├── commits: Commit[] array
│   ├── conflicts: Conflict[] array
│   ├── repoInfo: Repository info
│   ├── lastSyncTime: Date
│   ├── syncStatus: string
│   └── pendingChanges: number
│
├── Methods
│   ├── create(): Create panel UI
│   ├── destroy(): Remove panel
│   ├── updateStatus(): Refresh GitHub status
│   ├── showTab(tabName): Switch tabs
│   ├── syncToGitHub(): Push changes
│   ├── loadFromGitHub(): Pull changes
│   ├── createDraftBranch(): Create branch
│   ├── compareBranch(branchName): Compare branches
│   ├── rollbackToCommit(sha): Rollback
│   ├── startAutoSync(interval): Enable auto-sync
│   ├── stopAutoSync(): Disable auto-sync
│   ├── startOODALoop(): Begin monitoring
│   ├── runOODACycle(): Execute OODA loop
│   ├── oodaObserve(): Observe phase
│   ├── oodaOrient(): Orient phase
│   ├── oodaDecide(): Decide phase
│   ├── oodaAct(): Act phase
│   ├── updateOODAStatus(phase, updates): Update OODA
│   ├── addOODALog(message, type): Add log entry
│   └── showConnectionStatus(status): Update status
│
└── Internal Methods
    ├── buildPanelHTML(): Generate HTML
    ├── buildTabContent(tabName): Generate tab HTML
    ├── attachEventListeners(): Bind events
    ├── fetchRepositoryInfo(): Get repo data
    ├── fetchBranches(): Get branch list
    ├── fetchCommits(): Get commit history
    ├── updateUserInfo(): Update user display
    ├── updateBranchList(): Update branches
    ├── updateCommitList(): Update commits
    ├── updateStats(): Update statistics
    └── updateOODADisplay(): Update OODA UI
```

## Data Flow

```
User Action
    ↓
Event Listener
    ↓
Method Call
    ↓
GitHub API Request
    ↓
Data Processing
    ↓
UI Update
    ↓
OODA Cycle Update
    ↓
Log Entry
```

## OODA Loop Flow

```
┌─────────┐
│  START  │
└────┬────┘
     │
     ↓
┌─────────────┐
│  OBSERVE    │ ◄──┐
│  - Check    │    │
│  - Monitor  │    │
└──────┬──────┘    │
       │           │
       ↓           │
┌─────────────┐    │
│  ORIENT     │    │
│  - Assess   │    │
│  - Analyze  │    │
└──────┬──────┘    │
       │           │
       ↓           │
┌─────────────┐    │
│  DECIDE     │    │
│  - Action?  │    │
│  - Method?  │    │
└──────┬──────┘    │
       │           │
       ↓           │
┌─────────────┐    │
│  ACT        │    │
│  - Execute  │────┘
│  - Result   │
└──────┬──────┘
       │
       ↓
┌─────────┐
│  WAIT   │ (5 seconds)
└────┬────┘
     │
     └──→ Repeat
```

## State Management

```
Panel State
├── Connection State
│   ├── Authenticated: boolean
│   ├── User: userData
│   ├── Repository: repoInfo
│   └── Status: connected|checking|disconnected|error
│
├── Sync State
│   ├── Status: idle|syncing|conflict|error
│   ├── LastSync: Date
│   ├── PendingChanges: number
│   └── AutoSync: enabled|disabled
│
├── Branch State
│   ├── Current: string
│   ├── List: Branch[]
│   └── Comparison: branchComparison
│
├── Commit State
│   ├── History: Commit[]
│   └── Total: number
│
├── OODA State
│   ├── Observe: observeData
│   ├── Orient: orientData
│   ├── Decide: decideData
│   ├── Act: actData
│   ├── CycleTime: number
│   └── LastCycle: Date
│
└── Statistics State
    ├── TotalCommits: number
    ├── ChangesToday: number
    ├── ChangesWeek: number
    ├── ChangesMonth: number
    ├── AssetsUploaded: number
    ├── SyncSuccessRate: percentage
    └── APIRateLimit: rateLimitInfo
```

## Integration Points

```
Designer Mode CMS
    ↓
GitHubAuth (authentication)
    ↓
GitHubAdminPanel (management interface)
    ↓
GitHub API (operations)
```

## File Dependencies

```
index.html
├── CSS
│   ├── styles.css
│   ├── designer-mode.css
│   ├── auth-ui.css
│   ├── visual-editor.css
│   └── github-admin-panel.css ← NEW
│
└── JavaScript
    ├── script.js
    ├── github-auth.js
    ├── auth-ui.js
    ├── visual-editor.js
    ├── github-admin-panel.js ← NEW
    └── designer-mode.js
```

## Event Flow

```
1. User activates Designer Mode (Ctrl+Shift+E)
    ↓
2. Designer Mode creates Admin Panel
    ↓
3. Check GitHub Authentication
    ↓
4. If authenticated, create GitHub Admin Panel
    ↓
5. Panel initializes and fetches data
    ↓
6. OODA loop starts (5-second intervals)
    ↓
7. User interacts with panel
    ↓
8. Actions executed via GitHub API
    ↓
9. UI updates with results
    ↓
10. OODA cycle logs activity
```
