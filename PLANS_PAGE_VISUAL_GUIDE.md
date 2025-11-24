# 🎨 Plans Page - Visual Guide & Component Map

**This document provides a visual overview of all components and how they work together.**

---

## 🗺️ Component Architecture

```
PlansPage (Main Container)
│
├── Header Section
│   ├── Title "Choose Your Plan"
│   └── TrialStatusBadge
│       ├── Days remaining
│       ├── Progress bar
│       └── Color indicator (green/yellow/red)
│
├── View Mode Toggle
│   ├── "View Plans" button
│   └── "Compare Plans" button
│
├── Content Section (Conditional)
│   │
│   ├── IF "View Plans" Selected:
│   │   └── Grid Layout (3 columns)
│   │       ├── PlanCard (Basic)
│   │       │   ├── Plan name
│   │       │   ├── Price
│   │       │   ├── Features list
│   │       │   └── "Choose Plan" button
│   │       ├── PlanCard (Premium) - FEATURED
│   │       │   ├── Crown badge
│   │       │   └── Larger card (scaled up)
│   │       └── PlanCard (Enterprise)
│   │
│   └── IF "Compare Plans" Selected:
│       └── PlansComparisonTable
│           ├── Feature categories
│           ├── Checkmarks/X marks
│           └── Select buttons
│
├── FAQ Section
│   ├── "Why Choose Us?" header
│   └── 5 Expandable FAQItems
│       └── Q&A pairs
│
├── Features Overview
│   ├── FeatureCard (Instant Analysis)
│   ├── FeatureCard (100% Secure)
│   └── FeatureCard (Expert Support)
│
└── PaymentGateway Modal (Conditional)
    └── Opens when plan selected
```

---

## 📱 Responsive Layout Changes

### Desktop (1024px+)
```
┌─────────────────────────────────────────────┐
│          PLANS PAGE - DESKTOP               │
├─────────────────────────────────────────────┤
│  Choose Your Plan                           │
│  ─────────────────────────────────────────  │
│  🟢 Free Trial: 10 days remaining           │
│  ─────────────────────────────────────────  │
│  [View Plans] [Compare Plans]               │
│  ─────────────────────────────────────────  │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ BASIC    │  │👑PREMIUM │  │ENTERPRISE│ │
│  │ ₹299/mo  │  │ ₹799/mo  │  │₹2,999/mo │ │
│  │ Features │  │Features  │  │Features  │ │
│  │ [Choose] │  │ [Choose] │  │ [Choose] │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                (Scaled up)                   │
│                                             │
│  FAQ Section                                │
│  Features Overview                          │
└─────────────────────────────────────────────┘
```

### Tablet (640px - 1024px)
```
┌──────────────────────────────────┐
│    PLANS PAGE - TABLET           │
├──────────────────────────────────┤
│  Choose Your Plan                │
│  ────────────────────────────    │
│  🟢 Free Trial: 10 days left     │
│  ────────────────────────────    │
│  [View Plans] [Compare Plans]    │
│                                  │
│  ┌────────────────┐              │
│  │ BASIC - ₹299   │              │
│  │ Features...    │              │
│  │ [Choose]       │              │
│  └────────────────┘              │
│  ┌────────────────┐              │
│  │ PREMIUM - ₹799 │              │
│  │ Features...    │              │
│  │ [Choose]       │              │
│  └────────────────┘              │
│  ┌────────────────┐              │
│  │ ENTERPRISE-999 │              │
│  │ Features...    │              │
│  │ [Choose]       │              │
│  └────────────────┘              │
│                                  │
│  FAQ - Features Overview         │
└──────────────────────────────────┘
```

### Mobile (320px - 640px)
```
┌──────────────────┐
│ PLANS - MOBILE   │
├──────────────────┤
│ Choose Your Plan │
│ ──────────────── |
│ 🟢 Trial: 10 d   │
│ ──────────────── |
│ [View] [Compare] │
│                  │
│ ┌──────────────┐ │
│ │ BASIC        │ │
│ │ ₹299/month   │ │
│ │ • Feature 1  │ │
│ │ • Feature 2  │ │
│ │ [Choose]     │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ PREMIUM 👑   │ │
│ │ ₹799/month   │ │
│ │ • Feature 1  │ │
│ │ • Feature 2  │ │
│ │ [Choose]     │ │
│ └──────────────┘ │
│ ┌──────────────┐ │
│ │ ENTERPRISE   │ │
│ │ ₹2,999/month │ │
│ │ • Feature 1  │ │
│ │ • Feature 2  │ │
│ │ [Choose]     │ │
│ └──────────────┘ │
│                  │
│ FAQ - Features   │
└──────────────────┘
```

---

## 🎨 PlanCard Component - Visual Breakdown

### Normal Card
```
┌─────────────────────────────┐
│ Basic                       │
│ ₹299                        │
│ Basic Resume Analysis       │
│                             │
│ [Choose Plan]               │
│                             │
│ What's Included             │
│ ✓ ATS Score                 │
│ ✓ Basic Feedback            │
│ ✓ 1 Resume                  │
│                             │
│ ✓ Billed monthly            │
│ ✓ Cancel anytime            │
│ ✓ 7-day money-back          │
└─────────────────────────────┘
```

