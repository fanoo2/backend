import { DatabaseStorage } from './database.js';
import fs from 'fs';
import path from 'path';

export async function initializeDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const db = new DatabaseStorage(databaseUrl);

  try {
    // Check if agents already exist
    const existingAgents = await db.getAllAgents();
    if (existingAgents.length > 0) {
      console.log(`Database already initialized with ${existingAgents.length} agents`);
      return db;
    }

    console.log('Initializing database with seed data...');

    // Load agents from agents.json and create enhanced agent data
    const agentsJsonPath = path.join(process.cwd(), 'agents.json');
    const agentsData = JSON.parse(fs.readFileSync(agentsJsonPath, 'utf-8'));

    // Map agents.json data to our schema with enhanced information
    const agentMappings = {
      'uiux-designer': {
        type: 'ui-ux',
        description: 'FigmaAI + Uizard for design system automation',
        emoji: '🎨',
        provider: 'FigmaAI + Uizard',
        status: 'active',
        config: {
          tool: 'FigmaAI+Uizard',
          output: 'npm:@org/design-system',
          figmaToken: '',
          uizardProject: '',
          npmRegistry: 'https://npm.pkg.github.com'
        }
      },
      'webrtc-engineer': {
        type: 'webrtc',
        description: 'LiveKitCLI + AgoraAI for real-time communication',
        emoji: '📡',
        provider: 'LiveKitCLI + AgoraAI',
        status: 'configuring',
        config: {
          tool: 'LiveKitCLI+AgoraAI',
          output: 'docker:webrtc-service',
          liveKitUrl: process.env.LIVEKIT_URL || '',
          agoraAppId: '',
          turnStunSecrets: ''
        }
      },
      'backend-developer': {
        type: 'backend',
        description: 'Copilot + OpenAI Functions for backend development',
        emoji: '⚙️',
        provider: 'Copilot + OpenAI Functions',
        status: 'active',
        config: {
          tool: 'Copilot+OpenAIFunctions',
          output: 'docker:backend-api',
          openaiKey: process.env.OPENAI_API_KEY ? 'configured' : '',
          databaseUrl: process.env.DATABASE_URL ? 'configured' : '',
          apiPort: 5000
        }
      },
      'frontend-developer': {
        type: 'frontend',
        description: 'Locofy + MutableAI for frontend development',
        emoji: '💻',
        provider: 'Locofy + MutableAI',
        status: 'active',
        config: {
          tool: 'Locofy+MutableAI',
          output: 'src/pages/**/*.tsx',
          frontendUrl: process.env.FRONTEND_URL || '',
          features: {
            chat: true,
            gifts: true,
            livePreview: true
          }
        }
      },
      'payment-specialist': {
        type: 'payment',
        description: 'StripeIQ + PlaidAI for payment processing',
        emoji: '💳',
        provider: 'StripeIQ + PlaidAI',
        status: process.env.STRIPE_SECRET_KEY ? 'active' : 'configuring',
        config: {
          tool: 'StripeIQ+PlaidAI',
          output: 'npm:@fanno/payments-workspace',
          stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ? 'configured' : '',
          stripeSecretKey: process.env.STRIPE_SECRET_KEY ? 'configured' : '',
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'configured' : '',
          currency: 'USD'
        }
      },
      'moderation-agent': {
        type: 'moderation',
        description: 'OpenAI + PerspectiveAPI for content moderation',
        emoji: '🛡️',
        provider: 'OpenAI + PerspectiveAPI',
        status: 'active',
        config: {
          tool: 'OpenAI+PerspectiveAPI',
          output: 'npm:@fanno/moderation-service',
          openaiKey: process.env.OPENAI_API_KEY ? 'configured' : '',
          perspectiveKey: '',
          toxicityThreshold: 0.8
        }
      },
      'devops-engineer': {
        type: 'devops',
        description: 'HarnessAI + Humanitec for DevOps automation',
        emoji: '🚀',
        provider: 'HarnessAI + Humanitec',
        status: 'pending',
        config: {
          tool: 'HarnessAI+Humanitec',
          output: 'k8s:deployment-manifests',
          githubToken: process.env.GH_ACTIONS_TOKEN ? 'configured' : '',
          kubernetesCluster: '',
          cloudProvider: 'replit'
        }
      }
    };

    // Create agents from the JSON file with enhanced data
    for (const agent of agentsData.agents) {
      const mapping = agentMappings[agent.id as keyof typeof agentMappings];
      if (mapping) {
        await db.createAgent({
          name: agent.name,
          type: mapping.type,
          description: mapping.description,
          status: mapping.status,
          config: mapping.config,
          emoji: mapping.emoji,
          provider: mapping.provider
        });
        console.log(`Created agent: ${agent.name}`);
      }
    }

    // Initialize phases
    const phases = [
      {
        name: "Phase 0: Organizational Setup",
        description: "GitHub organization, registries, and namespace configuration",
        status: "complete" as const,
        progress: 100,
        order: 0
      },
      {
        name: "Phase 1: Define & Configure AI Agents",
        description: "Configure 7 specialized AI agents for platform automation",
        status: "in-progress" as const,
        progress: 75,
        order: 1
      },
      {
        name: "Phase 2: Agent Hand-Off Blueprints",
        description: "Establish communication patterns between agents",
        status: "pending" as const,
        progress: 0,
        order: 2
      },
      {
        name: "Phase 3: Integration & Verification",
        description: "Testing, monitoring, and security automation",
        status: "pending" as const,
        progress: 0,
        order: 3
      }
    ];

    for (const phase of phases) {
      // Note: We would need to add a createPhase method to properly initialize phases
      // For now, we'll skip phase initialization in the database seed
      console.log(`Would create phase: ${phase.name}`);
    }

    // Initialize repositories
    const repositories = [
      { name: "design-system", status: "active" as const, isPrivate: true },
      { name: "webrtc-client", status: "warning" as const, isPrivate: true },
      { name: "backend", status: "active" as const, isPrivate: true },
      { name: "frontend", status: "active" as const, isPrivate: true },
      { name: "payments", status: "warning" as const, isPrivate: true },
      { name: "moderation", status: "active" as const, isPrivate: true }
    ];

    for (const repo of repositories) {
      // Add repo creation logic when needed
      console.log(`Would create repository: ${repo.name}`);
    }

    // Initialize services
    const services = [
      { name: "API Gateway", status: "healthy" as const },
      { name: "Database", status: "healthy" as const },
      { name: "WebRTC SFU", status: "warning" as const },
      { name: "Payment Service", status: process.env.STRIPE_SECRET_KEY ? "healthy" : "warning" as const },
      { name: "Moderation AI", status: "healthy" as const }
    ];

    for (const service of services) {
      console.log(`Would create service: ${service.name}`);
    }

    // Initialize workflows
    const workflows = [
      {
        fromAgent: "UI/UX Designer",
        toAgent: "Frontend Developer",
        description: "Design tokens and component library",
        artifact: "@org/design-system",
        status: "active" as const
      },
      {
        fromAgent: "Backend Developer",
        toAgent: "Frontend & Payment",
        description: "API specification and SDKs",
        artifact: "openapi.yaml",
        status: "active" as const
      },
      {
        fromAgent: "WebRTC Engineer",
        toAgent: "Frontend Developer",
        description: "Real-time communication client",
        artifact: "@fanno/webrtc-client",
        status: "pending" as const
      }
    ];

    for (const workflow of workflows) {
      console.log(`Would create workflow: ${workflow.fromAgent} -> ${workflow.toAgent}`);
    }

    // Add some initial activities
    await db.createActivity({
      title: "Database initialized with real agent data",
      type: "success"
    });

    await db.createActivity({
      title: "Agents loaded from agents.json configuration",
      type: "info"
    });

    console.log('Database initialization completed!');
    return db;

  } catch (error) {
    console.error('Database initialization failed:', error);
    await db.close();
    throw error;
  }
}