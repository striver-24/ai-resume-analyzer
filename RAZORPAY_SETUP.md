# Razorpay Integration Setup Guide

## Overview

This document provides step-by-step instructions to integrate Razorpay payments into the AI Resume Analyzer application. The integration is currently implemented but commented and awaiting Razorpay API credentials.

## Files Created

### Backend Files

1. **`api/payments/create-order.ts`**
   - Creates payment orders in Razorpay
   - Validates payment amounts
   - Returns order details for frontend

2. **`api/payments/verify-payment.ts`**
   - Verifies payment signatures using HMAC-SHA256
   - Ensures payment authenticity
   - Updates payment status in database

### Frontend Files

1. **`app/lib/razorpay.ts`**
   - Core Razorpay utilities and constants
   - Payment plan configurations
   - Payment initiation functions
   - SDK loader

2. **`app/lib/payment-hooks.ts`**
   - React hooks for payment management
   - `usePayment()` - Single payment transactions
   - `usePaymentPlans()` - Plan switching/subscriptions
   - `usePaymentHistory()` - Payment tracking

3. **`app/components/PaymentGateway.tsx`**
   - Main payment UI component
   - Plan selection cards
   - Payment processing interface
   - Error handling and feedback

4. **`app/components/PricingPlans.tsx`**
   - Simple pricing display modal
   - Plan comparison view
   - Integration with PaymentGateway

## Step 1: Get Razorpay Credentials

