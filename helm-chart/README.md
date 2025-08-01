# Backend Helm Chart

This Helm chart deploys the AI Annotation Backend application to Kubernetes.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+

## Installing the Chart

To install the chart with the release name `backend`:

```bash
helm install backend ./helm-chart
```

To install the chart with custom values:

```bash
helm install backend ./helm-chart \
  --set image.tag=v1.0.0 \
  --set env.FRONTEND_URL="https://yourfrontend.com" \
  --set env.DATABASE_URL="postgresql://user:password@postgres:5432/backend"
```

## Uninstalling the Chart

To uninstall/delete the `backend` deployment:

```bash
helm uninstall backend
```

## Configuration

The following table lists the configurable parameters of the Backend chart and their default values.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `1` |
| `image.repository` | Image repository | `ghcr.io/fanoo2/backend` |
| `image.tag` | Image tag | `latest` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.type` | Service type | `ClusterIP` |
| `service.port` | Service port | `80` |
| `service.targetPort` | Container port | `5000` |
| `env.FRONTEND_URL` | Frontend URL for CORS | `https://example.com` |
| `env.DATABASE_URL` | Database connection string | `postgresql://user:password@localhost:5432/db` |
| `env.NODE_ENV` | Node environment | `production` |
| `resources.limits.cpu` | CPU limit | `nil` |
| `resources.limits.memory` | Memory limit | `nil` |
| `resources.requests.cpu` | CPU request | `nil` |
| `resources.requests.memory` | Memory request | `nil` |
| `autoscaling.enabled` | Enable horizontal pod autoscaler | `false` |
| `autoscaling.minReplicas` | Minimum number of replicas | `1` |
| `autoscaling.maxReplicas` | Maximum number of replicas | `100` |
| `autoscaling.targetCPUUtilizationPercentage` | Target CPU utilization percentage | `80` |

## Examples

### Production Deployment

```bash
helm install backend ./helm-chart \
  --set image.tag=v1.0.0 \
  --set replicaCount=3 \
  --set env.FRONTEND_URL="https://app.fanoo2.com" \
  --set env.DATABASE_URL="postgresql://backend:${DB_PASSWORD}@postgres:5432/backend_prod" \
  --set resources.requests.memory="256Mi" \
  --set resources.requests.cpu="250m" \
  --set resources.limits.memory="512Mi" \
  --set resources.limits.cpu="500m" \
  --set autoscaling.enabled=true \
  --set autoscaling.minReplicas=3 \
  --set autoscaling.maxReplicas=10
```

### Development Deployment

```bash
helm install backend-dev ./helm-chart \
  --set image.tag=dev \
  --set env.FRONTEND_URL="http://localhost:3000" \
  --set env.DATABASE_URL="postgresql://dev:password@postgres:5432/backend_dev" \
  --set env.NODE_ENV="development"
```

## Health Checks

The application includes built-in health checks:
- **Liveness Probe**: Checks if the application is running (30s interval)
- **Readiness Probe**: Checks if the application is ready to serve traffic (10s interval)

Both probes use the `--health` flag of the application to perform health checks.

## Security

- The application runs as a non-root user (nodejs:1001)
- Security contexts can be configured via `podSecurityContext` and `securityContext` values
- Service account is created automatically but can be customized

## Environment Variables

Environment variables are managed through a ConfigMap. For sensitive data like database passwords, consider using Kubernetes Secrets:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
type: Opaque
data:
  DATABASE_PASSWORD: <base64-encoded-password>
```

Then reference it in your values:

```yaml
envFrom:
  - secretRef:
      name: backend-secrets
```