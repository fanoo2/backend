import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
});
export const agents = pgTable("agents", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type").notNull(), // 'ui-ux', 'webrtc', 'backend', 'frontend', 'payment', 'moderation', 'devops'
    description: text("description").notNull(),
    status: text("status").notNull().default('pending'), // 'pending', 'configuring', 'active', 'error'
    config: jsonb("config").notNull().default('{}'),
    emoji: text("emoji").notNull(),
    provider: text("provider").notNull(),
    lastUpdated: timestamp("last_updated").defaultNow(),
});
export const phases = pgTable("phases", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    status: text("status").notNull().default('pending'), // 'pending', 'in-progress', 'complete'
    progress: integer("progress").notNull().default(0), // 0-100
    order: integer("order").notNull(),
});
export const repositories = pgTable("repositories", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    status: text("status").notNull().default('pending'), // 'pending', 'active', 'warning', 'error'
    isPrivate: boolean("is_private").notNull().default(true),
});
export const services = pgTable("services", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    status: text("status").notNull().default('healthy'), // 'healthy', 'warning', 'error'
    lastCheck: timestamp("last_check").defaultNow(),
});
export const activities = pgTable("activities", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    timestamp: timestamp("timestamp").defaultNow(),
    type: text("type").notNull().default('info'), // 'info', 'success', 'warning', 'error'
});
export const workflows = pgTable("workflows", {
    id: serial("id").primaryKey(),
    fromAgent: text("from_agent").notNull(),
    toAgent: text("to_agent").notNull(),
    description: text("description").notNull(),
    artifact: text("artifact").notNull(),
    status: text("status").notNull().default('pending'), // 'pending', 'active', 'complete'
});
export const annotations = pgTable("annotations", {
    id: serial("id").primaryKey(),
    inputText: text("input_text").notNull(),
    resultJson: jsonb("result_json").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
// Insert schemas - using manual Zod schemas for API validation instead of drizzle-zod due to compatibility issues
export const insertAnnotationSchema = z.object({
    inputText: z.string(),
    resultJson: z.any()
});
// API Request/Response schemas
export const annotateRequestSchema = z.object({
    text: z.string().min(1).max(10000)
});
export const annotateResponseSchema = z.object({
    annotations: z.array(z.string())
});
export const getAnnotationsQuerySchema = z.object({
    limit: z.string().optional().transform(val => val ? parseInt(val) : undefined)
});
//# sourceMappingURL=schema.js.map