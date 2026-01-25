# Planning Guide

A mobile-optimized disc golf putting practice game where players progress through 9 positions with increasing difficulty, featuring an innovative attempt carryover system and penalty scoring mechanics for continued play after failures.

**Experience Qualities**:
1. **Focused** - Clean, distraction-free interface that keeps players locked into their practice routine with minimal cognitive overhead
2. **Immediate** - Every tap produces instant visual feedback, creating a tight action-response loop that mimics the satisfaction of actual putting
3. **Empowering** - The carryover and penalty systems give players agency over their session, encouraging experimentation without fear of total failure

**Complexity Level**: Light Application (multiple features with basic state)
This app has several interconnected features (9 positions, attempt carryover, penalty scoring, session history) but maintains relatively straightforward state management with clear user flows and localized data persistence.

## Essential Features

### Position-Based Putting Gameplay
- **Functionality**: 9 positions arranged in a triangle formation, each requiring 3 successful putts within progressively increasing attempt allocations (3-11 attempts)
- **Purpose**: Simulates real disc golf putting practice with structured progression and difficulty scaling
- **Trigger**: User selects a position from the visual triangle or automatically advances after completing current position
- **Progression**: Select position → Record putts (sink/miss) → Complete with 3 sinks → Calculate carryover → Auto-advance to next position
- **Success criteria**: Position completes when 3 putts are sunk; unused attempts carry forward; game tracks all position states accurately

### Attempt Carryover System
- **Functionality**: When a position is completed with remaining attempts, unused attempts add to the next position's base allocation
- **Purpose**: Rewards efficient putting and creates momentum, making early success strategically valuable
- **Trigger**: Position completion with attempts remaining
- **Progression**: Complete position → Calculate remaining attempts → Display carryover tooltip → Add to next position → Show "X shots (Y base + Z carry)"
- **Success criteria**: Math calculates correctly; UI displays carryover breakdown; players understand the bonus system

### Penalty Scoring Mode
- **Functionality**: When attempts are exhausted without 3 sinks, players can choose to continue with penalty scoring (-1 per extra putt) or restart the entire game
- **Purpose**: Prevents total session abandonment while maintaining competitive scoring pressure
- **Trigger**: Attempts exhausted without sinking 3 putts
- **Progression**: Exhaust attempts → Show restart dialog → If "Continue", activate penalty mode → Each extra putt = -1 → Complete position with negative score → Carry penalty to next position
- **Success criteria**: Dialog appears at correct time; penalty counts accumulate correctly; negative scores persist across positions; final score calculation includes all penalties

### Session History & Persistence
- **Functionality**: Auto-saves current session every 10 seconds to localStorage; completed sessions archive to IndexedDB with scoring breakdown
- **Purpose**: Tracks improvement over time and prevents data loss from accidental app closure
- **Trigger**: Auto-save timer or significant game events; session completion triggers archive
- **Progression**: Game state changes → Debounced auto-save → Update localStorage → On completion → Calculate final score → Save to IndexedDB → Display history view
- **Success criteria**: Sessions persist through page refresh; history displays all past games with correct scores; offline functionality works completely

### Real-Time Score Tracking
- **Functionality**: Header displays current position, cumulative session score, and attempt breakdown; updates instantly with each putt
- **Purpose**: Provides constant awareness of performance and progress without cluttering the interface
- **Trigger**: Any putt recorded or position advancement
- **Progression**: Record putt → Update counters → Flash visual feedback → Recalculate cumulative score → Update header display
- **Success criteria**: All numbers update instantly; cumulative score reflects all position scores including penalties; visual feedback is clear and immediate

## Edge Case Handling

- **Resume abandoned session** - On app load, check localStorage for incomplete session and prompt user to resume or start fresh
- **Rapid tapping** - Debounce putt recording buttons to prevent accidental double-taps from registering multiple putts
- **Storage quota exceeded** - If IndexedDB reaches browser limit, delete oldest sessions first and notify user
- **Invalid state recovery** - If session data becomes corrupted, safely reset to position 1 rather than crashing
- **Completing position 9 in penalty mode** - Ensure final score calculation includes all accumulated penalties from failed positions

## Design Direction

The design should evoke the feeling of being outdoors on a disc golf course at golden hour - warm, focused, and energizing. High contrast and bold color choices ensure visibility in bright sunlight while maintaining a modern, confident aesthetic. The interface should feel like a professional training tool, not a casual game - serious, precise, and empowering.

## Color Selection

The palette prioritizes outdoor visibility with high saturation and maximum contrast, using warm earth tones balanced with cool performance colors.

