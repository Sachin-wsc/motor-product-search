# Motor Driver Catalog & Selection Platform

## 1. Project Overview
A specialized product catalog and selection platform for motor drivers (AC/DC, Stepper, BLDC, etc.). The platform allows administrators to manage complex technical products and enables engineers/customers to find the exact motor driver they need using an advanced equation-based search algorithm.

## 2. Tech Stack
- **Frontend & Framework:** Next.js (configured for Client-Side Rendering - CSR), React
- **Styling & UI:** Tailwind CSS, shadcn/ui
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** Custom JWT (JSON Web Tokens)
- **API Architecture:** Standardized RESTful APIs to serve both the web UI and external Mobile App

## 3. Feature List

### 3.1. Customer / Public Facing
*   **Product Details (PDP):** Comprehensive page for each driver including:
    *   Images and Description
    *   Detailed Technical Specifications (Voltage, Current, Power, Motor Type)
    *   Datasheet/PDF Download Links
*   **Standard Search & Filtering:** Filter by Motor Type, Voltage range, Current Rating, etc.
*   **Equation-Based Smart Search:** 
    *   Input specific electrical or mechanical requirements (e.g., Target RPM, Load Torque, Input Power).
    *   System runs background equations to filter and recommend the exact driver matches.
*   **Comparison Tool:** Select multiple drivers and compare their specifications side-by-side.
*   **Contact / Quote Request:** Lead generation form for bulk orders or specific technical inquiries.

### 3.2. Admin / Dashboard
*   **Secure Authentication:** Admin login to manage the platform.
*   **Product Management:** 
    *   CRUD (Create, Read, Update, Delete) operations for motor drivers.
    *   Support for dynamic technical fields and image/document uploads.
*   **Equation Logic Configuration:** (Optional) Ability to tweak the constants or logic for the equation-based search from the admin panel.
*   **Lead/Inquiry Management:** View and respond to quote requests.

## 4. User Flow

### 4.1. Core Customer Flow (Search & Discovery)
1.  **Landing Page:** User arrives at the site and is immediately presented with the "Smart Search" tool (No standard directory/listing).
2.  **Smart Search Entry:** User enters their known mechanical/electrical parameters (e.g., desired torque and speed).
3.  **Processing:** System processes the equation and filters the database for drivers that meet or exceed the requirements.
4.  **Results View:** User sees a tailored list of matching motor drivers based *only* on their equation input.
5.  **Product Evaluation:** User clicks on a driver, reviews specifications, and downloads the PDF datasheet.
6.  **Action:** User clicks "Request Quote" or "Contact Us" to initiate a purchase discussion.

### 4.2. Admin Flow (Inventory Management)
1.  **Login:** Admin securely logs into the dashboard.
2.  **Add Product:** Admin fills out the standard info (Title, Images) and technical specs (Voltage, Current, Steps/Rev).
3.  **Uploads:** Admin attaches the relevant PDF datasheet.
4.  **Publish:** The new motor driver is immediately available in the catalog and the equation search engine.

## 5. Task List & Development Roadmap

### Phase 1: Planning & Setup
- [ ] Initialize Next.js project with Tailwind CSS and shadcn/ui.
- [ ] Set up PostgreSQL database and configure Drizzle ORM.
- [ ] Define precise mathematical equations for the Smart Search.
- [ ] Design the high-level Database Schema (Users, Products, Specifications).

### Phase 2: Backend & Core API
- [ ] Create Drizzle schemas (Products, Specs, Categories, Logs).
- [ ] Generate and push database migrations.
- [ ] Develop custom JWT authentication service (Login, Token Generation, Middleware).
- [ ] Set up standardized REST API Routes (`/api/v1/...`) for all data operations (ensuring reuse for mobile).
- [ ] Build the logic for the Equation-Based Search algorithm exposed entirely via an API endpoint.

### Phase 3: Admin Dashboard (CMS)
- [ ] Implement Admin Login UI using CSR, hooking into the JWT API.
- [ ] Build the Admin Dashboard layout with shadcn/ui.
- [ ] Create forms for adding, editing, and deleting products (using CSR hooks to call API).
- [ ] Implement file upload handling for product images and PDF datasheets.

### Phase 4: Frontend Catalog & Engine
- [ ] Build the main layouts (Nav, Footer, standard responsive design).
- [ ] Ensure all UI components and pages are built as Client Components (CSR), fetching data securely from the API.
- [ ] Build the Home Page centered entirely around the Equation-Based Smart Search form.
- [ ] Implement the Smart Search results list/grid view.
- [ ] Build the Product Details Page (PDP) showing all specs and datasheet links.
- [ ] Create the "Request Quote" / Inquiry modal and connect it to email/database.

### Phase 5: Polish & Launch
- [ ] Implement the Product Comparison feature.
- [ ] End-to-end testing of the equation logic with real-world mechanical data.
- [ ] SEO Optimization (Meta tags, semantic HTML).
- [ ] Final UI/UX polish (loading states, toast notifications).
- [ ] Deploy to production (e.g., Vercel + Neon/Supabase DB).