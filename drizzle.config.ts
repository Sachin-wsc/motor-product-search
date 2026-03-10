// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './src/db/migrations',
    dialect: 'mysql',
    dbCredentials: {
        host: 'localhost',
        user: 'baap-user',
        password: 'dadaIsHere#202411',
        database: 'motor_driver_db',
        port: 3306,
    },
});
