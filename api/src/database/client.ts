import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

for (const envFile of ['.env.local', '.env']) {
  try {
    process.loadEnvFile?.(envFile);
  } catch {
    // Ignore missing env files so local commands can rely on whichever file exists.
  }
}

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ??
    process.env.SUPABASE_DB_URL ??
    process.env.POSTGRES_URL
  );
}

const databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  throw new Error(
    'Missing DATABASE_URL or SUPABASE_DB_URL. Set your Supabase Postgres connection string in api/.env.local.',
  );
}

export const sql = postgres(databaseUrl, {
  ssl: process.env.DATABASE_SSL === 'false' ? undefined : 'require',
  prepare: false,
});

export const db = drizzle(sql, { schema });