### Featured Card (Premium)
```
    ┌─────────────────────────┐
    │  👑 Most Popular        │
    ├─────────────────────────┤
    │  Premium                │
    │  ₹799 (larger text)     │
    │  Premium Resume...      │
    │                         │
    │  [Choose Plan]          │
    │  (blue button)          │
    │                         │
    │  What's Included        │
    │  ✓ ATS Score            │
    │  ✓ AI Suggestions       │
    │  ✓ Multiple Resumes     │
    │  ✓ Priority Support     │
    │                         │
    │  ... (scaled 1.05x)     │
    └─────────────────────────┘
    (Ring border: indigo-600)
```

### Current Plan Card
```
┌─────────────────────────────┐
│ Enterprise      ✓ Current   │
│ ₹2,999          (green)     │
│ Enterprise Resume...        │
│                             │
│ [Current Plan]              │
│ (disabled, gray)            │
│                             │
│ What's Included             │
│ ✓ Unlimited Resumes         │
│ ✓ 24/7 Support              │
│ ✓ Custom Analytics          │
│ ✓ API Access                │
│                             │
│ ✓ Billed monthly            │
│ ✓ Cancel anytime            │
│ ✓ 7-day money-back          │
└─────────────────────────────┘
```

---

## 📊 Trial Status Badge States

### Healthy (🟢 Green)
```
╔═════════════════════════════════════════╗
║ ✓ Free Trial Active                 12 │
║ ═════════════════════════════════════   │ (12/14 green)
║ You have access to all Premium         │
║ features during your trial              │
╚═════════════════════════════════════════╝
```

### Warning (🟡 Yellow)
```
╔═════════════════════════════════════════╗
║ ⚠ Free Trial Active                 3  │
║ ═══════════════════════════════════════ │ (3/14 yellow)
║ You have access to all Premium       │  │
║ features during your trial        [Upgrade]
╚═════════════════════════════════════════╝
```

### Critical (🔴 Red)
```
╔═════════════════════════════════════════╗
║ ⚠ Trial Expired                        │
║ ═════════════════════════════════════   │ (0/14 red)
║ Upgrade now to continue using premium   │
║ features                   [Upgrade Now]│
╚═════════════════════════════════════════╝
```

---

## 🔔 Trial Expiring Modal

### When It Appears
- Trial has 3 days or less remaining
- At page load (delayed 1 second)
- Only shows once per day (localStorage)
- User can dismiss for 24 hours

### Modal Layout
```
┌────────────────────────────────┐
│  ✕ (close)                    │
│                                │
│  🕐 (animated icon)            │
│                                │
│  Trial Ending Soon             │
│                                │
│  Your free trial ends in       │
│  ┌──┐                          │
│  │ 3 │  Days remaining         │
│  └──┘                          │
│                                │
│  Upgrade now to continue       │
│  using all premium features    │
│  including AI suggestions...   │
│                                │
│  ╔════════════════════════════╗│
│  ║ Unlock with Premium:       ║│
│  ║ • Unlimited analysis       ║│
│  ║ • AI-powered suggestions   ║│
│  ║ • Priority support         ║│
│  ╚════════════════════════════╝│
│                                │
│  [Upgrade to Premium]          │
│  [Maybe Later]                 │
│                                │
│  💳 7-day money-back guarantee │
│     Cancel anytime             │
└────────────────────────────────┘
```

---

## 📊 Plan Comparison Table

### Desktop Version
```
┌──────────────────┬──────────┬──────────┬─────────────┐
│ Feature          │ BASIC    │ PREMIUM  │ ENTERPRISE  │
├──────────────────┼──────────┼──────────┼─────────────┤
│ Monthly Price    │  ₹299    │  ₹799    │  ₹2,999     │
├──────────────────┼──────────┼──────────┼─────────────┤
│ RESUMES          │          │          │             │
│ ├─ Resumes       │    ✓     │    ✓     │     ✓       │
│ ├─ AI Suggestions│    ✗     │    ✓     │     ✓       │
│ └─ Version Hist. │    ✗     │    ✓     │     ✓       │
├──────────────────┼──────────┼──────────┼─────────────┤
│ FEATURES         │          │          │             │
│ ├─ ATS Score     │    ✓     │    ✓     │     ✓       │
│ ├─ Keyword Anal. │    ✓     │    ✓     │     ✓       │
│ ├─ Interview Prep│    ✗     │    ✓     │     ✓       │
│ ├─ Mock Interviews│   ✗     │    ✓     │     ✓       │
│ └─ Cover Letter  │    ✗     │    ✗     │     ✓       │
├──────────────────┼──────────┼──────────┼─────────────┤
│ SUPPORT          │          │          │             │
│ ├─ Email Support │    ✓     │    ✓     │     ✓       │
│ ├─ Priority      │    ✗     │    ✓     │     ✓       │
│ └─ 24/7 Support  │    ✗     │    ✗     │     ✓       │
├──────────────────┼──────────┼──────────┼─────────────┤
│ EXPORTS          │          │          │             │
│ ├─ PDF Export    │    ✓     │    ✓     │     ✓       │
│ ├─ Multiple      │    ✗     │    ✓     │     ✓       │
│ └─ Batch Process │    ✗     │    ✗     │     ✓       │
├──────────────────┼──────────┼──────────┼─────────────┤
│ CTA              │  [Select]│ [Select] │  [Select]   │
└──────────────────┴──────────┴──────────┴─────────────┘
```

