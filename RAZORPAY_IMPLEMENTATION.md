# Razorpay Integration Implementation Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

The `razorpay` package has already been added to `package.json`.

### 2. Get Razorpay Credentials

1. Sign up at https://razorpay.com
2. Verify your business
3. Go to Dashboard → Account Settings → API Keys
4. Copy your Key ID and Key Secret

### 3. Set Environment Variables

Copy `.env.razorpay.example` to `.env.local`:

```bash
cp .env.razorpay.example .env.local
```

Then edit `.env.local` and add your Razorpay credentials:

```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret_here
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

### 4. Uncomment Backend Code

#### In `api/payments/create-order.ts`:

Around line 85-95, uncomment:
```typescript
// Verify user is authenticated (optional but recommended)
const cookies = parse(req.headers.cookie || '');
const sessionToken = cookies.session_token;

if (!sessionToken) {
    return res.status(401).json({ error: 'Unauthorized. Please login first.' });
}

// Verify session validity
const session = await getSessionByToken(sessionToken);
if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session.' });
}
```

Around line 115-135, uncomment:
```typescript
const order = await razorpay.orders.create({
    amount: Math.round(amount), // Ensure amount is in paise
    currency,
    receipt: `receipt_${Date.now()}`,
    description,
    notes: {
        ...notes,
        user_id: session.uid, // Add user ID from session
        created_at: new Date().toISOString(),
    },
    customer_notify,
});

return res.status(200).json({
    success: true,
    order: {
        id: order.id,
        entity: order.entity,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        created_at: order.created_at,
    }
});
```

#### In `api/payments/verify-payment.ts`:

Around line 70-80, uncomment:
```typescript
const isValidSignature = verifySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    RAZORPAY_KEY_SECRET
);

if (!isValidSignature) {
    console.warn('Invalid payment signature detected:', {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
    });

    return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.'
    });
}
```

### 5. Uncomment Frontend Code

#### In `app/lib/razorpay.ts`:

In the `initiatePayment()` function (around line 185), uncomment:
```typescript
// Open Razorpay checkout
const razorpayCheckout = new (window as any).Razorpay(checkoutOptions);
razorpayCheckout.open();
```

And remove/comment out:
```typescript
throw new Error(
    'Razorpay integration not yet configured. ' +
    'Please add VITE_RAZORPAY_KEY_ID to your environment variables.'
);
```

#### In `app/lib/payment-hooks.ts`:

In the `usePayment()` hook, uncomment (around line 40):
```typescript
await loadRazorpayScript();
setScriptLoaded(true);
```

## Usage Examples

### Example 1: Simple Payment Button

```typescript
import { useState } from 'react';
import { usePayment } from '~/lib/payment-hooks';
import { PlanType } from '~/lib/razorpay';

export function PremiumButton() {
    const { processPayment, isLoading, error } = usePayment();

    const handleUpgrade = async () => {
        try {
            await processPayment(PlanType.PREMIUM, {
                email: 'user@example.com',
                phone: '+919999999999',
            });
        } catch (err) {
            console.error('Payment failed:', err);
        }
    };

    return (
        <div>
            <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
                {isLoading ? 'Processing...' : 'Upgrade to Premium'}
            </button>
            {error && <p className="text-red-600">{error.message}</p>}
        </div>
    );
}
```

### Example 2: Full Payment Gateway

```typescript
import PaymentGateway from '~/components/PaymentGateway';
import { PlanType } from '~/lib/razorpay';

export function PricingPage() {
    const handlePaymentSuccess = (plan: PlanType) => {
        console.log(`User upgraded to ${plan} plan`);
        // Update user subscription in database
        // Grant premium features
        // Send confirmation email
    };

    return (
        <main>
            <h1>Choose Your Plan</h1>
            <PaymentGateway
                onPaymentSuccess={handlePaymentSuccess}
                userInfo={{
                    email: 'user@example.com',
                    phone: '+919999999999',
                }}
            />
        </main>
    );
}
```

### Example 3: Plan Switching

```typescript
import { usePaymentPlans } from '~/lib/payment-hooks';
import { PlanType } from '~/lib/razorpay';

export function PlanSwitcher() {
    const { currentPlan, upgradePlan, downgradePlan, isLoading } =
        usePaymentPlans(PlanType.BASIC);

    const handleUpgrade = async () => {
        try {
            await upgradePlan(PlanType.PREMIUM);
        } catch (err) {
            console.error('Upgrade failed:', err);
        }
    };

    return (
        <div>
            <p>Current Plan: {currentPlan}</p>
            <button onClick={handleUpgrade} disabled={isLoading}>
                Upgrade to Premium
            </button>
        </div>
    );
}
```

### Example 4: Modal Payment Dialog

```typescript
import { useState } from 'react';
import PricingPlans from '~/components/PricingPlans';
import { PlanType } from '~/lib/razorpay';

