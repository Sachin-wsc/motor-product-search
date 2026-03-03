# Product Search API Documentation

This document outlines the available REST API endpoints in the Product Search application, providing details on request payloads, form data parameters, and example responses.

Base URL: `/api/v1`

---

## Authentication

### 1. Admin Login
**Endpoint**: `POST /auth/login`
**Description**: Authenticates an admin user and returns a JWT token.

**Request Payload (JSON)**
```json
{
  "email": "admin@example.com",
  "password": "yourpassword123"
}
```

**Success Response (200 OK)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Error Response (401 Unauthorized)**
```json
{
  "error": "Invalid credentials"
}
```

---

## Engine Search

### 2. Smart Product Search
**Endpoint**: `POST /engine/search`
**Description**: Calculates required power based on mechanical parameters and finds matching products.

**Request Payload (JSON)**
```json
{
  "desiredTorque": 15.5,
  "desiredSpeed": 2000
}
```

**Success Response (200 OK)**
```json
{
  "inputs": {
    "desiredTorque": 15.5,
    "desiredSpeed": 2000
  },
  "calculatedRequiredPower": 31000,
  "results": [
    {
      "id": "prod-1234",
      "name": "High Torque Stepper Motor",
      "sku": "SM-2000",
      "motorType": "Stepper",
      "imageUrl": "/uploads/1709384592-motor.png",
      "specs": {
        "id": "spec-1234",
        "productId": "prod-1234",
        "ratedPower": "35000"
      }
    }
  ]
}
```

---

## Products

### 3. List Products
**Endpoint**: `GET /products`
**Description**: Retrieves a list of all products. Accepts an optional `motor_type` query parameter.

**Query Parameters**
- `motor_type` (optional): Filter products by their motor type (e.g., `?motor_type=Stepper`).

**Success Response (200 OK)**
```json
[
  {
    "id": "prod-1234",
    "name": "High Torque Stepper Motor",
    "sku": "SM-2000",
    "summary": "Excellent for precision control.",
    "motorType": "Stepper",
    "imageUrl": "/uploads/1709384592-motor.png",
    "isActive": true,
    "createdAt": "2024-03-02T10:00:00Z"
  }
]
```

### 4. Create Product
**Endpoint**: `POST /products`
**Description**: Creates a new product. Accepts `multipart/form-data` to support image uploads.

**Request Data (`multipart/form-data`)**
- `name` (string, required): The product name.
- `sku` (string, required): The product SKU.
- `summary` (string, optional): A brief summary of the product.
- `motorType` (string, required): Type of motor (e.g., "Stepper", "Servo").
- `specs` (string, optional): JSON stringified representation of product specifications (e.g., `{"ratedPower": 1500}`).
- `image` (File, optional): An image file to be uploaded.

**Success Response (201 Created)**
```json
{
  "id": "prod-1234",
  "name": "High Torque Stepper Motor",
  "sku": "SM-2000",
  "summary": "Excellent for precision control.",
  "motorType": "Stepper",
  "imageUrl": "/uploads/1709384592-motor.png",
  "isActive": true,
  "createdAt": "2024-03-02T10:00:00Z",
  "updatedAt": "2024-03-02T10:00:00Z"
}
```

### 5. Get Product Details
**Endpoint**: `GET /products/:id`
**Description**: Fetches a single product and its associated specifications.

**Success Response (200 OK)**
```json
{
  "id": "prod-1234",
  "name": "High Torque Stepper Motor",
  "sku": "SM-2000",
  "specs": {
    "id": "spec-1234",
    "productId": "prod-1234",
    "ratedPower": "35000",
    "voltage": "24V"
  }
}
```

### 6. Update Product
**Endpoint**: `PUT /products/:id`
**Description**: Updates an existing product and/or its specifications using `multipart/form-data`.

**Request Data (`multipart/form-data`)**
- `name` (string, optional)
- `sku` (string, optional)
- `summary` (string, optional)
- `motorType` (string, optional)
- `isActive` (string, optional): `"true"` or `"false"`.
- `specs` (string, optional): JSON stringified object of specs to update or create.
- `image` (File, optional)

