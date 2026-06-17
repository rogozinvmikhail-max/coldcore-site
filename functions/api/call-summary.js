async function sendEmail(apiKey, { to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'ColdCore <onboarding@resend.dev>', to, subject, html }),
  });
  const body = await res.json().catch(() => ({}));
  console.log('[RESEND]', res.status, JSON.stringify(body));
  return res;
}

export async function onRequestPost(context) {
  const { env, request } = context;

  console.log('[CALL-SUMMARY] called, RESEND_API_KEY exists:', !!env.RESEND_API_KEY);

  let body;
  try { body = await request.json(); } catch (e) {
    console.log('[CALL-SUMMARY] JSON parse error:', e.message);
    return new Response('ok');
  }

  console.log('[CALL-SUMMARY] body keys:', Object.keys(body));

  const data = body?.data || body;
  const analysis = data?.analysis?.data_collection || {};
  const callerName  = analysis?.caller_name?.value  || data?.caller_name  || body?.caller_name  || '—';
  const company     = analysis?.company?.value       || data?.company      || body?.company      || '—';
  const phoneNumber = analysis?.phone_number?.value  || data?.phone_number || body?.phone_number || '—';
  const reason      = analysis?.reason?.value        || data?.reason       || body?.reason       || '—';
  const callTime    = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', dateStyle: 'full', timeStyle: 'short' });

  console.log('[CALL-SUMMARY]', callerName, '|', company, '|', phoneNumber, '|', reason);

  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#06151e;color:#fff;border-radius:12px;overflow:hidden">
  <div style="background:#0a2230;padding:28px 32px;border-bottom:1px solid rgba(61,180,232,0.2)">
    <span style="font-weight:900;font-size:18px;letter-spacing:1px">COLD<span style="color:#3db4e8">CORE</span></span>
    <span style="float:right;background:#3b82f6;color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px">📞 CALL</span>
  </div>
  <div style="padding:28px 32px">
    <h2 style="margin:0 0 20px;font-size:20px">Incoming call summary</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="color:#9fc4d6;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06)">Caller</td><td style="font-weight:700;text-align:right">${callerName}</td></tr>
      <tr><td style="color:#9fc4d6;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06)">Company</td><td style="font-weight:600;text-align:right">${company}</td></tr>
      <tr><td style="color:#9fc4d6;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06)">Phone</td><td style="text-align:right">${phoneNumber}</td></tr>
      <tr><td style="color:#9fc4d6;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06)">Reason</td><td style="text-align:right">${reason}</td></tr>
      <tr><td style="color:#9fc4d6;padding:7px 0">Time</td><td style="text-align:right">${callTime}</td></tr>
    </table>
  </div>
  <div style="padding:16px 32px;background:#0a2230;font-size:11px;color:rgba(159,196,214,0.5);text-align:center">
    ColdCore · +44 113 519 0000 · trading name of AMPY RESEARCH LTD
  </div>
</div>`;

  if (env.RESEND_API_KEY) {
    await sendEmail(env.RESEND_API_KEY, {
      to: 'sales@coldcore.uk',
      subject: `📞 Call: ${callerName} · ${company} — ${reason}`,
      html,
    });
  } else {
    console.log('[CALL-SUMMARY] No RESEND_API_KEY — skipping email');
  }

  return new Response('ok');
}
