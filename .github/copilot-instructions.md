# AI Agent Instructions for Disc Golf Putting Trainer

## Project Overview
This is a React TypeScript web app for practicing disc golf putting techniques with a structured training system. The app tracks putting sessions across 9 positions with progressive difficulty, manages attempt carryover mechanics, and stores session history in IndexedDB.

## Tech Stack
- **Framework**: React 18 + TypeScript with Vite (via @github/spark build template)
- **UI**: Radix UI components + Tailwind CSS + shadcn/ui patterns
- **Icons**: @phosphor-icons/react
- **State**: React hooks (useState, useCallback, useEffect)
- **Storage**: IndexedDB (via `storage.ts`)
- **Animation**: Framer Motion
- **Toast Notifications**: Sonner

## Core Architecture

### Game State Model
The entire game revolves around these data structures in `src/lib/types.ts`:

- **Session**: Container for a single training session with 9 positions, scoring, and session metadata
- **Position**: Individual training location (1-9) with base attempts, putts history, and status tracking
- **Putt**: Single attempt result ("sink" or "miss") with timestamp
- **PositionStatus**: Tracks progression: "not-started" → "in-progress" → "success"/"failed-restart"/"continued-penalty"

### Scoring System (`src/lib/game-logic.ts`)
- Successful positions always score 3 points (when not in penalty mode)
- Unused attempts "carry over" to the next position via `calculateCarryover()`
- Penalty scoring: Each attempt exceeding available attempts = -1 point
- Final score = sum of all position scores

### Critical Functions
- `createNewSession()`: Initializes 9 positions with base attempts (3-11 depending on difficulty)
- `calculatePositionScore()`: Applies base scoring (3 pts) or penalty (-1 per overage attempt)
- `calculateCarryover()`: Enables unused attempts to extend next position's allocation
- `createSessionSummary()`: Generates archive-ready session data

## Component Structure
- **GameHeader**: Displays current position, score, session timer
- **PositionTriangle**: Visual representation of position attempts/putts (3 rows × 3 columns layout)
- **PuttStatus**: Shows individual putt results in grid
- **GameControls**: "Sink" and "Miss" buttons, restart options
- **SessionComplete**: End-of-session summary and stats
- **SessionHistory**: Displays past sessions from IndexedDB

## Storage Architecture (`src/lib/storage.ts`)
Uses IndexedDB with schema:
- `currentSession`: Stores in-progress session (localStorage key)
- IndexedDB `completed_sessions` store: Persists finished sessions
- Seed data available in `seed-data.ts` for demo/testing

**Key Functions**:
- `initDB()`: Sets up IndexedDB (call once on app mount in App.tsx useEffect)
- `saveCurrentSession()`: Persists active session to localStorage
- `archiveSession()`: Moves completed session to IndexedDB

## Key Patterns & Conventions

### State Updates in Game Flow
The App component manages session state with controlled pattern:
```tsx
const [session, setSession] = useState<Session>(createNewSession())
```
After each putt: manually calculate new position status, update position array, then `setSession()` with new object reference.

### Position Status Transitions
- Sinking all putts → "success" (3 pts)
- Missing after position starts → "failed-restart" or "continued-penalty" (based on penalty mode)
- Penalty mode enabled when player uses additional attempts beyond available

### localStorage vs IndexedDB
- localStorage: Current session only (`currentSession` key)
- IndexedDB: Archived sessions (historical data)
- On app load: Check localStorage for ongoing session, restore if exists

## Developer Workflows

### Local Development
```bash
npm run dev       # Vite dev server (port 5000)
npm run build     # TypeScript check + Vite bundle
npm run lint      # ESLint validation
npm run optimize  # Vite dependency optimization
```

### Debugging Tips
- Check browser DevTools Storage tab for IndexedDB and localStorage
- Toast notifications (Sonner) provide user feedback on game events
- Use React DevTools Profiler to check re-render cycles
- Session state can be inspected in React DevTools hooks tab

## Common Modifications

### Adding UI Components
All Radix UI components are pre-built in `src/components/ui/`. Import from there using shadcn/ui pattern: `import { Button } from "@/components/ui/button"`

### Modifying Game Rules
Update `BASE_ATTEMPTS` in `types.ts` to change position difficulties, or edit `calculatePositionScore()` logic in `game-logic.ts` for scoring changes.

### Adding Position Count
Currently hardcoded to 9 positions. Extend `BASE_ATTEMPTS` object, adjust position triangle layout in `PositionTriangle.tsx`.

## File-to-Purpose Quick Reference
- `App.tsx` - Session orchestration and view management
- `src/lib/game-logic.ts` - Pure game rule calculations
- `src/lib/storage.ts` - IndexedDB and localStorage operations
- `src/lib/types.ts` - Authoritative schema definitions
- `src/components/GameControls.tsx` - User putt input
- `components/ui/*` - Reusable UI primitives (shadcn style)

## Notes for AI Agents
- Always update TypeScript types in `types.ts` when changing data structures
- Game logic is intentionally pure (no side effects) — test calculations in isolation
- When adding features, preserve the Session/Position/Putt hierarchy to maintain backward compatibility with stored sessions
- Vite uses `@github/spark` build system; ensure plugin order in vite.config.ts is not changed
