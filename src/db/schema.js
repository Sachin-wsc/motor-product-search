"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companies = exports.motorSelections = exports.inquiries = exports.equationConfigs = exports.productSpecs = exports.products = exports.masterApplications = exports.masterFrequencies = exports.masterVoltages = exports.masterPoles = exports.motorTypes = exports.users = void 0;
var mysql_core_1 = require("drizzle-orm/mysql-core");
/* =====================================================
   USERS
===================================================== */
exports.users = (0, mysql_core_1.mysqlTable)("users", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    email: (0, mysql_core_1.varchar)("email", { length: 255 }).unique().notNull(),
    password: (0, mysql_core_1.text)("password").notNull(),
    role: (0, mysql_core_1.varchar)("role", { length: 50 }).default("admin").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
/* =====================================================
   MASTER TABLES
===================================================== */
exports.motorTypes = (0, mysql_core_1.mysqlTable)("motor_types", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    name: (0, mysql_core_1.varchar)("name", { length: 50 }).unique().notNull(), // AC / DC
    description: (0, mysql_core_1.text)("description"),
    isActive: (0, mysql_core_1.boolean)("is_active").default(true).notNull(),
});
exports.masterPoles = (0, mysql_core_1.mysqlTable)("master_poles", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    poleNumber: (0, mysql_core_1.varchar)("pole_number", { length: 20 }).unique().notNull(), // 2,4,6,8
    isActive: (0, mysql_core_1.boolean)("is_active").default(true).notNull(),
});
exports.masterVoltages = (0, mysql_core_1.mysqlTable)("master_voltages", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    voltageValue: (0, mysql_core_1.decimal)("voltage_value", { precision: 10, scale: 2 }).notNull(),
    unit: (0, mysql_core_1.varchar)("unit", { length: 20 }).default("V").notNull(),
    isActive: (0, mysql_core_1.boolean)("is_active").default(true).notNull(),
});
exports.masterFrequencies = (0, mysql_core_1.mysqlTable)("master_frequencies", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    frequencyValue: (0, mysql_core_1.decimal)("frequency_value", { precision: 5, scale: 2 }).notNull(),
    unit: (0, mysql_core_1.varchar)("unit", { length: 10 }).default("Hz").notNull(),
    isActive: (0, mysql_core_1.boolean)("is_active").default(true).notNull(),
});
exports.masterApplications = (0, mysql_core_1.mysqlTable)("master_applications", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).unique().notNull(),
    description: (0, mysql_core_1.text)("description"),
    isActive: (0, mysql_core_1.boolean)("is_active").default(true).notNull(),
});
/* =====================================================
   PRODUCTS
===================================================== */
exports.products = (0, mysql_core_1.mysqlTable)("products", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    sku: (0, mysql_core_1.varchar)("sku", { length: 100 }).unique().notNull(),
    companyId: (0, mysql_core_1.varchar)("company_id", { length: 36 }).references(function () { return exports.companies.id; }, { onDelete: "restrict" }).notNull(),
    summary: (0, mysql_core_1.text)("summary"),
    images: (0, mysql_core_1.json)("images"),
    datasheetUrl: (0, mysql_core_1.text)("datasheet_url"),
    documentUrl: (0, mysql_core_1.text)("document_url"),
    motorTypeId: (0, mysql_core_1.varchar)("motor_type_id", { length: 36 })
        .references(function () { return exports.motorTypes.id; })
        .notNull(),
    isActive: (0, mysql_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
exports.productSpecs = (0, mysql_core_1.mysqlTable)("product_specs", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    productId: (0, mysql_core_1.varchar)("product_id", { length: 36 })
        .references(function () { return exports.products.id; }, { onDelete: "cascade" })
        .notNull(),
    /* ==========================================
       AC MOTOR FIELDS
    ========================================== */
    acKw: (0, mysql_core_1.decimal)("ac_kw", { precision: 10, scale: 2 }),
    poleId: (0, mysql_core_1.varchar)("pole_id", { length: 36 })
        .references(function () { return exports.masterPoles.id; }),
    voltageId: (0, mysql_core_1.varchar)("voltage_id", { length: 36 })
        .references(function () { return exports.masterVoltages.id; }),
    frequencyId: (0, mysql_core_1.varchar)("frequency_id", { length: 36 })
        .references(function () { return exports.masterFrequencies.id; }),
    acApplicationId: (0, mysql_core_1.varchar)("ac_application_id", { length: 36 })
        .references(function () { return exports.masterApplications.id; }),
    totalMotors: (0, mysql_core_1.decimal)("total_motors", { precision: 10, scale: 0 }),
    motorsPerGroup: (0, mysql_core_1.decimal)("motors_per_group", { precision: 10, scale: 0 }),
    /* ==========================================
       DC MOTOR FIELDS
    ========================================== */
    dcArmatureVoltage: (0, mysql_core_1.decimal)("dc_armature_voltage", { precision: 10, scale: 2 }),
    dcKw: (0, mysql_core_1.decimal)("dc_kw", { precision: 10, scale: 2 }),
    dcFieldVoltage: (0, mysql_core_1.decimal)("dc_field_voltage", { precision: 10, scale: 2 }),
    dcFieldCurrent: (0, mysql_core_1.decimal)("dc_field_current", { precision: 10, scale: 2 }),
    dcApplicationId: (0, mysql_core_1.varchar)("dc_application_id", { length: 36 })
        .references(function () { return exports.masterApplications.id; }),
});
/* =====================================================
   EQUATION CONFIG (SMART SELECTION ENGINE)
===================================================== */
exports.equationConfigs = (0, mysql_core_1.mysqlTable)("equation_configs", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    keyName: (0, mysql_core_1.varchar)("key_name", { length: 100 }).unique().notNull(),
    formulaString: (0, mysql_core_1.text)("formula_string").notNull(),
    constantValue: (0, mysql_core_1.decimal)("constant_value", { precision: 10, scale: 4 }),
    description: (0, mysql_core_1.text)("description"),
    isActive: (0, mysql_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
/* =====================================================
   INQUIRIES
===================================================== */
exports.inquiries = (0, mysql_core_1.mysqlTable)("inquiries", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    productId: (0, mysql_core_1.varchar)("product_id", { length: 36 })
        .references(function () { return exports.products.id; }, { onDelete: "set null" }),
    customerName: (0, mysql_core_1.varchar)("customer_name", { length: 255 }).notNull(),
    customerEmail: (0, mysql_core_1.varchar)("customer_email", { length: 255 }).notNull(),
    companyName: (0, mysql_core_1.varchar)("company_name", { length: 255 }),
    message: (0, mysql_core_1.text)("message"),
    userSearchInputs: (0, mysql_core_1.json)("user_search_inputs"),
    status: (0, mysql_core_1.varchar)("status", { length: 50 }).default("New").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
});
/* =====================================================
   MOTOR SELECTION (AC + DC Combined)
===================================================== */
exports.motorSelections = (0, mysql_core_1.mysqlTable)("motor_selections", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    inquiryId: (0, mysql_core_1.varchar)("inquiry_id", { length: 36 })
        .references(function () { return exports.inquiries.id; }, { onDelete: "cascade" }),
    motorTypeId: (0, mysql_core_1.varchar)("motor_type_id", { length: 36 })
        .references(function () { return exports.motorTypes.id; })
        .notNull(),
    // Common Fields
    kw: (0, mysql_core_1.decimal)("kw", { precision: 10, scale: 2 }).notNull(),
    applicationId: (0, mysql_core_1.varchar)("application_id", { length: 36 })
        .references(function () { return exports.masterApplications.id; }),
    totalMotors: (0, mysql_core_1.decimal)("total_motors", { precision: 10, scale: 0 }),
    motorsPerGroup: (0, mysql_core_1.decimal)("motors_per_group", { precision: 10, scale: 0 }),
    // AC Specific
    poleId: (0, mysql_core_1.varchar)("pole_id", { length: 36 })
        .references(function () { return exports.masterPoles.id; }),
    voltageId: (0, mysql_core_1.varchar)("voltage_id", { length: 36 })
        .references(function () { return exports.masterVoltages.id; }),
    frequencyId: (0, mysql_core_1.varchar)("frequency_id", { length: 36 })
        .references(function () { return exports.masterFrequencies.id; }),
    // DC Specific
    armVoltage: (0, mysql_core_1.decimal)("arm_voltage", { precision: 10, scale: 2 }),
    fieldVoltage: (0, mysql_core_1.decimal)("field_voltage", { precision: 10, scale: 2 }),
    fieldCurrent: (0, mysql_core_1.decimal)("field_current", { precision: 10, scale: 2 }),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.companies = (0, mysql_core_1.mysqlTable)("companies", {
    id: (0, mysql_core_1.varchar)("id", { length: 36 }).primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).unique().notNull(),
    description: (0, mysql_core_1.text)("description"),
    isActive: (0, mysql_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
