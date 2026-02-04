# Container Deployment Guide

## Overview
This document outlines the containerization strategy for deploying the Disc Golf Putting Trainer with SQLite database persistence using Docker volumes.

## Architecture

The application now uses a **client-server architecture**:
- **Frontend**: React application built with Vite
- **Backend**: Express.js server with REST API
- **Database**: SQLite for persistent storage
- **Deployment**: Docker with volume mapping for data persistence

## Files Overview

### 1. **Dockerfile** - Multi-stage Production Build
**Strategy**: Alpine-based multi-stage build optimized for production

**Stages**:
- **Builder Stage** (`node:20-alpine`)
  - Installs npm dependencies
  - Runs TypeScript compilation for both frontend and backend
  - Builds React app with Vite → `dist/`
  - Compiles backend TypeScript → `dist-server/`
  
- **Runtime Stage** (`node:20-alpine`)
  - Installs production-only dependencies
  - Copies built `dist/` (frontend) and `dist-server/` (backend)
  - Creates `/app/data` directory for SQLite database
  - Sets up non-root user (`nextjs:1001`) for security
  - Includes health check endpoint at `/health`

**Key Features**:
- Express.js serves both the React app and REST API
- SQLite database stored in `/app/data` directory
- Health check validates backend server responsiveness
- Runs on port `8080`
- Production-optimized build with no dev dependencies

### 2. **docker-compose.yml** - Local Development/Testing
**Purpose**: Simplified deployment with persistent database storage

**Configuration**:
```yaml
services:
  disc-golf-trainer:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DB_DIR=/app/data
    volumes:
      - disc-golf-data:/app/data  # ← Database persistence
    restart: unless-stopped

volumes:
  disc-golf-data:
    driver: local
```

**Key Features**:
- **Volume Mapping**: `disc-golf-data` volume persists SQLite database
- **Environment Variables**: `DB_DIR` configures database location
- **Health Check**: Validates `/health` endpoint every 30 seconds
- **Auto-restart**: Container restarts on failure (unless manually stopped)

**Usage**:
```bash
# Start container with volume
docker-compose up -d

# View logs
docker-compose logs -f

# Stop container (data persists)
docker-compose down

# Stop and remove volume (deletes data)
docker-compose down -v
```

## SQLite Database Persistence

### Volume Configuration

The application stores session data in a SQLite database at `/app/data/disc-golf-trainer.db`.

**Volume Mapping**:
- **Container Path**: `/app/data`
- **Volume Name**: `disc-golf-data`
- **Driver**: local (default)

**Files Created**:
- `disc-golf-trainer.db` - Main database file
- `disc-golf-trainer.db-shm` - Shared memory file (WAL mode)
- `disc-golf-trainer.db-wal` - Write-ahead log file

### Verifying Data Persistence

```bash
# Start container
docker-compose up -d

# Create some sessions in the app (navigate to http://localhost:8080)

# Stop container
docker-compose down

# Start again - your data should be preserved
docker-compose up -d
```

### Inspecting the Database

```bash
# Access the database directly
docker exec -it disc-golf-putting-trainer sh

# Inside container:
cd /app/data
ls -lh  # View database files
# Exit with: exit

# Or copy database out for inspection
docker cp disc-golf-putting-trainer:/app/data/disc-golf-trainer.db ./disc-golf-trainer.db
sqlite3 disc-golf-trainer.db
```

### Backup and Restore

**Backup**:
```bash
# Create backup of database
docker cp disc-golf-putting-trainer:/app/data/disc-golf-trainer.db \
  ./backup-$(date +%Y%m%d-%H%M%S).db
```

**Restore**:
```bash
# Stop container
docker-compose down

# Restore database to volume
docker run --rm -v disc-golf-data:/data -v $(pwd):/backup \
  alpine sh -c "cp /backup/backup-YYYYMMDD-HHMMSS.db /data/disc-golf-trainer.db"

# Start container
docker-compose up -d
```

### 3. **.dockerignore** - Build Optimization
Excludes unnecessary files from Docker context:
- Node modules and build artifacts (`node_modules/`, `dist/`, `dist-server/`)
- Database files (`data/`, `*.db`, `*.db-wal`, `*.db-shm`)
- Git history and config
- Development/test files
- Documentation

**Impact**: Reduces Docker build context significantly

## Data Migration from IndexedDB

If you're upgrading from a previous version that used IndexedDB/localStorage, you can migrate your existing session data to the new SQLite backend.

### Migration Steps

