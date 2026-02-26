# Finance Dashboard AI

A modern finance dashboard application built with a monorepo architecture, featuring a React frontend and an Express backend.

## 🚀 Features

- **Financial Overview**: Comprehensive dashboard for tracking finances.
- **Secure Authentication**: Robust auth system powered by [Better Auth](https://better-auth.com/).
- **Modern Stack**: Built with React 19, Vite, Tailwind CSS, Express, and Drizzle ORM.
- **Type Safety**: Full TypeScript support across the stack.

## 🛠 Tech Stack

### Frontend (`apps/finance-dashboard`)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **State/Data**: TanStack Query
- **Routing**: React Router v7
- **Authentication**: Better Auth Client

### Backend (`apps/api`)
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth Server

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (Package manager)
- [Docker](https://www.docker.com/) (For running the PostgreSQL database)

## ⚡️ Getting Started

Follow these steps to set up the project locally.

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd dashboard-finance-ai
pnpm install
```

### 2. Environment Setup

#### Backend
Set up the environment variables for the API.

```bash
cp apps/api/.env.example apps/api/.env
```

Review the `apps/api/.env` file. The defaults are configured to work with the Docker-based database.

#### Frontend (Optional)
The frontend defaults to connecting to `http://localhost:3001`. If you need to change this:

1. Create a `.env` file in `apps/finance-dashboard`:
   ```bash
   touch apps/finance-dashboard/.env
   ```
2. Add the API URL:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

### 3. Start Database

Start the PostgreSQL container using Docker Compose:

```bash
docker-compose up -d
```

### 4. Database Migration

Initialize the database schema using Drizzle Kit:

```bash
pnpm --filter api db:push
```

### 5. Running the Application

Start both the frontend and backend in development mode:

```bash
pnpm dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## 📂 Project Structure

```
dashboard-finance-ai/
├── apps/
│   ├── api/                 # Express backend
│   └── finance-dashboard/   # React frontend
├── docker-compose.yml       # Docker configuration for Postgres
├── package.json             # Root scripts and workspace config
└── pnpm-workspace.yaml      # Workspace definition
```

## 🚀 Deployment

### Build
To build both applications for production:

```bash
pnpm build
```

This will run type checking and build:
- **API**: Compiled to `apps/api/dist`
- **Frontend**: Static assets generated in `apps/finance-dashboard/dist`

### Deployment Guide

#### Backend (API)
1. Deploy the contents of `apps/api` to a Node.js environment.
2. Ensure production environment variables are set (especially `DATABASE_URL` and `BETTER_AUTH_SECRET`).
3. Run migrations on the production database.
4. Start with `node dist/index.js`.

#### Frontend
1. Deploy the `apps/finance-dashboard/dist` folder to any static host (Vercel, Netlify, S3, Nginx).
2. Ensure the build was created with the correct `VITE_API_URL` pointing to your production backend.

## 📝 Scripts

- `pnpm dev`: Start dev servers for all apps.
- `pnpm build`: Build all apps.
- `pnpm --filter api <command>`: Run a command only in the API package.
- `pnpm --filter finance-dashboard <command>`: Run a command only in the Frontend package.
