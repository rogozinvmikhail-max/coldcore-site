export async function onRequestPost(context) {
  const { env, request } = context;
  let body;
  try { body = await request.json(); } catch { return Response.json({ ok: true }); }

  const { name, contact } = body || {};
  console.log(`[LEAD] ${new Date().toISOString()} | ${name} | ${contact}`);

  if (env.RESEND_API_KEY && name && contact) {
    const callTime = new Date().toLocaleString('en-GB', {
      timeZone: 'Europe/London', dateStyle: 'full', timeStyle: 'short'
    });

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ColdCore <hello@coldcore.uk>',
        to: 'sales@coldcore.uk',
        subject: `🆕 New lead: ${name}`,
        html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#06151e;color:#fff;border-radius:12px;overflow:hidden">
  <div style="background:#0a2230;padding:28px 32px;border-bottom:1px solid rgba(61,180,232,0.2)">
    <span style="font-weight:900;font-size:18px;letter-spacing:1px">COLD<span style="color:#3db4e8">CORE</span></span>
    <span style="float:right;background:#f59e0b;color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px">🆕 NEW LEAD</span>
  </div>
  <div style="padding:28px 32px">
    <h2 style="margin:0 0 20px;font-size:20px">New enquiry from website</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="color:#9fc4d6;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06)">Name</td><td style="font-weight:700;text-align:right">${name}</td></tr>
      <tr><td style="color:#9fc4d6;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06)">Contact</td><td style="text-align:right">${contact}</td></tr>
      <tr><td style="color:#9fc4d6;padding:7px 0">Time</td><td style="text-align:right">${callTime}</td></tr>
    </table>
    <div style="margin-top:24px;padding:16px;background:rgba(61,180,232,0.08);border-radius:10px;font-size:13px;color:#9fc4d6">
      Follow up within 1 business day.
    </div>
  </div>
  <div style="padding:16px 32px;background:#0a2230;font-size:11px;color:rgba(159,196,214,0.5);text-align:center">
    ColdCore · coldcore.uk · trading name of AMPY RESEARCH LTD
  </div>
</div>`,
      }),
    });
  }

  return Response.json({ ok: true });
}
