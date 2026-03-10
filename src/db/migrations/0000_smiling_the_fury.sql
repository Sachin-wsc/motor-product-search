CREATE TABLE `companies` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `equation_configs` (
	`id` varchar(36) NOT NULL,
	`key_name` varchar(100) NOT NULL,
	`formula_string` text NOT NULL,
	`constant_value` decimal(10,4),
	`description` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `equation_configs_id` PRIMARY KEY(`id`),
	CONSTRAINT `equation_configs_key_name_unique` UNIQUE(`key_name`)
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` varchar(36) NOT NULL,
	`product_id` varchar(36),
	`customer_name` varchar(255) NOT NULL,
	`customer_email` varchar(255) NOT NULL,
	`company_name` varchar(255),
	`message` text,
	`user_search_inputs` json,
	`status` varchar(50) NOT NULL DEFAULT 'New',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `master_applications` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `master_applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `master_applications_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `master_frequencies` (
	`id` varchar(36) NOT NULL,
	`frequency_value` decimal(5,2) NOT NULL,
	`unit` varchar(10) NOT NULL DEFAULT 'Hz',
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `master_frequencies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `master_poles` (
	`id` varchar(36) NOT NULL,
	`pole_number` varchar(20) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `master_poles_id` PRIMARY KEY(`id`),
	CONSTRAINT `master_poles_pole_number_unique` UNIQUE(`pole_number`)
);
--> statement-breakpoint
CREATE TABLE `master_voltages` (
	`id` varchar(36) NOT NULL,
	`voltage_value` decimal(10,2) NOT NULL,
	`unit` varchar(20) NOT NULL DEFAULT 'V',
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `master_voltages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `motor_selections` (
	`id` varchar(36) NOT NULL,
	`inquiry_id` varchar(36),
	`motor_type_id` varchar(36) NOT NULL,
	`kw` decimal(10,2) NOT NULL,
	`application_id` varchar(36),
	`total_motors` decimal,
	`motors_per_group` decimal,
	`pole_id` varchar(36),
	`voltage_id` varchar(36),
	`frequency_id` varchar(36),
	`arm_voltage` decimal(10,2),
	`field_voltage` decimal(10,2),
	`field_current` decimal(10,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `motor_selections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `motor_types` (
	`id` varchar(36) NOT NULL,
	`name` varchar(50) NOT NULL,
	`description` text,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `motor_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `motor_types_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `product_specs` (
	`id` varchar(36) NOT NULL,
	`product_id` varchar(36) NOT NULL,
	`is_ac` boolean NOT NULL DEFAULT true,
	`ac_kw` decimal(10,2),
	`pole_id` varchar(36),
	`voltage_id` varchar(36),
	`frequency_id` varchar(36),
	`ac_application_id` varchar(36),
	`total_motors` decimal,
	`motors_per_group` decimal,
	`dc_armature_voltage` decimal(10,2),
	`dc_kw` decimal(10,2),
	`dc_field_voltage` decimal(10,2),
	`dc_field_current` decimal(10,2),
	`dc_application_id` varchar(36),
	CONSTRAINT `product_specs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`sku` varchar(100) NOT NULL,
	`company_id` varchar(36) NOT NULL,
	`summary` text,
	`images` json,
	`datasheet_url` text,
	`document_url` text,
	`motor_type_id` varchar(36) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` text NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'admin',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `inquiries` ADD CONSTRAINT `inquiries_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `motor_selections` ADD CONSTRAINT `motor_selections_inquiry_id_inquiries_id_fk` FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `motor_selections` ADD CONSTRAINT `motor_selections_motor_type_id_motor_types_id_fk` FOREIGN KEY (`motor_type_id`) REFERENCES `motor_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `motor_selections` ADD CONSTRAINT `motor_selections_application_id_master_applications_id_fk` FOREIGN KEY (`application_id`) REFERENCES `master_applications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `motor_selections` ADD CONSTRAINT `motor_selections_pole_id_master_poles_id_fk` FOREIGN KEY (`pole_id`) REFERENCES `master_poles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `motor_selections` ADD CONSTRAINT `motor_selections_voltage_id_master_voltages_id_fk` FOREIGN KEY (`voltage_id`) REFERENCES `master_voltages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `motor_selections` ADD CONSTRAINT `motor_selections_frequency_id_master_frequencies_id_fk` FOREIGN KEY (`frequency_id`) REFERENCES `master_frequencies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_specs` ADD CONSTRAINT `product_specs_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_specs` ADD CONSTRAINT `product_specs_pole_id_master_poles_id_fk` FOREIGN KEY (`pole_id`) REFERENCES `master_poles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_specs` ADD CONSTRAINT `product_specs_voltage_id_master_voltages_id_fk` FOREIGN KEY (`voltage_id`) REFERENCES `master_voltages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_specs` ADD CONSTRAINT `product_specs_frequency_id_master_frequencies_id_fk` FOREIGN KEY (`frequency_id`) REFERENCES `master_frequencies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_specs` ADD CONSTRAINT `product_specs_ac_application_id_master_applications_id_fk` FOREIGN KEY (`ac_application_id`) REFERENCES `master_applications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_specs` ADD CONSTRAINT `product_specs_dc_application_id_master_applications_id_fk` FOREIGN KEY (`dc_application_id`) REFERENCES `master_applications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_motor_type_id_motor_types_id_fk` FOREIGN KEY (`motor_type_id`) REFERENCES `motor_types`(`id`) ON DELETE no action ON UPDATE no action;