# Email Verification OTP API Documentation

This document describes the email verification OTP (One-Time Password) functionality added to the InternMatch application. These APIs enable secure email verification during user registration and provide OTP management features.

***

## Table of Contents
1. [Overview](#overview)
2. [Setup Requirements](#setup-requirements)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Usage Examples](#usage-examples)

***

## Overview

The Email Verification OTP system provides:
- **Secure registration** with email verification
- **6-digit OTP generation** with 5-minute expiry
- **Rate limiting** to prevent spam
- **Attempt limiting** for security
- **Professional email templates**
- **Integration** with existing authentication system

### Key Features
- ✅ OTP expires after 5 minutes
- ✅ Rate limiting: 1 minute between OTP requests
- ✅ Maximum 5 failed verification attempts per OTP
- ✅ HTML email templates with styling
- ✅ Automatic cleanup of expired OTPs
- ✅ Email verification required before login

***

## Setup Requirements

### Environment Variables
Add these to your `.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-jwt-secret
MONGODB_URI=your-mongodb-uri
```

### Dependencies
```bash
npm install nodemailer crypto
```

***

## API Endpoints

### 1. Register User (Modified)

**Endpoint:** `POST /api/auth/register`

**Description:** Register a new user and send OTP verification email.

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

**Success Response (200):**
```json
{
  "message": "Registration successful. Please check your email for verification code.",
  "email": "john.smith@example.com",
  "needsVerification": true
}
```

**Error Response (400):**
```json
{
  "message": "User already exists and verified"
}
```

**Error Response (500):**
```json
{
  "message": "Server error",
  "error": "Error details"
}
```

***

### 2. Send Verification OTP

**Endpoint:** `POST /api/auth/send-verification-otp`

**Description:** Send OTP to user's email for verification.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.smith@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "Verification code sent to your email",
  "email": "john.smith@example.com"
}
```

**Error Response (404):**
```json
{
  "message": "User not found"
}
```

**Error Response (400):**
```json
{
  "message": "Email already verified"
}
```

**Error Response (429):**
```json
{
  "message": "Please wait 1 minute before requesting new OTP"
}
```

***

### 3. Verify Email with OTP

**Endpoint:** `POST /api/auth/verify-email`

**Description:** Verify email address using the OTP sent to user's email.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.smith@example.com",
  "otp": "123456"
}
```

**Field Descriptions:**
- `email` (string, required): Email address to verify
- `otp` (string, required): 6-digit OTP received via email

**Success Response (200):**
```json
{
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64aae479cd22ea720ec6cd9e",
    "name": "John Smith",
    "email": "john.smith@example.com",
    "role": "student",
    "isVerified": true
  }
}
```

**Error Response (400):**
```json
{
  "message": "Invalid or expired OTP"
}
```

**Error Response (404):**
```json
{
  "message": "User not found"
}
```

**Error Response (429):**
```json
{
  "message": "Too many failed attempts. Please request a new OTP."
}
```

***

### 4. Resend Verification OTP

**Endpoint:** `POST /api/auth/resend-verification-otp`

**Description:** Resend OTP verification code to user's email.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.smith@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "New verification code sent to your email"
}
```

**Error Response (404):**
```json
{
  "message": "User not found"
}
```

**Error Response (400):**
```json
{
  "message": "Email already verified"
}
```

**Error Response (429):**
```json
{
  "message": "Please wait 1 minute before requesting new OTP"
}
```

***

### 5. Login (Modified)

**Endpoint:** `POST /api/auth/login`

**Description:** Login user with email verification check.

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64aae479cd22ea720ec6cd9e",
    "name": "John Smith",
    "email": "john.smith@example.com",
    "role": "student",
    "isVerified": true
  }
}
```

**Error Response (403):**
```json
{
  "message": "Please verify your email before logging in",
  "needsVerification": true,
  "email": "john.smith@example.com"
}
```

**Error Response (400):**
```json
{
  "message": "Invalid credentials"
}
```

***

## Data Models

### OTP Schema

```javascript
{
  email: String,           // User's email address
  otp: String,            // 6-digit OTP code
  createdAt: Date,        // Creation timestamp (expires after 5 minutes)
  verified: Boolean,      // Verification status
  attempts: Number        // Failed verification attempts count
}
```

### Updated User Schema

```javascript
{
  name: String,           // User's full name
  email: String,          // User's email (unique)
  password: String,       // Hashed password
  role: String,           // "student" | "company" | "admin"
  isVerified: Boolean,    // Email verification status
  emailVerifiedAt: Date,  // Verification timestamp
  createdAt: Date        // Registration timestamp
}
```

