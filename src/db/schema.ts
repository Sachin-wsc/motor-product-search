import { pgTable, uuid, varchar, text, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";

/* =====================================================
   USERS
===================================================== */

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: text("password").notNull(),
    role: varchar("role", { length: 50 }).default("admin").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =====================================================
   MASTER TABLES
===================================================== */

export const motorTypes = pgTable("motor_types", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 50 }).unique().notNull(), // AC / DC
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
});

export const masterPoles = pgTable("master_poles", {
    id: uuid("id").primaryKey().defaultRandom(),
    poleNumber: varchar("pole_number", { length: 20 }).unique().notNull(), // 2,4,6,8
    isActive: boolean("is_active").default(true).notNull(),
});

export const masterVoltages = pgTable("master_voltages", {
    id: uuid("id").primaryKey().defaultRandom(),
    voltageValue: decimal("voltage_value", { precision: 10, scale: 2 }).notNull(),
    unit: varchar("unit", { length: 20 }).default("V").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
});

export const masterFrequencies = pgTable("master_frequencies", {
    id: uuid("id").primaryKey().defaultRandom(),
    frequencyValue: decimal("frequency_value", { precision: 5, scale: 2 }).notNull(),
    unit: varchar("unit", { length: 10 }).default("Hz").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
});

export const masterApplications = pgTable("master_applications", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).unique().notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
});

/* =====================================================
   PRODUCTS
===================================================== */

export const products = pgTable("products", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    sku: varchar("sku", { length: 100 }).unique().notNull(),
    companyId: uuid("company_id").references(() => companies.id, { onDelete: "restrict" }).notNull(),
    summary: text("summary"),
    images: jsonb("images").default([]),
    datasheetUrl: text("datasheet_url"),
    documentUrl: text("document_url"),
    motorTypeId: uuid("motor_type_id")
        .references(() => motorTypes.id)
        .notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const productSpecs = pgTable("product_specs", {
    id: uuid("id").primaryKey().defaultRandom(),

    productId: uuid("product_id")
        .references(() => products.id, { onDelete: "cascade" })
        .notNull(),

    /* ==========================================
       AC MOTOR FIELDS
    ========================================== */

    acKw: decimal("ac_kw", { precision: 10, scale: 2 }),

    poleId: uuid("pole_id")
        .references(() => masterPoles.id),

    voltageId: uuid("voltage_id")
        .references(() => masterVoltages.id),

    frequencyId: uuid("frequency_id")
        .references(() => masterFrequencies.id),

    acApplicationId: uuid("ac_application_id")
        .references(() => masterApplications.id),

    totalMotors: decimal("total_motors", { precision: 10, scale: 0 }),

    motorsPerGroup: decimal("motors_per_group", { precision: 10, scale: 0 }),

    /* ==========================================
       DC MOTOR FIELDS
    ========================================== */

    dcArmatureVoltage: decimal("dc_armature_voltage", { precision: 10, scale: 2 }),

    dcKw: decimal("dc_kw", { precision: 10, scale: 2 }),

    dcFieldVoltage: decimal("dc_field_voltage", { precision: 10, scale: 2 }),

    dcFieldCurrent: decimal("dc_field_current", { precision: 10, scale: 2 }),

    dcApplicationId: uuid("dc_application_id")
        .references(() => masterApplications.id),
});

/* =====================================================
   EQUATION CONFIG (SMART SELECTION ENGINE)
===================================================== */

export const equationConfigs = pgTable("equation_configs", {
    id: uuid("id").primaryKey().defaultRandom(),
    keyName: varchar("key_name", { length: 100 }).unique().notNull(),
    formulaString: text("formula_string").notNull(),
    constantValue: decimal("constant_value", { precision: 10, scale: 4 }),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =====================================================
   INQUIRIES
===================================================== */

export const inquiries = pgTable("inquiries", {
    id: uuid("id").primaryKey().defaultRandom(),

    productId: uuid("product_id")
        .references(() => products.id, { onDelete: "set null" }),

    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerEmail: varchar("customer_email", { length: 255 }).notNull(),
    companyName: varchar("company_name", { length: 255 }),
    message: text("message"),

    userSearchInputs: jsonb("user_search_inputs"),
    status: varchar("status", { length: 50 }).default("New").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* =====================================================
   MOTOR SELECTION (AC + DC Combined)
===================================================== */

export const motorSelections = pgTable("motor_selections", {
    id: uuid("id").primaryKey().defaultRandom(),

    inquiryId: uuid("inquiry_id")
        .references(() => inquiries.id, { onDelete: "cascade" }),

    motorTypeId: uuid("motor_type_id")
        .references(() => motorTypes.id)
        .notNull(),

    // Common Fields
    kw: decimal("kw", { precision: 10, scale: 2 }).notNull(),
    applicationId: uuid("application_id")
        .references(() => masterApplications.id),

    totalMotors: decimal("total_motors", { precision: 10, scale: 0 }),
    motorsPerGroup: decimal("motors_per_group", { precision: 10, scale: 0 }),

    // AC Specific
    poleId: uuid("pole_id")
        .references(() => masterPoles.id),

    voltageId: uuid("voltage_id")
        .references(() => masterVoltages.id),

    frequencyId: uuid("frequency_id")
        .references(() => masterFrequencies.id),

    // DC Specific
    armVoltage: decimal("arm_voltage", { precision: 10, scale: 2 }),
    fieldVoltage: decimal("field_voltage", { precision: 10, scale: 2 }),
    fieldCurrent: decimal("field_current", { precision: 10, scale: 2 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});



export const companies = pgTable("companies", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).unique().notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});