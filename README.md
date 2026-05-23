# HealthMate

**Your AI-powered health assistant** — built for the ML Empowerment Build Challenge (AI for Health category).

HealthMate is a full-stack wellness application that combines health metrics tracking, AI-powered symptom checking, and personalized insights using Google Gemini.

## Features

- **User Authentication** — Secure JWT-based signup and login
- **Symptom Checker** — AI wellness recommendations with severity assessment (Gemini)
- **Health Metrics Tracking** — Log weight, sleep, exercise, mood, and notes
- **Data Visualization** — Line, bar, and area charts (Recharts)
- **Health Score** — Composite 0–100 score with factor breakdown
- **AI Insights** — Personalized trends and recommendations from your data
- **Responsive UI** — Mobile, tablet, and desktop support

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts, Zustand |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL) |
| AI | Google Generative AI (Gemini 1.5 Flash) |
| Auth | JWT + bcrypt |
| Hosting | Vercel (frontend), Railway (backend) |

## Project Structure

```
healthmate/
├── frontend/          # Next.js app
│   ├── app/           # Pages (App Router)
│   ├── components/    # Reusable UI components
│   └── lib/           # API client, auth, types
├── backend/           # Express API
│   └── src/
│       ├── routes/    # auth, health, ai
│       ├── services/  # Gemini integration
│       ├── db/        # PostgreSQL client & schema
│       └── middleware/
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- Supabase account
- Google AI Studio API key ([aistudio.google.com](https://aistudio.google.com))

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd healthmate
```

### 2. Database setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `backend/src/db/schema.sql`
3. Copy your **Database URL** from **Project Settings → Database → Connect → URI**
   - Use **Session pooler** (port `5432`) or **Transaction pooler** (port `6543`)
   - Host often looks like `aws-0-<region>.pooler.supabase.com`, not `db.<ref>.supabase.co`
   - If your password contains `@` or `#`, URL-encode it (`@` → `%40`, `#` → `%23`)

### 3. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

**Backend environment variables** (`.env`):

```env
GOOGLE_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
JWT_SECRET=your_random_secret_min_32_characters
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Frontend setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

**Frontend environment variables** (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=HealthMate
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### 5. Open the app

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3001](http://localhost:3001)
- Health check: [http://localhost:3001/api/health-check](http://localhost:3001/api/health-check)

## API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register `{ email, password }` |
| POST | `/api/auth/login` | Login `{ email, password }` |
| GET | `/api/auth/me` | Get current user (Bearer token) |
| POST | `/api/auth/logout` | Logout |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/health/metrics` | Log metrics |
| GET | `/api/health/metrics` | Get last 30 days + averages |
| DELETE | `/api/health/metrics/:id` | Delete metric |
| POST | `/api/health/symptoms` | Save symptom check |
| GET | `/api/health/symptoms/history` | Last 10 checks |
| GET | `/api/health/insights` | Latest stored insight |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/recommendations` | Symptom analysis `{ symptoms, age, medical_history }` |
| POST | `/api/ai/insights` | Generate insights from metrics |

### Example API calls

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@healthmate.app","password":"demo1234"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@healthmate.app","password":"demo1234"}'

# Check symptoms (replace TOKEN)
curl -X POST http://localhost:3001/api/ai/recommendations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"symptoms":"Mild headache and fatigue for 2 days","age":30,"medical_history":["None"]}'

# Log metrics
curl -X POST http://localhost:3001/api/health/metrics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"date":"2026-05-22","weight":70.5,"sleep_hours":7.5,"exercise_minutes":30,"mood":"Good"}'
```

## Deployment Guide

See **[DEPLOY.md](./DEPLOY.md)** for a full step-by-step checklist (Railway + Vercel).

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL
   - `NEXT_PUBLIC_APP_NAME` = HealthMate
5. Deploy

### Backend (Railway)

1. Push code to GitHub
2. Create new project in [railway.app](https://railway.app)
3. Set root directory to `backend`
4. Add environment variables from `.env.example`
5. Set `FRONTEND_URL` to your Vercel URL
6. Deploy — Railway assigns a public URL

### Database (Supabase)

- Use production connection string in `DATABASE_URL`
- Enable SSL (handled automatically when `NODE_ENV=production`)

## Demo Credentials

After setup, create a demo account:

- **Email:** `demo@healthmate.app`
- **Password:** `demo1234`

Or register any account via the Sign Up page.

## Screenshots

<!-- Add screenshots after deployment -->
| Landing | Dashboard | Symptom Checker |
|---------|-----------|-----------------|
| _placeholder_ | _placeholder_ | _placeholder_ |

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- Parameterized SQL queries prevent injection
- JWT tokens expire after 7 days
- CORS restricted to frontend URL
- Input validation on all endpoints
- **Not medical advice** — always consult a healthcare professional

## Contact

Built for the ML Empowerment Build Challenge — AI for Health category.

---

© 2026 HealthMate. This app provides general wellness information only and is not a substitute for professional medical advice.
