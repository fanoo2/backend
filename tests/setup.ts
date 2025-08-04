// Jest setup file - loads environment variables for tests
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Ensure test environment
process.env.NODE_ENV = 'test';