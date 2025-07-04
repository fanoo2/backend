import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Schema imports removed - not currently used in routes
import { annotate, annotateTextWithAI, generateBasicAnnotations } from "./annotator";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
