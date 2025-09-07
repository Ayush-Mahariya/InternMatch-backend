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
  }
});

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

module.exports = { generateOTP, sendOTPEmail };
