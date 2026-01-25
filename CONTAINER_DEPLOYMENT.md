# Container Deployment Plan

## Overview
This document outlines the containerization strategy and GitHub Actions integration for deploying the Disc Golf Putting Trainer to GitHub Container Registry (GHCR).

## Files Created

### 1. **Dockerfile** - Multi-stage Production Build
**Strategy**: Alpine-based multi-stage build for minimal image size

**Stages**:
- **Builder Stage** (`node:20-alpine`)
  - Installs npm dependencies
  - Runs TypeScript compilation and Vite build
  - Generates optimized `dist/` directory
  
- **Runtime Stage** (`node:20-alpine`)
  - Copies only the built `dist/` assets
  - Uses `http-server` for serving static files
  - Creates non-root user (`nextjs:1001`) for security
  - Includes health check endpoint

**Key Features**:
- ~200MB final image size (alpine base + http-server)
- Health check validates server responsiveness every 30s
- Runs on port `8080`
- Gzip compression enabled (`--gzip`)
- No cache headers for assets (`-c-1`)

### 2. **docker-compose.yml** - Local Development/Testing
**Purpose**: Quick local testing without manual Docker commands

**Configuration**:
- Maps port `8080` to localhost for browser access
- Includes environment variable for `NODE_ENV=production`
- Health check mirrors Dockerfile definition
- Auto-restart policy (unless manually stopped)
- Container name: `disc-golf-putting-trainer`

**Usage**:
```bash
# Start container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop container
docker-compose down
```

### 3. **.dockerignore** - Optimization
Excludes unnecessary files from Docker context:
- Node modules and build artifacts
- Git history and config
- Development/test files
- Documentation

**Impact**: Reduces Docker build context from ~300MB → ~5MB

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