1. **Before Upgrading**: Access the old version of the app in your browser
2. **Open Browser Console** (F12 or Cmd/Ctrl+Shift+I)
3. **Run Migration Script**:
   ```javascript
   // Import migration utility
   const { migrateFromIndexedDB } = await import('./src/lib/migration.ts')
   
   // Run migration (exports data and imports to backend)
   await migrateFromIndexedDB()
   ```

This will:
- Export all sessions from IndexedDB
- Download a backup JSON file to your computer
- Import the sessions to the new SQLite backend via the `/api/migrate/import` endpoint

### Manual Migration (Alternative)

If you prefer manual control:

```javascript
// 1. Export data from IndexedDB
const { exportIndexedDBData, downloadAsJson } = await import('./src/lib/migration.ts')
const sessions = await exportIndexedDBData()

// 2. Download backup
downloadAsJson(sessions, 'my-sessions-backup.json')

// 3. Import to backend (after upgrading)
const { importToBackend } = await import('./src/lib/migration.ts')
await importToBackend(sessions)
```

### REST API for Manual Import

You can also import sessions using the REST API directly:

```bash
curl -X POST http://localhost:8080/api/migrate/import \
  -H "Content-Type: application/json" \
  -d @sessions-backup.json
```

Where `sessions-backup.json` contains:
```json
{
  "sessions": [
    { "sessionId": "...", "startTime": 123456789, ... }
  ]
}
```

## REST API Endpoints

The backend provides the following REST API endpoints for session management:

### Health Check
- **GET** `/health` - Check server status
  ```bash
  curl http://localhost:8080/health
  # Response: {"status":"ok","timestamp":1234567890}
  ```

### Session Management

#### Get Current Session
- **GET** `/api/session/current` - Retrieve active session
  ```bash
  curl http://localhost:8080/api/session/current
  ```

#### Save Current Session
- **POST** `/api/session/current` - Save/update active session
  ```bash
  curl -X POST http://localhost:8080/api/session/current \
    -H "Content-Type: application/json" \
    -d '{"sessionId":"...","startTime":123456789,...}'
  ```

#### Clear Current Session
- **DELETE** `/api/session/current` - Mark session as ended
  ```bash
  curl -X DELETE http://localhost:8080/api/session/current \
    -H "Content-Type: application/json" \
    -d '{"sessionId":"session-id-here"}'
  ```

#### Archive Session
- **POST** `/api/session/archive` - Archive completed session
  ```bash
  curl -X POST http://localhost:8080/api/session/archive \
    -H "Content-Type: application/json" \
    -d '{"sessionId":"...","endTime":123456789,...}'
  ```

#### Get Session History
- **GET** `/api/session/history?limit=50` - Get all completed sessions
  ```bash
  curl http://localhost:8080/api/session/history?limit=50
  ```

#### Get Session by ID
- **GET** `/api/session/:sessionId` - Get specific session
  ```bash
  curl http://localhost:8080/api/session/abc123
  ```

#### Delete Oldest Sessions
- **DELETE** `/api/session/oldest/:count` - Remove old sessions
  ```bash
  curl -X DELETE http://localhost:8080/api/session/oldest/10
  ```

#### Import Sessions (Migration)
- **POST** `/api/migrate/import` - Import sessions from backup
  ```bash
  curl -X POST http://localhost:8080/api/migrate/import \
    -H "Content-Type: application/json" \
    -d '{"sessions":[...]}'
  ```

### 4. **.github/workflows/build-container.yml** - CI/CD Pipeline
**Trigger Events**:
- Push to `main` branch
- Any tag push (e.g., `v1.0.0`)
- Manual workflow dispatch (`workflow_dispatch`)

**Workflow Steps**:

1. **Checkout** - Fetch repository code
2. **Setup Buildx** - Enable advanced Docker build features (caching, multi-platform builds)
3. **Login to GHCR** - Authenticate using `GITHUB_TOKEN` (automatic)
4. **Extract Metadata** - Generate image tags:
   - Branch name (e.g., `main`)
   - Semantic versions (e.g., `v1.2.3`, `1.2`, `1`)
   - Git SHA with branch prefix (e.g., `main-abc1234`)
   - `latest` tag (only on default branch)
5. **Build & Push** - Multi-stage build with GitHub Actions cache

**Permissions Required**:
- `contents: read` - Access to repository code
- `packages: write` - Push to GHCR

## Setup Instructions

### 1. Enable GitHub Container Registry Access
Your personal GitHub account has automatic access to GHCR. No additional setup needed beyond GitHub's default `GITHUB_TOKEN` (which Actions provides automatically).

