import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Use a fallback URL if DATABASE_URL is not set so build doesn't crash during static generation
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin@localhost:5432/motor_driver_db',
});

export const db = drizzle(pool, { schema });
