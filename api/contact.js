import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, service, message, cfToken } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  // Verify Turnstile token
  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v1/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: cfToken,
    }),
  });
  const verifyData = await verifyRes.json();
  if (!verifyData.success) {
    return res.status(400).json({ error: 'Bot verification failed. Please refresh and try again.' });
  }

  try {
    await resend.emails.send({
      from: 'Veritas Builders Group <noreply@veritasbuildersgroup.com>',
      to: 'dan@veritasbuildersgroup.com',
      replyTo: esc(email),
      subject: `New contact form submission from ${esc(name)}`,
      html: `
        <p><strong>Name:</strong> ${esc(name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
        ${phone ? `<p><strong>Phone:</strong> ${esc(phone)}</p>` : ''}
        ${service ? `<p><strong>Service:</strong> ${esc(service)}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${esc(message).replace(/\n/g, '<br>')}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
