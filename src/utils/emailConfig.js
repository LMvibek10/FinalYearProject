import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Log environment variables (without exposing the password)
console.log('Email configuration:', {
  hasUser: !!process.env.EMAIL_USER,
  hasPassword: !!process.env.EMAIL_PASSWORD
});

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'np03cs4s230035@heraldcollege.edu.np',
    pass: 'vuwc lqrs iefh orin'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test the connection
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

export const sendOTPEmail = async (email, otp) => {
  try {
    console.log('Starting email send process...');
    
    const mailOptions = {
      from: {
        name: 'RentEase',
        address: 'rentease.app@gmail.com' // Replace with your Gmail
      },
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

    console.log('Attempting to send email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Detailed error sending email:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    return false;
  }
};

export default transporter; 