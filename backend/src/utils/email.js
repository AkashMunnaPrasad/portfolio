const nodemailer = require('nodemailer');
const ENV = require('../config/env');

let transporter = null;

function getMailer() {
  if (transporter) return transporter;
  if (!ENV.MAIL_USER || !ENV.MAIL_PASS) return null;
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: ENV.MAIL_USER, pass: ENV.MAIL_PASS },
  });
  return transporter;
}

function buildContactEmail(name, email, subject, message) {
  return `<!DOCTYPE html>
<html>
<body style="background:#060b14;font-family:Arial,sans-serif;color:#e8f4ff;padding:40px">
  <div style="max-width:580px;margin:0 auto;background:#0f1a2e;border-radius:14px;border:1px solid rgba(0,212,255,.2);overflow:hidden">
    <div style="background:linear-gradient(135deg,#00d4ff,#7b2fff);padding:28px 32px">
      <h1 style="margin:0;color:#060b14;font-size:1.5rem">&#9889; New Portfolio Message</h1>
    </div>
    <div style="padding:28px 32px">
      <p style="font-size:.7rem;text-transform:uppercase;letter-spacing:.15em;color:#4a6080;margin-bottom:4px">From</p>
      <p style="background:#0b1220;padding:12px 16px;border-radius:8px;border-left:3px solid #00d4ff;margin-bottom:18px">${name} &lt;${email}&gt;</p>
      <p style="font-size:.7rem;text-transform:uppercase;letter-spacing:.15em;color:#4a6080;margin-bottom:4px">Subject</p>
      <p style="background:#0b1220;padding:12px 16px;border-radius:8px;border-left:3px solid #00d4ff;margin-bottom:18px">${subject || '(No subject)'}</p>
      <p style="font-size:.7rem;text-transform:uppercase;letter-spacing:.15em;color:#4a6080;margin-bottom:4px">Message</p>
      <p style="background:#0b1220;padding:12px 16px;border-radius:8px;border-left:3px solid #00d4ff;white-space:pre-wrap">${message}</p>
    </div>
    <div style="background:#0b1220;padding:14px 32px;font-size:.75rem;color:#4a6080;text-align:center">Sent via Portfolio</div>
  </div>
</body></html>`;
}

async function sendContactNotification(name, email, subject, message) {
  const mailer = getMailer();
  if (!mailer) return;
  try {
    await mailer.sendMail({
      from: `"Portfolio" <${ENV.MAIL_USER}>`,
      to: ENV.ADMIN_EMAIL,
      replyTo: email,
      subject: `[Portfolio] ${subject || 'New message'} from ${name}`,
      html: buildContactEmail(name, email, subject, message),
      text: `From: ${name} <${email}>\nSubject: ${subject || 'N/A'}\n\n${message}`,
    });
  } catch (err) {
    console.error('[MAIL ERROR]', err.message);
  }
}

module.exports = { sendContactNotification, getMailer };
