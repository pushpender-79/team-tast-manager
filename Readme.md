# TaskFlow - Team Task Management System

A full-stack Team Task Management application built using the MERN stack.  
TaskFlow allows teams to create projects, assign tasks, manage members, and track overall project progress with role-based access control.

---

# 🚀 Live Demo

## Frontend
https://team-tast-manager.vercel.app

## Backend API
https://team-tast-manager-production.up.railway.app


---

# 📌 Features

## 🔐 Authentication
- User Signup & Login
- JWT-based Authentication
- Protected Routes
- Secure Password Hashing using bcryptjs

---

## 👥 Role-Based Access Control
- Admin & Member Roles
- Project Owner Permissions
- Restricted Project & Task Operations
- Authorized Access to Protected Resources

---

## 📁 Project Management
- Create New Projects
- Update Existing Projects
- Delete Projects
- Add or Remove Team Members
- View Project Details

---

## ✅ Task Management
- Create & Assign Tasks
- Update Task Status
- Set Task Priorities
- Due Date Management
- Overdue Task Tracking

---

## 📊 Dashboard
- Total Projects Overview
- Total Tasks Overview
- Task Status Analytics
- Priority-Based Statistics
- Overdue Tasks Tracking
- Personal Assigned Tasks

---

## 🎨 UI/UX Features
- Fully Responsive Design
- Modern Dashboard Interface
- Loading States
- Error Handling
- Empty State UI
- Consistent Layout & Spacing
- Clean Typography
- Status Indicators & Visual Feedback

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React

---

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

---

# 📂 Project Structure

```bash
team-task-manager/
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── server.js
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── App.jsx
│
├── railway.json
├── README.md
└── .gitignore

⚙️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/pushpender-79/team-task-manager.git

cd team-task-manager
🔧 Backend Setup
cd server
npm install

Create a .env file inside the server folder:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173

Run Backend Server:

npm run dev
💻 Frontend Setup
cd client
npm install

Create a .env file inside the client folder:

VITE_API_URL=http://localhost:5000/api

Run Frontend:

npm run dev
🔑 API Endpoints
Authentication
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
Projects
GET /api/projects
POST /api/projects
PUT /api/projects/:id
DELETE /api/projects/:id
Tasks
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
Dashboard
GET /api/dashboard
🌐 Deployment

The application is deployed using Railway.

Deployment Includes
Frontend Deployment
Backend Deployment
MongoDB Atlas Database

👨‍💻 Author

Pushpender Chauhan
