// Email configuration
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // Add to your .env file
    pass: process.env.EMAIL_PASS  // Add app password to your .env file
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  debug: true,          // Enable for debugging
  logger: true
});
// Add this after creating transporter to verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});


// Email sending function for password reset
const sendPasswordResetEmail = async (email, resetToken, name, userId) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&id=${userId}`;
  
  const mailOptions = {
    from: {
      name: 'InternMatch',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: 'InternMatch - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password for your InternMatch account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">© 2025 InternMatch. All rights reserved.</p>
      </div>
    `
  };
  return await transporter.sendMail(mailOptions);
};

// Utility function to generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
};

// Utility function to send email
const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'InternMatch - Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to InternMatch!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering with InternMatch. Please verify your email address using the OTP below:</p>
        <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; text-align: center;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP is valid for 5 minutes only.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">© 2025 InternMatch. All rights reserved.</p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = { generateOTP, sendOTPEmail, sendPasswordResetEmail };
