import nodemailer from 'nodemailer';

// Primary: port 465 (SSL) — more reliable than 587 on restricted networks
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,           // true for port 465
  auth: {
    user: process.env['EMAIL_USER'],
    pass: process.env['EMAIL_PASSWORD'],
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 15000,   // 15 seconds
  greetingTimeout: 10000,
  socketTimeout: 20000,
});

export const verifyEmailConnection = async (): Promise<void> => {
  try {
    await transporter.verify();
    console.log('✅ Email server connected successfully');
  } catch (error) {
    // Non-blocking — server starts regardless
    // Orders still work; emails will be skipped silently
    console.warn('⚠️  Email server unavailable (orders will still work):', (error as Error).message);
  }
};

export default transporter;
