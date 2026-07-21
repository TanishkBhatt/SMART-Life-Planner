<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-06b6d4?style=flat-square&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Prisma-7.8-2d3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169e1?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
  <br />
  <img src="https://img.shields.io/badge/Status-Active-success?style=flat-square" alt="Status" />
  <a href="#"><img src="https://img.shields.io/badge/Live Demo-Pending-6b7280?style=flat-square" alt="Live Demo" /></a>
</p>

<h1 align="center">SMART Life Planner</h1>

<p align="center">
  A minimal, full-stack life planner built with Next.js 16 — track todos, goals, habits, mood, time, and more.
</p>

---

## Features

| Feature | Description |
|---|---|
| **Dashboard** | Real-time stats widget for todos, goals, habits, logs, and mood |
| **Todos** | Full CRUD with priority, due dates, category filtering, and status toggle |
| **Goals** | Goals with milestones, progress bars, and color coding |
| **Calendar** | Custom lightweight month view with event CRUD |
| **Habits** | Daily 7-day grid check-in with streak tracking, XP levels, and gamification |
| **Time Logs** | Track hours/minutes by category with running totals |
| **Pomodoro** | Timer with start/stop/reset, custom duration, and session history |
| **Diary** | Daily entries with mood emoji selector |
| **Journal** | Markdown split-pane editor with tags, pinning, and live preview |
| **Notes** | Quick markdown notes with search and pinning |
| **Mood Tracker** | 1–5 daily mood selector with 7-day average |
| **Reports** | Full summary with CSV and JSON export |

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | [React 19](https://react.dev) + [Tailwind CSS 4](https://tailwindcss.com) |
| Icons | [Lucide](https://lucide.dev) |
| Charts | [Recharts](https://recharts.org) |
| Auth | [NextAuth v4](https://next-auth.js.org) (credentials) |
| Database | [Neon PostgreSQL](https://neon.tech) via [Prisma 7](https://prisma.io) |
| Markdown | [react-markdown](https://remark.js.org) |
| Dark Mode | [next-themes](https://github.com/pacocoursey/next-themes) |

## Getting Started

### Prerequisites

- Node.js 20+
- [Neon](https://neon.tech) PostgreSQL database (free tier)

### Setup

```bash
# 1. Clone
git clone https://github.com/your-username/smart-life-planner.git
cd smart-life-planner

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Neon DATABASE_URL and a random NEXTAUTH_SECRET

# 4. Push schema to database
npx prisma db push

# 5. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Register → Start using.

### Production Build

```bash
npm run build
npm start
```

## Deployment (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this repo to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `NEXTAUTH_SECRET` | Random string (`openssl rand -base64 32`) |

`NEXTAUTH_URL` is auto-detected on Vercel — no need to set it manually.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Secret for NextAuth JWT encryption |
| `NEXTAUTH_URL` | Local only | Auto-detected on Vercel/Railway |

## Project Structure

```
src/
├── app/
│   ├── (auth)/            Login & register pages
│   ├── (dashboard)/       Dashboard + feature pages
│   ├── api/               REST API routes (one per resource)
│   ├── providers.tsx      Auth + Theme providers
│   ├── layout.tsx         Root layout
│   ├── proxy.ts           Auth middleware (route protection)
│   └── page.tsx           Root redirect → /dashboard
├── components/
│   ├── layout/            Sidebar, Header
│   └── ui/                Button, Card, CategorySelect, etc.
├── lib/
│   ├── auth.ts            NextAuth configuration
│   ├── categories.ts      Predefined categories
│   ├── prisma.ts          Prisma client singleton
│   └── utils.ts           Helpers (cn, formatDate, etc.)
└── proxy.ts               Auth middleware (Next.js 16 proxy)
```

---

<p align="center">
  Built with ❤️ using Next.js · Prisma · Neon · Tailwind
</p>
