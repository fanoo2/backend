// Jest setup file - loads environment variables for tests
const { config } = require('dotenv');

// Load environment variables from .env file
config();

// Ensure test environment
process.env.NODE_ENV = 'test';