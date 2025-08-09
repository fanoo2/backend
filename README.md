# Fanno AI Platform Backend

A production-ready AI annotation backend service with LiveKit integration, Stripe payments, and comprehensive health monitoring.

## Features

- **AI Annotation Service**: Text annotation with AI models
- **Real-time Communication**: LiveKit integration for video/audio
- **Payment Processing**: Stripe integration for subscriptions  
- **Agent Management**: CRUD operations for AI agents
- **Health Monitoring**: Multiple health check endpoints
- **Database Support**: PostgreSQL with Drizzle ORM
- **Docker Support**: Production-ready containerization
- **Security**: CORS, input validation, and secure defaults

## API Endpoints

### Health & Monitoring
- `GET /health` - Basic health check
- `GET /api/health` - Detailed API health check
- `GET /api/stats` - System statistics

### Agent Management
- `GET /api/agents` - List all agents
- `GET /api/agents/:id` - Get specific agent
- `PATCH /api/agents/:id` - Update agent

### Annotation Services
- `POST /api/annotate` - Full annotation service
- `POST /api/annotate-simple` - Simple annotation
- `GET /api/annotations` - Get annotations

### Payment Integration
- `POST /payments/create-session` - Create Stripe session
- `POST /payments/webhook` - Stripe webhook handler

### LiveKit Integration
- `POST /api/token` - Generate access token
- `POST /api/livekit/token` - Generate LiveKit token

## Environment Variables

### Required for Production
```bash
# Frontend Configuration
FRONTEND_URL=https://yourdomain.com

# LiveKit Configuration
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-livekit-server.com

# Database (Optional - uses in-memory fallback)
DATABASE_URL=postgresql://user:pass@host:port/db

# Payment Processing (Optional)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# GitHub Integration (Optional)
GH_ACTIONS_TOKEN=your_github_token
```

### Optional
```bash
PORT=5000                    # Server port (default: 5000)
NODE_ENV=production         # Environment mode
```

## CORS Configuration

The backend includes intelligent CORS configuration:

### Development Mode
Automatically allows:
- Any `.replit.dev` domain (for Replit environments)
- `localhost` and `127.0.0.1` (for local development)
- The configured `FRONTEND_URL` environment variable

### Production Mode
When `FRONTEND_URL` is set, CORS becomes restrictive and only allows:
- The exact domain specified in `FRONTEND_URL`
- `.replit.dev` domains (for development flexibility)
- `localhost` (for testing)

## Running the Application

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm install --only=production
npm run build
npm start
```

### Docker
```bash
# Build image
docker build -t fanoo2/backend .

# Run container
docker run -p 5000:5000 \
  -e FRONTEND_URL=https://yourdomain.com \
  -e LIVEKIT_API_KEY=your_key \
  -e LIVEKIT_API_SECRET=your_secret \
  fanoo2/backend
```

## Testing

```bash
# Health check
npm run test:health

# Smoke tests
npm run test:smoke

# All tests
npm run test
```

## Building and Deployment

```bash
# Build for production
npm run build

# Validate environment
npm run validate-env

# Start production server
npm start
```

## Security Features

- **Non-root Docker user**: Runs as unprivileged user in container
- **Input validation**: Comprehensive request validation
- **CORS protection**: Configurable cross-origin policies
- **Environment validation**: Required variables checked at startup
- **Health checks**: Multiple monitoring endpoints
- **Signal handling**: Graceful shutdown support

## Monitoring

### Health Endpoints
- `/health` - Returns `{"status":"healthy"}` for load balancers
- `/api/health` - Detailed health information with timestamp
- `/api/stats` - System statistics and active connections

### Metrics
The service exposes metrics compatible with monitoring systems:
- Request/response times
- Error rates
- Active connections
- System resource usage

## Production Deployment

1. **Environment Setup**: Configure all required environment variables
2. **Database**: Set up PostgreSQL database (optional - has in-memory fallback)
3. **Build**: Run `npm run build` to compile TypeScript
4. **Health Check**: Verify with `npm run test:health`
5. **Deploy**: Use Docker or direct Node.js deployment
6. **Monitor**: Check `/health` endpoint for service status

## Version

Current version: **1.0.0** (Production Ready)

See [CHANGELOG.md](./CHANGELOG.md) for release notes and version history.