***

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input or business logic error |
| 403 | Forbidden - Email not verified |
| 404 | Not Found - User not found |
| 429 | Too Many Requests - Rate limiting triggered |
| 500 | Internal Server Error |

### Common Error Responses

**Validation Error:**
```json
{
  "message": "Email and OTP are required"
}
```

**Rate Limiting Error:**
```json
{
  "message": "Please wait 1 minute before requesting new OTP"
}
```

**Server Error:**
```json
{
  "message": "Server error",
  "error": "Detailed error message"
}
```

***

## Usage Examples

### Frontend Implementation

#### 1. Registration Flow

```javascript
// Step 1: Register user
const register = async (userData) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (data.needsVerification) {
      // Show OTP verification form
      showOTPForm(data.email);
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Step 2: Verify OTP
const verifyOTP = async (email, otp) => {
  try {
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      // Show error message
      showError(data.message);
    }
    
    return data;
  } catch (error) {
    console.error('OTP verification error:', error);
    throw error;
  }
};

// Step 3: Resend OTP if needed
const resendOTP = async (email) => {
  try {
    const response = await fetch('/api/auth/resend-verification-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    showSuccess(data.message);
    
    return data;
  } catch (error) {
    console.error('Resend OTP error:', error);
    throw error;
  }
};
```

#### 2. Complete Registration Component (React)

```jsx
import React, { useState } from 'react';

const Registration = () => {
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (formData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.needsVerification) {
        setEmail(data.email);
        setStep('verify');
      }
    } catch (error) {
      alert('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert('Failed to resend OTP');
    }
  };

  if (step === 'verify') {
    return (
      <div className="otp-verification">
        <h2>Verify Your Email</h2>
        <p>We've sent a 6-digit code to {email}</p>
        
        <input
          type="text"
          value={otp}
          onChange={(e) => setOTP(e.target.value)}
          placeholder="Enter 6-digit OTP"
          maxLength={6}
        />
        
        <button onClick={handleVerifyOTP} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
        
        <button onClick={handleResendOTP} className="link-button">
          Didn't receive code? Resend
        </button>
      </div>
    );
  }

  // Registration form component would go here
  return <RegistrationForm onSubmit={handleRegister} loading={loading} />;
};

export default Registration;
```

#### 3. Login with Verification Check

```javascript
const login = async (email, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else if (data.needsVerification) {
      // Redirect to email verification
      showOTPForm(data.email);
    } else {
      // Show login error
      showError(data.message);
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
```

### Email Template

The system sends professional HTML emails with the following structure:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Welcome to InternMatch!</h2>
  <p>Hi {name},</p>
  <p>Thank you for registering with InternMatch. Please verify your email address using the OTP below:</p>
  <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; text-align: center;">
    <h1 style="color: #007bff; font-size: 32px; margin: 0;">{otp}</h1>
  </div>
  <p>This OTP is valid for 5 minutes only.</p>
  <p>If you didn't request this verification, please ignore this email.</p>
  <hr>
  <p style="color: #666; font-size: 12px;">© 2025 InternMatch. All rights reserved.</p>
</div>
```

***

## Security Features

1. **OTP Expiry**: All OTPs expire after 5 minutes
2. **Rate Limiting**: Users can request new OTP only after 1 minute
3. **Attempt Limiting**: Maximum 5 failed verification attempts per OTP
4. **Automatic Cleanup**: Expired OTPs are automatically removed from database
5. **Password Hashing**: User passwords are hashed using bcrypt
6. **JWT Authentication**: Secure token-based authentication after verification

***

## Notes

- **Email Service**: Currently configured for Gmail. Update transporter configuration for other email services
- **Environment Setup**: Ensure all environment variables are properly configured
- **Error Handling**: All endpoints include comprehensive error handling
- **Database**: MongoDB with automatic TTL (Time To Live) for OTP documents
- **Testing**: Test with valid email addresses during development

This documentation provides complete guidance for implementing and using the email verification OTP system in your InternMatch application.

[1](https://nodejs.org/download/release/v0.10.0/docs/api/documentation.html)
[2](https://www.npmjs.com/package/apidoc-markdown)
[3](https://github.com/millermedeiros/mdoc)
[4](https://stackoverflow.com/questions/11969542/how-to-generate-api-documentation)
[5](https://nodejs.org/download/release/v4.4.4/docs/api/documentation.html)
[6](https://apidocjs.com)
[7](https://www.clouddefense.ai/code/javascript/example/jsdoc-to-markdown)
[8](https://www.docuwriter.ai/posts/api-documentation-templates)
[9](https://www.reddit.com/r/node/comments/10mrj4i/nodejs_api_documentation/)