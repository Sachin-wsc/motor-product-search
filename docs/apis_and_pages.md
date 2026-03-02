# Pages and API Endpoints

This document outlines all the standard UI pages and RESTful API endpoints for the Motor Driver Catalog & Selection Platform, derived from the project documentation and database schema.

## 1. Frontend Pages (UI)

### 1.1. Customer / Public Facing
*   **Landing Page / Smart Search (`/`)**: 
    *   The main entry point where users input parameters into the Equation-Based Smart Search tool.
*   **Standard Search & Catalog (`/products` or `/search`)**: 
    *   Allows filtering by Motor Type, Voltage, Current, etc.
    *   Also serves as the Results View for the Smart Search.
*   **Product Details Page (PDP) (`/product/[id]`)**: 
    *   Shows description, technical specifications, and datasheet download links.
*   **Product Comparison (`/compare`)**: 
    *   Side-by-side comparison of multiple motor drivers.
*   **Quote / Contact Request (`/contact` or `/inquiry`)**: 
    *   Lead generation form for bulk orders or specific inquiries.

### 1.2. Admin / Dashboard Facing
*   **Admin Login (`/admin/login`)**: 
    *   Secure login point for administrators.
*   **Admin Dashboard (`/admin/dashboard`)**: 
    *   Overview of platform metrics, recent inquiries, etc.
*   **Product Management List (`/admin/products`)**: 
    *   Table view of all motor drivers with quick actions.
*   **Add/Edit Product (`/admin/products/new`, `/admin/products/[id]`)**: 
    *   Form and CMS to create or update motor drivers and their specifications (with image/PDF uploads).
*   **Equation Configuration (`/admin/equations`)**: 
    *   Manage and tweak the constants or formulas used in the smart search engine.
*   **Inquiry Management (`/admin/inquiries`)**: 
    *   View, track, and update the status of quote requests.

---

## 2. Backend API Endpoints (REST)
All APIs follow the `/api/v1` namespace and are designed to be reused by the web UI and external Mobile Apps.

### 2.1. Authentication
*   `POST /api/v1/auth/login`
    *   Authenticate an admin user, returns a JSON Web Token (JWT).

### 2.2. Products & Catalog
*   `GET /api/v1/products`
    *   Fetch a list of products. Includes query parameters for standard search/filtering (e.g., `?motor_type=Stepper&min_voltage=12`).
*   `GET /api/v1/products/[id]`
    *   Fetch comprehensive details for a single product, including specifications.
*   `POST /api/v1/products` *(Admin Only)*
    *   Create a new motor driver record, including specifications.
*   `PUT /api/v1/products/[id]` *(Admin Only)*
    *   Update an existing motor driver or its specifications.
*   `DELETE /api/v1/products/[id]` *(Admin Only)*
    *   Delete or archive a motor driver.

### 2.3. Smart Search Engine
*   `POST /api/v1/engine/search`
    *   Accepts mathematical parameters (e.g., target RPM, load torque) from the UI.
    *   Executes the background equation logic to filter and recommend matching products.

### 2.4. Equation Configurations
*   `GET /api/v1/equations` *(Admin Only)*
    *   Fetch the list of all active formulas, constants, and logic rules.
*   `PUT /api/v1/equations/[id]` *(Admin Only)*
    *   Update a specific formula string or constant multiplier without needing a code deployment.

### 2.5. Inquiries (Quote Requests)
*   `POST /api/v1/inquiries`
    *   Submit a new quote request from a customer. Records their details and search inputs.
*   `GET /api/v1/inquiries` *(Admin Only)*
    *   Fetch a list of all submitted quote requests for the admin panel.
*   `PUT /api/v1/inquiries/[id]/status` *(Admin Only)*
    *   Update the status of an inquiry (e.g., from 'New' to 'Resolved').

### 2.6. File Uploads
*   `POST /api/v1/upload/image` *(Admin Only)*
    *   Upload a product image and return the securely hosted URL.
*   `POST /api/v1/upload/document` *(Admin Only)*
    *   Upload a PDF datasheet and return the securely hosted URL.
