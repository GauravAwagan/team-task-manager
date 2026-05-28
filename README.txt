Team Task Manager
=================

This is a Full-Stack web application built for the assessment. It allows users to create projects, assign tasks, and track progress with role-based access control (Admin/Member).

Tech Stack
----------
- Frontend: React (Vite), React Router, Vanilla CSS (Glassmorphism design)
- Backend: Node.js, Express.js
- Database: MongoDB Atlas (using Mongoose)
- Authentication: JWT & bcrypt
- Email Notifications: Nodemailer

Key Features
------------
- Role-based Access Control (Admins can create projects & assign tasks, Members can only update their own tasks).
- Real-time Dashboard with statistics on total, completed, in-progress, and overdue tasks.
- Secure Authentication with hashed passwords and JWT tokens.
- Email Notifications automatically sent upon user registration and task assignment.
- Dynamic, Glassmorphic UI design built entirely with Vanilla CSS (No Tailwind).

How to run locally
------------------
1. Make sure you have Node.js installed.
2. Open two separate terminal windows in VS Code.

**Terminal 1 (Backend):**
1. Navigate to the backend directory: 
   cd backend
2. Install dependencies:
   npm install
3. Configure your environment variables inside `backend/.env`. You must provide:
   - MONGO_URI
   - JWT_SECRET
   - EMAIL_USER
   - EMAIL_PASS
4. Start the backend server:
   npm run dev
   (The server will run on http://localhost:5000)

**Terminal 2 (Frontend):**
1. Navigate to the frontend directory:
   cd frontend
2. Install dependencies:
   npm install
3. Start the frontend server:
   npm run dev
4. Open your browser and go to http://localhost:5173

Deployment (Railway)
--------------------
To deploy this application to Railway for the final submission:

1. Push this entire project folder to your GitHub repository.
2. Go to Railway (railway.app) and create a "New Project" -> "Deploy from GitHub repo".
3. Because this is a Full-Stack app, you will deploy two separate services from the same repository:
   - Service 1 (Backend): Set the Root Directory to `/backend`. 
   - Service 2 (Frontend): Set the Root Directory to `/frontend`.
4. In the Backend service settings on Railway, go to the "Variables" tab and add your Environment Variables (MONGO_URI, JWT_SECRET, EMAIL_USER, EMAIL_PASS).
5. In the Frontend code, update the API requests (in `Login.jsx`, `Register.jsx`, etc.) from `http://localhost:5000` to the actual public URL of your deployed Railway Backend.
6. Once deployed, test the live URLs to ensure they work!
