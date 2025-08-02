import { z } from 'zod';

// Environment validation schema using Zod
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),
  
  // Database configuration
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Stripe configuration
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),
  
  // LiveKit configuration
  LIVEKIT_URL: z.string().url('LIVEKIT_URL must be a valid URL'),
  LIVEKIT_API_KEY: z.string().min(1, 'LIVEKIT_API_KEY is required'),
  LIVEKIT_API_SECRET: z.string().min(1, 'LIVEKIT_API_SECRET is required'),
  
  // GitHub Actions token (optional)
  GH_ACTIONS_TOKEN: z.string().optional(),
  
  // Frontend URL
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').default('https://example.com'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables and fails fast if required secrets are missing
 * @returns Validated environment configuration
 * @throws Error if validation fails
 */
export function validateEnvironment(): Env {
  try {
    const env = envSchema.parse(process.env);
    console.log('✅ Environment validation passed');
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\nRequired environment variables:');
      console.error('  - DATABASE_URL: PostgreSQL connection string');
      console.error('  - STRIPE_SECRET_KEY: Stripe secret key');
      console.error('  - STRIPE_WEBHOOK_SECRET: Stripe webhook secret');
      console.error('  - LIVEKIT_URL: LiveKit server URL');
      console.error('  - LIVEKIT_API_KEY: LiveKit API key');
      console.error('  - LIVEKIT_API_SECRET: LiveKit API secret');
      console.error('\nOptional environment variables:');
      console.error('  - GH_ACTIONS_TOKEN: GitHub Actions token for workflow dispatch');
      console.error('  - FRONTEND_URL: Frontend application URL (default: https://example.com)');
      console.error('  - NODE_ENV: Environment mode (default: development)');
      console.error('  - PORT: Server port (default: 5000)');
    } else {
      console.error('❌ Environment validation failed:', error);
    }
    process.exit(1);
  }
}

/**
 * Startup script that validates environment before starting the server
 */
export function startupCheck(): void {
  console.log('🔍 Validating environment configuration...');
  validateEnvironment();
  console.log('🚀 Environment validation complete, starting server...');
}