// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './src/db/migrations',
    dialect: 'mysql',
    dbCredentials: {
        host: 'localhost',
        user: process.env.DB_USER || "",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "",
        port: 3306,
    },
    verbose: true,
    strict: true,
});
