async function sendEmail(apiKey, { to, subject, html }) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'ColdCore Calls <calls@coldcore.uk>', to, subject, html }),
  });
}

export async function onRequestPost(context) {
  const { env, request } = context;

  let body;
  try { body = await request.json(); } catch { return new Response('ok'); }

  // ElevenLabs post-call webhook payload
  const data = body?.data || body;
  const analysis = data?.analysis?.data_collection || {};
  const callerName   = analysis?.caller_name?.value   || data?.caller_name   || '—';
  const company      = analysis?.company?.value        || data?.company       || '—';
  const phoneNumber  = analysis?.phone_number?.value   || data?.phone_number  || '—';
  const reason       = analysis?.reason?.value         || data?.reason        || '—';
  const duration     = data?.metadata?.call_duration_secs
    ? `${Math.round(data.metadata.call_duration_secs / 60)}m ${data.metadata.call_duration_secs % 60}s`
    : '—';
  const transcript   = data?.transcript?.map(t => `<b>${t.role === 'agent' ? 'Alex' : 'Caller'}:</b> ${t.message}`).join('<br>') || '—';
  const callTime     = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', dateStyle: 'full', timeStyle: 'short' });

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
      <tr><td style="color:#9fc4d6;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06)">Duration</td><td style="text-align:right">${duration}</td></tr>
      <tr><td style="color:#9fc4d6;padding:7px 0">Time</td><td style="text-align:right">${callTime}</td></tr>
    </table>
    ${transcript !== '—' ? `
    <div style="margin-top:24px">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#3db4e8;margin-bottom:12px">Transcript</div>
      <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:16px;font-size:13px;line-height:1.8;color:#9fc4d6;max-height:300px;overflow:auto">${transcript}</div>
    </div>` : ''}
  </div>
  <div style="padding:16px 32px;background:#0a2230;font-size:11px;color:rgba(159,196,214,0.5);text-align:center">
    ColdCore · +44 113 519 0000 · trading name of AMPY RESEARCH LTD
  </div>
</div>`;

  if (env.RESEND_API_KEY) {
    await sendEmail(env.RESEND_API_KEY, {
      to: 'sales@coldcore.uk',
      subject: `📞 Call from ${callerName}${company !== '—' ? ` · ${company}` : ''} — ${reason}`,
      html,
    });
  }

  console.log(`[CALL] ${callerName} | ${company} | ${phoneNumber} | ${reason}`);
  return new Response('ok');
}
