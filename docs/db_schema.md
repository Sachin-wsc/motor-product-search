# Database Schema Outline (PostgreSQL & Drizzle ORM)

This document outlines the core tables required for the Motor Driver platform, including your excellent suggestion for a dynamic equation configuration table.

## 1. `users` (Admin Authentication)
Stores administrator credentials for accessing the dashboard.
*   `id`: UUID (Primary Key)
*   `email`: String (Unique)
*   `password_hash`: String
*   `role`: String (e.g., 'admin', 'super_admin')
*   `created_at`: Timestamp
*   `updated_at`: Timestamp

## 2. `products` (Core Motor Driver Information)
Stores the physical properties and metadata for the motor drivers.
*   `id`: UUID (Primary Key)
*   `name`: String (e.g., 'DBL-500 Brushless Driver')
*   `sku`: String (Unique identifier/Part Number)
*   `summary`: Text (Short description)
*   `image_url`: String (Path/URL to the product image)
*   `datasheet_url`: String (Path/URL to the PDF manual)
*   `motor_type`: Enum/String ('AC', 'DC', 'BLDC', 'Stepper', etc.)
*   `is_active`: Boolean (Default true)
*   `created_at`: Timestamp
*   `updated_at`: Timestamp

## 3. `product_specs` (Searchable Technical Data)
A 1-to-1 or 1-to-many relationship with `products`, storing the raw numerical values evaluated during the Smart Search. Using exact decimal types is crucial for accurate equation comparisons.
*   `id`: UUID (Primary Key)
*   `product_id`: UUID (Foreign Key -> `products.id`)
*   `min_voltage`: Decimal
*   `max_voltage`: Decimal
*   `max_continuous_current`: Decimal
*   `peak_current`: Decimal
*   `rated_power`: Decimal
*   `max_rpm`: Decimal (If applicable)
*   `efficiency_rating`: Decimal (Percentage, e.g., 0.95)
*   `weight_kg`: Decimal
*    *(Note: These exact fields can be adjusted based on the specific variables your equations need to check.)*

## 4. `equation_configs` (The Dynamic Logic Engine)
This table allows admins to modify the mathematical constants, algorithms, or weights used in the Smart Search without needing a developer to rewrite the backend code. 
*   `id`: UUID (Primary Key)
*   `key_name`: String (Unique, e.g., 'power_calculation', 'safety_margin_multiplier')
*   `formula_string`: String (e.g., `(voltage * current) * 0.85`, which the backend parser will evaluate securely)
*   `constant_value`: Decimal (Optional, for storing flat multipliers like a 1.25 safety factor)
*   `description`: Text (Explains to the admin what changing this does)
*   `is_active`: Boolean
*   `updated_at`: Timestamp

## 5. `inquiries` (Quote Requests)
Stores the submissions from users who found a motor driver via the Smart Search and want to buy or ask questions.
*   `id`: UUID (Primary Key)
*   `product_id`: UUID (Foreign Key -> `products.id`, Nullable)
*   `customer_name`: String
*   `customer_email`: String
*   `company_name`: String (Optional)
*   `message`: Text (e.g., specifically requested quantities or customization)
*   `user_search_inputs`: JSONB (Stores the exact equation inputs the user used to find this product—extremely helpful for your sales team!)
*   `status`: Enum/String ('New', 'Contacted', 'Resolved')
*   `created_at`: Timestamp

## How the Equation Engine Will Use This:
1.  The user inputs `Desired Torque` and `Desired Speed` on the UI.
2.  The backend fetches the active formulas and multipliers from `equation_configs`.
3.  The backend parses the formula, replacing variables with the user's inputs to determine the `Required Power`.
4.  The backend queries `product_specs` to find all items where `rated_power >= Required Power`.
5.  Results are returned via the APIs to the UI.