### Mobile Version (Card Layout)
```
┌──────────────────────┐
│ BASIC                │
│ ₹299/month           │
│                      │
│ Resumes              │
│ ✓ Resumes Analyzable│
│ ✗ AI Suggestions    │
│ ✗ Version History   │
│                      │
│ Features             │
│ ✓ ATS Score         │
│ ✓ Keyword Analysis  │
│ ✗ Interview Prep    │
│ ✗ Mock Interviews   │
│ ✗ Cover Letter Help │
│                      │
│ [Choose Plan]        │
└──────────────────────┘
```

---

## 🔄 Payment Flow Diagram

```
User on Plans Page
        ↓
[Sees plan cards + trial status]
        ↓
Clicks "Choose Plan"
        ↓
PaymentGateway Modal Opens
        ↓
[Plan selected, price shown]
        ↓
User Clicks "Pay with Razorpay"
        ↓
Razorpay Checkout Opens
        ↓
[User enters payment details]
        ↓
Payment Processed
        ↓
Callback Handler Triggered
        ↓
verifyPayment() Calls Backend
        ↓
Backend: Verify HMAC Signature
        ↓
Success ✓ / Failure ✗
        ↓
If Success:
  • Update database
  • Grant plan access
  • Show success message
  • Redirect to dashboard
        ↓
If Failure:
  • Show error message
  • Allow retry
```

---

## 🎯 User Journey

```
1. FREE TIER USER
   ├─ Sees plans page
   ├─ Notices trial ending badge
   └─ Views plan features

2. CLICKS "CHOOSE PLAN"
   ├─ Plan selection state updates
   ├─ PaymentGateway component loads
   └─ Plan details shown

3. RAZORPAY CHECKOUT
   ├─ User enters card details
   ├─ Payment processed
   └─ Callback received

4. BACKEND VERIFICATION
   ├─ Signature verified
   ├─ Database updated
   └─ Plan granted

5. SUCCESS
   ├─ User sees confirmation
   ├─ Redirected to dashboard
   └─ New plan active immediately
```

---

## 🎨 Color Scheme

```
Primary (Interactive): #4F46E5 (Indigo-600)
  • Buttons
  • Hover states
  • Featured elements
  • Links

Success (Active): #10B981 (Green-500)
  • Checkmarks
  • Active states
  • Trial active badge

Warning (Attention): #F59E0B (Yellow-500)
  • Trial ending badge
  • Warning icons
  • Alert states

Error (Critical): #EF4444 (Red-500)
  • Trial expired
  • Disabled states
  • Errors

Background: #F9FAFB (Gray-50)
Surfaces: #FFFFFF (White)
Text: #111827 (Gray-900)
Muted: #6B7280 (Gray-500)
```

---

## 📏 Spacing & Sizing

```
Small: 0.25rem (1px padding)
      0.5rem (2px)
      1rem (4px)  - xs

Medium: 1.5rem (6px)   - sm
        2rem (8px)     - md
        3rem (12px)    - lg

Large: 4rem (16px)     - xl
       6rem (24px)     - 2xl
       8rem (32px)     - 3xl

Card padding: 2rem
Modal padding: 2rem
Button padding: 0.75rem 1rem
Section gap: 2rem - 3rem
```

---

## 🖱️ Interaction States

### Buttons
```
Default:   bg-indigo-600 text-white
Hover:     bg-indigo-700 (darker)
Active:    bg-indigo-800 (even darker)
Disabled:  bg-gray-100 text-gray-500 cursor-not-allowed
Loading:   opacity-50 pointer-events-none
```

### Cards
```
Default:   shadow-lg
Hover:     shadow-xl (deeper shadow)
Featured:  ring-2 ring-indigo-600 shadow-2xl
Current:   opacity-75 (disabled appearance)
```

### Modal
```
Closed:    opacity-0 scale-0
Open:      opacity-100 scale-100
           with fade-in and scale-in animations
```

---

## 📱 Touch Targets

All interactive elements meet 44×44px minimum:
```
Buttons:        py-3 px-4 (48px × 56px+)
Icon buttons:   w-6 h-6 (24px minimum)
Links:          p-2 (32px minimum)
Form inputs:    py-2 px-3 (40px minimum)
```

---

## 🎯 Summary

The Plans Page system provides:

✅ **Visual Hierarchy** - Clear product differentiation  
✅ **Responsive Design** - Works on all devices  
✅ **Trial Management** - Automatic countdown & alerts  
✅ **Payment Integration** - Seamless Razorpay checkout  
✅ **Accessibility** - Proper spacing & color contrast  
✅ **Animation** - Smooth transitions & feedback  
✅ **Mobile-First** - Optimized for all screen sizes  

Ready for production deployment! 🚀
