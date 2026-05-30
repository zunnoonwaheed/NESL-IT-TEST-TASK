import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Get a required environment variable or fail fast with a clear error message
 */
function getRequiredEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) {
      console.warn(`⚠️  ${key} is not set. Using default: ${defaultValue}`);
      return defaultValue;
    }
    console.error(`❌ Required environment variable ${key} is not set!`);
    console.error(`   Please copy .env.example to .env and configure it.`);
    process.exit(1);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  groqApiKey: getRequiredEnv('GROQ_API_KEY'),
  clientUrl: getRequiredEnv('CLIENT_URL', 'http://localhost:5173'),
};
