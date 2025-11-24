# Razorpay Integration - Quick Reference Guide

## 🚀 Getting Started in 5 Minutes

### 1. Get Credentials (2 min)
1. Go to https://razorpay.com and create account
2. Navigate to Account Settings → API Keys
3. Copy **Key ID** and **Key Secret**

### 2. Set Environment Variables (1 min)
Create `.env.local`:
```env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
VITE_RAZORPAY_KEY_ID=your_key_id_here
```

### 3. Uncomment Code (1 min)
Four files need uncomments - search for `TODO:` comments:
- `api/payments/create-order.ts` - Lines 85-95, 115-135
- `api/payments/verify-payment.ts` - Lines 70-80
- `app/lib/razorpay.ts` - Lines 180-195
- `app/lib/payment-hooks.ts` - Lines 40-45

### 4. Run & Test (1 min)
```bash
npm install
npm run dev
# Visit payment component, use test card: 4111111111111111
```

---

## 📁 File Structure

### Backend Payment APIs
```
api/payments/
├── create-order.ts          # Creates payment order
└── verify-payment.ts        # Verifies payment signature
```

### Frontend Payments Library
```
app/lib/
├── razorpay.ts              # Core utilities & config
└── payment-hooks.ts         # React hooks for payments
```

### Frontend Payment Components
```
app/components/
├── PaymentGateway.tsx       # Full payment interface
└── PricingPlans.tsx         # Pricing modal
```

---

## 💰 Pricing Configuration

Edit `app/lib/razorpay.ts`:
```typescript
export const PRICING = {
    basic: { amount: 29900 },      // ₹299
    premium: { amount: 79900 },    // ₹799
    enterprise: { amount: 299900 }, // ₹2,999
};
```

**Note:** Amounts are in **paise** (100 paise = ₹1)

---

## 🎯 Usage Examples

### Simple Payment Button
```tsx
import { usePayment } from '~/lib/payment-hooks';
import { PlanType } from '~/lib/razorpay';

export function UpgradeButton() {
    const { processPayment, isLoading } = usePayment();

    return (
        <button
            onClick={() => processPayment(PlanType.PREMIUM)}
            disabled={isLoading}
        >
            Upgrade Now
        </button>
    );
}
```

### Full Payment Page
```tsx
import PaymentGateway from '~/components/PaymentGateway';

export function PricingPage() {
    return (
        <PaymentGateway
            onPaymentSuccess={(plan) => {
                console.log('Payment successful:', plan);
                // Update user subscription
            }}
        />
    );
}
```

### Modal Pricing
```tsx
import { useState } from 'react';
import PricingPlans from '~/components/PricingPlans';

export function HomePage() {
    const [showPlans, setShowPlans] = useState(false);

    return (
        <>
            <button onClick={() => setShowPlans(true)}>
                View Plans
            </button>
            <PricingPlans
                isOpen={showPlans}
                onClose={() => setShowPlans(false)}
            />
        </>
    );
}
```

---

## 🧪 Testing

### Test Card Numbers
```
Visa:       4111111111111111
Mastercard: 5555555555554444
```

**Expiry:** Any future date  
**CVV:** Any 3 digits

### Test Scenarios
- ✅ All test cards process successfully in test mode
- Use real cards in production only

---

## 🔑 Environment Variables

### Development
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_test_secret
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### Production
```env
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_live_secret
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

---

## 🪝 Available Hooks

### usePayment()
```typescript
const {
    status,              // 'pending' | 'processing' | 'completed' | 'failed'
    error,               // Error | null
    isLoading,           // boolean
    processPayment,      // (plan, userDetails) => Promise
    cancelPayment,       // () => void
    isPaymentSuccess,    // boolean
} = usePayment();
```

### usePaymentPlans()
```typescript
const {
    currentPlan,         // PlanType | null
    upgradePlan,         // (plan) => Promise
    downgradePlan,       // (plan) => Promise
    ...paymentState,
} = usePaymentPlans();
```

### usePaymentHistory()
```typescript
const {
    history,             // PaymentHistoryItem[]
    loading,             // boolean
    loadHistory,         // () => Promise
    getPaymentById,      // (id) => PaymentHistoryItem | undefined
} = usePaymentHistory();
```

---

## 📋 Checklist

### Initial Setup
- [ ] Razorpay account created
- [ ] Credentials obtained
- [ ] Environment variables set
- [ ] `npm install` run

### Code Activation
- [ ] Backend code uncommented
- [ ] Frontend code uncommented
- [ ] Pricing configured
- [ ] Components imported

### Testing
- [ ] Dev server running
- [ ] Test payment successful
- [ ] Error handling works
- [ ] Success page shows

### Production
- [ ] Live credentials added
- [ ] Deployed to hosting
- [ ] Small test payment made
- [ ] Monitoring enabled

---

## 📚 Documentation

- **`RAZORPAY_SETUP.md`** - Detailed setup guide
- **`RAZORPAY_IMPLEMENTATION.md`** - Implementation examples
- **`RAZORPAY_SUMMARY.md`** - Complete file overview
- **`.env.razorpay.example`** - Environment variables template

Each file contains inline comments explaining implementation.

---

## ⚡ Common Tasks

### Change Pricing
Edit `PRICING` object in `app/lib/razorpay.ts`

### Add Payment to Page
```tsx
import PaymentGateway from '~/components/PaymentGateway';
// Add component to your page
```

### Handle Payment Success
```typescript
onPaymentSuccess={(plan) => {
    // Grant features, update database, send email, etc.
}}
```

### Debug Payment Issues
Check `browser console` for errors  
Check `server logs` in Vercel dashboard  
Verify environment variables are set

---

## 🔒 Security Tips

✅ Do:
- Keep `RAZORPAY_KEY_SECRET` private
- Verify signatures on backend
- Validate amounts on backend
- Log all transactions

❌ Don't:
- Expose key secret in frontend
- Skip signature verification
- Hardcode credentials in code
- Use real cards in test mode

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Script won't load | Check internet, verify key ID |
| Modal won't open | Check `VITE_RAZORPAY_KEY_ID` |
| Verification fails | Verify `RAZORPAY_KEY_SECRET` |
| Amount error | Use values in paise (100 = ₹1) |
| No environment vars | Create `.env.local` file |

---

## 📞 Support

- **Razorpay:** support@razorpay.com
- **Documentation:** Check inline comments
- **Examples:** See `RAZORPAY_IMPLEMENTATION.md`
- **Setup:** See `RAZORPAY_SETUP.md`

---

## 🎓 Learn More

- [Razorpay Docs](https://razorpay.com/docs/)
- [Payment Gateway Guide](https://razorpay.com/docs/payments/payment-gateway/)
- [API Reference](https://razorpay.com/docs/api/)

---

**Last Updated:** November 2, 2025  
**Status:** ✅ Ready for activation
