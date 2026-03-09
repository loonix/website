# Media Manager System - Visual Showcase

## UI Components

### 1. Main Media Library Window

```
┌─────────────────────────────────────────────────────────────────┐
│  🖼️ Media Library                    [24 images] [2.4 MB]        │
│  ─────────────────────────────────────────────────────────────  │
│  [📤 Upload] [🔄 Refresh] [✕]                                   │
├─────────────────────────────────────────────────────────────────┤
│  🔍 Search images...        [Gallery ▼] [All Types ▼]          │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐          │
│  │       │ │       │ │       │ │       │ │       │          │
│  │  IMG  │ │  IMG  │ │  IMG  │ │  IMG  │ │  IMG  │          │
│  │       │ │       │ │       │ │       │ │       │          │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘          │
│  profile.jpg  hero.png  logo.svg  banner.webp  icon.png         │
│  1920×1080   800×600  512×512  1920×600    256×256            │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐          │
│  │       │ │       │ │       │ │       │ │       │          │
│  │  IMG  │ │  IMG  │ │  IMG  │ │  IMG  │ │  IMG  │          │
│  │       │ │       │ │       │ │       │ │       │          │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Upload Panel

```
┌─────────────────────────────────────────────────────────────────┐
│  🖼️ Media Library                                              │
├─────────────────────────────────────────────────────────────────┤
│  🔍 Search images...        [Gallery ▼] [All Types ▼]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ╔═══════════════════════════╗                │
│                    ║                           ║                │
│                    ║       📁                  ║                │
│                    ║                           ║                │
│                    ║   Drag and drop images    ║                │
│                    ║       or click to         ║                │
│                    ║       browse              ║                │
│                    ║                           ║                │
│                    ║   Supports JPG, PNG, GIF, ║                │
│                    ║   SVG, WebP               ║                │
│                    ║   Max size: 5MB           ║                │
│                    ║                           ║                │
│                    ╚═══════════════════════════╝                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ████████████████████░░░░░░░░░░░░░                        │  │
│  │ Uploading 3/5...                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ✓ photo-1.jpg uploaded                                        │
│  ✓ photo-2.jpg uploaded                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Image Preview Modal

```
┌─────────────────────────────────────────────────────────────────┐
│                                                          [✕]    │
│  ┌───────────────────────────────────────────────────────┐    │
│  │                                                        │    │
│  │                                                        │    │
│  │                   [IMAGE PREVIEW]                      │    │
│  │                                                        │    │
│  │                                                        │    │
│  │                                                        │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
│  profile-picture.jpg                                           │
│  ────────────────────────────────────────────────────────────  │
│  Type:              image/jpeg                                 │
│  Dimensions:        1920 × 1080                                │
│  Size:              245 KB                                     │
│  Uploaded:          March 9, 2026                              │
│  CDN URL:           https://cdn.jsdelivr.net/gh/...            │
│                                                                 │
│  [Insert] [Copy URL] [Delete]                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Properties Panel

```
┌─────────────────────────────────────────┐
│  Image Properties                   [✕] │
├─────────────────────────────────────────┤
│  FILENAME                               │
│  1234567890-abc123.webp                 │
│                                         │
│  ORIGINAL NAME                          │
│  profile-picture.jpg                    │
│                                         │
│  TYPE                                   │
│  image/webp                             │
│                                         │
│  WIDTH     HEIGHT                       │
│  1920      1080                         │
│                                         │
│  SIZE                                   │
│  245 KB                                 │
│                                         │
│  CDN URL                                │
│  https://cdn.jsdelivr.net/...  [📋]    │
│                                         │
│  UPLOAD DATE                            │
│  2026-03-09 16:45:32                    │
│                                         │
│  SHA                                    │
│  abc123def456...                        │
└─────────────────────────────────────────┘
```

### 5. Designer Mode Integration

```
┌─────────────────────────────────────┐
│  🎨 Designer Mode                   │
├─────────────────────────────────────┤
│  Actions                            │
│  [💾 Save All]                      │
│  [📜 History]                       │
│  [📤 Export]                        │
│  [📥 Import]                        │
│  [🖼️ Media Library]  ← NEW!        │
├─────────────────────────────────────┤
│  GitHub Sync                        │
│  [⬆️ Sync to GitHub]                │
│  [⬇️ Load from GitHub]              │
├─────────────────────────────────────┤
│  Stats                              │
│  Editable elements: 42              │
│  Versions: 7                        │
└─────────────────────────────────────┘
```

## User Flow Diagrams

### Upload Flow

```
User clicks "Upload"
       ↓
Upload panel opens
       ↓
