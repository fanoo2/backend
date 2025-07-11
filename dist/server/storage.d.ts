import { type User, type Agent, type Phase, type Repository, type Service, type Activity, type Workflow, type Annotation, type InsertUser, type InsertAgent, type InsertPhase, type InsertRepository, type InsertService, type InsertActivity, type InsertWorkflow, type InsertAnnotation } from "@shared/schema";
export interface IStorage {
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;
    getAllAgents(): Promise<Agent[]>;
    getAgent(id: number): Promise<Agent | undefined>;
    createAgent(agent: InsertAgent): Promise<Agent>;
    updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent | undefined>;
    getAllPhases(): Promise<Phase[]>;
    updatePhase(id: number, updates: Partial<InsertPhase>): Promise<Phase | undefined>;
    getAllRepositories(): Promise<Repository[]>;
    updateRepository(id: number, updates: Partial<InsertRepository>): Promise<Repository | undefined>;
    getAllServices(): Promise<Service[]>;
    updateService(id: number, updates: Partial<InsertService>): Promise<Service | undefined>;
    getRecentActivities(limit?: number): Promise<Activity[]>;
    createActivity(activity: InsertActivity): Promise<Activity>;
    getAllWorkflows(): Promise<Workflow[]>;
    updateWorkflow(id: number, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
    createAnnotation(annotation: InsertAnnotation): Promise<Annotation>;
    getRecentAnnotations(limit?: number): Promise<Annotation[]>;
    getStats(): Promise<{
        activeAgents: number;
        completedTasks: number;
        progress: number;
    }>;
}
export declare class MemStorage implements IStorage {
    private users;
    private agents;
    private phases;
    private repositories;
    private services;
    private activities;
    private workflows;
    private annotations;
    private currentId;
    constructor();
    private initializeData;
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(insertUser: InsertUser): Promise<User>;
    getAllAgents(): Promise<Agent[]>;
    getAgent(id: number): Promise<Agent | undefined>;
    createAgent(agent: InsertAgent): Promise<Agent>;
    updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent | undefined>;
    getAllPhases(): Promise<Phase[]>;
    updatePhase(id: number, updates: Partial<InsertPhase>): Promise<Phase | undefined>;
    getAllRepositories(): Promise<Repository[]>;
    updateRepository(id: number, updates: Partial<InsertRepository>): Promise<Repository | undefined>;
    getAllServices(): Promise<Service[]>;
    updateService(id: number, updates: Partial<InsertService>): Promise<Service | undefined>;
    getRecentActivities(limit?: number): Promise<Activity[]>;
    createActivity(activity: InsertActivity): Promise<Activity>;
    getAllWorkflows(): Promise<Workflow[]>;
    updateWorkflow(id: number, updates: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
    createAnnotation(annotation: InsertAnnotation): Promise<Annotation>;
    getRecentAnnotations(limit?: number): Promise<Annotation[]>;
    getStats(): Promise<{
        activeAgents: number;
        completedTasks: number;
        progress: number;
    }>;
}
export declare const storage: MemStorage;
