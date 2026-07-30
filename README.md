# Labdox - Early Access / Waitlist Management App

A full-stack waitlist management application featuring separate user and admin workflows, real email and phone OTP verification, Google OAuth authentication, role-based access control (RBAC), and admin candidate approval management.

---

> **⚠️ IMPORTANT NOTICE ON PHONE OTP SMS DELIVERY (TWILIO VS. MOCKED SHOWCASE DELIVERY):**
> 
> **We initially implemented full Twilio SMS Gateway integration in the backend (`verification-controller.js`). However, Twilio trial/free-tier accounts strictly require manually pre-whitelisting destination phone numbers in the Twilio Console before SMS messages can be delivered.**
> 
> **To ensure a smooth evaluation experience without requiring evaluators to manually whitelist their personal phone numbers or deal with expired SMS credits, we configured the project for Mocked Delivery with On-Screen Display. The full code for both Twilio SMS Gateway and Mocked Delivery is retained in the codebase for complete transparency.**

---

### 📱 Detailed SMS Delivery Flow Comparison

#### 1. Twilio SMS Gateway Flow (Production Code - Retained in `verification-controller.js`)
- **Request**: User requests a 5-digit phone OTP via the `/api/verify/sendphoneotp` endpoint.
- **Generation & Storage**: The backend generates a random 5-digit number, hashes it using `bcrypt` (salt rounds: 10), and persists it to the MongoDB `PhoneOTPVerification` collection with a 5-minute TTL and 60-second resend cooldown.
- **Gateway Dispatch**: The controller instantiates the Twilio REST SDK (`client.messages.create`) using `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.
- **Delivery**: Twilio dispatches a real SMS message (`Labdox / Your OTP for phone verification is: XXXXX`) to the user's mobile device.
- **Verification**: The user enters the received 5-digit OTP on the `/verify` frontend screen. The backend compares the candidate string against the stored bcrypt hash and marks `isPhoneVerified: true` upon success.

```javascript
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const sendSms = (phone, message) => {
  const client = require('twilio')(accountSid, authToken);
  client.messages
    .create({
       body: message,
       from: process.env.TWILIO_PHONE_NUMBER,
       to: phone
     })
    .then(message => console.log(message.sid));
}
```


#### 2. Mocked Delivery with On-Screen Display Flow (Active Evaluation Mode)
- **Request & Validation**: Follows identical security, rate-limiting, Zod schema validation, and MongoDB bcrypt storage logic as the Twilio flow.
- **Console & Response Delivery**: Instead of invoking the external Twilio API (which would fail on un-whitelisted evaluator phone numbers), the backend logs the generated OTP to the server console (`[MOCK SMS OTP] Phone: +91... | OTP: 12345`) and returns `mockOtp` in the API JSON response.
- **On-Screen Display**: The React frontend (`Verify.jsx`) displays a **"Test Delivery OTP Banner"** directly below the Send button with an interactive **"Fill OTP"** button so evaluators can seamlessly complete and test the phone verification workflow in seconds.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Zustand (State Management), Tailwind CSS, React Router DOM, React Toastify, Native Fetch API.
- **Backend**: Node.js, Express.js, Mongoose (MongoDB ORM), Zod (Server-side schema validation), JSON Web Token (JWT), Bcryptjs, Nodemailer, Google OAuth 2.0.
- **Database**: MongoDB (Atlas / Local MongoDB) with unique indexes and TTL constraints.

---

## 📋 Features & Workflow Overview

### 1. User Registration & Authentication
- **Registration**: Collects Full Name, Email, Indian Mobile Number (`+91` or 10 digits starting 6-9), Interest Reason, Use Case, and Password.
- **Email/Password Authentication**: Secure login issuing 1-day JWT tokens.
- **Google OAuth 2.0**: Unified user creation with pre-filled Google account data. Google registration completion step for phone & interest details.
- **Unified System**: Records `authProvider` (`email` or `"google"`) in the database.

### 2. Real Email & Phone Verification
- **Email Verification**: Generates a 5-digit OTP sent via Nodemailer SMTP to the user's registered email address.
- **Phone Verification**: Generates a 5-digit OTP stored as bcrypt hash in DB with 5-minute expiry and 60-second resend cooldown. Includes on-screen test delivery mode for easy evaluator testing.
- **Backend Security**: OTP verification checks that the identifier matches the authenticated user in the JWT session. Frontend cannot mark users verified directly.

### 3. Validation & Duplicate Prevention
- **Schema Validation**: Zod middleware validates every endpoint field before controller execution.
- **Regex Enforcement**: Indian mobile numbers are validated via regex `/^(?:\+91[\-\s]?)?[6-9]\d{9}$/`.
- **Database Constraints**: `unique: true` indexes on `email` and `phone` in MongoDB prevent duplicates at the database level.

### 4. Admin Authentication & RBAC
- **Google OAuth Only**: Admin access is strictly limited to Google OAuth. Email/password authentication can never grant admin access.
- **Strict Email Access**: Restricted to designated admin email address (`career@labdox.com`). Non-authorized Google accounts are denied access.
- **Role-Based Access Control**: Backend `adminMiddleware` verifies `req.user.role === "admin"` before serving any admin API route.

### 5. Admin Dashboard
- **Applicant Table**: Displays Full Name, Email, Phone, Interest Reason, Use Case, Submission Time, Auth Provider, Email & Phone Verification status, and Approval Status.
- **Interactive Controls**: Real-time search by name, email, or phone number, with dropdown filters for email/phone verification and approval status.
- **Approval Logic**: Server enforces that users must have **both email and phone verified** before they can be approved.

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone git@github.com:AAshu1412/labdox-ashutosh.git
cd labdox-ashutosh

# Install Server Dependencies
cd server
pnpm install

# Install Client Dependencies
cd ../client
pnpm install
```

