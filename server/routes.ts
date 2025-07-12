import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
// Schema imports removed - not currently used in routes
import { annotate, annotateTextWithAI, generateBasicAnnotations } from "./annotator.js";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // Root route - serves a welcome page
  app.get("/", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fanno AI Platform API</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .container { max-width: 800px; margin: 0 auto; }
            .endpoint { background: #f4f4f4; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .method { font-weight: bold; color: #007acc; }
            h1 { color: #333; }
            h2 { color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🤖 Fanno AI Platform API</h1>
            <p>Welcome to the Fanno AI Platform API server. This service provides AI-powered text annotation and analysis capabilities.</p>
            
            <h2>Available Endpoints</h2>
            
            <div class="endpoint">
              <span class="method">GET</span> <code>/health</code> - Health check
            </div>
            
            <div class="endpoint">
              <span class="method">POST</span> <code>/api/annotate</code> - Annotate text with AI analysis
              <br><small>Body: {"text": "your text here"}</small>
            </div>
            
            <div class="endpoint">
              <span class="method">POST</span> <code>/api/annotate-simple</code> - Simple text annotation
              <br><small>Body: {"text": "your text here"}</small>
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span> <code>/api/annotations</code> - Get recent annotations
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span> <code>/api/stats</code> - Get platform statistics
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span> <code>/api/agents</code> - Get all agents
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span> <code>/api/workflows</code> - Get all workflows
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span> <code>/api/activities</code> - Get recent activities
            </div>
            
            <p><strong>Status:</strong> Service is running and ready to accept requests.</p>
          </div>
        </body>
      </html>
    `);
  });

  // Health check endpoint (must be before catch-all)
  app.get("/health", (req, res) => {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      service: "fanno-platform-api"
    });
  });

  // API health check endpoint (alternative path)
  app.get("/api/health", (req, res) => {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      service: "fanno-platform-api"
    });
  });

  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Agents endpoints
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.get("/api/agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });

  app.patch("/api/agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const agent = await storage.updateAgent(id, updates);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (_error) {
      res.status(500).json({ message: "Failed to update agent" });
    }
  });

  // Phases endpoints
  app.get("/api/phases", async (req, res) => {
    try {
      const phases = await storage.getAllPhases();
      res.json(phases);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch phases" });
    }
  });

  // Repositories endpoints
  app.get("/api/repositories", async (req, res) => {
    try {
      const repositories = await storage.getAllRepositories();
      res.json(repositories);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch repositories" });
    }
  });

  // Services endpoints
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Activities endpoints
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Workflows endpoints
  app.get("/api/workflows", async (req, res) => {
    try {
      const workflows = await storage.getAllWorkflows();
      res.json(workflows);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch workflows" });
    }
  });

  // Simple annotation endpoint as requested
  app.post("/api/annotate-simple", async (req, res) => {
    try {
      const { text } = req.body;
      const anns = await annotate(text);
      await storage.createAnnotation({ 
        inputText: text, 
        resultJson: {
          annotations: anns,
          analysisMethod: "simple",
          timestamp: new Date().toISOString(),
          inputLength: text.length,
          annotationCount: anns.length
        }
      });
      res.json({ annotations: anns });
    } catch (error) {
      res.status(500).json({ message: "Annotation failed" });
    }
  });

  // AI Services endpoints
  app.post("/api/annotate", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ 
          message: "Invalid request",
          code: "INVALID_TEXT",
          details: { error: "Text field is required and must be a string" }
        });
      }

      if (text.length > 10000) {
        return res.status(400).json({
          message: "Text too long",
          code: "TEXT_TOO_LONG", 
          details: { maxLength: 10000, actualLength: text.length }
        });
      }

      let annotations: string[];
      let analysisMethod = "openai";
      
      try {
        // Try OpenAI first for advanced AI analysis
        annotations = await annotateTextWithAI(text);
      } catch (aiError) {
        console.warn("OpenAI annotation failed, falling back to basic analysis:", aiError instanceof Error ? aiError.message : "Unknown error");
        
        // Fall back to basic annotations if OpenAI fails
        annotations = generateBasicAnnotations(text);
        analysisMethod = "basic";
        
        // Add a note about the fallback
        annotations.unshift("Note: Using basic analysis (OpenAI unavailable)");
      }

      // Log the annotation request and result to database
      try {
        await storage.createAnnotation({
          inputText: text,
          resultJson: {
            annotations,
            analysisMethod,
            timestamp: new Date().toISOString(),
            inputLength: text.length,
            annotationCount: annotations.length
          }
        });
      } catch (dbError) {
        // Don't fail the request if logging fails, just log the error
        console.error("Failed to log annotation to database:", dbError instanceof Error ? dbError.message : "Unknown error");
      }
      
      res.json({ annotations });
    } catch (_error) {
      res.status(500).json({ 
        message: "Failed to annotate text",
        code: "ANNOTATION_ERROR",
        details: { error: _error instanceof Error ? _error.message : "Unknown error" }
      });
    }
  });

  // Get recent annotations for monitoring
  app.get("/api/annotations", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const annotations = await storage.getRecentAnnotations(limit);
      res.json(annotations);
    } catch (_error) {
      res.status(500).json({ message: "Failed to fetch annotations" });
    }
  });

  // Stripe payments endpoint
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

      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: currency,
            product_data: {
              name: 'Fanno AI Platform Service',
            },
            unit_amount: amount,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cancel`,
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error("Payment session creation failed:", error);
      res.status(500).json({ 
        message: "Failed to create payment session",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Stripe webhook endpoint
  app.post("/payments/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error('Stripe webhook secret not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    let event;

    try {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err instanceof Error ? err.message : 'Unknown error');
      return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Payment succeeded:', session.id);
        
        // TODO: Fulfill the purchase, update database, send confirmation email, etc.
        // You can access session.customer_email, session.amount_total, etc.
        
        break;
      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object;
        console.log('Payment failed:', paymentIntent.id);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  // Agent events endpoint for orchestrator
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

        try {
          await axios.post(
            'https://api.github.com/repos/YOUR-ORG/frontend/actions/workflows/run-frontend-agent.yml/dispatches',
            {
              ref: 'main',
              inputs: { sdk_version: version || 'latest' }
            },
            {
              headers: {
                'Authorization': `Bearer ${ghToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log(`GitHub workflow dispatched for payment-specialist completion`);
        } catch (githubError) {
          console.error("Failed to dispatch GitHub workflow:", githubError instanceof Error ? githubError.message : "Unknown error");
          // Don't fail the request if GitHub call fails
        }
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("Agent events error:", error instanceof Error ? error.message : "Unknown error");
      res.status(500).json({ message: "Failed to process agent event" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
