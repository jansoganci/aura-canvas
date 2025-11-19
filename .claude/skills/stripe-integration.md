# Stripe Integration Skill

Implement Stripe payment for the "Personalized Aura Analysis" premium feature.

## When to Use
- Setting up Stripe account integration
- Creating payment flows
- Implementing webhooks
- Handling subscriptions

## Setup Steps

### 1. Stripe Account
- Create account at stripe.com
- Get API keys (publishable + secret)
- Set up webhook endpoint

### 2. Install Dependencies
```bash
npm install stripe @stripe/stripe-js
```

### 3. Environment Variables
```bash
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Cloudflare Worker Integration
Add to `worker-api/wrangler.toml`:
```toml
[vars]
STRIPE_SECRET_KEY = ""
```

## Implementation

### Payment Flow for Aura Analysis

1. **User clicks "Get Personalized Analysis"**
2. **Create Checkout Session** (Worker API)
3. **Redirect to Stripe Checkout**
4. **User completes payment**
5. **Webhook confirms payment**
6. **Generate and deliver analysis**

### API Endpoint: Create Checkout
```typescript
// worker-api/index.ts addition
if (url.pathname === '/create-checkout') {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Personalized Aura Analysis',
          description: 'AI-powered deep analysis of your aura'
        },
        unit_amount: 499, // $4.99
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/`,
    metadata: {
      sessionId: sessionId, // Aura session ID
    }
  });

  return Response.json({ url: session.url });
}
```

### Frontend: Payment Button
```tsx
const handlePayment = async () => {
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    body: JSON.stringify({ sessionId })
  });
  const { url } = await res.json();
  window.location.href = url;
};
```

### Webhook Handler
```typescript
if (url.pathname === '/webhook') {
  const sig = request.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(
    await request.text(),
    sig,
    env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Generate and save analysis
    await generateAuraAnalysis(session.metadata.sessionId);
  }

  return new Response('OK');
}
```

## Pricing Suggestions

### One-time Purchase
- Basic Analysis: $2.99
- Detailed Analysis: $4.99
- Premium + PDF: $9.99

### Subscription (Future)
- Monthly aura updates: $2.99/mo
- Unlimited analyses: $4.99/mo

## Testing
- Use Stripe test mode
- Test card: 4242 4242 4242 4242
- Test webhook with Stripe CLI: `stripe listen --forward-to localhost:8787/webhook`
