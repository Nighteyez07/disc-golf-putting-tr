# Quick Reference: Containerization Guide

## Files Added
- `Dockerfile` - Multi-stage Alpine build, ~200MB final image
- `docker-compose.yml` - Local testing with single command
- `.dockerignore` - Optimization file
- `.github/workflows/build-container.yml` - CI/CD to GHCR
- `CONTAINER_DEPLOYMENT.md` - Detailed deployment plan

## Local Testing (30 seconds)
```bash
docker-compose up -d
# Open http://localhost:8080
```

## Deploy to GHCR
```bash
git tag v1.0.0
git push origin v1.0.0
# Workflow auto-deploys in ~3 minutes
# Image available at: ghcr.io/YOUR-USERNAME/disc-golf-putting-tr:v1.0.0
```

## Manual Test Latest Image
```bash
docker pull ghcr.io/YOUR-USERNAME/disc-golf-putting-tr:latest
docker run -p 8080:8080 ghcr.io/YOUR-USERNAME/disc-golf-putting-tr:latest
```

## Image Tags Generated
- `latest` - Always points to main branch latest
- `v1.0.0` - Exact semantic version
- `1.0`, `1` - Major/minor versions
- `main` - Current main branch
- `branch-name` - Any branch push
- `sha-abc1234` - Git commit SHA

## Architecture Summary
```
Push/Tag Event
    ↓
GitHub Actions Workflow Triggered
    ↓
Build Docker Image (multi-stage, Alpine)
    ↓
Login to GHCR (automatic via GITHUB_TOKEN)
    ↓
Push Image with Generated Tags
    ↓
Image Available at ghcr.io/username/repo:tag
```

## Health Check
Image includes health check at port 8080:
```bash
docker ps
# HEALTHCHECK column shows "healthy" after 5 seconds
```

## Troubleshooting Commands
```bash
# View workflow logs
gh workflow run build-container.yml --watch

# Check pushed images
docker pull ghcr.io/YOUR-USERNAME/disc-golf-putting-tr:latest

# Local build test
docker build -t disc-golf:test .

# Container logs
docker logs disc-golf-putting-trainer

# Shell into running container
docker exec -it disc-golf-putting-trainer sh
```

## No Additional Setup Required
✅ GITHUB_TOKEN automatically available
✅ GHCR access automatic for your account
✅ All workflows already configured
✅ Just push code or tags to trigger

See `CONTAINER_DEPLOYMENT.md` for detailed information.
