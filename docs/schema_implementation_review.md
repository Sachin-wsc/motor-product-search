# Schema Implementation Review & Required Changes

Based on the updated `src/db/schema.ts`, the application's underlying data model has shifted significantly towards a highly relational, master-data-driven approach with specific delineations between AC and DC motor types. 

Below is a comprehensive module-by-module breakdown of the changes required to synchronize the current application with the new schema.

---

## 1. Database & ORM Layer
**Current State:** 
The application has defined the new schemas in `src/db/schema.ts` but the migrations might not be applied, or seed data for master tables is missing.
**Required Changes:**
- **Generate & Run Migrations:** Run `drizzle-kit generate:pg` and `drizzle-kit push:pg` (or apply migrations) to update the Postgres database.
- **Seed Master Data:** Create a seed script to populate `companies`, `motorTypes` (AC, DC, etc.), `masterPoles`, `masterVoltages`, `masterFrequencies`, and `masterApplications` so the application is functional upon deployment.

---

## 2. API / Backend Modules (`src/app/api/v1`)

### A. Master Data APIs (NEW)
**Required Changes:**
- Create new CRUD API routes for all master tables:
  - `/api/v1/master/motor-types`
  - `/api/v1/master/poles`
  - `/api/v1/master/voltages`
  - `/api/v1/master/frequencies`
  - `/api/v1/master/applications`
  - `/api/v1/master/companies`
- These endpoints will be consumed by the Admin panel dropdowns and Public search filters.

### B. Products API (`/api/v1/products`)
**Current State:** Handles basic string-based `motorType` and unstructured generic `specs` (e.g., `minVoltage`, `peakCurrent`).
**Required Changes:**
- Modify `POST` and `PUT` endpoints to accept `motorTypeId` instead of a static string for `motorType`.
- Update the nested insertion of `productSpecs` to map to the new AC and DC specific columns:
  - **AC Fields:** `acKw`, `poleId`, `voltageId`, `frequencyId`, `acApplicationId`, `totalMotors`, `motorsPerGroup`
  - **DC Fields:** `dcArmatureVoltage`, `dcKw`, `dcFieldVoltage`, `dcFieldCurrent`, `dcApplicationId`
- Implement validation to ensure that if a product is an AC motor, DC fields are null, and vice versa.

### C. Inquiries & Motor Selections APIs (NEW)
**Required Changes:**
- Create `/api/v1/inquiries` POST route to handle form submissions from the Smart Selection Engine (saving customer lead info and search context).
- Create `/api/v1/motor-selections` to record the exact motor parameters computed by the engine.

---

## 3. Admin Frontend (`src/app/admin`)

### A. Product Management Forms
**Current State:** `new-product-modal.tsx` and `edit-product-modal.tsx` use hardcoded select options for motor types and inputs for generic specs.
**Required Changes:**
- **Dynamic Master Data Loading with Autocomplete:** Fetch from the new Master Data APIs `onMount` to populate dropdowns. 
- **Creatable Dropdowns:** All master data fields (`Company`, `Motor Type`, `Poles`, `Voltages`, `Frequencies`, `Applications`) must use **`react-select` (specifically CreatableSelect)**. If a user types a value that does not exist, the component should automatically trigger an API call to create that new master entry on the fly and then select it.
- **Dynamic Spec Forms:** Implement conditional rendering based on the selected `Motor Type`:
  - If **AC Motor** is selected: Show Autocomplete dropdowns for Poles (`masterPoles`), Voltages (`masterVoltages`), Frequencies (`masterFrequencies`), Applications, and numeric inputs for AC kW, Total Motors, etc.
  - If **DC Motor** is selected: Show inputs for Armature Voltage, DC kW, Field Voltage, Field Current, and an Application Autocomplete dropdown.
- Update the `FormData` payload mapping to match the new strict schema before posting to `/api/v1/products`.

### B. Master Data Management Pages (NEW)
**Required Changes:**
- Create dedicated admin pages (e.g., `/admin/master-data/poles`, `/admin/master-data/voltages`) to perform CRUD operations on these master tables. This allows the admin to freely expand dropdown options without changing code.

### C. Inquiries Dashboard (NEW)
**Required Changes:**
- Create an Admin page `/admin/inquiries` to list incoming customer inquiries.
- Show details linking the Inquiry -> `motorSelections` -> Matched `product`.

---

## 4. Public Frontend (`src/app/(public)`)

### A. Smart Search Engine (`/page.tsx` & `/products/...`)
**Current State:** Search bar accepts basic inputs like `torque` and `speed`.
**Required Changes:**
- **Advanced Parameter Inputs:** The search page or a subsequent wizard must now capture inputs that map to the new schema metrics (Application Type, Grid Frequencies/Voltages) if applicable.
- **Equation Engine Integration:** The frontend must send these parameters to the backend (or compute locally via `equationConfigs`) to find matching products based on AC/DC rules rather than basic filtering.

### B. Inquiry Form (NEW)
**Required Changes:**
- After a motor is selected/recommended, prompt the user with a lead capture form (Customer Name, Email, Company, Message).
- Submit this payload along with the calculated `Motor Selection` parameters to `/api/v1/inquiries`.

---

## Summary
The primary focus must be moving away from the "generic spec" model to a "strict, relation-driven AC/DC split" model. This touches the **Product CRUD logic**, demands the creation of **Master Data tables/UIs**, and establishes a foundational **Inquiry/Lead capture pipeline**.
