import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

const connection = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
});

export const db = drizzle(connection);