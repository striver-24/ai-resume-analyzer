# ✅ Razorpay Test Mode - Complete Testing Checklist

## 📋 Pre-Testing Verification

### Environment Setup
- [x] `.env.local` file created with test keys
- [x] `RZP_KEY_ID` starts with `rzp_test_`
- [x] `RZP_KEY_SECRET` is set (test secret)
- [x] `VITE_RZP_KEY_ID` starts with `rzp_test_`
- [x] All other environment variables from `.env` copied
- [x] `.env.local` is in `.gitignore` (never committed)

### Backend Verification
- [x] `/api/payments/create-order.ts` configured
- [x] `/api/payments/verify-payment.ts` configured
- [x] Razorpay npm package installed (v2.9.6)
- [x] Signature verification using crypto module

### Frontend Setup
- [x] `/app/components/PaymentGateway.tsx` component exists
- [x] `/app/lib/razorpay.ts` pricing configuration exists
- [x] `/app/routes/plans.tsx` integrates payment component
- [x] Razorpay script loading configured

---

## 🧪 Testing Phase 1: Environment Verification

### 1.1 Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Verification Steps:**
- [ ] Server starts without errors
- [ ] No "Razorpay not configured" warnings
- [ ] No environment variable errors
- [ ] Build completes successfully

### 1.2 Check Environment Variables Loaded
Open browser console (F12) and run:

```javascript
// Should show test key
console.log(window.RAZORPAY_KEY_ID)  // Expected: rzp_test_...
```

**Expected Output:**
```
rzp_test_8dHSN9i1hZSm0f
```

**Verification Steps:**
- [ ] Test key ID is visible
- [ ] Starts with `rzp_test_`
- [ ] Not empty or undefined
- [ ] No console errors about missing variables

---

## 🎯 Testing Phase 2: Navigation & UI