### 2. Environment Configuration

Create a `.env` file in both `server/` and `client/` based on the provided `.env.example` files.

#### `server/.env`
```env
PORT=5000
MONGODB_URL=mongodb://localhost:27017/labdox
JWT_SECRET_KEY=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173

# SMTP Settings for Email OTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=your_email@gmail.com

# Google OAuth Settings
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/oauth/google/callback
GOOGLE_ADMIN_REDIRECT_URI=http://localhost:5000/api/oauth/google/admin/callback

# Twilio settings 
TWILIO_ACCOUNT_SID = your_twilio_account_sid
TWILIO_AUTH_TOKEN = your_twilio_auth_token
TWILIO_PHONE_NUMBER = your_twilio_phone_number
```

#### `client/.env`
```env
VITE_BACKEND_URL=http://localhost:5000
```

### 3. Run Locally

```bash
# Terminal 1: Start Backend Server
cd server
npm run dev

# Terminal 2: Start Frontend App
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📊 Database Schemas

### User Schema (`users`)
- `fullName`: String (Required)
- `email`: String (Required, Unique, Lowercase)
- `phone`: String (Required, Unique, Indian Mobile Format)
- `password`: String (Hashed with Bcrypt)
- `interestReason`: String
- `useCase`: String
- `authProvider`: String (`"email"` | `"google"`)
- `role`: String (`"user"` | `"admin"`)
- `isEmailVerified`: Boolean (Default: `false`)
- `isPhoneVerified`: Boolean (Default: `false`)
- `approvalStatus`: String (`"pending"` | `"approved"` | `"rejected"`)
- `createdAt`: Date

### OTP Verification Schemas (`emailotpverifications` & `phoneotpverifications`)
- `userId`: ObjectId (Ref: `User`)
- `email` / `phone`: String
- `otp`: String (Bcrypt Hash)
- `attempts`: Number
- `createdAt`: Date (TTL index: 300s expiry)

---

## 🌐 Deployment Instructions (Vercel)

### Client Deployment
1. Import `client/` directory into Vercel.
2. Set Environment Variable: `VITE_BACKEND_URL=https://your-backend-api.vercel.app`
3. Deploy!

### Server Deployment
1. Import `server/` directory into Vercel or Render.
2. Set Environment Variables from `server/.env.example`.
3. Whitelist deployed callback URLs in Google Cloud Console (`https://your-backend-api.vercel.app/api/oauth/google/callback`).

---

## 🔬 Testing Instructions

1. **User Signup**: Go to `/register`, fill out form details, and submit.
2. **Email OTP**: On the `/verify` page, click "Send Email OTP". Enter the 5-digit OTP sent to your inbox.
3. **Phone OTP**: On `/verify`, click "Send Phone OTP". The mock OTP will appear in the test banner on screen and in server console logs. Click "Fill OTP" and submit.
4. **Google User Auth**: Log in via Google to test automatic email verification & registration completion flow.
5. **Admin Access**: Navigate to `/login`, click "Sign in as Admin with Google". Access the dashboard at `/admin/users` to view, filter, approve, or reject applicants.
