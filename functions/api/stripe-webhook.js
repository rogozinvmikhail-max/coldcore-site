async function verifyStripeSignature(body, signature, secret) {
  const parts = signature.split(',').reduce((acc, part) => {
    const [k, v] = part.split('=');
    acc[k] = v;
    return acc;
  }, {});
  const timestamp = parts.t;
  const sig = parts.v1;
  if (!timestamp || !sig) return false;
  const payload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2,'0')).join('');
  return expected === sig;
}

async function sendEmail(apiKey, { to, subject, html }) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'ColdCore Orders <orders@coldcore.uk>', to, subject, html }),
  });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  if (env.STRIPE_WEBHOOK_SECRET) {
    const valid = await verifyStripeSignature(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    if (!valid) return new Response('Invalid signature', { status: 400 });
  }

  let event;
  try { event = JSON.parse(rawBody); } catch { return new Response('Bad JSON', { status: 400 }); }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    const amount = (s.amount_total / 100).toFixed(2);
    const email = s.customer_email || s.customer_details?.email || '—';
    const name = s.customer_details?.name || '—';
    const phone = s.customer_details?.phone || '—';
    const addr = s.shipping_details?.address || s.customer_details?.address || {};
    const addrStr = [addr.line1, addr.line2, addr.city, addr.postal_code, addr.country].filter(Boolean).join(', ') || '—';
    const description = s.metadata?.contact ? `Contact: ${s.metadata.contact}` : '';
    const postcode = s.metadata?.postcode || addr.postal_code || '—';
    const deliveryAddr = s.metadata?.addr || addrStr || '—';
    const shipMethod = s.metadata?.shipping_method || 'std';
    const sessionId = s.id;

    const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#06151e;color:#fff;border-radius:12px;overflow:hidden">
  <div style="background:#0a2230;padding:28px 32px;border-bottom:1px solid rgba(61,180,232,0.2)">
    <span style="font-weight:900;font-size:18px;letter-spacing:1px">COLD<span style="color:#3db4e8">CORE</span></span>
    <span style="float:right;background:#22c55e;color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px">PAID ✓</span>
  </div>
  <div style="padding:28px 32px">
    <h2 style="margin:0 0 20px;font-size:20px">New order received</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="color:#9fc4d6;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06)">Amount</td><td style="font-weight:700;color:#3db4e8;font-size:18px;text-align:right">£${amount}</td></tr>
      <tr><td style="color:#9fc4d6;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06)">Name</td><td style="font-weight:600;text-align:right">${name}</td></tr>
      <tr><td style="color:#9fc4d6;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06)">Email</td><td style="text-align:right">${email}</td></tr>
      <tr><td style="color:#9fc4d6;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06)">Phone</td><td style="text-align:right">${phone}</td></tr>
      <tr><td style="color:#9fc4d6;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06)">Post code</td><td style="text-align:right">${postcode}</td></tr>
      <tr><td style="color:#9fc4d6;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06)">Ship to</td><td style="text-align:right">${deliveryAddr}</td></tr>
      <tr><td style="color:#9fc4d6;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.06)">Delivery</td><td style="text-align:right">${shipMethod === 'exp' ? 'Express · Special Delivery' : shipMethod === 'pal' ? 'Pallet delivery' : 'Standard · Royal Mail 48'}</td></tr>
      <tr><td style="color:#9fc4d6;padding:7px 0">${description ? 'Note' : 'Session'}</td><td style="text-align:right;font-size:12px;color:#9fc4d6">${description || sessionId}</td></tr>
    </table>
    <div style="margin-top:24px;padding:16px;background:rgba(61,180,232,0.08);border-radius:10px;font-size:13px;color:#9fc4d6">
      View full details in <a href="https://dashboard.stripe.com/payments/${s.payment_intent}" style="color:#3db4e8">Stripe Dashboard →</a>
    </div>
  </div>
  <div style="padding:16px 32px;background:#0a2230;font-size:11px;color:rgba(159,196,214,0.5);text-align:center">
    ColdCore · trading name of AMPY RESEARCH LTD · 85 Great Portland Street, W1W 7LT, London
  </div>
</div>`;

    if (env.RESEND_API_KEY) {
      await sendEmail(env.RESEND_API_KEY, {
        to: 'sales@coldcore.uk',
        subject: `💳 New order £${amount} — ${name}`,
        html,
      });
    }
  }

  return new Response('ok');
}
