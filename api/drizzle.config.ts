import { defineConfig } from 'drizzle-kit';

for (const envFile of ['.env.local', '.env']) {
  try {
    process.loadEnvFile?.(envFile);
  } catch {
    // Ignore missing env files so generation works with only .env.local present.
  }
}

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.SUPABASE_DB_URL ??
  process.env.POSTGRES_URL;

export default defineConfig({
  schema: './src/database/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  ...(databaseUrl
    ? {
        dbCredentials: {
          url: databaseUrl,
        },
      }
    : {}),
});
