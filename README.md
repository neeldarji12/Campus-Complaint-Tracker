# 🏫 Campus Complaint Tracker - REST API

A robust, production-grade backend REST API built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** to register, track, filter, and manage campus student complaints without any frontend UI dependency.

---

## 📋 Features

- **Full CRUD Operations**: Register, view, update details, update status, and delete complaints.
- **Dedicated Status Flow**: Dedicated endpoint (`PATCH /api/complaints/:id/status`) restricted to strictly valid lifecycle statuses (`Open`, `In Progress`, `Resolved`, `Rejected`).
- **Default Status**: Newly filed complaints default automatically to `Open`.
- **Filtering by Query Parameters**: Filter complaints by `status`, `category`, and `priority`.
- **Case-Insensitive Search**: Search complaints by `title` or `studentName` via MongoDB regex query (`?search=...`).
- **Automatic Timestamps**: Auto-managed `createdAt` and `updatedAt` for full audit trails.
- **Robust Validation & Error Handling**: Clean 400 Bad Request responses for missing fields, malformed ObjectIds, or invalid enum values; 404 for non-existent complaints.
- **Zero-Config Database Engine**: Automatically connects to local MongoDB or MongoDB Atlas; seamlessly falls back to an in-memory database instance if local MongoDB is not running.
- **Postman Ready**: Pre-built Postman Collection JSON included for instant 1-click import and testing.

---

## 📁 Project Structure (MVC Architecture)

```text
campus-complaint-tracker/
├── config/
│   └── db.js                        # Database connection logic & in-memory fallback
├── controllers/
│   └── complaintController.js       # Business logic for all complaint endpoints
├── models/
│   └── Complaint.js                 # Mongoose schema, validation rules & enums
├── routes/
│   └── complaintRoutes.js           # REST endpoint mapping
├── scripts/
│   ├── seed.js                      # Database seeding script with sample data
│   └── test-api.js                  # Automated test runner (25 assertions)
├── .env                             # Environment configuration
├── .env.example                     # Environment template
├── .gitignore                       # Git ignored files
├── Campus_Complaint_Tracker.postman_collection.json  # Postman export
├── package.json                     # Project scripts and dependencies
└── server.js                        # Express server entry point & middleware
```

---

## 🗄️ Complaint Data Model

| Field | Type | Required | Allowed Values / Default | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `studentName` | String | **Yes** | — | Trimmed, max 100 chars |
| `email` | String | **Yes** | — | Lowercase, email regex validation |
| `title` | String | **Yes** | — | Trimmed, max 150 chars |
| `description` | String | **Yes** | — | Trimmed, max 2000 chars |
| `category` | String | No | `'Infrastructure'`, `'IT'`, `'Cleanliness'`, `'Security'`, `'Other'` | Default: `'Other'` |
| `priority` | String | No | `'Low'`, `'Medium'`, `'High'` | Default: `'Medium'` |
| `location` | String | No | Default: `'General Campus'` | Campus building / room / area |
| `status` | String | No | `'Open'`, `'In Progress'`, `'Resolved'`, `'Rejected'` | Default: `'Open'` |
| `createdAt` | Date | Auto | Current timestamp | Managed by Mongoose |
| `updatedAt` | Date | Auto | Current timestamp | Managed by Mongoose |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
The `.env` file is already pre-configured:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/campus_complaints
```
> **Note**: If local MongoDB is not running, the application will automatically spin up an in-memory MongoDB instance without crashing or requiring any manual setup.

### 3. Run Sample Data Seeder (Optional)
To pre-populate 5 realistic campus complaints into MongoDB:
```bash
npm run seed
```

### 4. Start the Server
- **Development mode** (auto-reload on code change):
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```
Server starts at: `http://localhost:5000`

### 5. Run Automated API Tests
To execute all 25 endpoint, filter, search, and validation assertions:
```bash
npm run test:api
```

---

## 📡 REST API Reference

### 1. Base / Health Check
- **`GET /`**
  - **Description**: Returns API health status and available endpoints.
  - **Response `200 OK`**:
    ```json
    {
      "success": true,
      "message": "Welcome to Campus Complaint Tracker API",
      "endpoints": { ... }
    }
    ```

---

### 2. Create Complaint
- **`POST /api/complaints`**
- **Status**: `201 Created`
- **Request Body (JSON)**:
  ```json
  {
    "studentName": "Aarav Patel",
    "email": "aarav.patel@campus.edu",
    "title": "Broken Projector in Lecture Hall 3",
    "description": "The ceiling projector is flickering constantly and shuts down after 10 minutes of usage.",
    "category": "Infrastructure",
    "priority": "High",
    "location": "Lecture Hall 3, Block A"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Complaint registered successfully",
    "data": {
      "_id": "66fde01a...",
      "studentName": "Aarav Patel",
      "email": "aarav.patel@campus.edu",
      "title": "Broken Projector in Lecture Hall 3",
      "description": "The ceiling projector is flickering constantly and shuts down after 10 minutes of usage.",
      "category": "Infrastructure",
      "priority": "High",
      "location": "Lecture Hall 3, Block A",
      "status": "Open",
      "createdAt": "2026-10-03T05:10:00.000Z",
      "updatedAt": "2026-10-03T05:10:00.000Z"
    }
  }
  ```

