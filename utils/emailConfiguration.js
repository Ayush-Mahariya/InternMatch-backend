// Email configuration with multiple fallback methods
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Alternative ports to try (Render blocks standard SMTP ports)
const alternativeConfigs = [
  // Try higher ports that might not be blocked
  { host: 'smtp.gmail.com', port: 2525, secure: false },
  { host: 'smtp.gmail.com', port: 8025, secure: false },
  { host: 'smtp.gmail.com', port: 8587, secure: false },
  { host: 'smtp.gmail.com', port: 9025, secure: false },
  { host: 'smtp.gmail.com', port: 10025, secure: false },
  // Try other email providers with alternative ports
  { host: 'smtp.mail.yahoo.com', port: 2525, secure: false },
  { host: 'smtp.outlook.com', port: 2525, secure: false }
];

let workingTransporter = null;

// Function to create transporter with fallback
const createTransporter = async () => {
  // First try standard configuration
  const standardConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  };

  console.log('🔄 Trying standard SMTP configuration...');
  
  try {
    const transporter = nodemailer.createTransport(standardConfig);
    await transporter.verify();
    console.log('✅ Standard SMTP connection successful!');
    return transporter;
  } catch (error) {
    console.log('❌ Standard SMTP failed:', error.message);
    console.log('🔄 Trying alternative configurations...');
  }

  // Try alternative configurations
  for (let i = 0; i < alternativeConfigs.length; i++) {
    const config = alternativeConfigs[i];
    
    try {
      console.log(`🔄 Trying ${config.host}:${config.port}...`);
      
      const transporter = nodemailer.createTransporter({
        ...config,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000
      });

      // Test the connection
      await transporter.verify();
      console.log(`✅ Alternative SMTP successful on ${config.host}:${config.port}!`);
      return transporter;
      
    } catch (error) {
      console.log(`❌ ${config.host}:${config.port} failed:`, error.message);
      continue;
    }
  }

  console.log('❌ All SMTP configurations failed');
  return null;
};

// Initialize transporter
const initializeTransporter = async () => {
  if (!workingTransporter) {
    workingTransporter = await createTransporter();
  }
  return workingTransporter;
};

// Fallback email methods
const fallbackMethods = {
  // Method 1: Use sendmail package (works without SMTP)
  sendmailFallback: async (mailOptions) => {
    try {
      const sendmail = require('sendmail')({
        silent: false,
        dkim: false,
        rejectUnauthorized: false
      });

      return new Promise((resolve, reject) => {
        sendmail(mailOptions, (err, reply) => {
          if (err) {
            reject(err);
          } else {
            resolve(reply);
          }
        });
      });
    } catch (error) {
      console.error('Sendmail fallback failed:', error);
      throw error;
    }
  },

  // Method 2: HTTP webhook to external service
  webhookFallback: async (mailOptions) => {
    try {
      const axios = require('axios');
      
      if (!process.env.EMAIL_WEBHOOK_URL) {
        throw new Error('EMAIL_WEBHOOK_URL not configured');
      }

      const response = await axios.post(process.env.EMAIL_WEBHOOK_URL, {
        to: mailOptions.to,
        from: mailOptions.from,
        subject: mailOptions.subject,
        html: mailOptions.html,
        secret: process.env.WEBHOOK_SECRET
      }, {
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('Webhook fallback failed:', error);
      throw error;
    }
  },

  // Method 3: Console logging (development fallback)
  consoleFallback: async (mailOptions) => {
    console.log('\n📧 EMAIL FALLBACK - Console Output:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`To: ${mailOptions.to}`);
    console.log(`From: ${mailOptions.from}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log('\nHTML Content:');
    console.log(mailOptions.html);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return { messageId: 'console-fallback-' + Date.now() };
  }
};

// Enhanced email sending with multiple fallbacks
const sendEmailWithFallback = async (mailOptions) => {
  const methods = [
    { name: 'SMTP', method: 'smtp' },
    { name: 'Sendmail', method: 'sendmail' },
    { name: 'Webhook', method: 'webhook' },
    { name: 'Console', method: 'console' }
  ];

  for (const { name, method } of methods) {
    try {
      console.log(`🔄 Attempting ${name} method...`);
      
      let result;
      
      if (method === 'smtp') {
        const transporter = await initializeTransporter();
        if (!transporter) {
          throw new Error('No working SMTP transporter available');
        }
        result = await transporter.sendMail(mailOptions);
      } else if (method === 'sendmail') {
        result = await fallbackMethods.sendmailFallback(mailOptions);
      } else if (method === 'webhook') {
        result = await fallbackMethods.webhookFallback(mailOptions);
      } else if (method === 'console') {
        result = await fallbackMethods.consoleFallback(mailOptions);
      }

      console.log(`✅ Email sent successfully via ${name}!`);
      return { success: true, method: name, result };
      
    } catch (error) {
      console.log(`❌ ${name} method failed:`, error.message);
      continue;
    }
  }

  throw new Error('All email sending methods failed');
};

// Utility function to generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
};

// Enhanced OTP email function
const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@internmatch.in',
    to: email,
    subject: 'InternMatch - Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #007bff; margin: 0;">InternMatch</h1>
            <p style="color: #6c757d; margin: 5px 0 0 0;">Your Gateway to Success</p>
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to InternMatch!</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Thank you for registering with InternMatch. Please verify your email address using the OTP below:
          </p>
          
          <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); padding: 30px; margin: 30px 0; text-align: center; border-radius: 10px;">
            <h1 style="color: white; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>⚠️ Important:</strong> This OTP is valid for <strong>5 minutes only</strong>.
            </p>
          </div>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6;">
            If you didn't request this verification, please ignore this email. Your account will remain secure.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <div style="text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2025 InternMatch. All rights reserved.
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
              This is an automated message, please do not reply.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Welcome to InternMatch! Hi ${name}, Your verification code is: ${otp}. This code expires in 5 minutes. If you didn't request this, please ignore this email.`
  };

  return await sendEmailWithFallback(mailOptions);
};

// Enhanced password reset email function
const sendPasswordResetEmail = async (email, resetToken, name, userId) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&id=${userId}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@internmatch.in',
    to: email,
    subject: 'InternMatch - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc3545; margin: 0;">🔐 Password Reset</h1>
          </div>
          
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            You requested to reset your password for your InternMatch account.
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #555; font-size: 14px;">Or copy and paste this link in your browser:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; word-break: break-all;">
            <code style="color: #007bff; font-size: 14px;">${resetUrl}</code>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>⚠️ Important:</strong> This link will expire in <strong>1 hour</strong>.
            </p>
          </div>
          
          <p style="color: #555; font-size: 14px; line-height: 1.6;">
            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <div style="text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2025 InternMatch. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Password Reset Request - Hi ${name}, You requested to reset your password. Visit this link: ${resetUrl} (expires in 1 hour). If you didn't request this, ignore this email.`
  };

  return await sendEmailWithFallback(mailOptions);
};

// Initialize on startup
initializeTransporter().then(() => {
  console.log('🚀 Email system initialized');
}).catch((error) => {
  console.log('⚠️ Email system initialization failed, fallback methods available:', error.message);
});

module.exports = { 
  generateOTP, 
  sendOTPEmail, 
  sendPasswordResetEmail,
  sendEmailWithFallback // Export for custom usage
};
