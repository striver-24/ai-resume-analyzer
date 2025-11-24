# 🚀 Plans Page - How to Access & Use

**Everything you need to know to start using your new plans page!**

---

## ⚡ Quick Access

### Option 1: Navigate Directly
1. Start dev server: `npm run dev`
2. Open: http://localhost:5173/plans
3. ✅ You'll see the complete plans page!

### Option 2: Add Link to Navigation
Add this to your navbar:
```tsx
<Link to="/plans" className="text-gray-700 hover:text-indigo-600">
    Pricing
</Link>
```

---

## 🎯 What You See on Plans Page

### Top Section
```
Choose Your Plan
Powerful resume analysis tools for every career stage

🟢 Your free trial: 10 days remaining
   [████████░░] Progress bar
```

### View Toggle
```
[View Plans] [Compare Plans]
```

### Plan Cards (Default View)
```
BASIC           PREMIUM 👑        ENTERPRISE
₹299/month      ₹799/month        ₹2,999/month
                (Highlighted)     

✓ ATS Score     ✓ ATS Score       ✓ All Features
✓ Feedback      ✓ AI Suggestions  ✓ 24/7 Support
✓ 1 Resume      ✓ Multiple        ✓ API Access
                ✓ Priority        

[Choose]        [Choose]          [Choose]
```

### Comparison Table (Toggle View)
- Side-by-side all features
- Checkmarks showing what's included
- Mobile-friendly accordion view

### FAQ Section
```
Q: Can I change my plan later?
Q: What's included in the free trial?
Q: Is there a money-back guarantee?
Q: Can I cancel anytime?
Q: Do you offer annual plans?
```

### Features Section
```
⚡ Instant Analysis
🔒 100% Secure
☎️ Expert Support
```

---

## 💳 How to Test Payment

### Step 1: Select a Plan
Click "Choose Plan" on any plan card

### Step 2: Payment Modal Opens
You'll see the plan details and payment button

### Step 3: Click "Pay with Razorpay"
Razorpay checkout modal appears

### Step 4: Enter Test Card Details
```
Card Number:  4111 1111 1111 1111
Expiry:       Any future date (e.g., 12/25)
CVV:          Any 3-4 digits (e.g., 123)
Name:         Any name
```

### Step 5: Complete Payment
- Click "Pay" button
- See success notification
- Payment recorded in database

### Verify in Razorpay Dashboard
1. Go to https://dashboard.razorpay.com
2. Log in with your credentials
3. Go to Transactions → Payments
4. See your test payment listed

---

## 🎨 How to Customize

### Change Pricing
**File:** `app/lib/razorpay.ts`

Find this section and edit:
```typescript
export const PRICING = {
    [PlanType.BASIC]: {
        amount: 29900,        // Change ₹299 to your price
        // ... rest of config
    },
    // ... other plans
};
```

Convert your price to paise (1 rupee = 100 paise):
- ₹99 = 9900 paise
- ₹199 = 19900 paise
- ₹499 = 49900 paise

### Change Features List
**File:** `app/lib/razorpay.ts`

```typescript
features: [
    'Your Feature 1',    // Edit these
    'Your Feature 2',
    'Your Feature 3',
],
```

### Change Featured Plan
**File:** `app/components/PlansPage.tsx` (line ~158)

```typescript
// Make ENTERPRISE featured instead of PREMIUM:
isFeatured={planType === PlanType.ENTERPRISE}
```

### Change Trial Duration
**File:** `app/routes/plans.tsx` (line ~48)

```typescript
const freeTrialTotalDays = 30;  // Change from 14 to 30
```

### Change Trial Alert Trigger
**File:** `app/root.tsx` (where you add the modal)

```typescript
// Show modal at 5 days instead of 3:
useTrialExpiringWarning(daysRemaining, 5)
```

---

## 📱 How to Test on Mobile

### Option 1: Browser DevTools
1. Open plans page
2. Press `F12` or `Ctrl+Shift+I`
3. Click device toggle (📱 icon)
4. Select your device size
5. Refresh page

### Option 2: Actual Mobile Device
1. Get your computer IP: `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows)
2. On mobile, visit: `http://YOUR_IP:5173/plans`
3. Test all functionality

---

## 🔔 How the Trial Modal Works

### When It Shows
- User's trial is 3 days or less remaining
- Automatically appears on page load
- Only once per day (remembers dismissal)
- User can click "Maybe Later" to dismiss

### How to Force Show (Testing)
Add this to your component:
```tsx
import { useTrialExpiringWarning } from '~/lib/useTrialExpiringWarning';

const { forceShowModal } = useTrialExpiringWarning(3);

// In your JSX:
<button onClick={forceShowModal}>
    Force Show Trial Modal (For Testing)
</button>
```

