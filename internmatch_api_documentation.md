# InternMatch API Documentation

Complete API reference with detailed examples for all endpoints.

***

## Table of Contents
1. [Authentication](#authentication)
2. [Student Profile](#student-profile)
3. [Company Profile](#company-profile)
4. [Jobs](#jobs)
5. [Applications](#applications)
6. [Assessments](#assessments)
7. [File Uploads](#file-uploads)
8. [Analytics](#analytics)
9. [Error Responses](#error-responses)

***

## Authentication

### Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Register a new user account for students, companies, or admins.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "password": "SecurePassword123",
  "role": "student"
}
```

**Field Descriptions:**
- `name` (string, required): Full name of the user
- `email` (string, required): Valid email address (must be unique)
- `password` (string, required): Password (minimum 6 characters recommended)
- `role` (string, required): User role - "student", "company", or "admin"

**Success Response (201):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGFhZTQ3OWNkMjJlYTcyMGVjNmNkOWUiLCJlbWFpbCI6ImpvaG4uc21pdGhAZXhhbXBsZS5jb20iLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTY5Mzc2NDYxMSwiZXhwIjoxNjkzODUxMDExfQ.abc123",
  "user": {
    "id": "64aae479cd22ea720ec6cd9e",
    "name": "John Smith",
    "email": "john.smith@example.com",
    "role": "student"
  }
}
```

**Error Response (400):**
```json
{
  "message": "User already exists"
}
```

***

### Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive JWT token.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.smith@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGFhZTQ3OWNkMjJlYTcyMGVjNmNkOWUiLCJlbWFpbCI6ImpvaG4uc21pdGhAZXhhbXBsZS5jb20iLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTY5Mzc2NDYxMSwiZXhwIjoxNjkzODUxMDExfQ.abc123",
  "user": {
    "id": "64aae479cd22ea720ec6cd9e",
    "name": "John Smith",
    "email": "john.smith@example.com",
    "role": "student"
  }
}
```

**Error Response (400):**
```json
{
  "message": "Invalid credentials"
}
```

***

### Get User Profile

**Endpoint:** `GET /api/auth/profile`

**Description:** Retrieve the authenticated user's complete profile information including role-specific data.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response for Student (200):**
```json
{
  "success": true,
  "data": {
    "id": "64aae479cd22ea720ec6cd9e",
    "name": "John Smith",
    "email": "john.smith@example.com",
    "role": "student",
    "isVerified": false,
    "createdAt": "2025-09-01T10:00:00.000Z",
    "profile": {
      "university": "Massachusetts Institute of Technology",
      "major": "Computer Science",
      "graduationYear": 2025,
      "gpa": 3.8,
      "skills": ["JavaScript", "React", "Node.js", "Python", "MongoDB"],
      "projects": [
        {
          "title": "E-commerce Platform",
          "description": "Full-stack web application with React and Node.js",
          "technologies": ["React", "Node.js", "MongoDB", "Express"],
          "link": "https://github.com/johnsmith/ecommerce",
          "completedDate": "2024-12-15T00:00:00.000Z"
        }
      ],
      "certifications": [
        {
          "name": "AWS Cloud Practitioner",
          "issuer": "Amazon Web Services",
          "issueDate": "2024-08-15T00:00:00.000Z",
          "credentialId": "AWS-CP-2024-001"
        }
      ],
      "experience": [
        {
          "company": "TechStartup Inc.",
          "position": "Software Engineering Intern",
          "startDate": "2024-06-01T00:00:00.000Z",
          "endDate": "2024-08-31T00:00:00.000Z",
          "description": "Developed RESTful APIs and worked on frontend components"
        }
      ],
      "resume": "uploads/1693764611123-john-smith-resume.pdf",
      "portfolio": "https://johnsmith.dev",
      "linkedIn": "https://linkedin.com/in/johnsmith",
      "github": "https://github.com/johnsmith",
      "skillAssessments": [
        {
          "skill": "JavaScript",
          "score": 8,
          "maxScore": 10,
          "completedDate": "2024-09-01T00:00:00.000Z",
          "level": "Advanced"
        }
      ],
      "preferences": {
        "jobTypes": ["full-time", "remote"],
        "locations": ["San Francisco", "New York", "Remote"],
        "industries": ["Technology", "Fintech"],
        "salaryExpectation": 85000
      },
      "status": "active",
      "profileCompletion": 85
    }
  }
}
```

**Success Response for Company (200):**
```json
{
  "success": true,
  "data": {
    "id": "64aae56bc618c40e8c9791cc",
    "name": "TechCorp HR",
    "email": "hr@techcorp.com",
    "role": "company",
    "isVerified": true,
    "createdAt": "2025-08-15T14:00:00.000Z",
    "profile": {
      "companyName": "TechCorp Solutions",
      "industry": "Software Development",
      "size": "50-100 employees",
      "description": "Leading software development company specializing in web applications and mobile solutions.",
      "website": "https://techcorp.com",
      "location": "San Francisco, CA",
      "contactPerson": "Sarah Johnson",
      "contactPhone": "+1-555-123-4567",
      "logo": "uploads/companies/techcorp-logo.png",
      "verificationStatus": "verified"
    }
  }
}
```

**Success Response for User Without Profile (200):**
```json
{
  "success": true,
  "data": {
    "id": "64aae479cd22ea720ec6cd9e",
    "name": "New User",
    "email": "new.user@example.com",
    "role": "student",
    "isVerified": false,
    "createdAt": "2025-09-04T06:00:00.000Z"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Authentication required"
}
```

**Error Response (403):**
```json
{
  "message": "Invalid token"
}
```

**Error Response (404):**
```json
{
  "message": "User not found"
}
```

**Error Response (500):**
```json
{
  "message": "Server error",
  "error": "Database connection failed"
}
```

***

## Student Profile

### Get Student Profile

**Endpoint:** `GET /api/students/profile`

**Description:** Retrieve the authenticated student's profile information.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "_id": "64aae479cd22ea720ec6cd9f",
  "userId": {
    "_id": "64aae479cd22ea720ec6cd9e",
    "name": "John Smith",
    "email": "john.smith@example.com",
    "role": "student"
  },
  "university": "Massachusetts Institute of Technology",
  "major": "Computer Science",
  "graduationYear": 2025,
  "gpa": 3.8,
  "skills": ["JavaScript", "React", "Node.js", "Python", "MongoDB"],
  "projects": [
    {
      "title": "E-commerce Platform",
      "description": "Full-stack web application with React and Node.js",
      "technologies": ["React", "Node.js", "MongoDB", "Express"],
      "link": "https://github.com/johnsmith/ecommerce",
      "completedDate": "2024-12-15T00:00:00.000Z"
    }
  ],
  "certifications": [
    {
      "name": "AWS Cloud Practitioner",
      "issuer": "Amazon Web Services",
      "issueDate": "2024-08-15T00:00:00.000Z",
      "credentialId": "AWS-CP-2024-001"
    }
  ],
  "experience": [
    {
      "company": "TechStartup Inc.",
      "position": "Software Engineering Intern",
      "startDate": "2024-06-01T00:00:00.000Z",
      "endDate": "2024-08-31T00:00:00.000Z",
      "description": "Developed RESTful APIs and worked on frontend components"
    }
  ],
  "resume": "uploads/1693764611123-john-smith-resume.pdf",
  "portfolio": "https://johnsmith.dev",
  "linkedIn": "https://linkedin.com/in/johnsmith",
  "github": "https://github.com/johnsmith",
  "skillAssessments": [
    {
      "skill": "JavaScript",
      "score": 8,
      "maxScore": 10,
      "completedDate": "2024-09-01T00:00:00.000Z",
      "level": "Advanced"
    }
  ],
  "preferences": {
    "jobTypes": ["full-time", "remote"],
    "locations": ["San Francisco", "New York", "Remote"],
    "industries": ["Technology", "Fintech"],
    "salaryExpectation": 85000
  },
  "status": "active",
  "profileCompletion": 85,
  "updatedAt": "2025-09-03T13:30:45.123Z"
}
```

**Error Response (404):**
```json
{
  "message": "Student profile not found"
}
```

***

### Create/Update Student Profile

**Endpoint:** `POST /api/students/profile`

**Description:** Create or update the authenticated student's profile.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "university": "Massachusetts Institute of Technology",
  "major": "Computer Science",
  "graduationYear": 2025,
  "gpa": 3.8,
  "skills": ["JavaScript", "React", "Node.js", "Python"],
  "projects": [
    {
      "title": "E-commerce Platform",
      "description": "Full-stack web application with React and Node.js",
      "technologies": ["React", "Node.js", "MongoDB"],
      "link": "https://github.com/johnsmith/ecommerce",
      "completedDate": "2024-12-15"
    }
  ],
  "certifications": [
    {
      "name": "AWS Cloud Practitioner",
      "issuer": "Amazon Web Services",
      "issueDate": "2024-08-15",
      "credentialId": "AWS-CP-2024-001"
    }
  ],
  "experience": [
    {
      "company": "TechStartup Inc.",
      "position": "Software Engineering Intern",
      "startDate": "2024-06-01",
      "endDate": "2024-08-31",
      "description": "Developed RESTful APIs and worked on frontend components"
    }
  ],
  "portfolio": "https://johnsmith.dev",
  "linkedIn": "https://linkedin.com/in/johnsmith",
  "github": "https://github.com/johnsmith",
  "preferences": {
    "jobTypes": ["full-time", "remote"],
    "locations": ["San Francisco", "New York", "Remote"],
    "industries": ["Technology", "Fintech"],
    "salaryExpectation": 85000
  }
}
```

**Success Response (200):**
```json
{
  "_id": "64aae479cd22ea720ec6cd9f",
  "userId": "64aae479cd22ea720ec6cd9e",
  "university": "Massachusetts Institute of Technology",
  "major": "Computer Science",
  "graduationYear": 2025,
  "gpa": 3.8,
  "skills": ["JavaScript", "React", "Node.js", "Python"],
  "projects": [
    {
      "title": "E-commerce Platform",
      "description": "Full-stack web application with React and Node.js",
      "technologies": ["React", "Node.js", "MongoDB"],
      "link": "https://github.com/johnsmith/ecommerce",
      "completedDate": "2024-12-15T00:00:00.000Z"
    }
  ],
  "status": "active",
  "profileCompletion": 75,
  "updatedAt": "2025-09-03T13:35:20.456Z"
}
```

***

### Update Student Skills

**Endpoint:** `PUT /api/students/skills`

**Description:** Update only the skills array for the authenticated student.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Docker"]
}
```

**Success Response (200):**
```json
{
  "_id": "64aae479cd22ea720ec6cd9f",
  "userId": "64aae479cd22ea720ec6cd9e",
  "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Docker"],
  "updatedAt": "2025-09-03T13:40:15.789Z"
}
```

***

### Search Students

**Endpoint:** `GET /api/students/search`

**Description:** Search for students based on various criteria (Company users only).

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `skills` (string, optional): Comma-separated list of skills
- `university` (string, optional): University name (partial match)
- `experience` (string, optional): Experience level
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Example Request:**
```
GET /api/students/search?skills=JavaScript,React&university=MIT&page=1&limit=5
```

**Success Response (200):**
```json
{
  "students": [
    {
      "_id": "64aae479cd22ea720ec6cd9f",
      "userId": {
        "name": "John Smith",
        "email": "john.smith@example.com"
      },
      "university": "Massachusetts Institute of Technology",
      "major": "Computer Science",
      "skills": ["JavaScript", "React", "Node.js"],
      "gpa": 3.8,
      "status": "active",
      "skillAssessments": [
        {
          "skill": "JavaScript",
          "level": "Advanced",
          "score": 8,
          "maxScore": 10
        }
      ]
    },
    {
      "_id": "64aae479cd22ea720ec6ce0f",
      "userId": {
        "name": "Jane Doe",
        "email": "jane.doe@example.com"
      },
      "university": "MIT",
      "major": "Software Engineering",
      "skills": ["JavaScript", "React", "Python"],
      "gpa": 3.9,
      "status": "active"
    }
  ],
  "totalPages": 3,
  "currentPage": 1
}
```

**Error Response (403):**
```json
{
  "message": "Access denied"
}
```

***

## Company Profile

### Get Company Profile

**Endpoint:** `GET /api/companies/profile`

**Description:** Retrieve the authenticated company's profile information.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "_id": "64aae56bc618c40e8c9791cd",
  "userId": {
    "_id": "64aae56bc618c40e8c9791cc",
    "name": "TechCorp HR",
    "email": "hr@techcorp.com",
    "role": "company"
  },
  "companyName": "TechCorp Solutions",
  "industry": "Software Development",
  "size": "50-100 employees",
  "description": "Leading software development company specializing in web applications and mobile solutions.",
  "website": "https://techcorp.com",
  "location": "San Francisco, CA",
  "contactPerson": "Sarah Johnson",
  "contactPhone": "+1-555-123-4567",
  "logo": "uploads/companies/techcorp-logo.png",
  "verificationStatus": "verified",
  "updatedAt": "2025-09-03T13:25:30.123Z"
}
```

**Error Response (404):**
```json
{
  "message": "Company profile not found"
}
```

***

### Create/Update Company Profile

**Endpoint:** `POST /api/companies/profile`

**Description:** Create or update the authenticated company's profile.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "companyName": "TechCorp Solutions",
  "industry": "Software Development",
  "size": "50-100 employees",
  "description": "Leading software development company specializing in web applications and mobile solutions.",
  "website": "https://techcorp.com",
  "location": "San Francisco, CA",
  "contactPerson": "Sarah Johnson",
  "contactPhone": "+1-555-123-4567"
}
```

**Success Response (200):**
```json
{
  "_id": "64aae56bc618c40e8c9791cd",
  "userId": "64aae56bc618c40e8c9791cc",
  "companyName": "TechCorp Solutions",
  "industry": "Software Development",
  "size": "50-100 employees",
  "description": "Leading software development company specializing in web applications and mobile solutions.",
  "website": "https://techcorp.com",
  "location": "San Francisco, CA",
  "contactPerson": "Sarah Johnson",
  "contactPhone": "+1-555-123-4567",
  "verificationStatus": "pending",
  "updatedAt": "2025-09-03T13:45:22.567Z"
}
```

***

## Jobs

### List Jobs

**Endpoint:** `GET /api/jobs`

**Description:** Retrieve a paginated list of active job postings with optional filtering.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `skills` (string, optional): Comma-separated list of required skills
- `location` (string, optional): Job location (partial match)
- `type` (string, optional): Job type - "full-time", "part-time", or "remote"

**Example Request:**
```
GET /api/jobs?skills=JavaScript,React&type=full-time&location=San Francisco&page=1&limit=5
```

**Success Response (200):**
```json
{
  "jobs": [
    {
      "_id": "64aae679cd22ea720ec6aaa0",
      "companyId": {
        "_id": "64aae56bc618c40e8c9791cd",
        "companyName": "TechCorp Solutions",
        "location": "San Francisco, CA",
        "logo": "uploads/companies/techcorp-logo.png"
      },
      "title": "Frontend Developer Internship",
      "description": "Join our team to build amazing user interfaces using React and modern JavaScript.",
      "requirements": [
        "Strong knowledge of JavaScript and React",
        "Experience with HTML5 and CSS3",
        "Understanding of RESTful APIs"
      ],
      "skills": ["JavaScript", "React", "HTML", "CSS"],
      "location": "San Francisco, CA",
      "duration": "3 months",
      "stipend": 2000,
      "type": "full-time",
      "positions": 2,
      "status": "active",
      "createdAt": "2025-09-01T10:00:00.000Z",
      "deadline": "2025-09-30T23:59:59.000Z",
      "applications": []
    },
    {
      "_id": "64aae679cd22ea720ec6aaa1",
      "companyId": {
        "_id": "64aae56bc618c40e8c9791cd",
        "companyName": "DataTech Inc.",
        "location": "San Francisco, CA"
      },
      "title": "Backend Developer Internship",
      "description": "Work on scalable backend systems using Node.js and databases.",
      "requirements": [
        "Proficiency in Node.js",
        "Database experience (MongoDB/PostgreSQL)",
        "Understanding of API development"
      ],
      "skills": ["Node.js", "MongoDB", "Express", "JavaScript"],
      "location": "San Francisco, CA",
      "duration": "6 months",
      "stipend": 2500,
      "type": "full-time",
      "positions": 1,
      "status": "active",
      "createdAt": "2025-09-02T14:30:00.000Z",
      "deadline": "2025-10-15T23:59:59.000Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1
}
```

***

### Create Job

**Endpoint:** `POST /api/jobs`

**Description:** Create a new job posting (Company users only).

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Full Stack Developer Internship",
  "description": "Work on both frontend and backend development using modern technologies. You'll be part of a dynamic team building innovative web applications.",
  "requirements": [
    "Strong knowledge of JavaScript",
    "Experience with React or Vue.js",
    "Backend development with Node.js",
    "Database experience (MongoDB or PostgreSQL)",
    "Understanding of version control (Git)"
  ],
  "skills": ["JavaScript", "React", "Node.js", "MongoDB", "Git"],
  "location": "New York, NY",
  "duration": "6 months",
  "stipend": 3000,
  "type": "full-time",
  "positions": 3,
  "deadline": "2025-10-31T23:59:59.000Z"
}
```

**Success Response (201):**
```json
{
  "_id": "64aae679cd22ea720ec6aaa2",
  "companyId": "64aae56bc618c40e8c9791cd",
  "title": "Full Stack Developer Internship",
  "description": "Work on both frontend and backend development using modern technologies. You'll be part of a dynamic team building innovative web applications.",
  "requirements": [
    "Strong knowledge of JavaScript",
    "Experience with React or Vue.js",
    "Backend development with Node.js",
    "Database experience (MongoDB or PostgreSQL)",
    "Understanding of version control (Git)"
  ],
  "skills": ["JavaScript", "React", "Node.js", "MongoDB", "Git"],
  "location": "New York, NY",
  "duration": "6 months",
  "stipend": 3000,
  "type": "full-time",
  "positions": 3,
  "status": "active",
  "applications": [],
  "createdAt": "2025-09-03T13:50:15.789Z",
  "deadline": "2025-10-31T23:59:59.000Z"
}
```

**Error Response (403):**
```json
{
  "message": "Only companies can post jobs"
}
```

***

### Get Specific Job

**Endpoint:** `GET /api/jobs/:id`

**Description:** Retrieve detailed information about a specific job posting.

**Path Parameters:**
- `id` (string, required): Job ID

**Example Request:**
```
GET /api/jobs/64aae679cd22ea720ec6aaa0
```

**Success Response (200):**
```json
{
  "_id": "64aae679cd22ea720ec6aaa0",
  "companyId": {
    "_id": "64aae56bc618c40e8c9791cd",
    "companyName": "TechCorp Solutions",
    "industry": "Software Development",
    "location": "San Francisco, CA",
    "website": "https://techcorp.com",
    "logo": "uploads/companies/techcorp-logo.png",
    "verificationStatus": "verified"
  },
  "title": "Frontend Developer Internship",
  "description": "Join our team to build amazing user interfaces using React and modern JavaScript. You'll work closely with our senior developers and gain hands-on experience in a fast-paced environment.",
  "requirements": [
    "Strong knowledge of JavaScript and React",
    "Experience with HTML5 and CSS3",
    "Understanding of RESTful APIs",
    "Familiarity with version control systems (Git)",
    "Good communication skills"
  ],
  "skills": ["JavaScript", "React", "HTML", "CSS", "Git"],
  "location": "San Francisco, CA",
  "duration": "3 months",
  "stipend": 2000,
  "type": "full-time",
  "positions": 2,
  "status": "active",
  "applications": [
    {
      "studentId": "64aae479cd22ea720ec6cd9e",
      "appliedDate": "2025-09-02T10:30:00.000Z",
      "status": "applied"
    }
  ],
  "createdAt": "2025-09-01T10:00:00.000Z",
  "deadline": "2025-09-30T23:59:59.000Z"
}
```

**Error Response (404):**
```json
{
  "message": "Job not found"
}
```

***

## Applications

### Apply for Job

**Endpoint:** `POST /api/applications`

**Description:** Submit an application for a specific job (Student users only).

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobId": "64aae679cd22ea720ec6aaa0",
  "coverLetter": "Dear Hiring Manager,\n\nI am excited to apply for the Frontend Developer Internship position at TechCorp Solutions. With my strong foundation in JavaScript and React, along with my passion for creating intuitive user interfaces, I believe I would be a valuable addition to your team.\n\nI have completed several personal projects using React, including an e-commerce platform that showcases my ability to build responsive and user-friendly applications. My experience with modern development tools and practices, combined with my eagerness to learn and grow, makes me well-suited for this role.\n\nI look forward to the opportunity to contribute to your team and learn from experienced developers.\n\nBest regards,\nJohn Smith"
}
```

**Success Response (201):**
```json
{
  "_id": "64aae789cd22ea720ec6bbb1",
  "studentId": "64aae479cd22ea720ec6cd9f",
  "jobId": "64aae679cd22ea720ec6aaa0",
  "companyId": "64aae56bc618c40e8c9791cd",
  "status": "applied",
  "appliedDate": "2025-09-03T14:00:25.123Z",
  "coverLetter": "Dear Hiring Manager,\n\nI am excited to apply for the Frontend Developer Internship position at TechCorp Solutions...",
  "notes": "",
  "interviewDate": null,
  "feedback": ""
}
```

**Error Response (400):**
```json
{
  "message": "Already applied for this job"
}
```

**Error Response (404):**
```json
{
  "message": "Job not found"
}
```

**Error Response (403):**
```json
{
  "message": "Only students can apply for jobs"
}
```

***

### Get Student Applications

**Endpoint:** `GET /api/applications/student`

**Description:** Retrieve all applications submitted by the authenticated student.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
[
  {
    "_id": "64aae789cd22ea720ec6bbb1",
    "jobId": {
      "_id": "64aae679cd22ea720ec6aaa0",
      "title": "Frontend Developer Internship",
      "location": "San Francisco, CA",
      "stipend": 2000,
      "type": "full-time",
      "status": "active"
    },
    "companyId": {
      "_id": "64aae56bc618c40e8c9791cd",
      "companyName": "TechCorp Solutions",
      "location": "San Francisco, CA",
      "logo": "uploads/companies/techcorp-logo.png"
    },
    "status": "shortlisted",
    "appliedDate": "2025-09-03T14:00:25.123Z",
    "coverLetter": "Dear Hiring Manager...",
    "interviewDate": "2025-09-10T10:00:00.000Z",
    "feedback": "Great application! We'd like to schedule an interview."
  },
  {
    "_id": "64aae789cd22ea720ec6bbb2",
    "jobId": {
      "_id": "64aae679cd22ea720ec6aaa1",
      "title": "Backend Developer Internship",
      "location": "San Francisco, CA",
      "stipend": 2500,
      "type": "full-time",
      "status": "active"
    },
    "companyId": {
      "_id": "64aae56bc618c40e8c9791ce",
      "companyName": "DataTech Inc.",
      "location": "San Francisco, CA"
    },
    "status": "applied",
    "appliedDate": "2025-09-02T16:30:10.456Z",
    "coverLetter": "I am interested in the Backend Developer position...",
    "interviewDate": null,
    "feedback": ""
  }
]
```

**Error Response (403):**
```json
{
  "message": "Access denied"
}
```

***

### Get Company Applications

**Endpoint:** `GET /api/applications/company`

**Description:** Retrieve all applications for jobs posted by the authenticated company.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
[
  {
    "_id": "64aae789cd22ea720ec6bbb1",
    "studentId": {
      "_id": "64aae479cd22ea720ec6cd9f",
      "userId": {
        "name": "John Smith",
        "email": "john.smith@example.com"
      },
      "university": "Massachusetts Institute of Technology",
      "major": "Computer Science",
      "skills": ["JavaScript", "React", "Node.js"],
      "gpa": 3.8,
      "resume": "uploads/1693764611123-john-smith-resume.pdf"
    },
    "jobId": {
      "_id": "64aae679cd22ea720ec6aaa0",
      "title": "Frontend Developer Internship",
      "location": "San Francisco, CA"
    },
    "status": "applied",
    "appliedDate": "2025-09-03T14:00:25.123Z",
    "coverLetter": "Dear Hiring Manager,\n\nI am excited to apply...",
    "notes": "Strong candidate with relevant skills",
    "interviewDate": null,
    "feedback": ""
  },
  {
    "_id": "64aae789cd22ea720ec6bbb3",
    "studentId": {
      "_id": "64aae479cd22ea720ec6ce0f",
      "userId": {
        "name": "Jane Doe",
        "email": "jane.doe@example.com"
      },
      "university": "Stanford University",
      "major": "Software Engineering",
      "skills": ["JavaScript", "React", "Python"],
      "gpa": 3.9
    },
    "jobId": {
      "_id": "64aae679cd22ea720ec6aaa0",
      "title": "Frontend Developer Internship",
      "location": "San Francisco, CA"
    },
    "status": "shortlisted",
    "appliedDate": "2025-09-01T11:15:30.789Z",
    "coverLetter": "I am very interested in this opportunity...",
    "notes": "Excellent GPA and strong technical skills",
    "interviewDate": "2025-09-08T14:00:00.000Z",
    "feedback": "Interview scheduled for next week"
  }
]
```

**Error Response (403):**
```json
{
  "message": "Access denied"
}
```

***

## Assessments

### List Assessments

**Endpoint:** `GET /api/assessments`

**Description:** Retrieve a list of all available skill assessments.

**Success Response (200):**
```json
[
  {
    "_id": "64aae899cd22ea720ec6ccc1",
    "title": "JavaScript Fundamentals",
    "skill": "JavaScript",
    "duration": 30,
    "passingScore": 7,
    "createdAt": "2025-08-15T10:00:00.000Z",
    "questions": [
      {
        "question": "What is the difference between let and var in JavaScript?",
        "options": [
          "No difference",
          "let has block scope, var has function scope",
          "var has block scope, let has function scope",
          "Both have global scope"
        ],
        "difficulty": "medium"
      }
    ]
  },
  {
    "_id": "64aae899cd22ea720ec6ccc2",
    "title": "React Basics",
    "skill": "React",
    "duration": 25,
    "passingScore": 6,
    "createdAt": "2025-08-16T14:00:00.000Z",
    "questions": [
      {
        "question": "What is JSX in React?",
        "options": [
          "A JavaScript extension",
          "A syntax extension for JavaScript",
          "A new programming language",
          "A CSS framework"
        ],
        "difficulty": "easy"
      }
    ]
  },
  {
    "_id": "64aae899cd22ea720ec6ccc3",
    "title": "Node.js Backend Development",
    "skill": "Node.js",
    "duration": 40,
    "passingScore": 8,
    "createdAt": "2025-08-17T09:30:00.000Z"
  }
]
```

***

### Take Assessment

**Endpoint:** `POST /api/assessments/:id/take`

**Description:** Submit answers for a specific assessment (Student users only).

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, required): Assessment ID

**Request Body:**
```json
{
  "answers": [1, 2, 0, 3, 1, 2, 3, 0, 1, 2]
}
```

**Field Descriptions:**
- `answers` (array of numbers, required): Array of selected answer indices (0-based) for each question

**Example Request:**
```
POST /api/assessments/64aae899cd22ea720ec6ccc1/take
```

**Success Response (200):**
```json
{
  "score": 8,
  "maxScore": 10,
  "percentage": 80.0,
  "level": "Advanced",
  "passed": true
}
```

**Assessment Levels:**
- **Advanced**: 80% or higher
- **Intermediate**: 60-79%
- **Beginner**: Below 60%

**Error Response (404):**
```json
{
  "message": "Assessment not found"
}
```

**Error Response (403):**
```json
{
  "message": "Only students can take assessments"
}
```

***

## File Uploads

### Upload Resume

**Endpoint:** `POST /api/upload/resume`

**Description:** Upload a resume file for the authenticated student.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

**Form Data:**
- `resume` (file, required): Resume file (PDF, DOC, or DOCX)

**Success Response (200):**
```json
{
  "message": "Resume uploaded successfully",
  "path": "uploads/1693764611123-john-smith-resume.pdf"
}
```

**Error Response (400):**
```json
{
  "message": "No file uploaded"
}
```

***

## Analytics

### Dashboard Analytics

**Endpoint:** `GET /api/analytics/dashboard`

**Description:** Retrieve dashboard analytics data based on user role.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response for Students (200):**
```json
{
  "totalApplications": 15,
  "activeApplications": 8,
  "shortlistedApplications": 3,
  "rejectedApplications": 2,
  "hiredApplications": 2,
  "profileCompletion": 85,
  "skillsCount": 6,
  "assessmentsPassed": 4,
  "averageAssessmentScore": 82.5,
  "recentApplications": [
    {
      "jobTitle": "Frontend Developer Internship",
      "companyName": "TechCorp Solutions",
      "appliedDate": "2025-09-03T14:00:25.123Z",
      "status": "shortlisted"
    }
  ]
}
```

**Success Response for Companies (200):**
```json
{
  "totalJobs": 8,
  "activeJobs": 5,
  "closedJobs": 3,
  "draftJobs": 0,
  "totalApplications": 124,
  "pendingApplications": 45,
  "reviewedApplications": 32,
  "shortlistedApplications": 28,
  "rejectedApplications": 15,
  "hiredCandidates": 4,
  "averageApplicationsPerJob": 15.5,
  "topSkillsRequested": [
    { "skill": "JavaScript", "count": 6 },
    { "skill": "React", "count": 5 },
    { "skill": "Node.js", "count": 4 }
  ],
  "recentApplications": [
    {
      "studentName": "John Smith",
      "jobTitle": "Frontend Developer Internship",
      "appliedDate": "2025-09-03T14:00:25.123Z",
      "status": "applied"
    }
  ]
}
```

***

## Error Responses

### Common Error Status Codes

**400 Bad Request**
```json
{
  "message": "Invalid request data",
  "error": "Missing required field: email"
}
```

**401 Unauthorized**
```json
{
  "message": "Authentication required"
}
```

**403 Forbidden**
```json
{
  "message": "Access denied",
  "error": "Insufficient permissions for this operation"
}
```

**404 Not Found**
```json
{
  "message": "Resource not found",
  "error": "Job with ID 64aae679cd22ea720ec6aaa0 does not exist"
}
```

**500 Internal Server Error**
```json
{
  "message": "Server error",
  "error": "Database connection failed"
}
```

***

## Authentication Notes

- All protected endpoints require a valid JWT token in the Authorization header
- Token format: `Authorization: Bearer <your-jwt-token>`
- Tokens expire after 24 hours
- Include the token received from login/register in all subsequent requests
- Role-based access control is enforced (students can only access student endpoints, companies can only access company endpoints)

***

## Rate Limiting

- All endpoints are rate-limited to prevent abuse
- Standard limit: 100 requests per minute per IP
- File upload endpoints: 10 requests per minute per user
- Assessment endpoints: 5 attempts per assessment per day per student
