export async function onRequestPost(context) {
  const { env, request } = context;

  if (!env.STRIPE_SECRET_KEY) {
    return Response.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    contact = '',
    postcode = '',
    amount_pence,
    description,
    shipping_label,
    shipping_method,
    addr = '',
  } = body;

  if (!amount_pence || amount_pence < 50) {
    return Response.json({ error: 'Invalid order amount' }, { status: 400 });
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);

  const productDesc = [
    shipping_label || '',
    postcode ? `Post code: ${postcode}` : '',
    !isEmail && contact ? `Contact: ${contact}` : '',
  ].filter(Boolean).join(' · ');

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('payment_method_types[]', 'card');

  // Product
  params.append('line_items[0][price_data][currency]', 'gbp');
  params.append('line_items[0][price_data][product_data][name]', description || 'ColdCore Order');
  if (productDesc) {
    params.append('line_items[0][price_data][product_data][description]', productDesc);
  }
  params.append('line_items[0][price_data][unit_amount]', String(Math.round(amount_pence)));
  params.append('line_items[0][quantity]', '1');

  // Shipping address (UK only)
  params.append('shipping_address_collection[allowed_countries][]', 'GB');

  // Phone number — required
  params.append('phone_number_collection[enabled]', 'true');

  // Tax ID (company name + VAT number) — optional for customer
  params.append('tax_id_collection[enabled]', 'true');

  // Billing address — required (captures full name + company)
  params.append('billing_address_collection', 'required');

  // Metadata
  params.append('metadata[contact]', contact);
  params.append('metadata[postcode]', postcode);
  params.append('metadata[shipping_method]', shipping_method || 'std');
  params.append('metadata[addr]', addr);

  params.append('success_url', 'https://coldcore.uk/success');
  params.append('cancel_url', 'https://coldcore.uk/#try');

  if (isEmail) {
    params.append('customer_email', contact);
  }

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const session = await stripeRes.json();

  if (!stripeRes.ok) {
    console.error('Stripe error:', session.error?.message);
    return Response.json({ error: session.error?.message || 'Stripe error' }, { status: 500 });
  }

  return Response.json({ url: session.url });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