Drag & drop OR click to browse
       ↓
Files selected
       ↓
Client-side validation
(type, size)
       ↓
Canvas optimization
(resize, compress, WebP)
       ↓
Base64 encoding
       ↓
GitHub API upload
       ↓
Progress bar updates
       ↓
Upload complete
       ↓
Metadata saved to index
       ↓
CDN URL generated
       ↓
Success message
       ↓
Gallery refreshes with new image
```

### Browse & Select Flow

```
User opens Media Library
       ↓
Gallery loads with thumbnails
       ↓
(Optional) User searches/filters
       ↓
User sees image they want
       ↓
User clicks image
       ↓
Preview modal opens
       ↓
User views metadata
       ↓
User clicks "Insert" OR "Copy URL"
       ↓
Image inserted into content
    OR URL copied to clipboard
       ↓
Modal closes
       ↓
User can continue editing
```

### Delete Flow

```
User opens preview OR
Right-clicks image in gallery
       ↓
User clicks "Delete"
       ↓
Confirmation dialog appears
"Are you sure?"
       ↓
User confirms
       ↓
File deleted from GitHub
       ↓
Index updated
       ↓
Gallery refreshes
       ↓
Success message
```

## Color Scheme

### Primary Colors
```
Background: #0a0a0a (Black)
Surface:    #1a1a1a (Dark Gray)
Border:     #333 (Medium Gray)
Text:       #e0e0e0 (Light Gray)
```

### Accent Colors
```
Primary:    #00ff41 (Green)
Secondary:  #ff00ff (Magenta)
Danger:     #ff4444 (Red)
Success:    #00ff41 (Green)
Info:       #667eea (Blue)
```

### UI Elements
```
Button Gradient:
  Linear gradient: #00ff41 → #00cc33

Hover Effects:
  Scale: 1.05
  Shadow: 0 4px 12px rgba(0, 255, 65, 0.3)

Progress Bar:
  Linear gradient: #00ff41 → #00cc33
```

## Responsive Breakpoints

```
Desktop:  > 1200px
  - 5 columns in gallery
  - Full preview modal

Tablet:   768px - 1200px
  - 3 columns in gallery
  - Wide preview modal

Mobile:  < 768px
  - 2 columns in gallery
  - Full-screen preview
  - Stacked toolbar
```

## Animation Timing

```
Fade In:        300ms ease
Slide Up:       300ms ease
Hover Scale:    200ms ease
Button Press:   100ms ease
Modal Open:     200ms ease
Toast:          3000ms duration
Progress:       Real-time
```

## Icon Usage

```
📤 Upload       - Upload button
🔄 Refresh      - Refresh gallery
✕ Close         - Close panels/modals
🔍 Search       - Search icon
👁️ Preview      - View image
📋 Copy         - Copy URL
🗑️ Delete       - Delete image
📁 Folder       - Drop zone icon
🖼️ Gallery      - Media Library icon
✓ Success       - Upload success
✗ Error         - Upload error
⚡ Optimized     - Optimization indicator
🌐 CDN          - CDN indicator
📊 Stats        - Statistics icon
```

## Layout Spacing

```
Container Padding:    24px
Section Spacing:      30px
Element Gap:          12px
Border Radius:        6-12px
Thumbnail Gap:        20px
Modal Padding:        40px
Input Padding:        10-16px
```

## Typography

```
Headers:      24px, 600 weight
Subheaders:   18px, 600 weight
Body:         14px, 400 weight
Small:        11-13px, 400 weight
Code:         13px, Monaco/Consolas
Line Height:  1.5-1.6
```

## State Indicators

```
Upload States:
  - Idle:       Gray border
  - Drag over:  Green border + background
  - Uploading:  Progress bar + text
  - Complete:   Success message + green check

Image States:
  - Normal:     Border on hover
  - Hover:      Border + shadow + scale
  - Selected:   Green border
  - Disabled:   Grayed out

Button States:
  - Normal:     Default background
  - Hover:      Darker background
  - Active:     Primary gradient
  - Disabled:   Gray + no hover
```

## Accessibility

```
Keyboard Navigation:
  - Tab:        Navigate controls
  - Enter:      Activate button
  - Escape:     Close modal
  - Arrows:     Navigate gallery (future)

Screen Reader Support:
  - Alt text on all images
  - ARIA labels on buttons
  - Status announcements
  - Error messages

Visual Indicators:
  - High contrast colors
  - Clear focus states
  - Large touch targets (min 44px)
  - Readable font sizes
```

This visual showcase demonstrates the complete Media Manager UI/UX design with all components, flows, and styling specifications.
