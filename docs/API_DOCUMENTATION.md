# CooLink API Documentation

Comprehensive REST API reference for the CooLink Daily-Wage Worker Marketplace.

Base URL: `http://localhost:5000/api`

---

## 1. Authentication & Identity (`/api/auth`)

### 1.1 Register User
- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Access**: Public
- **Body**:
  ```json
  {
    "phone": "9847123456",
    "password": "password123",
    "fullName": "Ravi Kumar",
    "role": "WORKER",
    "email": "ravi@example.com",
    "preferredLanguage": "ml"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "Registration successful. OTP has been dispatched to your mobile number.",
    "data": {
      "user": {
        "_id": "673f8a...",
        "phone": "9847123456",
        "fullName": "Ravi Kumar",
        "role": "WORKER",
        "isPhoneVerified": false,
        "verificationStatus": "NOT_VERIFIED"
      },
      "accessToken": "eyJhbGciOi...",
      "debugOtp": "123456"
    }
  }
  ```

### 1.2 Send OTP
- **Method**: `POST`
- **Endpoint**: `/api/auth/send-otp`
- **Body**: `{ "phone": "9847123456" }`
- **Response**: `{ "success": true, "message": "OTP sent to 9847123456" }`

### 1.3 Verify Phone OTP
- **Method**: `POST`
- **Endpoint**: `/api/auth/verify-otp`
- **Body**: `{ "phone": "9847123456", "otp": "123456" }`
- **Response**: `{ "success": true, "message": "Phone number verified successfully." }`

### 1.4 User Login
- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Body**: `{ "phone": "9847123456", "password": "password123" }`
- **Response**: Returns JWT `accessToken` in body and sets HTTP-only `refreshToken` cookie.

### 1.5 Refresh Access Token
- **Method**: `POST`
- **Endpoint**: `/api/auth/refresh-token`
- **Body / Cookie**: `{ "refreshToken": "..." }`
- **Response**: Rotates refresh token and returns fresh `accessToken`.

### 1.6 Current Authenticated User
- **Method**: `GET`
- **Endpoint**: `/api/auth/me`
- **Headers**: `Authorization: Bearer <accessToken>`

---

## 2. Worker Discovery & Profiles (`/api/workers`)

### 2.1 Search & Filter Workers
- **Method**: `GET`
- **Endpoint**: `/api/workers`
- **Query Params**:
  - `skillId`: MongoDB ObjectId of trade
  - `locality`: Substring search (e.g. `Kottakkal`)
  - `availableOnly`: `true` | `false`
  - `verifiedOnly`: `true` | `false`
  - `minRating`: `4.0`
  - `maxWage`: `1200`
  - `page`: default 1
  - `limit`: default 12
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "results": [
        {
          "_id": "...",
          "workerId": "...",
          "fullName": "Ravi Kumar",
          "maskedPhone": "98******56",
          "primarySkill": { "name": "Masonry", "nameMl": "മേസ്തിരി പണി" },
          "experienceYears": 8,
          "dailyWageMin": 950,
          "dailyWageMax": 1150,
          "locality": "Kottakkal",
          "district": "Malappuram",
          "approxLocation": { "type": "Point", "coordinates": [75.995, 10.999] },
          "availability": { "status": "AVAILABLE", "availableFor": "TODAY" },
          "completedJobsCount": 127,
          "averageRating": 4.85,
          "totalReviews": 36,
          "verificationStatus": "VERIFIED"
        }
      ],
      "pagination": { "page": 1, "limit": 12, "total": 1, "totalPages": 1 }
    }
  }
  ```

### 2.2 Update Worker Availability (1-Tap Toggle)
- **Method**: `PATCH`
- **Endpoint**: `/api/workers/availability`
- **Headers**: `Authorization: Bearer <workerToken>`
- **Body**:
  ```json
  {
    "status": "AVAILABLE",
    "availableFor": "TODAY"
  }
  ```

### 2.3 Update Worker Profile
- **Method**: `PUT`
- **Endpoint**: `/api/workers/profile`
- **Body**: `{ primarySkillId, experienceYears, dailyWageMin, dailyWageMax, locality, district, bio, languages }`

---

## 3. Work Requests & Atomic Booking (`/api/work-requests`)

### 3.1 Send Work Request
- **Method**: `POST`
- **Endpoint**: `/api/work-requests`
- **Headers**: `Authorization: Bearer <employerToken>`
- **Body**:
  ```json
  {
    "workerId": "673f...",
    "offeredWage": 1100,
    "jobDate": "2026-10-28",
    "duration": "2 days",
    "locality": "Kottakkal",
    "instructions": "Need plastering on exterior compound wall."
  }
  ```

### 3.2 Accept Work Request (Atomic Lock)
- **Method**: `PATCH`
- **Endpoint**: `/api/work-requests/:id/accept`
- **Headers**: `Authorization: Bearer <workerToken>`
- **Guarantees**: Atomically marks worker as `BUSY`. Automatically cancels competing pending requests for that date.

### 3.3 Decline Work Request
- **Method**: `PATCH`
- **Endpoint**: `/api/work-requests/:id/reject`
- **Body**: `{ "reason": "Not available on that date" }`

---

## 4. Jobs Lifecycle (`/api/jobs`)

### 4.1 Post a Job
- **Method**: `POST`
- **Endpoint**: `/api/jobs`
- **Body**: `{ title, description, requiredSkillId, workersNeeded, wageOffer, startDate, durationDays, startTime, locality, landmark }`

### 4.2 Update Job Status
- **Method**: `PATCH`
- **Endpoint**: `/api/jobs/:id/status`
- **Body**: `{ "status": "COMPLETED" }`
- **Valid Transitions**:
  - `POSTED -> ASSIGNED | CANCELLED`
  - `ASSIGNED -> IN_PROGRESS | CANCELLED | COMPLETED`
  - `IN_PROGRESS -> COMPLETED | DISPUTED | CANCELLED`

---

## 5. Reviews & Ratings (`/api/reviews`)

### 5.1 Submit Review
- **Method**: `POST`
- **Endpoint**: `/api/reviews`
- **Body**:
  ```json
  {
    "jobId": "673f...",
    "targetUserId": "673f...",
    "rating": 5,
    "comment": "Punctual and very skilled mason.",
    "categoryRatings": { "punctuality": 5, "workQuality": 5, "paymentPromptness": 5 }
  }
  ```
- **Integrity**: Enforces that only verified job participants can review. Blocks duplicate reviews for the same job.

---

## 6. Trust, Safety & Moderation (`/api/reports` & `/api/verifications`)

### 6.1 Submit Government ID
- **Method**: `POST`
- **Endpoint**: `/api/verifications/submit`
- **Body**: `{ "documentType": "AADHAAR", "documentNumberMasked": "XXXX-XXXX-1234", "documentFileUrl": "..." }`

### 6.2 Admin ID Review
- **Method**: `PATCH`
- **Endpoint**: `/api/verifications/:id/review`
- **Access**: Admin only
- **Body**: `{ "decision": "APPROVE" }` or `{ "decision": "REJECT", "rejectionReason": "Blurry document" }`

### 6.3 Submit Safety Report
- **Method**: `POST`
- **Endpoint**: `/api/reports`
- **Body**: `{ "reportedUserId": "...", "reason": "NON_PAYMENT", "description": "Did not pay agreed daily wage." }`
