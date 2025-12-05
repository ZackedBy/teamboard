# Web Software Production

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/7xgB12Aq)

Welcome to the starter repository for your team project in the **Web Software Production** course.

As the course progresses and you implement features, keep the README up-to-date.

## Project: “TeamBoard” – A Collaborative Task Management Web App

### 🎯 Project Goal

Build a full-stack web application that allows users to create, manage, and collaborate on tasks within teams. The app should support basic CRUD operations, user authentication, and real-time updates.

### 🧩 Core Features (Required for All Teams)

#### User Authentication

- Register, login, logout
- Join team

#### Task Management

- Create, edit, delete tasks
- Assign tasks to users
- Set due dates and priorities
- Team Collaboration

#### Create and join teams

- View team-specific task boards

### 🛠️ Tech Stack Guidelines

- Frontend: React
- Backend: Node.js (Express)
- Database: PostgreSQL
- DevOps: Docker, GitHub Actions, CI/CD pipeline
- Testing: Unit + integration tests using Jest, Mocha, Cypress, Playwrite, etc.

---

## ✅ Testing and CI/CD

Our project includes automated testing for the API (Backend) component, running on every push and pull request via GitHub Actions.

### Backend Testing (Node.js/Express)

- **Tooling:** Vitest + Supertest
- **Test Types:** Unit, Integration, Schema Validation, and Security Header Verification.
- **How to Run Locally:**
  ```bash
  # Assuming you are in the 'backend' directory
  npm run test
  ```

### CI Pipeline

- **Platform:** GitHub Actions
- **Workflow:** Runs two separate jobs (`backend_test` and `frontend_test`) to ensure full-stack integrity before merging to `main`.

---

## ⚙️ Configuration & Feature Flags

To ensure safe deployment, gradual rollouts, and the ability to instantly roll back critical functions, we utilize Feature Flags controlled via environment variables.

### 🚩 FEATURE_RANDOM_EMOJI

- **Purpose:** Controls access to the basic test endpoint: `GET /api/v1/emojis/random`.
- **Environment Variable:** `FEATURE_RANDOM_EMOJI` (Boolean)
- **Default Value:** `true` (ENABLED)
- **How to Disable:** Set environment variable to: `FEATURE_RANDOM_EMOJI=false`
- **Behavior when Disabled:** The endpoint will return a **403 Forbidden** status with a descriptive message.

This implementation allows us to instantly disable the feature if it causes a critical bug in production, without requiring a new code deployment.

---

### 🎨 Options (Choose 2–3 per team)

Teams can personalize their app by selecting from the following enhancements:

- AI Assistant: Suggest task priorities or deadlines using a simple ML model or rule-based logic.
- Calendar View: Visualize tasks in a calendar or timeline format.
- Notifications: Add email or in-app notifications for task updates.
- Analytics Dashboard: Show team productivity metrics (e.g., tasks completed per week).
- Multilingual Support: Add localization for at least two languages.
- Security Focus: Implement advanced security features like 2FA or audit logs.
- File Attachments: Allow users to upload files to tasks.
- Custom Themes: Let users choose or create UI themes.
- Responsive UI: Works well on desktop and mobile.
