# 🚀 QueueFlow - Real-Time Kanban Workspace (Frontend)

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white&style=for-the-badge)](https://react.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7.x-CA4245?logo=react-router&logoColor=white&style=for-the-badge)](https://reactrouter.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white&style=for-the-badge)](https://vitejs.dev/)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?logo=redux&logoColor=white&style=for-the-badge)](https://redux-toolkit.js.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css&logoColor=white&style=for-the-badge)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?logo=socket.io&logoColor=white&style=for-the-badge)](https://socket.io/)
[![GitHub](https://img.shields.io/badge/GitHub-Frontend-2496ED?logo=github&logoColor=white&style=for-the-badge)](https://github.com/Anoop-Kumar-31/QueueFlow_Frontend)

---

QueueFlow is a highly interactive, real-time Kanban project management dashboard designed to flawlessly bridge the workflow gap between Project Managers and Developers. 

This repository contains the **Frontend** client which binds tightly to our custom WebSocket backend, allowing seamless live updates without refreshing the browser.

---

## 📸 Sneak Peek

> **Note:** Add your UI screenshots below by replacing the `URL_TO_...` paths!

| Login & Registration | Project Dashboard | Live Kanban Board |
|:---:|:---:|:---:|
| ![Login Screenshot](URL_TO_LOGIN_SCREENSHOT) | ![Dashboard Screenshot](URL_TO_DASHBOARD_SCREENSHOT) | ![Kanban Screenshot](URL_TO_KANBAN_SCREENSHOT) |

---

## 👔 How It Works (The PM-Developer Flow)

QueueFlow operates on a strict Role-Based Access platform:

1. **Project Managers (PMs)**: 
   * A PM creates a new isolated **Workspace / Project**.
   * They generate a dynamic, time-bound **Invitation Code** (e.g. valid for 6 hours).
   * The PM shares this code securely with their Developer team.
2. **Developers**:
   * Developers log in and click **"Join Project"**.
   * They enter the 6-character Invitation Code and are instantly onboarded into the workspace!
   * Developers can now see their assigned tasks and drag-and-drop them across the Kanban queues.
3. **Real-time Sync**: As Developers move tasks, the PM's dashboard organically tracks the movements and updates the Activity Timeline instantly!
4. **Clients**: Clients can seamlessly securely log in and watch tasks dynamically update around the board chronologically, without having formal drag-and-drop structural privileges natively isolating safe data viewing!

---

## ✨ Core Features

* **Role-Based Workspaces**: Specialized views, constraints, and logical bindings for Project Managers, Developers, and explicitly Clients safely correctly parsing explicit views organically.
* **Live Task Board**: A high-performance, dynamic Kanban board supporting drag-and-drop mechanics to seamlessly shift tasks (`PENDING` -> `IN PROGRESS` -> `REVIEW` -> `DONE`).
* **Sticky-Note Feedback Ecosystem**: A gorgeous isolated feedback layer inside the `TaskDetailsModal` allowing absolutely real-time bidirectional chatting and feedback (Sticky Notes) formally tracked specifically inside Tasks! Users can beautifully edit and formally delete their feedback natively efficiently!
* **Robust Access Management UI**: Project Managers formally retain `Manage Access` dashboards explicitly mapped smoothly securely deleting members natively, whilst standard users retain explicit graceful `Leave Team` escape hooks cleanly organically.
* **Strict API Abstractions**: The entire React architecture cleanly routes all server mapping through explicitly structured global API hooks (`api.js`) efficiently seamlessly decoupling network handling structurally intelligently.
* **Real-time WebSockets**: Task movements, creations, new notes, edits, and deletions are broadcasted globally natively smoothly eliminating manual refreshes completely.
* **Active Presence System**: Stunning UI integration tracking precisely who is online right now using glowing active-user indicator pings attached to task assignees.
* **Workspace Timeline Engine**: A sleek, vertical activity feed intercepting workflow state changes chronologically natively alerting PMs to developer speed metrics (e.g. *John moved 'Setup DB' to IN PROGRESS 5m ago*).

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
