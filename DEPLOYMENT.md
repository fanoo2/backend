# Backend Dockerization and Kubernetes Deployment

This repository has been updated to support containerized deployment with Docker and Kubernetes orchestration via Helm.

## What's Been Added

### 1. Multi-Stage Dockerfile
- **Location**: `Dockerfile`
- **Features**:
  - Build stage with TypeScript compilation using Node 20 Alpine
  - Production stage with only runtime dependencies
  - Non-root user for security (`nodejs:1001`)
  - Health check integration
  - Optimized for GitHub Container Registry

### 2. GitHub Actions Workflow
- **Location**: `.github/workflows/docker.yml`
- **Features**:
  - Automated Docker image building on push/PR
  - Push to GitHub Container Registry (`ghcr.io/fanoo2/backend`)
  - Multi-platform support and caching
  - Automatic tagging with branch/PR/semver

### 3. Helm Chart
- **Location**: `helm-chart/`
- **Components**:
  - **Deployment**: Manages application pods with health checks
  - **Service**: Exposes the application internally
  - **ConfigMap**: Manages environment variables
  - **ServiceAccount**: Security context management
  - **Helper templates**: Reusable naming and labeling

### 4. Environment Configuration
- **ConfigMap Environment Variables**:
  - `FRONTEND_URL`: Frontend application URL for CORS
  - `DATABASE_URL`: PostgreSQL connection string
  - `NODE_ENV`: Node.js environment setting

### 5. Code Improvements
- Fixed TypeScript compilation error in `server/routes.ts`
- Added proper validation for Stripe webhook signatures
- Updated build scripts for production

## Usage

### Building Docker Image
```bash
# Local build
docker build -t backend:latest .

# Multi-platform build for GitHub Container Registry
docker buildx build --platform linux/amd64,linux/arm64 \
  -t ghcr.io/fanoo2/backend:latest --push .
```

### Deploying with Helm
```bash
# Basic deployment
helm install backend ./helm-chart

# Production deployment with custom values
helm install production-backend ./helm-chart \
  --set image.tag=v1.0.0 \
  --set replicaCount=3 \
  --set env.FRONTEND_URL="https://app.fanoo2.com" \
  --set env.DATABASE_URL="postgresql://backend:${DB_PASSWORD}@postgres:5432/backend_prod" \
  --set resources.requests.memory="256Mi" \
  --set resources.requests.cpu="250m" \
  --set resources.limits.memory="512Mi" \
  --set resources.limits.cpu="500m"
```

### GitHub Actions Integration
The workflow automatically:
1. Builds Docker images on every push to `main`/`master`
2. Pushes images to `ghcr.io/fanoo2/backend`
3. Tags images appropriately:
   - `latest` for main branch
   - `pr-123` for pull requests  
   - `v1.0.0` for semantic version tags
   - `sha-abcd123` for specific commits

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub        │    │   Docker        │    │   Kubernetes    │
│   Repository    │    │   Registry      │    │   Cluster       │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Source    │ │    │ │   Image     │ │    │ │   Pods      │ │
│ │   Code      │────────→│   Storage   │────────→│   Running   │ │
│ │             │ │    │ │             │ │    │ │   App       │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │                 │    │ ┌─────────────┐ │
│ │   Actions   │ │    │                 │    │ │   Services  │ │
│ │   Workflow  │ │    │                 │    │ │   ConfigMap │ │
│ │             │ │    │                 │    │ │             │ │
│ └─────────────┘ │    │                 │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Environment Variables in Production

The application expects these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `FRONTEND_URL` | CORS allowed origin | `https://example.com` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:password@localhost:5432/db` |
| `NODE_ENV` | Node environment | `production` |
| `STRIPE_SECRET_KEY` | Stripe API key | _(required for payments)_ |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | _(required for webhooks)_ |

## Security Features

- **Non-root execution**: Application runs as `nodejs` user (UID 1001)
- **Minimal attack surface**: Production image contains only runtime dependencies
- **Health checks**: Built-in application health monitoring
- **Resource limits**: Configurable CPU and memory constraints
- **Network policies**: Service-level network isolation

## Monitoring and Health Checks

The application includes comprehensive health checks:
- **Liveness probe**: Ensures the application is running
- **Readiness probe**: Ensures the application is ready to serve traffic
- **Health endpoint**: Built-in `--health` flag for status checking

## Next Steps

1. **Configure secrets**: Set up Kubernetes secrets for sensitive data
2. **Set up ingress**: Configure external access to the application  
3. **Add monitoring**: Integrate with Prometheus/Grafana
4. **Set up staging**: Create staging environment with Helm
5. **Add backup strategy**: Implement database backup automation