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
- **Testing**: Vitest (unit tests) + Playwright (E2E tests)
- **Containerization**: Docker multi-stage build with Alpine Linux

## Core Architecture

### Game State Model
The entire game revolves around these data structures in `src/lib/types.ts`:

- **Session**: Container for a single training session with 9 positions, scoring, and session metadata
- **Position**: Individual training location (1-9) with base attempts, putts history, and status tracking
- **Putt**: Single attempt result ("sink" or "miss") with timestamp
- **PositionStatus**: Tracks progression: "not-started" → "in-progress" → "success"/"failed-restart"/"continued-penalty"

### Scoring System (`src/lib/game-logic.ts`)
- Successful positions score 3 points (when not in penalty mode)
- Unused attempts "carry over" to the next position via `calculateCarryover()`
- Penalty scoring: Each attempt exceeding available attempts = -1 point
- Final score = sum of all completed position scores
- Position score is stored in `position.positionScore` and calculated by `calculatePositionScore()`
- Session score is dynamically calculated by summing all completed positions via `calculateSessionScore()`

### Critical Functions
- `createInitialPosition()`: Creates a position with base attempts and optional carryover
- `createNewSession()`: Initializes 9 positions with base attempts (3-11 depending on position number)
- `calculatePositionScore()`: Applies base scoring (3 pts for success) or penalty (-1 per overage attempt)
- `calculateCarryover()`: Returns unused attempts from successful positions (0 for non-success)
- `calculateSessionScore()`: Dynamically sums positionScore for all completed positions
- `createSessionSummary()`: Generates archive-ready session data with final stats
- `formatDuration()`: Converts minutes to readable time format (e.g., "5m 23s")
- `formatScore()`: Formats score with + prefix for positive scores

## Component Structure
- **GameHeader**: Displays current position, cumulative score, session timer, restart button, instructions button
- **PositionTriangle**: Visual 9-position triangle layout showing status/progress for each position
- **PuttStatus**: Shows individual putt results in grid with current position attempt tracking
- **GameControls**: "Sink" and "Miss" buttons for recording putts
- **RestartDialog**: Confirmation dialog for manual restart and penalty mode continuation
- **SessionComplete**: Full-screen end-of-session summary with stats and navigation
- **SessionCompleteDialog**: Popup dialog showing session completion with quick restart option
- **SessionHistory**: Displays past sessions from IndexedDB with detailed breakdowns
- **InstructionsDialog**: Game rules and tutorial explaining the 9-spot drill system
- **PositionExplainer**: Component explaining position attempt allocation and carryover mechanics

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

### Testing

#### Unit Tests (Vitest)
```bash
npm run test          # Run unit tests
npm run test:ui       # Run tests with Vitest UI
npm run test:ci       # Run tests in CI mode with coverage
npm run test:watch    # Watch mode for development
```

**Test Files**:
- `src/lib/game-logic.test.ts` - Core game calculation tests (607 test cases)
- `src/lib/storage.test.ts` - Storage operations tests
- `src/lib/position-completion.test.ts` - Position completion edge cases
- `src/components/GameHeader.test.tsx` - Header component tests
- `src/components/PositionExplainer.test.tsx` - Position explanation tests
- `src/components/SessionCompleteDialog.test.tsx` - Completion dialog tests

**Coverage**: Excludes `src/components/ui/**` (shadcn components) and E2E tests from coverage

#### E2E Tests (Playwright)
```bash
npm run test:e2e         # Run all E2E tests
npm run test:e2e:ui      # Interactive UI mode
npm run test:e2e:debug   # Debug mode
npm run test:e2e:report  # Show test report
```

**First-time setup**: `npx playwright install`

**Test Files** (in `tests/e2e/`):
- `game-flow.spec.ts` - Full game flow and state management
- `instructions.spec.ts` - Instructions dialog interactions
- `restart-session.spec.ts` - Session restart confirmation flows

**Configuration**: Tests run on Chromium, Firefox, and WebKit against `http://localhost:5000`

### Containerization

#### Quick Local Testing
```bash
docker-compose up -d
# Open http://localhost:8080
```

#### Manual Docker Build
```bash
docker build -t disc-golf-putting-trainer .
docker run -p 8080:8080 disc-golf-putting-trainer
```

#### Container Architecture
- **Multi-stage Alpine build** (~200MB final image)
- Stage 1: Node 20 Alpine - build with `npm run build`
- Stage 2: Node 20 Alpine - serve with `http-server`
- **Health check**: HTTP GET on port 8080 every 30s
- **Security**: Non-root user (nodejs:1001)

#### Deploy to GitHub Container Registry (GHCR)
```bash
git tag v1.0.0
git push origin v1.0.0
# Workflow auto-deploys in ~3 minutes
```

**Available tags**: `latest`, `v1.0.0`, `1.0`, `1`, `main`, `branch-name`, `sha-abc1234`

See `CONTAINER_QUICK_REF.md` and `CONTAINER_DEPLOYMENT.md` for details.

### Debugging Tips
- Check browser DevTools Storage tab for IndexedDB and localStorage
- Toast notifications (Sonner) provide user feedback on game events
- Use React DevTools Profiler to check re-render cycles
- Session state can be inspected in React DevTools hooks tab
- Run unit tests with `npm run test:ui` for interactive debugging
- Use Playwright UI mode (`npm run test:e2e:ui`) for E2E test debugging
- Check test coverage with `npm run test:ci` to identify untested code paths

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
- Write unit tests for all game logic changes - aim for comprehensive coverage (current: 607 test cases)
- Add E2E tests for new user-facing features or flows
- Update Dockerfile and docker-compose.yml if dependencies or build process changes
- Test containerized builds locally before deploying to ensure proper operation