### 2. First Deployment
```bash
# Option A: Push to main branch (automatic)
git push origin main
# Workflow triggers automatically

# Option B: Create a release tag
git tag v1.0.0
git push origin v1.0.0
# Creates image tagged as: ghcr.io/username/disc-golf-putting-tr:v1.0.0 (and v1.0, 1, latest)

# Option C: Manual trigger (via GitHub UI)
# Go to Actions → Build and Push Container Image → Run workflow
```

### 3. Verify Image Deployed
```bash
# Check GHCR packages (after workflow completes)
# GitHub UI: Settings → Packages → Container registry
# Or via CLI:
gh api user/packages --jq '.[].name'

# Pull and test locally
docker pull ghcr.io/YOUR-USERNAME/disc-golf-putting-tr:latest
docker run -p 8080:8080 ghcr.io/YOUR-USERNAME/disc-golf-putting-tr:latest
# Visit http://localhost:8080
```

## Image Tag Strategy

### Tag Patterns
| Event | Generated Tags |
|-------|---|
| Push to `main` | `main`, `latest`, `sha-COMMIT_SHA` |
| Tag `v1.2.3` | `v1.2.3`, `1.2.3`, `1.2`, `1`, `latest` |
| Branch push | `branch-name`, `sha-COMMIT_SHA` |

### Recommendation
Use **semantic versioning tags** for production releases:
```bash
git tag v1.0.0
git push origin v1.0.0
```
This automatically creates `v1.0.0`, `1.0`, `1`, and `latest` tags.

## Local Development Workflow

### Build and Test Locally
```bash
# Option 1: Using docker-compose (recommended)
docker-compose up --build

# Option 2: Using Docker CLI
docker build -t disc-golf-trainer:dev .
docker run -p 8080:8080 disc-golf-trainer:dev

# Option 3: Development mode (no container)
npm install
npm run dev
# Runs on http://localhost:5000
```

### Access the App
- **Local dev**: http://localhost:5000
- **Docker/Compose**: http://localhost:8080

## Troubleshooting

### Workflow Fails with Permission Denied
**Solution**: Ensure repository settings allow Actions to write to packages:
- GitHub → Settings → Actions → General → Workflow permissions
- Select "Read and write permissions"

### Image Won't Push to GHCR
**Solution**: The `secrets.GITHUB_TOKEN` is automatic, but verify:
1. Repository is public (required for personal GHCR access on free tier)
2. Actions tab shows "Workflow permissions" set to "Read and write"

### Container Exits Immediately
**Solution**: Check logs:
```bash
docker-compose logs
# Or
docker logs disc-golf-putting-trainer
```
Common issue: Port 8080 already in use. Change in `docker-compose.yml`:
```yaml
ports:
  - "9000:8080"  # Changed to 9000
```

## Performance & Security

### Image Size Optimization
- Alpine base: ~40MB
- Node 20 Alpine: ~160MB
- http-server: ~3MB
- **Total: ~200MB** (vs ~400MB with Node 20 debian)

### Security Measures
- Non-root user (`nextjs:1001`)
- Multi-stage build (discards build tools)
- Health check enabled
- No secrets in image layers

### Build Caching
- GitHub Actions cache automatically caches Docker layers
- Subsequent builds (~2min) faster than first build (~5min)
- Cache keyed by `Dockerfile` and dependencies

## Migration from Development to Production

### Gradual Rollout
1. **Local Testing**
   ```bash
   docker-compose up -d
   # Test at http://localhost:8080
   ```

2. **CI Pipeline Testing**
   - Push to feature branch
   - Workflow runs but doesn't push image
   - Verify build succeeds

3. **Staging Deployment**
   ```bash
   git tag v1.0.0-rc1
   git push origin v1.0.0-rc1
   # Image tagged as ghcr.io/.../disc-golf-putting-tr:v1.0.0-rc1
   ```

4. **Production Deployment**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   # Image tagged with v1.0.0, 1.0, 1, latest
   ```

## Future Enhancements

### Optional Additions
1. **Multi-platform builds** - Add `platforms: linux/amd64,linux/arm64` in workflow
2. **Container scanning** - Add Trivy security scanning step
3. **Release notes** - Auto-generate changelog from commits
4. **Helm charts** - For Kubernetes deployment
5. **Image signing** - Use Cosign for image verification

## Related Documentation
- [Dockerfile](../Dockerfile)
- [docker-compose.yml](../docker-compose.yml)
- [GitHub Actions Workflow](.github/workflows/build-container.yml)
- [.dockerignore](../.dockerignore)
