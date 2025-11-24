# 🧪 Razorpay Test Mode Setup Guide

## Overview
This guide will help you set up Razorpay in **test mode** for development and testing without processing real payments.

## ⚠️ Important Notes

- **Live Keys vs Test Keys**: Your current `.env` has LIVE keys. To avoid accidental charges, we'll create test mode keys.
- **Test Mode Cards**: Razorpay provides special test credit card numbers that won't charge your account.
- **No Real Transactions**: Test mode allows you to verify the entire payment flow safely.

---

## 🚀 Step 1: Get Test Mode Credentials from Razorpay

### Option A: If you have a Razorpay Account

1. Visit: [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Login with your credentials
3. Navigate to: **Settings → API Keys**
4. You should see two toggle switches at the top:
   - **Live Keys** (currently active)
   - **Test Keys** (click to switch)
5. Click on the **Test Keys** toggle to see test credentials
6. Copy both:
   - **Test Key ID** (starts with `rzp_test_`)
   - **Test Key Secret** (private, never share)

### Option B: If you don't have a Razorpay Account

1. Create a free account at: [Razorpay.com](https://razorpay.com)
2. Complete the KYC process (can be simplified for testing)
3. Follow Option A steps above

---

## 📝 Step 2: Create `.env.local` for Test Mode

Create a new file `.env.local` in the project root:

```bash
# Copy the entire .env content first
cp .env .env.local

# Then edit .env.local and update Razorpay keys
```

Replace the Razorpay keys in `.env.local`:

```dotenv
# ❌ OLD (LIVE - Don't use for testing!)
# RZP_KEY_ID="rzp_live_bOOBoN66KZPPYT"
# RZP_KEY_SECRET="kll_OttPDQPXRZPmPxVEKXmC1"
# VITE_RZP_KEY_ID="rzp_live_bOOBoN66KZPPYT"

# ✅ NEW (TEST MODE)
RZP_KEY_ID="rzp_test_YOUR_TEST_KEY_ID_HERE"
RZP_KEY_SECRET="YOUR_TEST_KEY_SECRET_HERE"
VITE_RZP_KEY_ID="rzp_test_YOUR_TEST_KEY_ID_HERE"
```

**Example (with dummy test keys):**

```dotenv
RZP_KEY_ID="rzp_test_1234567890abcde"
RZP_KEY_SECRET="test_secret_1234567890abcdefghij"
VITE_RZP_KEY_ID="rzp_test_1234567890abcde"
```

---

## 💳 Step 3: Test Payment Cards

Use these test credit cards in test mode (they won't charge):

### Successful Payment Cards

| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Visa | 4111111111111111 | Any 3 digits | Any future date |
| Mastercard | 5555555555554444 | Any 3 digits | Any future date |

### Test OTP for 3D Secure

- OTP: **123456** (or any 6 digits)

---

## 🔧 Step 4: Restart Development Server

After updating `.env.local`:

```bash
# Kill the current dev server
# Press Ctrl+C in the terminal

# Restart the dev server
npm run dev
```

**Verify in browser console:**
```javascript
// Should show test mode key
console.log(window.RAZORPAY_KEY_ID)  // Should be: rzp_test_...
```

---

## ✅ Step 5: Test the Payment Flow

### Access the Plans Page

1. Navigate to: [http://localhost:5173/plans](http://localhost:5173/plans)
2. Choose any plan
3. Click **"Choose Plan"** or **"Upgrade"** button

### Complete Test Payment

1. A Razorpay modal will appear
2. Fill in the form:
   - Email: Any test email (e.g., test@example.com)
   - Phone: Any number (e.g., 9999999999)
   - Amount: Should show your plan price
3. Click **"Pay"** or similar button
4. The payment page will open:
   - Card Number: **4111111111111111**
   - Expiry: **Any future date** (e.g., 12/25)
   - CVV: **Any 3 digits** (e.g., 123)
5. Click **"Pay"** button
6. For 3D Secure (if prompted): Enter **123456** as OTP
7. Payment should complete successfully

### Verify Test Transaction

1. Return to Razorpay Dashboard
2. Make sure you're viewing **Test Keys** (not Live)
3. Go to: **Transactions → Payments**
4. Your test transaction should appear with status: **Captured**

---

## 🐛 Troubleshooting

### Issue: "Razorpay is not defined"

**Cause:** Razorpay script not loaded
**Fix:**
```bash
npm run dev
# Clear browser cache (Ctrl+Shift+Delete)
# Refresh page
```

### Issue: Payment modal won't open

**Cause:** Test key not properly loaded
**Fix:**
1. Check `.env.local` has test keys
2. Verify `VITE_RZP_KEY_ID` starts with `rzp_test_`
3. Restart dev server
4. Check browser console for errors

### Issue: "Invalid API Key" error

**Cause:** Wrong key or key mismatch
**Fix:**
1. Verify both backend and frontend keys match
2. Ensure test keys (not live)
3. Double-check for typos or extra spaces

### Issue: Payment fails with "Invalid amount"

**Cause:** Amount format issue
**Fix:**
1. Ensure amount is in paise (1 rupee = 100 paise)
2. Check that amount is an integer
3. Verify pricing in `app/lib/razorpay.ts`

### Issue: Signature verification fails

**Cause:** Wrong secret key or key mismatch
**Fix:**
1. Verify `RZP_KEY_SECRET` matches dashboard
2. Check for extra spaces or characters
3. Restart server after env changes

---

## 📊 Monitoring Test Transactions

### In Razorpay Dashboard

1. Make sure you're on **Test Keys** view
2. Go to: **Transactions → Payments**
3. You'll see all test transactions with:
   - Payment ID
   - Amount
   - Status (Captured = Success)
   - Timestamp

### In Application Logs

Check your dev server console for:

```
✅ Payment created successfully
✅ Payment verified successfully
✅ Payment status: captured
```

---

## 🔄 Switching Between Test and Live Mode

### To Use Test Keys

1. In `.env.local`: Use `rzp_test_*` keys
2. Restart dev server
3. Test card numbers work

### To Use Live Keys

1. Update `.env.local` with `rzp_live_*` keys
2. Restart dev server
3. Real credit cards required
4. ⚠️ Real charges will be processed!

---

## 🚀 Deployment Considerations

### For Vercel Deployment

1. Don't commit `.env.local` to git
2. Add environment variables in Vercel dashboard:
   - **Development**: Use test keys
   - **Production**: Use live keys
3. Restart deployment for changes to take effect

### Environment Priorities (Vercel)

1. System environment variables
2. `.env.production.local` (if exists)
3. `.env.local`
4. `.env`

---

## 🔐 Security Checklist

- ✅ `.env.local` is in `.gitignore` (never committed)
- ✅ Test secret key is not exposed in frontend code
- ✅ Live keys are in `.env` (separate from test keys)
- ✅ Using HTTPS for production
- ✅ Backend verifies payment signatures
- ✅ No sensitive data in browser console
- ✅ CORS properly configured

---

## 📚 Useful Resources

| Resource | URL |
|----------|-----|
| Razorpay Docs | https://razorpay.com/docs/payments/ |
| API Reference | https://razorpay.com/docs/api/payments/ |
| Test Cards | https://razorpay.com/docs/payments/payments/test-cards/ |
| Dashboard | https://dashboard.razorpay.com |

---

## ✨ What's Next?

After testing:
1. ✅ Test payment creation with test cards
2. ✅ Verify payment signatures
3. ✅ Check transaction status
4. ✅ Test error scenarios
5. ✅ Deploy to production with live keys

---

## 🆘 Need Help?

If you encounter issues:

1. Check browser console (F12)
2. Check server logs
3. Verify all environment variables
4. Ensure `.env.local` has correct test keys
5. Try in incognito mode (clears cache)
6. Restart dev server
7. Clear node_modules and reinstall

---

**Last Updated:** 2024
**Razorpay Version:** v2.9.6
**Status:** ✅ Ready for Testing
