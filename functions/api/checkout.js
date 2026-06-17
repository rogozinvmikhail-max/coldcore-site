import Stripe from 'stripe';

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
  } = body;

  if (!amount_pence || amount_pence < 50) {
    return Response.json({ error: 'Invalid order amount' }, { status: 400 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);

  const productDesc = [
    shipping_label || '',
    postcode ? `Post code: ${postcode}` : '',
    !isEmail && contact ? `Contact: ${contact}` : '',
  ].filter(Boolean).join(' · ') || undefined;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      ...(isEmail ? { customer_email: contact } : {}),
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: description || 'ColdCore Order',
              ...(productDesc ? { description: productDesc } : {}),
            },
            unit_amount: Math.round(amount_pence),
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['GB'],
      },
      metadata: {
        contact,
        postcode,
        shipping_method: shipping_method || 'std',
      },
      success_url: 'https://coldcore.uk/?paid=1',
      cancel_url: 'https://coldcore.uk/#try',
    });

    return Response.json({ url: session.url });

  } catch (err) {
    console.error('Stripe error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
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
