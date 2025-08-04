import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import { 
  type User, type Agent, type Phase, type Repository, type Service, type Activity, type Workflow, type Annotation,
  type InsertUser, type InsertAgent, type InsertPhase, type InsertRepository, 
  type InsertService, type InsertActivity, type InsertWorkflow, type InsertAnnotation
} from "@shared/schema";
import { eq, desc } from 'drizzle-orm';
import { IStorage } from './storage.js';

export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  private connection: postgres.Sql;

  constructor(databaseUrl: string) {
    this.connection = postgres(databaseUrl);
    this.db = drizzle(this.connection, { schema });
  }

  async close() {
    await this.connection.end();
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(schema.users).values(user).returning();
    return result[0];
  }

  // Agents
  async getAllAgents(): Promise<Agent[]> {
    return await this.db.select().from(schema.agents);
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const result = await this.db.select().from(schema.agents).where(eq(schema.agents.id, id));
    return result[0];
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const result = await this.db.insert(schema.agents).values(agent).returning();
    return result[0];
  }

  async updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent | undefined> {
    const result = await this.db.update(schema.agents)
      .set(updates)
      .where(eq(schema.agents.id, id))
      .returning();
    return result[0];
  }

  // Phases
  async getAllPhases(): Promise<Phase[]> {
    return await this.db.select().from(schema.phases).orderBy(schema.phases.order);
  }

  async updatePhase(id: number, updates: Partial<InsertPhase>): Promise<Phase | undefined> {
    const result = await this.db.update(schema.phases)
      .set(updates)
      .where(eq(schema.phases.id, id))
      .returning();
    return result[0];
  }

  // Repositories
  async getAllRepositories(): Promise<Repository[]> {
    return await this.db.select().from(schema.repositories);
  }

  async updateRepository(id: number, updates: Partial<InsertRepository>): Promise<Repository | undefined> {
    const result = await this.db.update(schema.repositories)
      .set(updates)
      .where(eq(schema.repositories.id, id))
      .returning();
    return result[0];
  }

  // Services
  async getAllServices(): Promise<Service[]> {
    return await this.db.select().from(schema.services);
  }

  async updateService(id: number, updates: Partial<InsertService>): Promise<Service | undefined> {
    const result = await this.db.update(schema.services)
      .set(updates)
      .where(eq(schema.services.id, id))
      .returning();
    return result[0];
  }

  // Activities
  async getRecentActivities(limit = 10): Promise<Activity[]> {
    return await this.db.select().from(schema.activities)
      .orderBy(desc(schema.activities.timestamp))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const result = await this.db.insert(schema.activities).values(activity).returning();
    return result[0];
  }

  // Workflows
  async getAllWorkflows(): Promise<Workflow[]> {
    return await this.db.select().from(schema.workflows);
  }

  async updateWorkflow(id: number, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const result = await this.db.update(schema.workflows)
      .set(updates)
      .where(eq(schema.workflows.id, id))
      .returning();
    return result[0];
  }

  // Annotations
  async createAnnotation(annotation: InsertAnnotation): Promise<Annotation> {
    const result = await this.db.insert(schema.annotations).values(annotation).returning();
    return result[0];
  }

  async getRecentAnnotations(limit = 10): Promise<Annotation[]> {
    return await this.db.select().from(schema.annotations)
      .orderBy(desc(schema.annotations.createdAt))
      .limit(limit);
  }

  // Stats
  async getStats(): Promise<{ activeAgents: number; completedTasks: number; progress: number }> {
    const agents = await this.getAllAgents();
    const phases = await this.getAllPhases();

    const activeAgents = agents.filter(agent => agent.status === 'active').length;
    const completedTasks = phases.reduce((sum, phase) => sum + Math.floor(phase.progress / 10), 0);
    const totalProgress = phases.reduce((sum, phase) => sum + phase.progress, 0);
    const progress = phases.length > 0 ? Math.round(totalProgress / phases.length) : 0;

    return { activeAgents, completedTasks, progress };
  }
}