- **Primary Color**: oklch(0.45 0.15 25) - Deep clay orange representing the disc golf basket and earth, communicates focus and groundedness
- **Secondary Colors**: 
  - oklch(0.95 0.02 95) - Warm off-white background for reduced eye strain in bright conditions
  - oklch(0.25 0.05 260) - Deep charcoal blue-gray for structural elements
- **Accent Color**: oklch(0.65 0.22 145) - Vibrant grass green for success states and positive actions, evokes the course environment
- **Foreground/Background Pairings**:
  - Primary (Deep Clay): White text (oklch(1 0 0)) - Ratio 8.2:1 ✓
  - Background (Warm Off-White oklch(0.95 0.02 95)): Charcoal text (oklch(0.25 0.05 260)) - Ratio 12.5:1 ✓
  - Accent (Grass Green oklch(0.65 0.22 145)): White text (oklch(1 0 0)) - Ratio 7.8:1 ✓
  - Warning/Penalty (Bright Orange oklch(0.70 0.20 40)): Charcoal text (oklch(0.25 0.05 260)) - Ratio 7.1:1 ✓
  - Destructive (Error Red oklch(0.55 0.25 25)): White text (oklch(1 0 0)) - Ratio 8.9:1 ✓

## Font Selection

Typography should convey precision and athleticism - clear, bold, and effortlessly readable at a glance in outdoor conditions. Using JetBrains Mono for numbers provides technical accuracy while maintaining personality.

- **Typographic Hierarchy**:
  - H1 (Position Header): Inter Bold/32px/tight letter spacing (-0.02em)
  - H2 (Section Headers): Inter SemiBold/24px/normal spacing
  - Body (Instructions/Labels): Inter Medium/18px/relaxed line-height (1.6)
  - Numbers (Scores/Attempts): JetBrains Mono Bold/28px/tabular numerals
  - Small (Tooltips/Meta): Inter Regular/14px/normal spacing

## Animations

Animations should feel immediate and athletic - snappy spring physics that mirror the satisfying "thunk" of a disc landing in chains. Use animations exclusively for feedback and orientation, never for decoration.

- Button presses: 100ms scale transform (0.95) with slight shadow shift for tactile press feeling
- Successful putt: 300ms green flash with scale pulse (1 → 1.1 → 1) using spring physics
- Missed putt: 200ms subtle shake animation (±3px horizontal) with orange tint
- Position advance: 400ms slide transition (current position fades left, next slides in from right)
- Score updates: 250ms count-up animation for numbers changing, emphasizing the delta
- Penalty mode activation: 500ms pulsing red border around game area with haptic feedback (if available)

## Component Selection

- **Components**:
  - **Card** - Main game container with elevated shadow for depth against background
  - **Button** - Primary action buttons (Record Putt/Miss) with solid fills, large touch targets (min 56px height)
  - **Dialog** - Restart confirmation with clear "Restart Game" vs "Continue" options
  - **Badge** - Position indicators in triangle layout, pill-shaped with number inside
  - **Progress** - Visual indicator showing completed positions (filled) vs remaining (outlined)
  - **Separator** - Subtle dividers between header/game/controls sections
  - **Alert** - Penalty scoring active banner with warning styling
  - **Tooltip** - Hover/tap tooltips for carryover explanations and attempt breakdowns
  - **Tabs** - Switch between "Current Game" and "History" views
  - **ScrollArea** - History list with past sessions

- **Customizations**:
  - Custom position triangle layout using CSS Grid with responsive scaling
  - Large circular position badges with active state highlighting
  - Custom putt counter display with animated fills showing progress to 3
  - Numeric score displays using tabular numerals for alignment
  - Full-width sticky header with session stats

- **States**:
  - Buttons: Default (solid), Pressed (scale down + shadow), Disabled (50% opacity)
  - Position badges: Inactive (outlined), Active (filled primary), Complete (filled accent green), Failed (outlined with red indicator)
  - Putt indicators: Empty (outlined circle), Filled (solid accent), Miss (subtle gray)
  - Penalty mode: Warning banner appears, affected elements gain orange border

- **Icon Selection**:
  - CheckCircle (successful putt recording)
  - XCircle (missed putt)
  - ArrowCounterClockwise (undo action)
  - Trophy (session complete)
  - ChartLine (view history)
  - Warning (penalty mode indicator)

- **Spacing**:
  - Section padding: 24px vertical, 20px horizontal
  - Button groups: 12px gap between buttons
  - Header elements: 16px gap
  - Card internal padding: 20px
  - Touch target minimum: 56px height with 16px spacing between interactive elements

- **Mobile**:
  - Single-column layout on all screen sizes
  - Triangle position layout scales proportionally to viewport width (max 90vw)
  - Header becomes more compact: score moves to same line as position
  - Buttons remain full-width with consistent 56px touch targets
  - Reduce padding to 16px on very small screens (<375px)
  - History view: stack session cards vertically with full width
