# Skinstory Repository Architecture & Index

This file acts as the primary architectural map for the Skinstory monorepo. It prevents unneeded directory scanning and file searches, drastically reducing token usage and speeding up task execution.

---

## 1. Monorepo Overview

- **`apps/web`**: Next.js 16 App Router (React 19, Tailwind CSS v4, Framer Motion, Razorpay, Sentry, Supabase).
- **`apps/mobile`**: Expo SDK 56 Mobile App (React Native 0.85, Expo Router, NativeWind/Tailwind v3, Zustand, MediaPipe Tasks Vision).

---

## 2. Web Application Structure (`apps/web/src/`)

### Pages & Routes (`apps/web/src/app/`)
- `page.js`: Main Landing Page
- `checkout/page.jsx`: Razorpay Checkout & Payment Flow
- `pre-launch-offer/page.jsx`: Pre-launch Special Checkout Offer
- `blog/page.jsx`: Blog Index Page
- `blog/[slug]/page.jsx`: Dynamic Blog Post View
- `blog/content/`: Blog Content Registry & Articles (`Blog1.jsx` to `Blog40.jsx`, `articleRegistry.js`)
- `api/create-order/route.js`: Razorpay Order Creation API Endpoint
- `api/verify-payment/route.js`: Razorpay Payment Verification API Endpoint
- `faq/page.jsx`: FAQ Page
- `privacy-policy/page.jsx`: Privacy Policy
- `terms-of-service/page.jsx`: Terms of Service
- `refund-cancellation/page.jsx`: Refund & Cancellation Policy
- `cookie-policy/page.jsx`: Cookie Policy Page
- `press/page.jsx`: Press Information Page

### Components & Context (`apps/web/src/components/`, `apps/web/src/context/`)
- `components/sections/`: Landing Sections (`HeroSection.jsx`, `HowItWorksSection.jsx`, `ComparisonSection.jsx`, `TestimonialsSection.jsx`, `FaqSection.jsx`, `WaitlistCtaSection.jsx`)
- `components/checkout/`: Payment Flow Components (`ProgressBar.jsx`, `RazorpayCheckoutButton.jsx`)
- `components/blog/`: `BlogWaitlistForm.jsx`
- `components/`: Global UI Components (`FloatingNavbar.jsx`, `Footer.jsx`, `WaitlistForm.jsx`, `Logo.jsx`, `ContactUsCard.jsx`)
- `context/`: App State Contexts (`LanguageContext.jsx`, `ThemeContext.jsx`)
- `lib/`: `supabase.js` (Supabase Client Config)
- `utils/`: `loadRazorpay.js` (Razorpay Script Injector)

---

## 3. Mobile Application Structure (`apps/mobile/src/`)

### App Router & Navigation (`apps/mobile/src/app/`)
- `_layout.tsx`: Root Provider Layout & Navigation Guard
- `(tabs)/`: Tab Navigation Group
  - `(tabs)/_layout.tsx`: Tab Bar UI & Configuration (`app-tabs.tsx`)
  - `(tabs)/index.tsx`: Main Home Dashboard (Scan CTA, Streaks, Recent Activity)
  - `(tabs)/routine.tsx`: Skincare Routine Dashboard (AM/PM routines, completion)
  - `(tabs)/routine/create.tsx`: Create New Custom Routine Screen
  - `(tabs)/routine/[id].tsx`: Edit/View Specific Routine Details
  - `(tabs)/progress.tsx`: Scan Progress Tracking & Comparison Screen
  - `(tabs)/profile.tsx`: User Profile & Settings Screen
  - `(tabs)/scan/index.tsx`: Face Scan Entry Flow
  - `(tabs)/scan/_layout.tsx`: Scan Stack Navigation
- `scan/[id].tsx`: Scan Result Detail View
- `select-scans.tsx`: Scan Selection for Side-by-Side Comparison
- `camera.tsx`: MediaPipe Camera Face Scanner Screen
- `insight.tsx`: Skin Analysis Breakdown & AI Insights Screen
- `streak.tsx`: User Daily Streak & Gamification Screen
- `badges.tsx`: Achievement Badges & Milestones Screen
- `routine/start.tsx`: Interactive Routine Execution View (Step-by-Step timer/checklist)
- `onboarding/`: User Onboarding Flow
  - `page-1.tsx` to `page-15.tsx`: Multi-step Skin Quiz & Personalization

### Mobile Components & State (`apps/mobile/src/components/`, `apps/mobile/src/store/`)
- `components/page7/`: 3D Face Mapping (`FaceZoneMap.tsx`, `Native3DButton.tsx`, `ZoneFollowUpView.tsx`, `zoneData.ts`)
- `components/routine/`: Routine Widgets (`RoutineCard.tsx`, `EnterRoutineCodeSheet.tsx`, `RoutineDeleteModal.tsx`, `RoutineFilterModal.tsx`)
- `store/`: Zustand Global Stores (`scanStore.ts`, `onboardingStore.ts`, `themeStore.ts`)
- `modules/my-module/`: Native Android C++/Kotlin Module for MediaPipe Scanner (`com.glamup.mediapipescanner`)

---

## 4. Execution & Development Rules

1. **Web Commands** (Run inside `apps/web`):
   - Dev Server: `npm run dev`
   - Production Build: `npm run build`
2. **Mobile Commands** (Run inside `apps/mobile`):
   - Start Metro: `npx expo start`
   - Run Android: `npx expo run:android`
3. **Coding Standards**:
   - Web uses Next.js 16 App Router conventions (`apps/web/src/app/`).
   - Mobile uses Expo Router file-based navigation (`apps/mobile/src/app/`).
   - Always edit existing components before adding duplicate helper files.
