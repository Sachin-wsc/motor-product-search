CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "master_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "master_applications_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "master_frequencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"frequency_value" numeric(5, 2) NOT NULL,
	"unit" varchar(10) DEFAULT 'Hz' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "master_poles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pole_number" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "master_poles_pole_number_unique" UNIQUE("pole_number")
);
--> statement-breakpoint
CREATE TABLE "master_voltages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"voltage_value" numeric(10, 2) NOT NULL,
	"unit" varchar(20) DEFAULT 'V' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "motor_selections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiry_id" uuid,
	"motor_type_id" uuid NOT NULL,
	"kw" numeric(10, 2) NOT NULL,
	"application_id" uuid,
	"total_motors" numeric(10, 0),
	"motors_per_group" numeric(10, 0),
	"pole_id" uuid,
	"voltage_id" uuid,
	"frequency_id" uuid,
	"arm_voltage" numeric(10, 2),
	"field_voltage" numeric(10, 2),
	"field_current" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "motor_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "motor_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "product_specs" ADD COLUMN "ac_kw" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "product_specs" ADD COLUMN "pole_id" uuid;--> statement-breakpoint
ALTER TABLE "product_specs" ADD COLUMN "voltage_id" uuid;--> statement-breakpoint
ALTER TABLE "product_specs" ADD COLUMN "frequency_id" uuid;--> statement-breakpoint
ALTER TABLE "product_specs" ADD COLUMN "ac_application_id" uuid;--> statement-breakpoint
ALTER TABLE "product_specs" ADD COLUMN "total_motors" numeric(10, 0);--> statement-breakpoint
ALTER TABLE "product_specs" ADD COLUMN "motors_per_group" numeric(10, 0);--> statement-breakpoint
ALTER TABLE "product_specs" ADD COLUMN "dc_armature_voltage" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "product_specs" ADD COLUMN "dc_kw" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "product_specs" ADD COLUMN "dc_field_voltage" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "product_specs" ADD COLUMN "dc_field_current" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "product_specs" ADD COLUMN "dc_application_id" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "company_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "motor_type_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "motor_selections" ADD CONSTRAINT "motor_selections_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "motor_selections" ADD CONSTRAINT "motor_selections_motor_type_id_motor_types_id_fk" FOREIGN KEY ("motor_type_id") REFERENCES "public"."motor_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "motor_selections" ADD CONSTRAINT "motor_selections_application_id_master_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."master_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "motor_selections" ADD CONSTRAINT "motor_selections_pole_id_master_poles_id_fk" FOREIGN KEY ("pole_id") REFERENCES "public"."master_poles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "motor_selections" ADD CONSTRAINT "motor_selections_voltage_id_master_voltages_id_fk" FOREIGN KEY ("voltage_id") REFERENCES "public"."master_voltages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "motor_selections" ADD CONSTRAINT "motor_selections_frequency_id_master_frequencies_id_fk" FOREIGN KEY ("frequency_id") REFERENCES "public"."master_frequencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_specs" ADD CONSTRAINT "product_specs_pole_id_master_poles_id_fk" FOREIGN KEY ("pole_id") REFERENCES "public"."master_poles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_specs" ADD CONSTRAINT "product_specs_voltage_id_master_voltages_id_fk" FOREIGN KEY ("voltage_id") REFERENCES "public"."master_voltages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_specs" ADD CONSTRAINT "product_specs_frequency_id_master_frequencies_id_fk" FOREIGN KEY ("frequency_id") REFERENCES "public"."master_frequencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_specs" ADD CONSTRAINT "product_specs_ac_application_id_master_applications_id_fk" FOREIGN KEY ("ac_application_id") REFERENCES "public"."master_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_specs" ADD CONSTRAINT "product_specs_dc_application_id_master_applications_id_fk" FOREIGN KEY ("dc_application_id") REFERENCES "public"."master_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_motor_type_id_motor_types_id_fk" FOREIGN KEY ("motor_type_id") REFERENCES "public"."motor_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_specs" DROP COLUMN "min_voltage";--> statement-breakpoint
ALTER TABLE "product_specs" DROP COLUMN "max_voltage";--> statement-breakpoint
ALTER TABLE "product_specs" DROP COLUMN "max_continuous_current";--> statement-breakpoint
ALTER TABLE "product_specs" DROP COLUMN "peak_current";--> statement-breakpoint
ALTER TABLE "product_specs" DROP COLUMN "rated_power";--> statement-breakpoint
ALTER TABLE "product_specs" DROP COLUMN "max_rpm";--> statement-breakpoint
ALTER TABLE "product_specs" DROP COLUMN "efficiency_rating";--> statement-breakpoint
ALTER TABLE "product_specs" DROP COLUMN "weight_kg";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "motor_type";