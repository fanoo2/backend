import request from 'supertest';
import express from 'express';

describe('Configuration Fixes', () => {
  let app: express.Express;
  
  beforeAll(async () => {
    app = express();
    app.use(express.json());

    // LiveKit token endpoint simulation
    app.post('/api/livekit/token', express.json(), async (req, res) => {
      const { identity, roomName } = req.body as {
        identity?: string;
        roomName?: string;
      };

      const apiKey = process.env.LIVEKIT_API_KEY;
      const apiSecret = process.env.LIVEKIT_API_SECRET;
      const url = process.env.LIVEKIT_URL;

      if (!apiKey || !apiSecret) {
        return res
          .status(500)
          .json({ error: 'LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set.' });
      }

      if (!url) {
        return res
          .status(500)
          .json({ error: 'LIVEKIT_URL must be set. Please provide a valid LiveKit server URL.' });
      }

      // Mock successful response
      return res.json({
        identity: identity ?? 'test-user',
        token: 'mock-token',
        url,
        roomName
      });
    });

    // Agent events endpoint simulation
    app.post("/agent-events", async (req, res) => {
      try {
        const { agent, status, version } = req.body;

        if (!agent || !status) {
          return res.status(400).json({ message: "Agent and status are required" });
        }

        // Only process completed events
        if (status !== 'completed') {
          return res.sendStatus(204);
        }

        // Only trigger frontend when payment is done
        if (agent === 'payment-specialist') {
          const ghToken = process.env.GH_ACTIONS_TOKEN;

          if (!ghToken) {
            console.warn("GH_ACTIONS_TOKEN not found, skipping GitHub workflow dispatch");
            return res.sendStatus(200);
          }

          // In a real scenario, this would dispatch to fanoo2/frontend
          console.log(`Would dispatch to GitHub with URL: https://api.github.com/repos/fanoo2/frontend/actions/workflows/run-frontend-agent.yml/dispatches`);
        }

        res.sendStatus(200);
      } catch (error) {
        console.error("Agent events error:", error instanceof Error ? error.message : "Unknown error");
        res.status(500).json({ message: "Failed to process agent event" });
      }
    });

    // Stripe payments endpoint simulation
    app.post("/payments/create-session", async (req, res) => {
      try {
        const { amount, currency } = req.body;

        if (!amount || !currency) {
          return res.status(400).json({ 
            message: "Amount and currency are required" 
          });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
          return res.status(500).json({
            message: "Stripe configuration missing",
            error: "STRIPE_SECRET_KEY not configured"
          });
        }

        // Mock successful response
        res.json({ sessionId: 'mock-session-id', url: 'https://checkout.stripe.com/mock' });
      } catch (error) {
        console.error("Payment session creation failed:", error);
        res.status(500).json({ 
          message: "Failed to create payment session",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });

    // Stripe webhook endpoint simulation
    app.post("/payments/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!endpointSecret) {
        console.error('Stripe webhook secret not configured');
        return res.status(500).send('Webhook secret not configured');
      }

      if (!sig) {
        console.error('Missing stripe signature');
        return res.status(400).send('Missing stripe signature');
      }

      res.json({ received: true });
    });
  });

  describe('LiveKit Configuration', () => {
    beforeEach(() => {
      // Clear environment variables
      delete process.env.LIVEKIT_URL;
      delete process.env.LIVEKIT_API_KEY;
      delete process.env.LIVEKIT_API_SECRET;
    });

    test('should return error when LIVEKIT_URL is missing', async () => {
      process.env.LIVEKIT_API_KEY = 'test-key';
      process.env.LIVEKIT_API_SECRET = 'test-secret';
      
      const response = await request(app)
        .post('/api/livekit/token')
        .send({ identity: 'test-user', roomName: 'test-room' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('LIVEKIT_URL must be set. Please provide a valid LiveKit server URL.');
    });

    test('should return error when LIVEKIT_API_KEY is missing', async () => {
      process.env.LIVEKIT_URL = 'wss://test.livekit.cloud';
      process.env.LIVEKIT_API_SECRET = 'test-secret';
      
      const response = await request(app)
        .post('/api/livekit/token')
        .send({ identity: 'test-user', roomName: 'test-room' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set.');
    });

    test('should return error when LIVEKIT_API_SECRET is missing', async () => {
      process.env.LIVEKIT_URL = 'wss://test.livekit.cloud';
      process.env.LIVEKIT_API_KEY = 'test-key';
      
      const response = await request(app)
        .post('/api/livekit/token')
        .send({ identity: 'test-user', roomName: 'test-room' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set.');
    });
  });

  describe('GitHub Dispatch URL', () => {
    beforeEach(() => {
      delete process.env.GH_ACTIONS_TOKEN;
    });

    test('should handle agent events with missing GH_ACTIONS_TOKEN gracefully', async () => {
      const response = await request(app)
        .post('/agent-events')
        .send({ 
          agent: 'payment-specialist', 
          status: 'completed',
          version: '1.0.0'
        });

      expect(response.status).toBe(200);
    });

    test('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/agent-events')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Agent and status are required');
    });

    test('should return 204 for non-completed status', async () => {
      const response = await request(app)
        .post('/agent-events')
        .send({ 
          agent: 'payment-specialist', 
          status: 'running'
        });

      expect(response.status).toBe(204);
    });
  });

  describe('Stripe Configuration', () => {
    beforeEach(() => {
      delete process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_WEBHOOK_SECRET;
    });

    test('should return error when STRIPE_SECRET_KEY is missing', async () => {
      const response = await request(app)
        .post('/payments/create-session')
        .send({ amount: 1000, currency: 'usd' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('STRIPE_SECRET_KEY not configured');
    });

    test('should return error when STRIPE_WEBHOOK_SECRET is missing', async () => {
      const response = await request(app)
        .post('/payments/webhook')
        .set('Content-Type', 'application/json')
        .send({});

      expect(response.status).toBe(500);
      expect(response.text).toBe('Webhook secret not configured');
    });
  });
});