---

### 3. Get All Complaints (With Filter & Search)
- **`GET /api/complaints`**
- **Query Parameters (All Optional)**:
  - `?status=Open` (or `In Progress`, `Resolved`, `Rejected`)
  - `?category=IT` (or `Infrastructure`, `Cleanliness`, `Security`, `Other`)
  - `?priority=High` (or `Low`, `Medium`)
  - `?search=Projector` (searches `title` and `studentName`, case-insensitive)
- **Example**: `GET /api/complaints?category=Infrastructure&priority=High`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [ ... ]
  }
  ```

---

### 4. Get Complaint by ID
- **`GET /api/complaints/:id`**
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- **Response `400 Bad Request`** (Malformed ID):
  ```json
  {
    "success": false,
    "message": "Invalid complaint ID format: \"invalid-id\""
  }
  ```
- **Response `404 Not Found`** (ID not in database):
  ```json
  {
    "success": false,
    "message": "Complaint not found with ID: 507f1f77bcf86cd799439011"
  }
  ```

---

### 5. Update Complaint Details
- **`PUT /api/complaints/:id`**
- **Request Body (JSON)**:
  ```json
  {
    "title": "Broken Projector in Lecture Hall 3 (Bulb Replaced)",
    "priority": "Medium",
    "location": "Lecture Hall 3, Block A (Near Podium)"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Complaint updated successfully",
    "data": { ... }
  }
  ```

---

### 6. Update Complaint Status Only
- **`PATCH /api/complaints/:id/status`**
- **Request Body (JSON)**:
  ```json
  {
    "status": "In Progress"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Complaint status updated to \"In Progress\" successfully",
    "data": { ... }
  }
  ```
- **Response `400 Bad Request`** (Invalid Status Value):
  ```json
  {
    "success": false,
    "message": "Invalid status value \"Archived\". Allowed values are: Open, In Progress, Resolved, Rejected"
  }
  ```

---

### 7. Delete Complaint
- **`DELETE /api/complaints/:id`**
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Complaint deleted successfully",
    "data": {}
  }
  ```

---

## 📮 Postman Testing Guide

1. Open **Postman**.
2. Click **Import** (top left).
3. Drag & drop or browse to `Campus_Complaint_Tracker.postman_collection.json` inside this repository.
4. The imported collection contains 4 folders:
   - **1. Health & Welcome Check**
   - **2. Complaints CRUD**
   - **3. Filters & Search**
   - **4. Validation & Error Handling (Negative Tests)**
5. Running `Create Complaint 1` will **automatically save the complaint ID** to the collection variable `{{complaintId}}`, so all subsequent GET, PUT, PATCH, and DELETE requests will work out-of-the-box without manual copying.

---

## ✅ Postman Testing Checklist Compliance

| Checklist Item | Status | Verification Detail |
| :--- | :---: | :--- |
| **At least 4 sample complaints with different categories, priorities, and statuses** | ✅ Passed | Infrastructure (High, Open), IT (Medium, In Progress), Cleanliness (Low, Resolved), Security (High, Open). |
| **Test all CRUD APIs (Create, Read All, Read Single, Update, Delete)** | ✅ Passed | POST, GET, GET /:id, PUT /:id, DELETE /:id verified. |
| **Test dedicated status change endpoint (PATCH /:id/status)** | ✅ Passed | Only accepts `Open`, `In Progress`, `Resolved`, `Rejected`. |
| **Test filter queries (`?status=`, `?category=`, `?priority=`)** | ✅ Passed | Precise MongoDB query matching verified. |
| **Test search query (`?search=`)** | ✅ Passed | Case-insensitive regex matching across `title` and `studentName`. |
| **Test invalid ID format handling** | ✅ Passed | Returns `400 Bad Request` for malformed MongoDB ObjectIds. |
| **Test non-existent ID handling** | ✅ Passed | Returns `404 Not Found` for valid formatted IDs that do not exist. |
| **Test missing required fields** | ✅ Passed | Returns `400 Bad Request` with exact field error messages. |
| **Test invalid status rejection** | ✅ Passed | Returns `400 Bad Request` rejecting invalid status values. |
| **Consistent response formatting** | ✅ Passed | Every response returns `{ success, message?, data?, count? }`. |
