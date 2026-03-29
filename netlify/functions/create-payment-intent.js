exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { paymentMethodId, name, email } = JSON.parse(event.body);
    const secretKey = process.env.STRIPE_SECRET_KEY;

    const params = new URLSearchParams({
      amount: '1000',
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: 'true',
      receipt_email: email,
      description: 'The Oliver Kelly Award — Script Submission Fee',
      'metadata[name]': name,
      'metadata[email]': email,
      return_url: process.env.SITE_URL || 'https://theoliverkellyaward.com',
    });

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const result = await response.json();

    if (result.error) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: result.error.message }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, id: result.id }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
