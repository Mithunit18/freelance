# Vision Match Monorepo

A full-stack monorepo template with Next.js, React Native (Expo), and Python (FastAPI) backends.

## 📦 Tech Stack

### Frontend

* **Client Web**: Next.js 15 + TypeScript + Tailwind CSS + Turbopack
* **Admin Web**: Next.js 15 + TypeScript + Tailwind CSS + Turbopack
* **Mobile**: React Native + Expo + TypeScript

### Backend

* **Client API**: Python + FastAPI + uvicorn
* **Admin API**: Python + FastAPI + uvicorn
* **Mobile API**: Python + FastAPI + uvicorn

### Tools

* **Package Manager**: pnpm (TypeScript)
* **Python Manager**: uv
* **Build System**: Turborepo
* **Linting**: ESLint (shared config)

---

## 🚀 Quick Start

### Prerequisites

Make sure you have these installed:

* **Node.js** (v18 or higher)
* **pnpm**
* **uv** (Python package manager)
* **Python** (v3.12 or higher)

---

## 📥 Installation

### 1. Clone the repository

```bash
git clone https://github.com/PRITHVI01234/vision-match.git

cd vision-match
```

### 2. Install all dependencies

```bash
pnpm install
```

### 3. Python dependencies

Managed by `uv`, installed automatically when running dev servers.

---

## 🎮 Development Commands

### Run All Apps (Not Recommended)

```bash
pnpm dev
```

Runs all 6 apps using a Turborepo TUI.

### Run App Groups

```bash
pnpm dev:client     # client-web + client-api
pnpm dev:admin      # admin-web + admin-api
pnpm dev:mobile     # mobile + mobile-api
```

### Run Individual Apps

```bash
pnpm dev:client-web
pnpm dev:client-api
pnpm dev:admin-web
pnpm dev:admin-api
pnpm dev:mobile
pnpm dev:mobile-api
```

---

## 🏗️ Project Structure

```
vision-match/
├── apps/
│   ├── client-web/          # Next.js client frontend
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── services/        # API service layer
│   │   └── utils/           # Utilities (axios, etc.)
│   │
│   ├── client-api/          # Python FastAPI backend
│   │   ├── config/          # Environment & global clients
│   │   ├── models/          # Pydantic models
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helper functions
│   │
│   ├── admin-web/           # Next.js admin frontend
│   ├── admin-api/           # Python FastAPI admin backend
│   ├── mobile/              # React Native Expo app
│   └── mobile-api/          # Python FastAPI mobile backend
│
├── packages/
│   ├── ui-web/              # Shared React components
│   ├── ui-mobile/           # Shared React Native components
│   ├── utils-js/            # Shared JS/TS utilities
│   ├── utils-py/            # Shared Python utilities
│   └── eslint-config/       # Shared ESLint config
│
├── turbo.json               # Turborepo configuration
├── pnpm-workspace.yaml      # pnpm workspace config
└── package.json             # Root package.json
```
---