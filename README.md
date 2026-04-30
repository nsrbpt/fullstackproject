# Exam Seating Allocation System

Full-stack MERN application for automated exam seating allocation with department-aware interleaving, column-wise zig-zag seating, JWT-protected APIs, and PDF export.

## 1. MongoDB Migration: Docker to MongoDB Atlas

This project already reads database settings from `MONGO_URI`, so no backend code changes are required for Atlas migration.

### 1.1 Create Atlas Cluster
1. Go to MongoDB Atlas and create a project.
2. Create a cluster (M0 free tier is enough for development).
3. Create a database user with password authentication.
4. In Network Access, add your current IP (or `0.0.0.0/0` temporarily for testing).
5. Click Connect -> Drivers -> copy the Node.js connection string.

### 1.2 Update Backend Environment
Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/exam_seating_db?retryWrites=true&w=majority
JWT_SECRET=supersecret_jwt_key_exam_seating_admin
```

Notes:
- URL-encode special characters in password.
- Keep `JWT_SECRET` strong in production.
- Database name can stay `exam_seating_db`.

### 1.3 Stop Local Docker Mongo (Optional)
If you were using Docker Mongo:

```bash
docker stop exam-mongo
docker rm exam-mongo
```

### 1.4 Verify Atlas Connection
From `backend`:

```bash
npm start
```

Expected server log:

```text
MongoDB Connected: <atlas-hostname>
Server running on port 5000
```

## 2. System Architecture

### 2.1 High-Level Flow
1. React frontend sends API requests via RTK Query.
2. Express backend validates/admin-authenticates requests.
3. Services perform business logic (auth, upload, allocation).
4. Mongoose models persist/retrieve data from MongoDB Atlas.
5. Allocation service generates QR payload per seat and stores allocation records.
6. Frontend renders seating grids and exports reports as PDF.

### 2.2 Components
- Frontend (`frontend`): React + Vite + Redux Toolkit + RTK Query.
- Backend (`backend`): Express API, route-level services.
- Database: MongoDB Atlas via `mongoose.connect(process.env.MONGO_URI)`.
- Auth: JWT tokens, `Authorization: Bearer <token>` header.

### 2.3 Core Data Models
- `AdminUser`: admin identity and bcrypt password hash.
- `Student`: roll number, name, department.
- `Hall`: hall name, rows, cols, capacity.
- `SeatingAllocation`: examId + student + hall + seat coordinates + QR URL.

## 3. Algorithms Used

### 3.1 Department Interleaving
Purpose: reduce adjacent clustering of students from the same department.

Process:
1. Group students by `department`.
2. Round-robin merge across department queues.
3. Resulting `mergedStudents` list alternates departments as much as possible.

Approximate complexity:
- Time: $O(n)$
- Space: $O(n)$

### 3.2 Column-Wise Zig-Zag Seat Assignment
Purpose: fill halls in vertical sweep while alternating direction each column.

Process per hall:
1. Iterate columns from left to right.
2. Odd column: assign rows top-to-bottom.
3. Even column: assign rows bottom-to-top.
4. Continue until all students are assigned or hall capacity is exhausted.

Seat label format:
- `R<row>C<col>` (example: `R3C2`)

Approximate complexity:
- Time: $O(n)$ for assignment itself
- Space: $O(n)$ for allocation records

### 3.3 Conflict Check
Before assignment:
- Compute total capacity $= \sum hall.capacity$
- If total students $>$ total capacity, allocation is aborted with a clear error message.

## 4. Setup and Run Instructions

## 4.1 Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas cluster + credentials

### 4.2 Backend Setup
```bash
cd backend
npm install
```

Create/update `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/exam_seating_db?retryWrites=true&w=majority
JWT_SECRET=supersecret_jwt_key_exam_seating_admin
ADMIN_SETUP_KEY=<one-time-bootstrap-key>
```

Security note:
- Keep `ADMIN_SETUP_KEY` empty in production after initial admin bootstrap to disable open registration.

Optional seed (recommended first run):

```bash
npm run seed
```

Start backend:

```bash
npm start
```

Backend URL: `http://localhost:5000`

### 4.3 Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Optional frontend environment (`frontend/.env`):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Frontend URL: `http://localhost:5173`

### 4.4 Default Seed Credentials
- Admin ID: `17903`
- Password: `040807`

Alternative custom user (if created manually):
- Admin ID: `srinivas`
- Password: `12334`

### 4.5 Basic Usage Flow
1. Login with admin credentials.
2. Upload student data (`.txt` or `.xlsx`) in Data Ingestion.
3. Generate allocation by providing an `examId`.
4. Open Seating Grids to inspect/export reports.

## 5. Project File Structure

```text
fullstackproject/
├── datasetofstudents.txt
├── README.md
├── RUN_INSTRUCTIONS.txt
├── backend/
│   ├── index.js
│   ├── package.json
│   └── src/
│       ├── api-gateway/
│       │   └── middleware/
│       │       └── auth.middleware.js
│       ├── models/
│       │   ├── AdminUser.js
│       │   ├── Hall.js
│       │   ├── SeatingAllocation.js
│       │   └── Student.js
│       ├── scripts/
│       │   ├── add-user.js
│       │   ├── reset.js
│       │   └── seed.js
│       ├── services/
│       │   ├── allocation-service/
│       │   │   ├── allocation.controller.js
│       │   │   └── allocation.routes.js
│       │   ├── auth-service/
│       │   │   ├── auth.controller.js
│       │   │   └── auth.routes.js
│       │   └── upload-service/
│       │       ├── upload.controller.js
│       │       └── upload.routes.js
│       └── utils/
│           └── db.js
└── frontend/
		├── eslint.config.js
		├── index.html
		├── package.json
		├── README.md
		├── vite.config.js
		├── public/
		└── src/
				├── App.css
				├── App.jsx
				├── index.css
				├── main.jsx
				├── assets/
				├── components/
				│   └── common/
				│       └── DashboardLayout.jsx
				├── features/
				│   ├── apiSlice.js
				│   ├── authSlice.js
				│   └── store.js
				├── pages/
				│   ├── Dashboard.jsx
				│   ├── Login.jsx
				│   ├── SeatingList.jsx
				│   ├── SeatingView.jsx
				│   └── Upload.jsx
				└── services/
						└── pdfService.js
```

## 6. API Overview

- `POST /api/auth/login`: admin authentication
- `POST /api/auth/register`: bootstrap admin creation (requires `x-setup-key` header)
- `GET /api/health`: health check
- `POST /api/upload/students`: ingest students file
- `POST /api/allocation/generate`: generate seating for `examId`
- `GET /api/allocation/:examId`: fetch allocation for one exam
- `GET /api/allocations/all`: fetch all allocations (admin)
- `GET /api/stats`: dashboard stats (admin)
- `DELETE /api/allocation/:examId`: delete one exam allocation
- `GET /api/halls`: list halls
- `POST /api/halls`: create hall
- `PUT /api/halls/:id`: update hall
- `DELETE /api/halls/:id`: delete hall (blocked if allocations exist)

## 7. Troubleshooting

- `MongoNetworkError` / timeout:
	- Verify Atlas IP allowlist and credentials.
- `bad auth : Authentication failed`:
	- Check username/password and URL encoding.
- `Allocation already exists for this Exam ID`:
	- Use a new `examId` or delete old allocation first.
- Capacity conflict error:
	- Increase number of halls/capacity before generating.
