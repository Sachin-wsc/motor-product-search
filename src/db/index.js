"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
var mysql2_1 = require("drizzle-orm/mysql2");
var promise_1 = require("mysql2/promise");
var schema = require("./schema");
var connection = await promise_1.default.createConnection({
    uri: process.env.DATABASE_URL,
});
exports.db = (0, mysql2_1.drizzle)(connection, { schema: schema, mode: 'default' });