### 2.1 Navigate to Plans Page
1. Go to: [http://localhost:5173](http://localhost:5173)
2. You should see: "Crack your dream job using AI"
3. Look for: A "Choose Plan" button or "Upgrade" button
4. If not on home, navigate to Plans page

**Verification Steps:**
- [ ] Plans page loads without errors
- [ ] Plan cards are visible (Basic, Pro, Enterprise)
- [ ] Plan prices are displayed
- [ ] "Choose Plan" buttons are clickable
- [ ] No broken styles or layout issues

### 2.2 Check Plan Details
For each plan visible:

**Verification Steps:**
- [ ] Plan name is clear (Basic, Pro, Enterprise)
- [ ] Price is displayed correctly
- [ ] Features list is visible
- [ ] CTA button is present and readable
- [ ] Trial info badge (if applicable) is shown

### 2.3 Mobile Responsiveness Check
Resize browser to test mobile (375px width):

**Verification Steps:**
- [ ] Plans stack vertically
- [ ] Text remains readable
- [ ] Buttons are touch-friendly (44px+ height)
- [ ] No horizontal scrolling
- [ ] Spacing is appropriate

---

## 💳 Testing Phase 3: Payment Modal Opening

### 3.1 Click "Choose Plan" Button
1. On plans page, click any **"Choose Plan"** button
2. A modal should appear with form fields

**Expected Modal Elements:**
- Email field
- Phone field
- Plan name display
- Amount display
- "Pay Now" button

**Verification Steps:**
- [ ] Modal appears within 2 seconds
- [ ] No console errors (F12)
- [ ] Form fields are empty and ready
- [ ] Modal backdrop is visible
- [ ] Close (X) button is visible

### 3.2 Fill Test Payment Form
Fill the modal form with test data:

| Field | Value |
|-------|-------|
| Email | test@example.com |
| Phone | 9999999999 |

**Verification Steps:**
- [ ] Email field accepts input
- [ ] Phone field accepts input
- [ ] No validation errors while typing
- [ ] "Pay Now" button is clickable
- [ ] Amount shown matches plan price

### 3.3 Click "Pay Now" Button
Click the blue "Pay Now" button to open Razorpay checkout

**Expected:** Razorpay payment modal opens with payment options

**Verification Steps:**
- [ ] Razorpay modal opens (look for Razorpay branding)
- [ ] Modal appears within 3 seconds
- [ ] No console errors
- [ ] Modal is not blocked/hidden
- [ ] Close button (X) is visible

---

## 🔐 Testing Phase 4: Payment Processing

### 4.1 Select Test Card Payment
In Razorpay modal:
1. Look for payment method selector
2. Choose: **Card** option
3. This opens the test card entry form

**Verification Steps:**
- [ ] Card option is available
- [ ] Clicking card shows input fields
- [ ] Card number field is focused
- [ ] Form is ready for card details

### 4.2 Enter Test Card Details

**Use this test card (Visa):**
```
Card Number: 4111111111111111
Expiry: 12/25 (or any future date)
CVV: 123 (or any 3 digits)
Name: Test User
```

**Step-by-step:**
1. Click card number field
2. Paste or type: `4111111111111111`
3. Tab to expiry field
4. Type: `1225` (for Dec 2025)
5. Tab to CVV field
6. Type: `123`
7. Tab to name field
8. Type: `Test User`

**Verification Steps:**
- [ ] Card number field accepts 16 digits
- [ ] Number is masked/formatted correctly
- [ ] Expiry field accepts MM/YY format
- [ ] CVV field accepts 3 digits
- [ ] Name field accepts text
- [ ] No validation errors
- [ ] "Pay" button appears and is clickable

### 4.3 Submit Card Payment
Click the blue **"Pay"** button in Razorpay modal

**Expected:** Either success or 3D Secure prompt

**Verification Steps:**
- [ ] Button is clickable
- [ ] Loading spinner appears briefly
- [ ] No error messages (unless 3D Secure)
- [ ] Modal doesn't close prematurely

### 4.4 Handle 3D Secure (if prompted)
If a 3D Secure verification page appears:
1. Look for OTP input field
2. Enter OTP: `123456`
3. Click "Verify" or "Confirm"

**Verification Steps:**
- [ ] OTP field appears
- [ ] OTP accepts numeric input
- [ ] Verify button is clickable
- [ ] Processing spinner shows
- [ ] Returns to payment success

---

## ✅ Testing Phase 5: Payment Success

### 5.1 Payment Completion
After successful payment, the Razorpay modal should close and show success

**Expected Results:**
- [ ] Razorpay modal closes automatically
- [ ] Success message appears (green)
- [ ] Message text: "Payment successful" or similar
- [ ] Page updates to show upgraded status
- [ ] No error messages in console (F12)

### 5.2 Check Success Message
**Verification Steps:**
- [ ] Success message is clearly visible
- [ ] Message has green color/check icon
- [ ] Message displays payment amount
- [ ] Message displays order ID or plan name
- [ ] Message disappears after few seconds or has close button

### 5.3 Check Plan Status Update
After payment:
- [ ] Plans page should update to show new status
- [ ] Paid plan should show "Active" badge
- [ ] "Choose Plan" button changes to "Current Plan" or similar
- [ ] Features should be accessible

**Verification Steps:**
- [ ] Plan status is updated
- [ ] Button text has changed
- [ ] Visual indication of active plan
- [ ] No "Choose Plan" option visible for purchased plan

---

## 📊 Testing Phase 6: Verify in Razorpay Dashboard

### 6.1 Access Razorpay Dashboard
1. Go to: [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Login with your Razorpay account credentials
3. You should see dashboard with statistics

**Verification Steps:**
- [ ] Dashboard loads without errors
- [ ] Logged in successfully
- [ ] Can see account statistics

### 6.2 Switch to Test Keys View
1. Look at top-right corner
2. You should see: **"Test Keys"** toggle/switch
3. Ensure it's **ON** (highlighted/enabled)
4. If showing "Live Keys", click toggle to switch

**Important:** If you're viewing Live Keys, you'll see only live transactions

**Verification Steps:**
- [ ] Test Keys toggle is visible
- [ ] Toggle is in ON position
- [ ] Text clearly shows "Test Keys"
- [ ] Dashboard shows test data only

### 6.3 View Transactions
1. In left sidebar, find: **Transactions** or **Payments**
2. Click to expand menu
3. Click: **Payments**
4. You should see list of all payments

**Verification Steps:**
- [ ] Transactions page loads
- [ ] Page shows payment history
- [ ] List is not empty (shows your test payment)
- [ ] Latest payment is at the top

### 6.4 Find Your Test Transaction
Look for your test payment in the list:

**Verification Steps:**
- [ ] Your test payment is visible
- [ ] Amount matches (e.g., ₹299 for Pro plan)
- [ ] Status shows: **"Captured"** (means successful)
- [ ] Payment method shows: **Card**
- [ ] Card shows: **Visa** ending in **1111**
- [ ] Timestamp is recent (within last few minutes)

### 6.5 Check Transaction Details
Click on your payment in the list to see details:

**Expected Details:**
- Payment ID: `pay_XXXXXXXXXXXXX`
- Order ID: `order_XXXXXXXXXXXXX`
- Amount: Correct rupee amount
- Currency: INR
- Status: Captured (success)
- Method: Card
- Card: Visa ending 1111
- 3D Secure: Status (if applicable)
- Timestamp: Recent
- Customer Email: test@example.com
- Customer Phone: 9999999999

**Verification Steps:**
- [ ] All details load correctly
- [ ] Status is "Captured" (not Failed or Pending)
- [ ] Amount is correct
- [ ] Payment ID is visible
- [ ] Order ID is visible
- [ ] Can see full transaction flow

---

## 🔄 Testing Phase 7: Alternative Test Cards (Optional)

### 7.1 Test Mastercard
Repeat the payment process with:
```
Card: 5555555555554444
Expiry: 12/25
CVV: 123
```

**Verification Steps:**
- [ ] Mastercard payment succeeds
- [ ] Appears in dashboard with "Mastercard" label
- [ ] Status shows "Captured"

### 7.2 Test with Different Amount
Try a different plan with different price:

**Verification Steps:**
- [ ] Different amount processes correctly
- [ ] Dashboard shows correct amount
- [ ] Payment succeeds without issues

### 7.3 Test Failure Scenario (Optional)
Use test card: `4000000000000002` (designed to fail)

**Expected:** Payment should fail with error message

**Verification Steps:**
- [ ] Error message appears
- [ ] Modal shows failure reason
- [ ] Can retry payment
- [ ] No payment captured in dashboard

---

## 🐛 Testing Phase 8: Error Scenarios

### 8.1 Test Network Error Recovery
1. Open payment modal
2. Before completing payment, disconnect internet
3. Wait for error message
4. Reconnect internet
5. Try again

**Verification Steps:**
- [ ] Error message appears
- [ ] Clear message about network issue
- [ ] Can close modal safely
- [ ] Can retry after reconnecting

### 8.2 Test Modal Close Without Payment
1. Open payment modal
2. Click X or close button
3. Modal should close without processing

**Verification Steps:**
- [ ] Modal closes cleanly
- [ ] Page returns to normal state
- [ ] No payment processed
- [ ] No charge in Razorpay dashboard

### 8.3 Test Validation Errors
Try to submit form with invalid data:

**Test Cases:**
- Empty email: Should show "Email required"
- Invalid email: Should show "Invalid email format"
- Empty phone: Should show "Phone required"
- Invalid phone: Should show "Invalid phone"

**Verification Steps:**
- [ ] Validation messages appear
- [ ] Errors are clear and helpful
- [ ] Can't submit without valid data
- [ ] Fixes take effect immediately

---

## 📱 Testing Phase 9: Cross-Browser Testing

### 9.1 Chrome/Firefox/Safari
Test payment flow in different browsers:

**Verification Steps:**
- [ ] Payment works in Chrome
- [ ] Payment works in Firefox
- [ ] Payment works in Safari
- [ ] Payment works in Edge
- [ ] No console errors in any browser

### 9.2 Incognito/Private Mode
Test in incognito window (no cache issues):

**Verification Steps:**
- [ ] Payment modal opens
- [ ] Payment processes successfully
- [ ] No cache-related issues
- [ ] Works with fresh session

### 9.3 Mobile Browsers
Test on real mobile devices or mobile emulation:

**Verification Steps:**
- [ ] Modal opens on mobile
- [ ] Keyboard appears appropriately
- [ ] Can enter card details on mobile
- [ ] No horizontal scrolling
- [ ] Touch interaction works smoothly

---

## 📊 Final Verification Checklist

### Backend Status
- [ ] No console errors
- [ ] No network errors (Network tab)
- [ ] Payment API responds correctly
- [ ] Signature verification passes
- [ ] Database records transaction (if configured)

### Frontend Status
- [ ] Payment modal loads
- [ ] Form validation works
- [ ] Success message appears
- [ ] Error handling works
- [ ] UI updates after payment

### Razorpay Dashboard
- [ ] Transaction appears in dashboard
- [ ] Amount is correct
- [ ] Status is "Captured"
- [ ] Card details show correctly
- [ ] Timestamp is accurate

### Security
- [ ] HTTPS used (production)
- [ ] API key secret not exposed in console
- [ ] Frontend key is `rzp_test_*`
- [ ] Backend signature verification works
- [ ] No sensitive data in logs

---

## 🎓 Test Results Summary

### Test Execution Date: ___________
### Tester Name: ___________

### Results

**Phase 1 - Environment:** ✅ PASS / ❌ FAIL
- Issues: ___________

**Phase 2 - UI Navigation:** ✅ PASS / ❌ FAIL
- Issues: ___________

**Phase 3 - Modal Opening:** ✅ PASS / ❌ FAIL
- Issues: ___________

**Phase 4 - Payment Form:** ✅ PASS / ❌ FAIL
- Issues: ___________

**Phase 5 - Success Message:** ✅ PASS / ❌ FAIL
- Issues: ___________

**Phase 6 - Dashboard Verification:** ✅ PASS / ❌ FAIL
- Issues: ___________

**Phase 7 - Alternative Cards:** ✅ PASS / ❌ FAIL
- Issues: ___________

**Phase 8 - Error Scenarios:** ✅ PASS / ❌ FAIL
- Issues: ___________

**Phase 9 - Cross-Browser:** ✅ PASS / ❌ FAIL
- Issues: ___________

### Overall Status: ✅ READY FOR PRODUCTION / ❌ NEEDS FIXES

---

## 🚀 Next Steps After Testing

- [ ] All test phases completed successfully
- [ ] No critical issues found
- [ ] Document any minor issues for future fixes
- [ ] Get live Razorpay credentials when ready
- [ ] Update `.env` with live keys
- [ ] Test with live keys in staging environment
- [ ] Deploy to production
- [ ] Monitor payment transactions in production

---

## 📞 Troubleshooting Guide

If you encounter any issues during testing, refer to:
- `RAZORPAY_TEST_MODE_SETUP.md` - Detailed setup guide
- `RAZORPAY_QUICK_REFERENCE.md` - Quick reference for common issues
- `RAZORPAY_TEST_MODE_QUICK_START.md` - Quick start guide

---

**Test Mode:** ✅ ENABLED  
**Status:** Ready for comprehensive testing  
**Last Updated:** 2024
