# 🚀 QueueFlow - Real-Time Kanban Workspace (Frontend)

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white&style=for-the-badge)](https://react.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7.x-CA4245?logo=react-router&logoColor=white&style=for-the-badge)](https://reactrouter.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white&style=for-the-badge)](https://vitejs.dev/)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?logo=redux&logoColor=white&style=for-the-badge)](https://redux-toolkit.js.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css&logoColor=white&style=for-the-badge)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?logo=socket.io&logoColor=white&style=for-the-badge)](https://socket.io/)
[![GitHub](https://img.shields.io/badge/GitHub-Frontend-2496ED?logo=github&logoColor=white&style=for-the-badge)](https://github.com/Anoop-Kumar-31/QueueFlow_Frontend)

---

QueueFlow is a real-time project management platform built for modern development teams. It connects Project Managers, Developers, and Clients inside shared live workspaces — with drag-and-drop Kanban boards, sticky-note feedback, a workflow intelligence analytics engine, and a real-time activity feed, all syncing instantly via WebSockets without a page refresh.

This repository is the **React frontend** — a Vite + Redux Toolkit SPA that consumes QueueFlow's REST API and Socket.io backend.

---

## 📸 Sneak Peek

### Authentication
#### Login
<img src="./screenshots/Login.png" alt="Login" style="border: 2px solid #999999; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />

#### Sign Up
<img src="./screenshots/SignUp.png" alt="Sign Up" style="border: 2px solid #999999; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />

### Dashboard & Projects
#### Overview Dashboard
<img src="./screenshots/OverviewDashboard.png" alt="Overview Dashboard" style="border: 2px solid #999999; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />

#### Project Board
<img src="./screenshots/ProjectDashboard.png" alt="Project Board" style="border: 2px solid #999999; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />

### Task Management
#### My Tasks
<img src="./screenshots/MyTask.png" alt="My Tasks" style="border: 2px solid #999999; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />

#### Task Details & Sticky Notes
<img src="./screenshots/TaskDetails.png" alt="Task Details" style="border: 2px solid #999999; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />

### Collaboration
#### Join via Project Code
<img src="./screenshots/JoinWithProjectCode.png" alt="Join Project" style="border: 2px solid #999999; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />

#### Generated Invite Code
<img src="./screenshots/CodeGenerated.png" alt="Code Generated" style="border: 2px solid #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />

#### Code Time Limit
<img src="./screenshots/CodeTimeLimit.png" alt="Code Time Limit" style="border: 2px solid #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />

### Access Management & Analytics
#### Manage Access (PM)
<img src="./screenshots/ManageAccess(PM).png" alt="Manage Access" style="border: 2px solid #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />

#### Analytical Overview
<img src="./screenshots/AnalyticalOverview.png" alt="Analytical Overview" style="border: 2px solid #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />

---

## 👔 How It Works

QueueFlow is built around a strict role-based flow:

1. **Project Manager** creates a workspace and generates a time-limited **6-character invite code** (valid for up to 6 hours).
2. **Developers / Clients** enter the code from the Join screen and are instantly added to the workspace.
3. **Developers** drag tasks across `PENDING → IN PROGRESS → REVIEW → DONE` — every move is broadcast in real time to all members.
4. **Clients** get a live read-only view of progress and can leave sticky-note feedback directly on tasks.
5. **Project Managers** monitor the **Activity Timeline**, check the **Analytics Dashboard** for bottlenecks and workload imbalances, and manage team access — all without leaving the app.

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🎯 **Role-Based Access** | PMs create projects, Developers work tasks, Clients view and leave feedback — each role sees exactly what it needs |
| 📋 **Live Kanban Board** | Drag-and-drop tasks across `PENDING → IN PROGRESS → REVIEW → DONE`, updates broadcast instantly to all members |
| 🔔 **Notification Bell** | Real-time notification feed in the header — shows teammate actions with unread badge counter, filtered to exclude your own events |
| 🔍 **Live Search** | Instant client-side search across all projects and tasks from the header bar |
| 📊 **Workflow Intelligence** | Analytics dashboard with bottleneck detection, workload imbalance alerts, in-progress task chips, priority breakdown, completion trends, and smart insights |
| 🗒️ **Sticky Notes** | Per-task feedback layer — post, edit, and delete notes in real time inside the Task Details modal |
| 👥 **Access Management** | PMs get a Manage Access panel to view and remove members; Developers/Clients get a Leave Team option with confirmation |
| 📜 **Activity Timeline** | Real-time vertical feed of all workspace events — task moves, notes, members joining, and more |
| 🔗 **Invite Codes** | PMs generate time-limited invite codes; members join by entering the code from the dashboard |
| ⚡ **Loading Screen** | Animated boot screen with cycling status messages and a Render cold-start notice for first visits |

---

## 📦 Local Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Anoop-Kumar-31/QueueFlow_Frontend.git
cd QueueFlow_Frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root folder pointing directly to your local backend server:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Boot the Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` to interact with QueueFlow!

---

**Anoop Kumar | Full Stack Developer**
