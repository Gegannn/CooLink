# CooLink Architecture & Security Specification

## 1. System Architecture

CooLink is built using a modern decoupled architecture:
- **Client**: React 18 SPA built with Vite, TypeScript, and Tailwind CSS. Employs a mobile-first UI with bilingual English and Malayalam (`മലയാളം`) context providers.
- **Server**: Node.js & Express REST API in TypeScript following a clean layered architecture:
  `Routes -> Middlewares -> Controllers -> Services -> Repositories/Models`.
- **Database**: MongoDB with geospatial indexing (`2dsphere`), compound indexing for low-latency worker discovery, and support for in-memory embedded server for effortless local development and tests.

---

## 2. Concurrency & Anti-Double-Booking Engine

### The Problem:
In traditional informal labour setups, multiple contractors may attempt to book a skilled worker for the same morning. If not controlled atomically, workers could be double-booked, resulting in no-shows and employer disputes.

### The Solution:
1. When worker accepts request $R$ for date $D$:
   ```typescript
   const updated = await WorkerProfile.findOneAndUpdate(
     { userId: workerId, "availability.status": "AVAILABLE" },
     { $set: { "availability.status": "BUSY", "availability.updatedAt": new Date() } },
     { new: true }
   );
   if (!updated) {
     throw new ConflictError("Worker is already marked as BUSY or accepted another job.");
   }
   ```
2. Any competing pending requests for the same date are automatically transitioned to `CANCELLED` with reason `"Worker accepted another booking for this date"`.

---

## 3. Strict Job Lifecycle State Machine

Job statuses strictly adhere to valid deterministic state transitions:
```
POSTED ───► ASSIGNED ───► IN_PROGRESS ───► COMPLETED ───► RATED
   │           │               │
   ▼           ▼               ▼
CANCELLED   CANCELLED      DISPUTED
```
Invalid transitions (e.g., `COMPLETED -> POSTED` or modifying a `CANCELLED` job) are blocked at the service validation layer.

---

## 4. Privacy & Anti-Surveillance Safeguards

1. **Location Obfuscation**:
   - Exact residential addresses and GPS coordinates of daily-wage workers are fuzzed by applying a random geographical offset (~1.5 to 2.5 km) on all public endpoints (`approxLocation`).
   - Public worker listings only state "Within 5 km of [Locality]".
2. **Phone Number & Identity Masking**:
   - Worker phone numbers are masked (`98******56`) on public profiles.
   - Government ID numbers are stored in masked format (`XXXX-XXXX-1234`).
   - Identity documents (`documentFileUrl`) have `select: false` on Mongoose models and are inaccessible via public endpoints.
3. **Restricted Direct Communication**:
   - Messaging and exact work site addresses are unlocked only **after** a work request has been explicitly accepted by the worker, preventing unsolicited spam or harassment.

---

## 5. Security & Authentication Safeguards

- **Passwords**: Hashed with `bcryptjs` using 10 salt rounds.
- **Tokens**:
  - Short-lived Access Token (15m expiry).
  - Long-lived Refresh Token (7d expiry) transmitted in secure HTTP-only cookie with token rotation on renewal.
- **Phone OTP Verification**:
  - Pluggable provider abstraction (`ISmsProvider`) with `DevLoggerSmsProvider`, `Fast2SmsProvider`, and `TwilioSmsProvider`.
  - OTP hashed in DB with TTL index auto-expiration (10 mins).
  - Strict lockout: max 3 attempts per OTP code, rate limit of max 4 OTPs per phone in 10 minutes.
- **Protection**:
  - `helmet` security headers.
  - CORS origin restricted.
  - Zod runtime validation on request payloads.
