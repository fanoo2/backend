import { 
  type User, type Agent, type Phase, type Repository, type Service, type Activity, type Workflow, type Annotation,
  type InsertUser, type InsertAgent, type InsertPhase, type InsertRepository, 
  type InsertService, type InsertActivity, type InsertWorkflow, type InsertAnnotation
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Agents
  getAllAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent | undefined>;

  // Phases
  getAllPhases(): Promise<Phase[]>;
  updatePhase(id: number, updates: Partial<InsertPhase>): Promise<Phase | undefined>;

  // Repositories
  getAllRepositories(): Promise<Repository[]>;
  updateRepository(id: number, updates: Partial<InsertRepository>): Promise<Repository | undefined>;

  // Services
  getAllServices(): Promise<Service[]>;
  updateService(id: number, updates: Partial<InsertService>): Promise<Service | undefined>;

  // Activities
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Workflows
  getAllWorkflows(): Promise<Workflow[]>;
  updateWorkflow(id: number, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined>;

  // Annotations
  createAnnotation(annotation: InsertAnnotation): Promise<Annotation>;
  getRecentAnnotations(limit?: number): Promise<Annotation[]>;

  // Stats
  getStats(): Promise<{ activeAgents: number; completedTasks: number; progress: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private agents: Map<number, Agent> = new Map();
  private phases: Map<number, Phase> = new Map();
  private repositories: Map<number, Repository> = new Map();
  private services: Map<number, Service> = new Map();
  private activities: Map<number, Activity> = new Map();
  private workflows: Map<number, Workflow> = new Map();
  private annotations: Map<number, Annotation> = new Map();
  private currentId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize agents
    const agentData: Array<Omit<Agent, 'id'>> = [
      {
        name: "UI/UX Agent",
        type: "ui-ux",
        description: "Figma AI + Uizard",
        status: "active",
        config: { uizardProject: "", figmaToken: "", figmaFileKey: "" },
        emoji: "🎨",
        provider: "Figma AI + Uizard",
        lastUpdated: new Date()
      },
      {
        name: "WebRTC Agent",
        type: "webrtc",
        description: "LiveKit CLI / Agora AI SDK",
        status: "configuring",
        config: { turnStunSecrets: "", sfuClusterConfig: "", jwtSecret: "" },
        emoji: "📡",
        provider: "LiveKit CLI / Agora AI SDK",
        lastUpdated: new Date()
      },
      {
        name: "Backend Agent",
        type: "backend",
        description: "Copilot + OpenAI Functions",
        status: "active",
        config: { openapiLocation: "", dbConnection: "", kafkaBroker: "" },
        emoji: "⚙️",
        provider: "Copilot + OpenAI Functions",
        lastUpdated: new Date()
      },
      {
        name: "Frontend Agent",
        type: "frontend",
        description: "Locofy.ai + Mutable AI",
        status: "active",
        config: { npmTokens: "", apiBaseUrl: "", features: { chat: true, gifts: true, livePreview: false } },
        emoji: "💻",
        provider: "Locofy.ai + Mutable AI",
        lastUpdated: new Date()
      },
      {
        name: "Payment Agent",
        type: "payment",
        description: "Stripe IQ + Plaid Link AI",
        status: "configuring",
        config: { stripeKeys: "", webhookSecret: "", currency: "USD", payoutThreshold: 100 },
        emoji: "💳",
        provider: "Stripe IQ + Plaid Link AI",
        lastUpdated: new Date()
      },
      {
        name: "Moderation Agent",
        type: "moderation",
        description: "OpenAI + Perspective",
        status: "active",
        config: { openaiKey: "", perspectiveKey: "", toxicityThreshold: 0.8, adultContentThreshold: 0.7 },
        emoji: "🛡️",
        provider: "OpenAI + Perspective",
        lastUpdated: new Date()
      },
      {
        name: "DevOps Agent",
        type: "devops",
        description: "Harness.io AI + Humanitec",
        status: "pending",
        config: { cloudAccount: "", kubernetesCluster: "", vaultPaths: "", cicdCredentials: "" },
        emoji: "🚀",
        provider: "Harness.io AI + Humanitec",
        lastUpdated: new Date()
      }
    ];

    agentData.forEach(agent => {
      this.agents.set(this.currentId, { ...agent, id: this.currentId });
      this.currentId++;
    });

    // Initialize phases
    const phaseData: Array<Omit<Phase, 'id'>> = [
      {
        name: "Phase 0: Organizational Setup",
        description: "GitHub organization, registries, and namespace configuration",
        status: "complete",
        progress: 100,
        order: 0
      },
      {
        name: "Phase 1: Define & Configure AI Agents",
        description: "Configure 7 specialized AI agents for platform automation",
        status: "in-progress",
        progress: 65,
        order: 1
      },
      {
        name: "Phase 2: Agent Hand-Off Blueprints",
        description: "Establish communication patterns between agents",
        status: "pending",
        progress: 0,
        order: 2
      },
      {
        name: "Phase 3: Integration & Verification",
        description: "Testing, monitoring, and security automation",
        status: "pending",
        progress: 0,
        order: 3
      }
    ];

    phaseData.forEach(phase => {
      this.phases.set(this.currentId, { ...phase, id: this.currentId });
      this.currentId++;
    });

    // Initialize repositories
    const repoData: Array<Omit<Repository, 'id'>> = [
      { name: "design-system", status: "active", isPrivate: true },
      { name: "webrtc-client", status: "warning", isPrivate: true },
      { name: "backend", status: "active", isPrivate: true },
      { name: "frontend", status: "active", isPrivate: true },
      { name: "payments", status: "warning", isPrivate: true },
      { name: "moderation", status: "active", isPrivate: true }
    ];

    repoData.forEach(repo => {
      this.repositories.set(this.currentId, { ...repo, id: this.currentId });
      this.currentId++;
    });

    // Initialize services
    const serviceData: Array<Omit<Service, 'id' | 'lastCheck'>> = [
      { name: "API Gateway", status: "healthy" },
      { name: "Database", status: "healthy" },
      { name: "WebRTC SFU", status: "warning" },
      { name: "Payment Service", status: "healthy" },
      { name: "Moderation AI", status: "healthy" }
    ];

    serviceData.forEach(service => {
      this.services.set(this.currentId, { ...service, id: this.currentId, lastCheck: new Date() });
      this.currentId++;
    });

    // Initialize activities
    const activityData: Array<Omit<Activity, 'id' | 'timestamp'>> = [
      { title: "Backend Agent deployed", type: "success" },
      { title: "Design tokens published", type: "info" },
      { title: "WebRTC configuration updated", type: "warning" },
      { title: "Payment webhooks verified", type: "success" }
    ];

    activityData.forEach(activity => {
      this.activities.set(this.currentId, { ...activity, id: this.currentId, timestamp: new Date() });
      this.currentId++;
    });

    // Initialize workflows
    const workflowData: Array<Omit<Workflow, 'id'>> = [
      {
        fromAgent: "UI/UX Agent",
        toAgent: "Frontend Agent",
        description: "Design tokens and component library",
        artifact: "@fanno/design-system",
        status: "active"
      },
      {
        fromAgent: "Backend Agent",
        toAgent: "Frontend & Payment",
        description: "API specification and SDKs",
        artifact: "openapi.yaml",
        status: "active"
      },
      {
        fromAgent: "WebRTC Agent",
        toAgent: "Frontend Agent",
        description: "Real-time communication client",
        artifact: "@fanno/webrtc-client",
        status: "pending"
      }
    ];

    workflowData.forEach(workflow => {
      this.workflows.set(this.currentId, { ...workflow, id: this.currentId });
      this.currentId++;
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const id = this.currentId++;
    const newAgent: Agent = { ...agent, id, lastUpdated: new Date() };
    this.agents.set(id, newAgent);
    return newAgent;
  }

  async updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent | undefined> {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    
    const updatedAgent = { ...agent, ...updates, lastUpdated: new Date() };
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }

  async getAllPhases(): Promise<Phase[]> {
    return Array.from(this.phases.values()).sort((a, b) => a.order - b.order);
  }

  async updatePhase(id: number, updates: Partial<InsertPhase>): Promise<Phase | undefined> {
    const phase = this.phases.get(id);
    if (!phase) return undefined;
    
    const updatedPhase = { ...phase, ...updates };
    this.phases.set(id, updatedPhase);
    return updatedPhase;
  }

  async getAllRepositories(): Promise<Repository[]> {
    return Array.from(this.repositories.values());
  }

  async updateRepository(id: number, updates: Partial<InsertRepository>): Promise<Repository | undefined> {
    const repo = this.repositories.get(id);
    if (!repo) return undefined;
    
    const updatedRepo = { ...repo, ...updates };
    this.repositories.set(id, updatedRepo);
    return updatedRepo;
  }

  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async updateService(id: number, updates: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...updates, lastCheck: new Date() };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async getRecentActivities(limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.currentId++;
    const newActivity: Activity = { ...activity, id, timestamp: new Date() };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async getAllWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }

  async updateWorkflow(id: number, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;
    
    const updatedWorkflow = { ...workflow, ...updates };
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async createAnnotation(annotation: InsertAnnotation): Promise<Annotation> {
    const id = this.currentId++;
    const newAnnotation: Annotation = { 
      ...annotation, 
      id, 
      createdAt: new Date() 
    };
    this.annotations.set(id, newAnnotation);
    return newAnnotation;
  }

  async getRecentAnnotations(limit = 10): Promise<Annotation[]> {
    return Array.from(this.annotations.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getStats(): Promise<{ activeAgents: number; completedTasks: number; progress: number }> {
    const agents = Array.from(this.agents.values());
    const phases = Array.from(this.phases.values());
    
    const activeAgents = agents.filter(agent => agent.status === 'active').length;
    const completedTasks = phases.reduce((sum, phase) => sum + Math.floor(phase.progress / 10), 0);
    const totalProgress = phases.reduce((sum, phase) => sum + phase.progress, 0);
    const progress = Math.round(totalProgress / phases.length);
    
    return { activeAgents, completedTasks, progress };
  }
}

export const storage = new MemStorage();
