# Fanno AI Platform Backend

## CORS Configuration

The backend includes a flexible CORS configuration that automatically handles dynamic URLs from development environments like Replit.

### Development Mode
In development, the CORS policy automatically allows:
- Any `.replit.dev` domain (for Replit environments)
- `localhost` and `127.0.0.1` (for local development)
- The configured `FRONTEND_URL` environment variable

### Production Mode
For production, set the `FRONTEND_URL` environment variable to your specific frontend domain:

```bash
export FRONTEND_URL=https://yourdomain.com
```

When `FRONTEND_URL` is set, the CORS policy becomes more restrictive and only allows:
- The exact domain specified in `FRONTEND_URL`
- `.replit.dev` domains (for development flexibility)
- `localhost` (for testing)

### Security Note
The current configuration allows all `.replit.dev` domains for development convenience. In a production environment, you may want to further restrict this by setting specific allowed origins.

## Environment Variables

Required for production:
- `FRONTEND_URL` - The URL of your frontend application
- `LIVEKIT_API_KEY` - LiveKit API key
- `LIVEKIT_API_SECRET` - LiveKit API secret
- `LIVEKIT_URL` - LiveKit server URL

Optional:
- `PORT` - Server port (defaults to 5000)
- `STRIPE_SECRET_KEY` - For payment processing
- `STRIPE_WEBHOOK_SECRET` - For Stripe webhooks
- `GH_ACTIONS_TOKEN` - For GitHub integrations

## Running the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```