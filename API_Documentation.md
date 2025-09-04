# InternMatch API Documentation

---

## Authentication

### Register

**Endpoint**  
`POST /api/auth/register`

**Request Example**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "Secret123",
  "role": "student"
}
```

**Response Example**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciO...api_token...",
  "user": {
    "id": "64aae479cd22ea720ec6cd9e",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "student"
  }
}
```

---

### Login

**Endpoint**  
`POST /api/auth/login`

**Request Example**
```json
{
  "email": "alice@example.com",
  "password": "Secret123"
}
```

**Response Example**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciO...api_token...",
  "user": {
    "id": "64aae479cd22ea720ec6cd9e",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "student"
  }
}
```

---

## Students

### Get Profile

**Endpoint**  
`GET /api/students/profile`  
**Headers:** `Authorization: Bearer <token>`

**Response Example**
```json
{
  "userId": "64aae479cd22ea720ec6cd9e",
  "university": "MIT",
  "skills": ["JavaScript", "React"],
  "gpa": 3.9,
  "resume": "uploads/1693764611123-resume.pdf",
  "status": "active"
}
```

---

### Create or Update Profile

**Endpoint**  
`POST /api/students/profile`  
**Headers:** `Authorization: Bearer <token>`

**Request Example**
```json
{
  "university": "MIT",
  "major": "Engineering",
  "graduationYear": 2025,
  "skills": ["JavaScript", "React"]
}
```

**Response Example**
```json
{
  "userId": "64aae479cd22ea720ec6cd9e",
  "university": "MIT",
  "major": "Engineering",
  "graduationYear": 2025,
  "skills": ["JavaScript", "React"],
  "status": "active"
}
```

---

### Update Skills

**Endpoint**  
`PUT /api/students/skills`  
**Headers:** `Authorization: Bearer <token>`

**Request Example**
```json
{
  "skills": ["Node.js", "MongoDB"]
}
```

**Response Example**
```json
{
  "skills": ["Node.js", "MongoDB"],
  "updatedAt": "2025-09-03T15:46:01.591Z"
}
```

---

### Search Students

**Endpoint**  
`GET /api/students/search?skills=React,Node.js&university=MIT&page=1&limit=5`  
**Headers:** `Authorization: Bearer <token>`

**Response Example**
```json
{
  "students": [
    {
      "userId": { "name": "Alice", "email": "alice@example.com" },
      "university": "MIT",
      "skills": ["React", "Node.js"],
      "status": "active"
    }
  ],
  "totalPages": 1,
  "currentPage": 1
}
```

---

## Companies

### Get Profile

**Endpoint**  
`GET /api/companies/profile`  
**Headers:** `Authorization: Bearer <token>`

**Response Example**
```json
{
  "userId": "64aae56bc618c40e8c9791cd",
  "companyName": "TechCorp",
  "industry": "Software",
  "size": "50-100",
  "location": "San Francisco",
  "verificationStatus": "verified"
}
```

---

### Create or Update Profile

**Endpoint**  
`POST /api/companies/profile`  
**Headers:** `Authorization: Bearer <token>`

**Request Example**
```json
{
  "companyName": "TechCorp",
  "industry": "Software",
  "website": "https://techcorp.com"
}
```

**Response Example**
```json
{
  "userId": "64aae56bc618c40e8c9791cd",
  "companyName": "TechCorp",
  "industry": "Software",
  "website": "https://techcorp.com",
  "status": "active"
}
```

---

## Jobs

### List Jobs

**Endpoint**  
`GET /api/jobs?skills=Node.js&type=full-time&page=1&limit=10`

**Response Example**
```json
{
  "jobs": [
    {
      "_id": "64aae679cd22ea720ec6aaa0",
      "title": "Backend Developer Intern",
      "companyId": { "companyName": "TechCorp" },
      "location": "Bangalore",
      "skills": ["Node.js"],
      "status": "active"
    }
  ],
  "totalPages": 1,
  "currentPage": 1
}
```

---

### Create Job

**Endpoint**  
`POST /api/jobs`  
**Headers:** `Authorization: Bearer <token>`

**Request Example**
```json
{
  "title": "Backend Developer Intern",
  "description": "Build scalable web APIs.",
  "skills": ["Node.js", "MongoDB"],
  "location": "Bangalore",
  "type": "full-time",
  "duration": "3 months"
}
```

**Response Example**
```json
{
  "_id": "64aae679cd22ea720ec6aaa0",
  "title": "Backend Developer Intern",
  "companyId": "64aae56bc618c40e8c9791cd",
  "location": "Bangalore",
  "skills": ["Node.js", "MongoDB"],
  "type": "full-time",
  "duration": "3 months",
  "status": "active"
}
```

---

### Get Specific Job

**Endpoint**  
`GET /api/jobs/:id`

**Response Example**
```json
{
  "_id": "64aae679cd22ea720ec6aaa0",
  "title": "Backend Developer Intern",
  "description": "Build scalable web APIs.",
  "companyId": { "companyName": "TechCorp" },
  "location": "Bangalore",
  "skills": ["Node.js", "MongoDB"],
  "type": "full-time",
  "duration": "3 months",
  "status": "active"
}
```

---

## Applications

### Apply for Job

**Endpoint**  
`POST /api/applications`  
**Headers:** `Authorization: Bearer <token>`

**Request Example**
```json
{
  "jobId": "64aae679cd22ea720ec6aaa0",
  "coverLetter": "I am excited to apply for this internship!"
}
```

**Response Example**
```json
{
  "studentId": "64aae479cd22ea720ec6cd9e",
  "jobId": "64aae679cd22ea720ec6aaa0",
  "companyId": "64aae56bc618c40e8c9791cd",
  "status": "applied",
  "coverLetter": "I am excited to apply for this internship!"
}
```

---

### Get Student Applications

**Endpoint**  
`GET /api/applications/student`  
**Headers:** `Authorization: Bearer <token>`

**Response Example**
```json
[
  {
    "jobId": { "title": "Backend Developer Intern" },
    "companyId": { "companyName": "TechCorp" },
    "status": "applied"
  }
]
```

---

### Get Company Applications

**Endpoint**  
`GET /api/applications/company`  
**Headers:** `Authorization: Bearer <token>`

**Response Example**
```json
[
  {
    "studentId": { "userId": "Alice" },
    "jobId": { "title": "Backend Developer Intern" },
    "status": "applied"
  }
]
```

---

## Assessments

### List Assessments

**Endpoint**  
`GET /api/assessments`

**Response Example**
```json
[
  {
    "_id": "651ef2...",
    "title": "React Basics",
    "skill": "React",
    "duration": 30,
    "passingScore": 6
  }
]
```

---

### Take Assessment

**Endpoint**  
`POST /api/assessments/:id/take`  
**Headers:** `Authorization: Bearer <token>`

**Request Example**
```json
{
  "answers": {}
}
```

**Response Example**
```json
{
  "score": 6,
  "maxScore": 7,
  "percentage": 85.7,
  "level": "Advanced",
  "passed": true
}
```

---

## Uploads

### Upload Resume

**Endpoint**  
`POST /api/upload/resume`  
**Headers:** `Authorization: Bearer <token>`  
**FormData:**  
- **resume:** file

**Response Example**
```json
{
  "message": "Resume uploaded successfully",
  "path": "uploads/1693764611123-resume.pdf"
}
```

---

## Analytics

### Dashboard Analytics

**Endpoint**  
`GET /api/analytics/dashboard`  
**Headers:** `Authorization: Bearer <token>`

**Response Example (for students)**
```json
{
  "totalApplications": 10,
  "activeApplications": 2,
  "shortlistedApplications": 1,
  "profileCompletion": 75,
  "skillsCount": 5,
  "assessmentsPassed": 3
}
```

**Response Example (for companies)**
```json
{
  "totalJobs": 5,
  "activeJobs": 3,
  "totalApplications": 40,
  "pendingApplications": 8,
  "hiredCandidates": 2
}
```

---

## Common Error

**Error Response Example**
```json
{
  "message": "Server error",
  "error": "Description of error"
}
```

---

**Note:**  
- All endpoints use standard JWT Bearer authentication.  
- File upload endpoints require `multipart/form-data`.
