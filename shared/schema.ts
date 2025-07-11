import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertAgentSchema = createInsertSchema(agents).omit({ id: true, lastUpdated: true });
export const insertPhaseSchema = createInsertSchema(phases).omit({ id: true });
export const insertRepositorySchema = createInsertSchema(repositories).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true, lastCheck: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, timestamp: true });
export const insertWorkflowSchema = createInsertSchema(workflows).omit({ id: true });
export const insertAnnotationSchema = createInsertSchema(annotations).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type Phase = typeof phases.$inferSelect;
export type Repository = typeof repositories.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Workflow = typeof workflows.$inferSelect;
export type Annotation = typeof annotations.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type InsertPhase = z.infer<typeof insertPhaseSchema>;
export type InsertRepository = z.infer<typeof insertRepositorySchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type InsertAnnotation = z.infer<typeof insertAnnotationSchema>;
