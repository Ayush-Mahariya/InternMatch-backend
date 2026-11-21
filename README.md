# InternMatch — Backend

REST API for **InternMatch**, a platform that matches students with internships. Handles accounts and profiles for
students and companies, job postings, applications, skill assessments, file uploads, analytics and a newsletter.

Frontend: [InternMatch-frontend](https://github.com/Ayush-Mahariya/InternMatch-frontend)

## Stack

Node.js · Express · MongoDB (Mongoose) · Firebase Admin (ID-token verification) · Multer

## How auth works

The client signs in with Firebase Authentication and sends the Firebase ID token as `Authorization: Bearer <token>`.
The `authenticateToken` middleware verifies it with Firebase Admin, then loads the matching user from MongoDB by
Firebase UID, so every protected route has both the verified identity and the app's own user record.

## API

| Prefix | Covers |
|---|---|
| `/api/auth` | Firebase sign-in, email verification, profile, account deletion, stats |
| `/api/students` | Student profiles |
| `/api/companies` | Company profiles |
| `/api/jobs` | Job postings and search |
| `/api/applications` | Applying and reviewing applications |
| `/api/assessments` | Skill assessments |
| `/api/upload` | File uploads (resumes, images) |
| `/api/analytics` | Dashboard metrics |
| `/api/newsletter` | Newsletter sign-up |

Request and response examples: [`API_Documentation.md`](./API_Documentation.md) and
[`OTP_API_documentation.md`](./OTP_API_documentation.md).

## Run locally

Needs Node 18+, a MongoDB instance and a Firebase project with a service account.

```bash
npm install
cp .env.example .env   # fill in MONGODB_URI and the Firebase service-account fields
npm run dev            # or: npm start
```

The API listens on <http://localhost:5000>.
