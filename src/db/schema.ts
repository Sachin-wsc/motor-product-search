import { pgTable, uuid, varchar, text, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: text("password").notNull(),
    role: varchar("role", { length: 50 }).default("admin").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    sku: varchar("sku", { length: 100 }).unique().notNull(),
    summary: text("summary"),
    imageUrl: text("image_url"),
    datasheetUrl: text("datasheet_url"),
    motorType: varchar("motor_type", { length: 50 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productSpecs = pgTable("product_specs", {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
    minVoltage: decimal("min_voltage", { precision: 10, scale: 2 }),
    maxVoltage: decimal("max_voltage", { precision: 10, scale: 2 }),
    maxContinuousCurrent: decimal("max_continuous_current", { precision: 10, scale: 2 }),
    peakCurrent: decimal("peak_current", { precision: 10, scale: 2 }),
    ratedPower: decimal("rated_power", { precision: 10, scale: 2 }),
    maxRpm: decimal("max_rpm", { precision: 10, scale: 2 }),
    efficiencyRating: decimal("efficiency_rating", { precision: 5, scale: 4 }), // percentage
    weightKg: decimal("weight_kg", { precision: 8, scale: 3 }),
});

export const equationConfigs = pgTable("equation_configs", {
    id: uuid("id").primaryKey().defaultRandom(),
    keyName: varchar("key_name", { length: 100 }).unique().notNull(),
    formulaString: text("formula_string").notNull(),
    constantValue: decimal("constant_value", { precision: 10, scale: 4 }),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inquiries = pgTable("inquiries", {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").references(() => products.id, { onDelete: 'set null' }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerEmail: varchar("customer_email", { length: 255 }).notNull(),
    companyName: varchar("company_name", { length: 255 }),
    message: text("message"),
    userSearchInputs: jsonb("user_search_inputs"),
    status: varchar("status", { length: 50 }).default("New").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
