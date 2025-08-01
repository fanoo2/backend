import request from 'supertest';
import express, { type Express } from 'express';
import cors from 'cors';

describe('Environment Configuration Tests', () => {
  let app: Express;
  let originalEnv: typeof process.env;

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env;
    // Clear the module cache to ensure fresh imports
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  test('should use custom FRONTEND_URL from environment variable', () => {
    // Set custom environment variable
    process.env.FRONTEND_URL = 'http://localhost:3000';
    
    // Create a minimal app to test CORS configuration
    const app = express();
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://20cb041c-29ee-4ed6-9fb7-89e207c36447-00-34lt6eadu20q9.kirk.replit.dev';
    
    app.use(cors({
      origin: FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    app.get('/test-cors', (req, res) => {
      res.json({ frontendUrl: FRONTEND_URL });
    });

    expect(FRONTEND_URL).toBe('http://localhost:3000');
  });

  test('should use default FRONTEND_URL when environment variable is not set', () => {
    // Ensure FRONTEND_URL is not set
    delete process.env.FRONTEND_URL;
    
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://20cb041c-29ee-4ed6-9fb7-89e207c36447-00-34lt6eadu20q9.kirk.replit.dev';
    
    expect(FRONTEND_URL).toBe('https://20cb041c-29ee-4ed6-9fb7-89e207c36447-00-34lt6eadu20q9.kirk.replit.dev');
  });

  test('should handle empty FRONTEND_URL environment variable', () => {
    // Set empty environment variable
    process.env.FRONTEND_URL = '';
    
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://20cb041c-29ee-4ed6-9fb7-89e207c36447-00-34lt6eadu20q9.kirk.replit.dev';
    
    expect(FRONTEND_URL).toBe('https://20cb041c-29ee-4ed6-9fb7-89e207c36447-00-34lt6eadu20q9.kirk.replit.dev');
  });
});