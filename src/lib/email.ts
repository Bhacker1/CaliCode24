import nodemailer from "nodemailer";

// Create transporter lazily so env vars are definitely loaded
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "in-v3.mailjet.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // false for port 587 — uses STARTTLS upgrade
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
  });
}

const FROM = process.env.SMTP_FROM || "calicode24.mail@gmail.com";

export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationUrl: string
) {
  const transporter = getTransporter();

  console.log("[email] Sending verification email to:", to);
  console.log("[email] SMTP host:", process.env.SMTP_HOST);
  console.log("[email] SMTP port:", process.env.SMTP_PORT);
  console.log("[email] SMTP user set:", !!process.env.SMTP_USER);
  console.log("[email] From:", FROM);
  console.log("[email] Verification URL:", verificationUrl?.substring(0, 80) + "...");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F0F4F8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:8px;border:1px solid #D0DAE4;overflow:hidden;">
    <!-- Header -->
    <div style="background:#FF6B00;padding:24px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">
        CaliCode 24
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="margin:0 0 16px;font-size:15px;color:#1a2332;">
        Hey ${name || "there"},
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">
        Thanks for signing up for CaliCode 24. Click the button below to verify your email and start checking Title 24 compliance.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin:32px 0;">
        <a href="${verificationUrl}"
           style="display:inline-block;background:#FF6B00;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:6px;">
          Verify My Email
        </a>
      </div>

      <p style="margin:0 0 8px;font-size:13px;color:#718096;line-height:1.5;">
        Or copy and paste this link into your browser:
      </p>
      <p style="margin:0 0 24px;font-size:12px;color:#FF6B00;word-break:break-all;">
        ${verificationUrl}
      </p>

      <hr style="border:none;border-top:1px solid #E8EEF4;margin:24px 0;" />

      <p style="margin:0;font-size:12px;color:#A0AEC0;line-height:1.5;">
        If you didn't create a CaliCode 24 account, you can safely ignore this email. This link expires in 24 hours.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#F0F4F8;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#A0AEC0;">
        CaliCode 24 — Instant Title 24 Compliance for California Contractors
      </p>
    </div>
  </div>
</body>
</html>`;

  const info = await transporter.sendMail({
    from: `"CaliCode 24" <${FROM}>`,
    to,
    subject: "Verify your CaliCode 24 account",
    html,
    text: `Hey ${name || "there"},\n\nThanks for signing up for CaliCode 24. Verify your email by visiting:\n${verificationUrl}\n\nThis link expires in 24 hours.\n\n— CaliCode 24`,
  });

  console.log("[email] Message sent! ID:", info.messageId);
  console.log("[email] Response:", info.response);

  return info;
}
