import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Email configuration loaded:', {
  user: process.env.EMAIL_USER,
  hasPassword: !!process.env.EMAIL_PASSWORD
});

// Create transporter with more detailed configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

export const sendOTPEmail = async (email, otp) => {
  console.log('Attempting to send email to:', email);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('Email configuration is missing');
    return false;
  }

  const mailOptions = {
    from: `"RentEase" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for RentEase Signup',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to RentEase!</h2>
        <p>Your OTP for account verification is:</p>
        <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
      </div>
    `
  };

  try {
    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Please check your email credentials.');
    }
    return false;
  }
};

export default transporter; 