**Success Response (200 OK)**
```json
{
  ...updatedProductBaseFields,
  "specs": {
    "id": "spec-1234",
    "ratedPower": "40000"
  }
}
```

### 7. Delete Product
**Endpoint**: `DELETE /products/:id`
**Description**: Deletes a single product by ID.

**Success Response (200 OK)**
```json
{
  "success": true
}
```

---

## Equations / Configurations

### 8. List Equation Configs
**Endpoint**: `GET /equations`
**Description**: Retrieves all equation configurations.

**Success Response (200 OK)**
```json
[
  {
    "id": "eq-111",
    "keyName": "safety_margin_multiplier",
    "formulaString": null,
    "constantValue": "1.2",
    "description": "Multiplier for calculated power to determine safety margin",
    "isActive": true,
    "createdAt": "2024-03-02T10:00:00Z"
  }
]
```

### 9. Create Equation Config
**Endpoint**: `POST /equations`
**Description**: Creates a new equation / constant configuration. When a new equation is created, all previous equations are deactivated automatically.

**Request Payload (JSON)**
```json
{
  "keyName": "safety_margin_multiplier",
  "formulaString": "T * S",
  "constantValue": "1.5",
  "description": "Calculates safe operational boundary."
}
```

**Success Response (201 Created)**
```json
{
  "id": "eq-112",
  "keyName": "safety_margin_multiplier",
  "constantValue": "1.5",
  "isActive": true,
  "createdAt": "2024-03-02T10:05:00Z"
}
```

### 10. Update Equation Config
**Endpoint**: `PATCH /equations/:id`
**Description**: Updates a specific equation. Passing `"isActive": true` disables all other equations.

**Request Payload (JSON)**
```json
{
  "constantValue": "1.8",
  "isActive": true
}
```

**Success Response (200 OK)**
```json
{
  "id": "eq-112",
  "constantValue": "1.8",
  "isActive": true,
  "updatedAt": "2024-03-02T11:00:00Z"
}
```

---

## Inquiries

### 11. List Inquiries
**Endpoint**: `GET /inquiries`
**Description**: Retrieves all user inquiries/leads. Should be protected for admin usage.

**Success Response (200 OK)**
```json
[
  {
    "id": "inq-1",
    "productId": "prod-1234",
    "customerName": "Jane Doe",
    "customerEmail": "jane@example.com",
    "companyName": "Tech Corp",
    "message": "I would like to order 50 units.",
    "userSearchInputs": { "desiredTorque": 15, "desiredSpeed": 1000 },
    "status": "new",
    "createdAt": "2024-03-02T10:00:00Z"
  }
]
```

### 12. Create Inquiry
**Endpoint**: `POST /inquiries`
**Description**: Submits a new inquiry from a customer, optionally linking a product or their search parameters.

**Request Payload (JSON)**
```json
{
  "productId": "prod-1234",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "companyName": "Tech Corp",
  "message": "Interested in bulk pricing.",
  "userSearchInputs": {
    "desiredTorque": 20,
    "desiredSpeed": 1500
  }
}
```

**Success Response (201 Created)**
```json
{
  "id": "inq-2",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "status": "new"
}
```

### 13. Update Inquiry Status
**Endpoint**: `PATCH /inquiries/:id`
**Description**: Updates an inquiry's status (e.g., from `new` to `reviewed`).

**Request Payload (JSON)**
```json
{
  "status": "reviewed"
}
```

**Success Response (200 OK)**
```json
{
  "id": "inq-1",
  "status": "reviewed",
  "updatedAt": "2024-03-02T12:00:00Z"
}
```

---

## Statistics

### 14. Get Dashboard Stats
**Endpoint**: `GET /stats`
**Description**: Returns overall counts for dashboard reporting (total products, active equations, total inquiries).

**Success Response (200 OK)**
```json
{
  "totalProducts": 42,
  "activeEquations": 1,
  "totalInquiries": 15
}
```
