async function sendEmail(apiKey, { to, subject, html }) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'ColdCore <sales@coldcore.uk>', to, subject, html }),
  });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const { email, ref, amount, desc, ship, name = '', contact, postcode, addr = '' } = body;
  if (!email) return Response.json({ error: 'No email' }, { status: 400 });

  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const dueDate = new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const amountNum = parseFloat(amount) || 0;
  const exVat = (amountNum / 1.2).toFixed(2);
  const vat = (amountNum - amountNum / 1.2).toFixed(2);

  const html = `
<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#fff;color:#111;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
  <div style="background:#06151e;padding:28px 36px;display:flex;justify-content:space-between;align-items:center">
    <span style="font-weight:900;font-size:20px;letter-spacing:1px;color:#fff">COLD<span style="color:#3db4e8">CORE</span></span>
    <span style="color:#9fc4d6;font-size:13px">INVOICE</span>
  </div>
  <div style="padding:32px 36px">
    <table style="width:100%;margin-bottom:28px">
      <tr>
        <td style="vertical-align:top">
          <div style="font-size:12px;color:#6b7280;margin-bottom:4px">From</div>
          <div style="font-weight:700">AMPY RESEARCH LTD</div>
          <div style="font-size:13px;color:#374151">trading as ColdCore</div>
          <div style="font-size:13px;color:#6b7280">85 Great Portland Street<br>W1W 7LT, London, UK</div>
        </td>
        <td style="vertical-align:top;text-align:right">
          <div style="font-size:12px;color:#6b7280;margin-bottom:4px">Bill to</div>
          <div style="font-weight:700">${name || contact || '—'}</div>
          <div style="font-size:13px;color:#374151">${contact || ''}</div>
          <div style="font-size:13px;color:#6b7280">${addr ? addr + '<br>' : ''}Post code: ${postcode || '—'}</div>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding-top:12px">
          <div style="font-size:12px;color:#6b7280;margin-bottom:4px">Invoice details</div>
        </td>
      </tr>
      <tr>
        <td></td>
        <td style="vertical-align:top;text-align:right">
          <div style="font-weight:700;font-size:16px;color:#3db4e8">${ref}</div>
          <div style="font-size:13px;color:#6b7280">Date: ${date}</div>
          <div style="font-size:13px;color:#6b7280">Due: ${dueDate}</div>
        </td>
      </tr>
    </table>
    <div style="background:#f9fafb;border-radius:10px;overflow:hidden;margin-bottom:20px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="text-align:left;padding:12px 16px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280">Description</th>
            <th style="text-align:right;padding:12px 16px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-top:1px solid #e5e7eb">
            <td style="padding:14px 16px">
              <div style="font-weight:600">${desc || 'ColdCore Order'}</div>
              <div style="font-size:12px;color:#6b7280">${ship || 'Delivery included'}</div>
            </td>
            <td style="padding:14px 16px;text-align:right;font-weight:600">£${exVat}</td>
          </tr>
          <tr style="border-top:1px solid #e5e7eb;background:#fafafa">
            <td style="padding:10px 16px;color:#6b7280;font-size:13px">VAT (20%)</td>
            <td style="padding:10px 16px;text-align:right;color:#6b7280;font-size:13px">£${vat}</td>
          </tr>
          <tr style="border-top:2px solid #e5e7eb">
            <td style="padding:14px 16px;font-weight:800;font-size:16px">Total</td>
            <td style="padding:14px 16px;text-align:right;font-weight:800;font-size:20px;color:#3db4e8">£${amountNum.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:20px;margin-bottom:20px">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#0369a1;font-weight:700;margin-bottom:12px">Payment details</div>
      <table style="font-size:14px;width:100%;border-collapse:collapse">
        <tr><td style="color:#374151;padding:3px 0;width:40%">Recipient</td><td style="font-weight:700">AMPY RESEARCH LTD</td></tr>
        <tr><td style="color:#374151;padding:3px 0">Account number</td><td style="font-family:monospace;font-weight:600">34408653</td></tr>
        <tr><td style="color:#374151;padding:3px 0">Sort code</td><td style="font-family:monospace;font-weight:600">23-01-20</td></tr>
        <tr><td style="color:#374151;padding:3px 0">IBAN</td><td style="font-family:monospace;font-weight:600">GB04 REVO 0099 6954 1967 01</td></tr>
        <tr><td style="color:#374151;padding:3px 0">BIC</td><td style="font-family:monospace;font-weight:600">REVOGB21</td></tr>
        <tr><td style="color:#374151;padding:3px 0">Reference</td><td style="font-family:monospace;font-weight:800;color:#0369a1">${ref}</td></tr>
      </table>
      <div style="margin-top:12px;font-size:12px;color:#0369a1;font-weight:600">⚠️ Please include the reference exactly as shown above.</div>
    </div>
    <div style="font-size:12px;color:#6b7280">Questions? <a href="mailto:hello@coldcore.uk" style="color:#3db4e8">hello@coldcore.uk</a> · <a href="https://coldcore.uk" style="color:#3db4e8">coldcore.uk</a></div>
  </div>
</div>`;

  if (env.RESEND_API_KEY) {
    await sendEmail(env.RESEND_API_KEY, {
      to: email,
      subject: `Invoice ${ref} · ColdCore · £${amountNum.toFixed(2)}`,
      html,
    });
    // Also notify sales
    await sendEmail(env.RESEND_API_KEY, {
      to: 'sales@coldcore.uk',
      subject: `📄 Invoice sent to ${email} · ${ref} · £${amountNum.toFixed(2)}`,
      html,
    });
  }

  return Response.json({ ok: true });
}
