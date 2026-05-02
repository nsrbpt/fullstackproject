

🎓 Exam Seating Allocation System

A full-stack MERN application for automated exam seating allocation with department-aware interleaving, column-wise zig-zag seating, JWT-protected APIs, and PDF export.


---

🚀 1. MongoDB Migration: Docker → MongoDB Atlas

This project already reads database settings from MONGO_URI, so no backend code changes are required for Atlas migration.

1.1 Create Atlas Cluster

1. Go to MongoDB Atlas and create a project


2. Create a cluster (M0 free tier is sufficient)


3. Create a database user with password authentication


4. In Network Access, add your IP (or 0.0.0.0/0 for testing)


5. Click Connect → Drivers → Node.js and copy connection string




---

1.2 Update Backend Environment

Edit backend/.env:

PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/exam_seating_db?retryWrites=true&w=majority
JWT_SECRET=supersecret_jwt_key_exam_seating_admin

Notes:

URL-encode special characters in password

Keep JWT_SECRET strong in production

Database name: exam_seating_db



---

1.3 Stop Local Docker Mongo (Optional)

docker stop exam-mongo
docker rm exam-mongo


---

1.4 Verify Atlas Connection

cd backend
npm start

Expected output:

MongoDB Connected: <atlas-hostname>
Server running on port 5000


---

🏗️ 2. System Architecture

2.1 High-Level Flow

1. React frontend sends API requests via RTK Query


2. Express backend authenticates requests (JWT)


3. Services handle business logic


4. Mongoose interacts with MongoDB Atlas


5. Allocation service assigns seats + generates QR payload


6. Frontend displays seating and exports PDF




---

2.2 Components

Layer	Tech Stack

Frontend	React + Vite + Redux Toolkit + RTK Query
Backend	Node.js + Express
Database	MongoDB Atlas
Auth	JWT



---

2.3 Core Data Models

AdminUser → admin login + password hash

Student → roll number, name, department

Hall → hall name, rows, cols, capacity

SeatingAllocation → examId, student, hall, seat, QR



---

⚙️ 3. Algorithms Used

3.1 Department Interleaving

Goal: Avoid same-department clustering

Steps:

1. Group students by department


2. Apply round-robin merge


3. Generate balanced student order



Complexity:

Time: O(n)

Space: O(n)



---

3.2 Column-Wise Zig-Zag Seating

Goal: Efficient seating distribution

Steps:

1. Traverse columns left → right


2. Odd columns → top → bottom


3. Even columns → bottom → top



Seat Format:

R<row>C<col>
Example: R3C2

Complexity:

Time: O(n)

Space: O(n)



---

3.3 Conflict Check

Before allocation:

Total Capacity = sum(hall.capacity)

If students > capacity → ERROR


---

🛠️ 4. Setup & Run Instructions

4.1 Prerequisites

Node.js 18+

npm 9+

MongoDB Atlas account



---

4.2 Backend Setup

cd backend
npm install

Create .env:

PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/exam_seating_db?retryWrites=true&w=majority
JWT_SECRET=supersecret_jwt_key_exam_seating_admin
ADMIN_SETUP_KEY=<one-time-bootstrap-key>

Run seed (first time):

npm run seed

Start server:

npm start

Backend URL:
👉 http://localhost:5000


---

4.3 Frontend Setup

cd frontend
npm install
npm run dev

Optional .env:

VITE_API_BASE_URL=http://localhost:5000/api

Frontend URL:
👉 http://localhost:5173


---

4.4 Default Credentials

Admin ID: 17903

Password: 040807


Alternate:

Admin ID: srinivas

Password: 12334



---

4.5 Usage Flow

1. Login


2. Upload student data (.txt / .xlsx)


3. Generate allocation using examId


4. View seating grid & export PDF




---

📁 5. Project Structure

fullstackproject/
├── backend/
│   ├── index.js
│   └── src/
│       ├── models/
│       ├── services/
│       ├── scripts/
│       └── utils/
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── features/
    │   └── services/


---

🔗 6. API Overview

Method	Endpoint	Description

POST	/api/auth/login	Admin login
POST	/api/auth/register	Create admin
GET	/api/health	Health check
POST	/api/upload/students	Upload students
POST	/api/allocation/generate	Generate seating
GET	/api/allocation/:examId	Get seating
GET	/api/allocations/all	All allocations
GET	/api/stats	Dashboard stats
DELETE	/api/allocation/:examId	Delete allocation
GET	/api/halls	List halls
POST	/api/halls	Add hall
PUT	/api/halls/:id	Update hall
DELETE	/api/halls/:id	Delete hall



---

🧪 7. Troubleshooting

MongoDB Connection Error

Check IP whitelist

Verify credentials


Authentication Failed

Check username/password encoding


Allocation Exists Error

Use new examId or delete old


Capacity Error

Increase halls or capacity



---

🎥 8. Demo & Documentation

🎬 Explanation Video

Complete walkthrough of:

System features

Seating algorithm

UI demo


🔗 https://drive.google.com/drive/folders/1VRY7BX5OCpsBK9b1uG64PUYNwq1cEw8e


---

📄 Project Report

Includes:

Architecture

Algorithms

Implementation

Screenshots


🔗 https://drive.google.com/drive/folders/1pLXWI4hfdwkkAPrWU5ujZXizlZPKIxIp


---

🌟 9. Key Features

✅ Automated seating allocation

✅ Department-wise interleaving

✅ Zig-zag seat optimization

✅ JWT-secured admin system

✅ Excel/TXT upload support

✅ PDF export

✅ MongoDB Atlas integration



---

📌 10. Future Enhancements

Multi-exam scheduling

AI-based seating optimization

Real-time dashboard analytics

QR-based attendance tracking

Mobile app version



