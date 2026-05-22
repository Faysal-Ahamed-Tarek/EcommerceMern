import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string) {
  await transporter.sendMail({
    from: `"ShopBD Admin" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Admin Password Reset',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#1e293b;margin-bottom:8px;">Password Reset Request</h2>
        <p style="color:#475569;margin-bottom:24px;">
          You requested a password reset for your ShopBD admin account.
          Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
          Reset Password
        </a>
        <p style="color:#94a3b8;font-size:12px;margin-top:28px;">
          If you did not request this, ignore this email — your password will not change.<br/>
          Link: <a href="${resetUrl}" style="color:#94a3b8;">${resetUrl}</a>
        </p>
      </div>
    `,
  });
}
