# Disc Golf Putting Trainer

A mobile-optimized web app for structured disc golf putting practice. Track your progress across 9 positions with increasing difficulty, featuring an innovative attempt carryover system and optional penalty scoring mode.

## Features

**Position-Based Training** - Practice from 9 positions arranged in a triangle, each requiring 3 successful putts within progressively increasing attempt allocations (3-11 attempts per position).

**Attempt Carryover System** - Unused attempts from completed positions automatically carry over to the next position, rewarding efficient putting and building momentum.

**Penalty Scoring Mode** - Choice to continue after exhausting attempts with -1 point per additional putt, allowing session persistence with competitive scoring pressure.

**Haptic Feedback** - Tactile vibration feedback on mobile devices when recording putts (Android Chrome/Firefox). Different vibration patterns for sinks, misses, and penalty mode activation. Configurable in settings. See [HAPTIC_COMPATIBILITY.md](./HAPTIC_COMPATIBILITY.md) for browser support details.

**Session Persistence** - Auto-saves every 10 seconds to localStorage; completed sessions archive to IndexedDB with full scoring breakdown and history viewing.

**Real-Time Tracking** - Live header display showing current position, cumulative score, and attempt breakdown updated with every putt.

## Attribution

This disc golf putting trainer was inspired by the instructional video ["Putting Practice - 9 Spot Drill"](https://youtu.be/uWt3f3zv4I4) by **Throwing for Good**. 

The video demonstrates a structured 9-position putting practice routine that is the foundation of this digital training tool. Special thanks to Throwing for Good for creating excellent disc golf instructional content.

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development Setup

```bash
# Install dependencies
npm install

# Start dev server (runs on http://localhost:5000)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Optimize dependencies
npm run optimize
```

### Testing

The project includes both unit tests (Vitest) and end-to-end tests (Playwright).

#### Unit Tests

```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in CI mode with coverage
npm run test:ci

# Watch mode for development
npm run test:watch
```

#### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Show test report
npm run test:e2e:report
```

**First-time E2E setup:**
```bash
# Install Playwright browsers
npx playwright install
```

**E2E Test Coverage:**
- Instructions dialog display and interactions
- Session restart confirmation flows
- Game state persistence
- UI element interactions

E2E tests run against the local dev server (http://localhost:5173) which is automatically started by Playwright's webServer configuration.

### Project Structure

```
src/
├── App.tsx                 # Main session orchestration and view management
├── components/             # React UI components
│   ├── GameControls.tsx   # Sink/Miss putt buttons
│   ├── GameHeader.tsx     # Position, score, timer display
│   ├── PositionTriangle.tsx # 3x3 grid position visualization
│   ├── SessionComplete.tsx # End-of-session summary
│   ├── SessionHistory.tsx # Past sessions browser
│   └── ui/                # Radix UI + shadcn/ui primitives
├── lib/
│   ├── types.ts           # Core data structures (Session, Position, Putt)
│   ├── game-logic.ts      # Pure game rule calculations
│   ├── storage.ts         # IndexedDB and localStorage operations
│   ├── haptics.ts         # Haptic feedback utilities (Vibration API)
│   └── seed-data.ts       # Demo session data
└── styles/                # Tailwind CSS theme
```

## Architecture

### Core Game Model

The app manages sessions through a hierarchical state model:
- **Session** - Container for a single training session with 9 positions and metadata
- **Position** - Individual training location with base attempts, putts, and status
- **Putt** - Single attempt ("sink" or "miss") with timestamp

### Scoring System

- **Success**: 3 points per completed position (all putts sunk within attempts)
- **Carryover**: Unused attempts automatically add to next position's allocation
- **Penalty Mode**: Each attempt exceeding available attempts = -1 point
- **Final Score**: Sum of all position scores including penalties

### Storage Strategy

- **Database**: SQLite database for persistent storage (server-side)
- **Current Session**: Saved to backend API, loaded on app initialization
- **Completed Sessions**: Archived to SQLite database via REST API
- **Auto-save**: Automatic save every 10 seconds to backend
- **Docker Volume**: Database persisted in Docker volume for data persistence across container restarts
- **Migration**: Utility available to migrate data from legacy IndexedDB storage

## Development Tips

**State Management**: App component uses React hooks with controlled state pattern. After each putt, manually calculate new position status, update position array, then call `setSession()` with new object reference.

**Game Logic Testing**: All calculations in `game-logic.ts` are pure functions with no side effects - test in isolation from UI.

**Storage Architecture**: Backend API serves both the React frontend and provides RESTful endpoints for session management. Storage debugging can be done by inspecting the SQLite database file at `data/disc-golf-trainer.db` or using the API endpoints.

**UI Components**: All Radix UI components are pre-built in `src/components/ui/`. Import using shadcn/ui pattern: `import { Button } from "@/components/ui/button"`

**Game Rules**: Modify `BASE_ATTEMPTS` in `types.ts` to adjust position difficulties. Update scoring logic in `game-logic.ts` for rule changes.

## Technology Stack

- **React 18** + TypeScript for type-safe component development
- **Vite** + @github/spark for fast build and development
- **Express.js** for backend API server
- **SQLite** (better-sqlite3) for persistent data storage
- **Radix UI** + Tailwind CSS + shadcn/ui for accessible, styled components
- **Framer Motion** for smooth animations
- **Sonner** for toast notifications
- **Vitest** + React Testing Library for unit testing
- **Playwright** for end-to-end testing
- **Docker** + Docker Compose for containerized deployment

## Deployment

See [CONTAINER_DEPLOYMENT.md](./CONTAINER_DEPLOYMENT.md) for Docker deployment instructions, including:
- Building and running the containerized application
- SQLite database volume configuration
- Data persistence across container restarts
- Migration from IndexedDB to SQLite

## License

MIT License - Copyright GitHub, Inc.

This project was scaffolded with the GitHub Spark template. See LICENSE file for full details.