### Prerequisites
- Razorpay Account (sign up at https://razorpay.com)
- Business verification completed

### Getting API Keys

1. Log in to Razorpay Dashboard: https://dashboard.razorpay.com
2. Navigate to **Account Settings** → **API Keys**
3. You'll see two keys:
   - **Key ID** (publishable key - safe for frontend)
   - **Key Secret** (secret key - ONLY for backend)

4. Copy both keys - you'll need them next

## Step 2: Configure Environment Variables

### Backend Environment Variables

Add to your `.env` or hosting environment (Vercel, etc.):

```env
# Razorpay API Credentials
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

**WARNING:** Never commit `RAZORPAY_KEY_SECRET` to version control!

### Frontend Environment Variables

Create `.env.local` (for development) or add to your hosting platform:

```env
# Razorpay Public Key (safe to expose)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

### Vercel Configuration

If deploying to Vercel:

1. Go to your project settings on Vercel
2. Navigate to **Environment Variables**
3. Add the variables for each environment (Preview, Production, Development)

```
RAZORPAY_KEY_ID = your_key_id
RAZORPAY_KEY_SECRET = your_key_secret
```

## Step 3: Uncomment Backend Code

### In `api/payments/create-order.ts`

Find these sections and uncomment:

1. **Session verification** (lines ~85-95)
   ```typescript
   // Uncomment to verify user is authenticated
   const cookies = parse(req.headers.cookie || '');
   const sessionToken = cookies.session_token;
   
   if (!sessionToken) {
       return res.status(401).json({ error: 'Unauthorized. Please login first.' });
   }
   ```

2. **Razorpay order creation** (lines ~115-135)
   ```typescript
   // Uncomment to create actual Razorpay orders
   const order = await razorpay.orders.create({
       amount: Math.round(amount),
       currency,
       receipt: `receipt_${Date.now()}`,
       description,
       notes: {
           ...notes,
           user_id: session.uid,
           created_at: new Date().toISOString(),
       },
       customer_notify,
   });
   ```

### In `api/payments/verify-payment.ts`

Find this section and uncomment (lines ~70-80):

```typescript
// Uncomment verification logic when Razorpay is configured
const isValidSignature = verifySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    RAZORPAY_KEY_SECRET
);
```

## Step 4: Uncomment Frontend Code

### In `app/lib/razorpay.ts`

Find the `initiatePayment()` function (around line ~185) and uncomment:

```typescript
// Open Razorpay checkout
const razorpayCheckout = new (window as any).Razorpay(checkoutOptions);
razorpayCheckout.open();
```

Remove or comment out the error throw that prevents payment:

```typescript
// Remove this line:
throw new Error('Razorpay integration not yet configured...');
```

### In `app/lib/payment-hooks.ts`

In the `usePayment()` hook, uncomment the Razorpay script loading (around line ~40):

```typescript
await loadRazorpayScript();
```

## Step 5: Update Database Schema (Optional)

Create a migration to add payment-related tables if you want to track payments:

```sql
-- File: migrations/003_add_payments_table.sql

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(uuid),
    razorpay_order_id VARCHAR(50) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(50),
    razorpay_signature VARCHAR(100),
    amount INTEGER NOT NULL, -- in paise
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
    plan_type VARCHAR(20), -- basic, premium, enterprise
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_razorpay_order_id ON payments(razorpay_order_id);
```

## Step 6: Update Backend Verification

After uncommenting the verification code, add database update logic in `api/payments/verify-payment.ts`:

```typescript
// After signature verification passes:
await db.query(
    `UPDATE payments SET status = 'completed', razorpay_payment_id = $1, 
     razorpay_signature = $2, updated_at = NOW() 
     WHERE razorpay_order_id = $3`,
    [razorpay_payment_id, razorpay_signature, razorpay_order_id]
);

// Grant premium features to user
await grantPremiumFeatures(userId, planType);
```

## Step 7: Test the Integration

### Development Testing

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Navigate to the pricing page
4. Click on a plan - the Razorpay checkout should open
5. Use test card numbers (for Razorpay test mode)

### Razorpay Test Cards

In test mode, use these cards:

| Card Type | Card Number | Expiry | CVV |
|-----------|-------------|--------|-----|
| Visa | 4111111111111111 | Any Future Date | Any 3 Digits |
| Mastercard | 5555555555554444 | Any Future Date | Any 3 Digits |

All test transactions will succeed (unless you explicitly test failures).

### Switch to Production

1. In Razorpay Dashboard, switch from Test Mode to Live Mode
2. Update environment variables with live API keys
3. Redeploy your application
4. Test with a small real payment

## Step 8: Add Payment UI to Pages

### On Home Page (`app/routes/home.tsx`)

```typescript
import { useState } from 'react';
import PricingPlans from '~/components/PricingPlans';
import { PlanType } from '~/lib/razorpay';

export default function Home() {
    const [showPricing, setShowPricing] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowPricing(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
                View Pricing
            </button>

            <PricingPlans
                isOpen={showPricing}
                onClose={() => setShowPricing(false)}
                onSuccess={(plan) => {
                    console.log('Purchase successful:', plan);
                    // Grant features here
                }}
            />
        </>
    );
}
```

### On Upload Page (`app/routes/upload.tsx`)

```typescript
import PaymentGateway from '~/components/PaymentGateway';

export default function Upload() {
    return (
        <div>
            {/* Existing upload UI */}
            
            {/* Payment Gateway Section */}
            <section className="mt-12 bg-gray-50 rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-4">Unlock Premium Features</h2>
                <PaymentGateway
                    onPaymentSuccess={(plan) => {
                        // Update user subscription
                    }}
                />
            </section>
        </div>
    );
}
```

## Pricing Configuration

Edit plan details and pricing in `app/lib/razorpay.ts`:

```typescript
export const PRICING = {
    [PlanType.BASIC]: {
        amount: 29900, // ₹299
        currency: 'INR',
        description: 'Basic Resume Analysis',
        features: ['ATS Score', 'Basic Feedback', '1 Resume'],
    },
    [PlanType.PREMIUM]: {
        amount: 79900, // ₹799
        currency: 'INR',
        description: 'Premium Resume Analysis',
        features: ['ATS Score', 'AI Suggestions', 'Multiple Resumes', 'Priority Support'],
    },
    [PlanType.ENTERPRISE]: {
        amount: 299900, // ₹2,999
        currency: 'INR',
        description: 'Enterprise Resume Analysis',
        features: ['Unlimited Resumes', '24/7 Support', 'Custom Analytics', 'API Access'],
    },
};
```

## Troubleshooting

### Issue: "Razorpay script failed to load"
- Check that internet connectivity is available
- Verify Razorpay CDN is accessible from your region
- Check browser console for CORS errors

### Issue: "Invalid signature"
- Verify that `RAZORPAY_KEY_SECRET` is correct
- Ensure the signature verification code hasn't been modified
- Check that payment data hasn't been tampered with

### Issue: Orders not creating
- Verify backend endpoint is accessible
- Check server logs for errors
- Ensure environment variables are set on the server

### Issue: Payment modal won't open
- Verify `VITE_RAZORPAY_KEY_ID` is set in frontend environment
- Check that Razorpay script loaded successfully
- Look for errors in browser console

## Security Checklist

- [ ] Never commit `RAZORPAY_KEY_SECRET` to version control
- [ ] Use environment variables for all credentials
- [ ] Always verify payment signatures on backend
- [ ] Implement rate limiting on payment endpoints
- [ ] Log all payment transactions for audit trails
- [ ] Use HTTPS only in production
- [ ] Validate all user input on backend
- [ ] Implement proper error handling without exposing sensitive info

## Next Steps

After setup, consider implementing:

1. **Payment History** - Show users their past transactions
2. **Receipts** - Generate and email payment receipts
3. **Refunds** - Implement refund handling for disputes
4. **Webhooks** - Listen to Razorpay webhooks for real-time updates
5. **Analytics** - Track conversion rates and payment metrics
6. **Email Notifications** - Notify users of successful payments
7. **Plan Upgrades** - Allow users to switch between plans
8. **Subscription Management** - For recurring payments

## Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Keys Documentation](https://razorpay.com/docs/payments/payment-gateway/how-to/api-keys/)
- [Payment Verification](https://razorpay.com/docs/payments/verify-payments/)
- [Razorpay Webhooks](https://razorpay.com/docs/webhooks/)
- [Integration Examples](https://github.com/razorpay)

## Support

For issues related to:
- **Razorpay**: Contact Razorpay support at support@razorpay.com
- **Application**: Check the project documentation or contact the development team