export function HomePage() {
    const [showPricing, setShowPricing] = useState(false);

    return (
        <main>
            <h1>AI Resume Analyzer</h1>
            <button
                onClick={() => setShowPricing(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
                View Plans
            </button>

            <PricingPlans
                isOpen={showPricing}
                onClose={() => setShowPricing(false)}
                onSuccess={(plan: PlanType) => {
                    console.log(`Payment successful for ${plan}`);
                    setShowPricing(false);
                }}
            />
        </main>
    );
}
```

## Customizing Pricing

Edit `app/lib/razorpay.ts`:

```typescript
export const PRICING = {
    [PlanType.BASIC]: {
        amount: 29900, // ₹299 (in paise)
        currency: 'INR',
        description: 'Basic Resume Analysis',
        features: [
            'ATS Score Analysis',
            'Basic Feedback',
            'Support for 1 Resume',
        ],
    },
    [PlanType.PREMIUM]: {
        amount: 79900, // ₹799
        currency: 'INR',
        description: 'Premium Resume Analysis',
        features: [
            'ATS Score Analysis',
            'AI-Powered Suggestions',
            'Support for Multiple Resumes',
            'Priority Email Support',
            'Download Reports',
        ],
    },
    [PlanType.ENTERPRISE]: {
        amount: 299900, // ₹2,999
        currency: 'INR',
        description: 'Enterprise Resume Analysis',
        features: [
            'Unlimited Resume Analysis',
            '24/7 Phone & Email Support',
            'Custom Analytics Dashboard',
            'API Access',
            'Team Management',
        ],
    },
};
```

## Adding Payment Tracking

Create a database table in `migrations/003_add_payments_table.sql`:

```sql
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(uuid),
    razorpay_order_id VARCHAR(50) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(50),
    razorpay_signature VARCHAR(100),
    amount INTEGER NOT NULL, -- in paise
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'pending',
    plan_type VARCHAR(20),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
```

Run migration:
```bash
psql "$DATABASE_URL" -f migrations/003_add_payments_table.sql
```

## Testing

### Step 1: Start Development Server

```bash
npm run dev
```

### Step 2: Navigate to Payment Page

Go to any page with the payment component.

### Step 3: Use Test Card

Click on a plan and use this test card:
- **Number:** 4111111111111111
- **Expiry:** Any future date (e.g., 12/25)
- **CVV:** Any 3 digits (e.g., 123)

### Step 4: Verify Payment

After completing the test payment, check:
- Payment status shows as "Completed"
- User features are granted
- Database is updated

## Webhook Integration (Advanced)

Set up webhook to receive real-time payment updates:

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Subscribe to events: `order.paid`, `payment.failed`, etc.

Create `api/webhooks/razorpay.ts`:

```typescript
import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const signature = req.headers['x-razorpay-signature'] as string;
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

    if (signature !== expectedSignature) {
        return res.status(403).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    switch (event) {
        case 'order.paid':
            // Handle successful payment
            console.log('Order paid:', payload.order.entity.id);
            break;

        case 'payment.failed':
            // Handle failed payment
            console.log('Payment failed:', payload.payment.entity.id);
            break;

        case 'payment.authorized':
            // Handle authorized payment
            console.log('Payment authorized:', payload.payment.entity.id);
            break;
    }

    return res.status(200).json({ status: 'ok' });
}
```

## Troubleshooting

### Problem: "Cannot find module 'razorpay'"
**Solution:** Make sure dependencies are installed:
```bash
npm install
```

### Problem: "Razorpay key not configured"
**Solution:** Check your environment variables:
```bash
# Development
cat .env.local | grep RAZORPAY

# Vercel
vercel env ls
```

### Problem: Payment modal won't open
**Solution:** Check browser console for errors. Ensure:
- `VITE_RAZORPAY_KEY_ID` is set
- Script is loaded successfully
- No CORS errors

### Problem: Payment verification fails
**Solution:** Verify in backend logs:
```bash
# Check server logs on Vercel
vercel logs
```

Ensure `RAZORPAY_KEY_SECRET` matches your Razorpay account.

## Next Steps

1. **Email Notifications** - Send receipts after payment
2. **Payment History** - Allow users to view past payments
3. **Analytics** - Track conversion rates and revenue
4. **Refund Handling** - Implement refund process
5. **Plan Management** - Allow users to manage subscriptions
6. **Bulk Discounts** - Add discount codes/coupons

## Resources

- [Razorpay Node.js SDK](https://github.com/razorpay/razorpay-node)
- [Razorpay API Documentation](https://razorpay.com/docs/api/)
- [Payment Integration Guide](https://razorpay.com/docs/payments/payment-gateway/)
- [Webhook Documentation](https://razorpay.com/docs/webhooks/)

## Support

For implementation help:
- Check the detailed comments in each file
- Review Razorpay documentation
- Contact Razorpay support: support@razorpay.com
