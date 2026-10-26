# CooLink - Daily-Wage Worker Marketplace
> **Find Work. Find Workers. Without Waiting.**  
> *കവലകളിലും ബസ് സ്റ്റാൻഡുകളിലും കാത്തുനിൽക്കാതെ തൊഴിൽ കണ്ടെത്താം.*

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-10%20Passing-success.svg)](https://jestjs.io/)

A production-grade, mobile-first local marketplace connecting **daily-wage workers** (masons, carpenters, plumbers, electricians, tile workers, painters, welders, helpers) with **contractors and house owners** across India (initially localized for Kerala).

---

## 🌟 The Core Problem We Solve

In traditional informal labour setups across India, workers must wake before dawn and physically gather at bus stands, railway stations, and road junctions hoping a contractor picks them for daily work:
- Workers waste money on travel with no guarantee of work.
- Zero price transparency; high risk of non-payment and exploitation.
- No verifiable work history or digital reputation.
- Contractors and house owners struggle to find verified, skilled help on short notice.

**CooLink digitally transforms this workflow**:
Workers tap **"AVAILABLE FOR WORK TODAY"** from home. Contractors discover nearby verified workers, compare ratings, send transparent wage requests, and coordinate directly.

---

## 🚀 Key Features

- **📱 Worker-First Simple UI**: Ultra-large touch buttons, minimal forms, and bilingual support (English & Malayalam `മലയാളം`).
- **⚡ 1-Tap Availability Engine**: Single-tap toggle for `AVAILABLE`, `BUSY`, and `NOT_AVAILABLE`.
- **🔒 Atomic Booking Engine**: MongoDB atomic updates prevent double-booking for the same date; competing requests auto-cancel upon acceptance.
- **🛡️ Real Government ID Verification**: Human review queue for Aadhaar, Voter ID, and Labour Cards. Blue Verified Worker badge ✓.
- **📍 Location Privacy & GPS Fuzzing**: Worker residential addresses and exact GPS are masked with ~2 km locality radius.
- **⭐ Bi-directional Reviews & Reputation**: Only participants who completed a verified job can rate each other; duplicate reviews blocked.
- **💬 Spam-Proof Messaging**: Direct contact and chat unlock only after a work request is accepted.
- **🚨 Trust, Safety & Fraud Defense**: Report abuse, block bad actors, and automatic heuristics flagging suspicious cancellation rates.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Context API |
| **Backend** | Node.js, Express.js, TypeScript, Zod Validation, Mongoose |
| **Database** | MongoDB (with embedded fallback runner for zero-setup local dev/test) |
| **Security** | JWT (Access & Refresh Rotation), Bcrypt, Helmet, CORS, Cookie-Parser |
| **Testing** | Jest, Supertest, ts-jest (10 passing automated integration tests) |

---

## ⚡ Quick Start & Development Setup

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/CooLink.git
cd CooLink

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

The project comes pre-configured with sensible defaults:
```bash
# In server/ directory, copy example env
cp .env.example .env
```

*Note: By default `MONGODB_URI=in-memory` enables the embedded MongoDB runner. You can plug your MongoDB Atlas or local MongoDB URI anytime.*

### 3. Run Automated Tests

To run the complete test suite (Auth, OTP, Concurrency Locking, State Machine, Reviews):
```bash
cd server
npm test
```

### 4. Seed Realistic Kerala Workers & Jobs

Populates the database with 10 authentic Kerala workers (masons, electricians, plumbers, carpenters, etc.), 3 employers, sample jobs, and reviews:
```bash
cd server
npm run seed
```

### 5. Start Development Servers

Run both Backend and Frontend concurrently from root:
```bash
# From workspace root:
npm run dev

# Or run separately:
# Terminal 1: Backend API (Port 5000)
cd server && npm run dev

# Terminal 2: Vite React Frontend (Port 5173)
cd client && npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🔑 Demo Login Accounts

| Role | Name / Trade | Phone | Password |
|---|---|---|---|
| **Worker** | Ravi Kumar (Mason / മേസ്തിരി) | `9847100001` | `password123` |
| **Worker** | Suresh Babu (Tile / ടൈൽ വർക്ക്) | `9847100002` | `password123` |
| **Worker** | Faisal V.P. (Electrician / വയർമാൻ) | `9847100003` | `password123` |
| **Employer** | Moideen Kutty (MK Builders) | `9847000001` | `password123` |
| **Employer** | Dr. Anita Thomas (House Owner) | `9847000002` | `password123` |
| **Admin** | CooLink Administrator | `9847000000` | `adminpassword123` |

*💡 Tip: The Login page features 1-click quick login buttons to instantly switch between roles during evaluation.*

---

## 📂 Project Structure

```
d:\VSCODE\CooLink\
├── docs/
│   ├── API_DOCUMENTATION.md          # Complete REST API specification
│   └── ARCHITECTURE_AND_SECURITY.md   # Security & concurrency architecture
├── server/
│   ├── src/
│   │   ├── config/                   # Env, DB connector, MongoDB memory runner
│   │   ├── controllers/              # Auth, Worker, Job, Review, Admin handlers
│   │   ├── middlewares/              # JWT auth, RoleGuard, centralized error handler
│   │   ├── models/                   # Mongoose schemas (User, Profiles, Job, etc.)
│   │   ├── routes/                   # Express routes
│   │   ├── scripts/                  # Seed script with realistic Kerala data
│   │   ├── services/                 # Booking, Auth, OTP, Review, Fraud services
│   │   ├── utils/                    # Geo fuzzer, error classes
│   │   └── validators/               # Zod input schemas
│   └── tests/                        # Automated Jest & Supertest integration tests
└── client/
    └── src/
        ├── api/                      # Axios client with automatic token refresh
        ├── components/               # Navbar, Footer, WorkerCard, RequestModal, ReviewModal
        ├── context/                  # AuthContext, LanguageContext (EN / ML)
        └── pages/                    # Home, HowItWorks, Login, Register, Dashboards
```

---

## 🧪 Testing Verification Summary

Our test suite verifies:
1. **Real OTP & Authentication**:
   - Phone verification, rate limiting, max-3-attempt lockout.
   - Access & refresh token rotation, duplicate phone prevention.
2. **Concurrency & Atomic Booking**:
   - Atomic locking prevents double-booking when two contractors simultaneously book a worker.
   - Automatic cancellation of competing requests for the same date.
3. **State Machine Transitions**:
   - Deterministic status transitions (`POSTED -> ASSIGNED -> IN_PROGRESS -> COMPLETED`).
   - Rejects illegal state jumps.
4. **Reviews & Integrity**:
   - Prevents non-participants from reviewing.
   - Blocks duplicate reviews.
   - Recalculates average ratings accurately.

---

## 📄 License
ISC License © 2026 CooLink Technologies. Built for dignified daily-wage employment.
