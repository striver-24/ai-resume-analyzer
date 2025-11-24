# 🧪 Razorpay Test Mode - Quick Start

## ✅ Setup Complete!

Your test environment is now configured. Here's how to test payments immediately.

---

## 🎯 Quick Test in 5 Steps

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Go to Plans Page
Open in browser: [http://localhost:5173/plans](http://localhost:5173/plans)

### Step 3: Select Any Plan
Click **"Choose Plan"** or **"Upgrade"** button

### Step 4: Fill Payment Form
- Email: `test@example.com`
- Phone: `9999999999`
- Click **"Pay Now"** button

### Step 5: Use Test Card
When Razorpay modal opens:
- **Card Number:** `4111111111111111`
- **Expiry:** `12/25` (any future month/year)
- **CVV:** `123` (any 3 digits)
- **Name:** `Test User`
- Click **"Pay"** button

### Step 6: Complete OTP
If 3D Secure appears:
- **OTP:** `123456` (or any 6 digits)
- Click **"Verify"** button

---

## 💡 Test Cards Reference

| Card Type | Number | Expiry | CVV | Use Case |
|-----------|--------|--------|-----|----------|
| Visa | 4111111111111111 | Any future | Any 3 digits | Success |
| Mastercard | 5555555555554444 | Any future | Any 3 digits | Success |
| American Express | 378282246310005 | Any future | Any 4 digits | Success |

All test cards will process successfully with **zero charges**.

---

## 🔍 What Happens After Payment

1. ✅ Payment modal closes
2. ✅ Success message appears
3. ✅ Page redirects or updates
4. ✅ Check Razorpay Dashboard for transaction record

---

## 📊 Verify in Razorpay Dashboard

1. Go to: [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Login with your credentials
3. Make sure **Test Keys toggle is ON** (top right)
4. Go to: **Transactions → Payments**
5. You should see your test transaction with status **Captured**

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Payment modal won't open | Restart dev server, clear browser cache |
| "Razorpay not defined" | Check console for errors, restart server |
| "Invalid API Key" | Verify test keys in `.env.local` |
| Payment page shows blank | Use different test card number |
| Can't find transaction | Make sure **Test Keys toggle is ON** in dashboard |

---

## 🔐 Key Files

- **Payments:** `/api/payments/create-order.ts`
- **Verification:** `/api/payments/verify-payment.ts`
- **Config:** `/app/lib/razorpay.ts`
- **Component:** `/app/components/PaymentGateway.tsx`
- **Test Keys:** `.env.local` (Test mode configuration)

---

## 📝 Important Notes

✅ **Safe to Test**
- Test cards won't charge you
- No real transactions
- Perfect for development

⚠️ **Remember**
- Never commit `.env.local` to git
- Keep test keys in `.env.local`
- Live keys stay in `.env`

---

## 🚀 Next: Switching to Live Mode

When ready for production:

1. Get live keys from Razorpay Dashboard
2. Update `.env` with live `rzp_live_*` keys
3. Never use test cards in production
4. Deploy to Vercel with live credentials

---

## 💬 Sample Test Flow

```
User Visit /plans
   ↓
Click "Choose Plan"
   ↓
Razorpay Modal Opens
   ↓
User Enters Test Card: 4111111111111111
   ↓
Payment Success ✅
   ↓
Transaction Recorded
   ↓
User See Success Message
```

---

## ✨ Status

✅ **Environment Variables:** Configured  
✅ **Test Keys:** Set to `rzp_test_*`  
✅ **Test Cards:** Available  
✅ **Ready to Test:** YES  

**Start testing now by running `npm run dev` and visiting `/plans`**

---

**Razorpay Integration Version:** 2.9.6  
**Test Mode:** ✅ ENABLED  
**Last Updated:** 2024
