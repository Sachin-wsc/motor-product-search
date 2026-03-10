// import { defineConfig } from "drizzle-kit";

// export default defineConfig({
//     schema: "./src/db/schema.ts",
//     out: "./src/db/migrations",
//     dialect: "mysql",
//     dbCredentials: {
//         url: process.env.DATABASE_URL || "",
//     },
//     verbose: true,
//     strict: true,
// });


import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

const pool = mysql.createPool({
    host: process.env.DB_HOST || "",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "",
    port: 3306
});

export const db = drizzle(pool);