### How to Clear Dismissal
```typescript
localStorage.removeItem('trial_modal_dismissed_date');
// Modal will show again on next page load
```

---

## 🔍 Troubleshooting

### Issue: "Plans page shows 404"
**Solution:** Restart dev server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Issue: "Pricing not updating"
**Solution:** Clear cache and rebuild
```bash
rm -rf node_modules/.vite
npm run dev
```

### Issue: "Payment button not working"
**Solution:** Check browser console
```
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for error messages
4. Check if Razorpay key is configured in .env
```

### Issue: "Modal not showing"
**Solution:** 
```typescript
// Clear dismissal flag
localStorage.clear();

// Or use force show:
const { forceShowModal } = useTrialExpiringWarning(3);
forceShowModal();
```

### Issue: "Styling looks broken"
**Solution:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build

# Start dev
npm run dev
```

---

## 📊 Integration Checklist

- [ ] Visit `/plans` and see it working
- [ ] Click a plan and see payment modal
- [ ] Test payment with test card
- [ ] Check payment in Razorpay dashboard
- [ ] Customize pricing
- [ ] Update features list
- [ ] Add link to navbar
- [ ] Add trial modal to root layout
- [ ] Test on mobile
- [ ] Test trial modal (force show)
- [ ] Deploy to staging
- [ ] Test payment flow on staging
- [ ] Deploy to production

---

## 🚀 Ready to Deploy?

### Before Going Live:

1. **Update Pricing**
   - Set real prices in `PRICING` constant
   - Verify all amounts

2. **Customize Features**
   - Edit features list to match your offering
   - Update comparison table

3. **Configure Environment**
   - Ensure Razorpay live credentials in `.env`
   - Verify `RZP_KEY_ID` and `RZP_KEY_SECRET`

4. **Add Navigation**
   - Add pricing link to navbar
   - Update footer if needed

5. **Add Trial Modal**
   - Integrate in root layout
   - Set appropriate threshold (3 days default)

6. **Test Everything**
   - Test all plans
   - Test payment flow
   - Test mobile responsiveness
   - Test trial modal

7. **Deploy**
   - Push to your repository
   - Deploy to Vercel or your hosting
   - Verify production URLs work

---

## 💡 Pro Tips

### Tip 1: Offer Annual Plans
Add to `PRICING`:
```typescript
[PlanType.BASIC_ANNUAL]: {
    amount: 299900,  // ₹2,999 (20% discount)
    description: 'Basic Plan - Annual',
    features: [...],
},
```

### Tip 2: Add Custom Features
Edit comparison data in `PlansComparisonTable.tsx`:
```typescript
const COMPARISON_FEATURES = [
    { 
        category: 'Your Category', 
        items: ['Your Feature 1', 'Your Feature 2'] 
    },
];
```

### Tip 3: Change Colors
Search for these in components and modify:
```
indigo-600  → Your primary color
green-500   → Your success color
yellow-500  → Your warning color
```

### Tip 4: Add Email Capture
Before payment, collect email:
```tsx
const [email, setEmail] = useState('');

<input 
    type="email" 
    value={email} 
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Enter your email"
/>
```

---

## 📞 Support

### Documentation Files
- **Quick Start:** This file
- **Detailed Guide:** `PLANS_PAGE_DOCUMENTATION.md`
- **Visual Guide:** `PLANS_PAGE_VISUAL_GUIDE.md`
- **Complete Summary:** `COMPLETE_IMPLEMENTATION_SUMMARY.md`

### If You Need Help
1. Check the relevant documentation file
2. Look for error message in browser console (F12)
3. Check Razorpay dashboard for transaction logs
4. Review the troubleshooting section above

---

## ✅ Verification Checklist

After implementation, verify:

- ✅ `/plans` route works and displays all plans
- ✅ Plans page shows trial status badge
- ✅ Toggle between card and comparison views works
- ✅ Clicking plan opens payment modal
- ✅ Payment can be completed with test card
- ✅ Payment appears in Razorpay dashboard
- ✅ Page is mobile responsive
- ✅ Trial modal appears when days are low
- ✅ All links work (navbar, buttons)
- ✅ Prices are correct
- ✅ Features are listed correctly
- ✅ FAQ accordion works
- ✅ Build passes: `npm run build`

---

## 🎉 You're Ready!

Your plans page is fully functional and ready to use:

1. **Access it:** http://localhost:5173/plans
2. **Test it:** Complete a payment
3. **Customize it:** Edit pricing and features
4. **Deploy it:** Push to production

That's it! Your users can now see your pricing and upgrade their plans. 🚀

---

**Questions?** Check the documentation files or search for error messages in the browser console.

**Ready to launch?** Your system is production-ready! 🎊
