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
   - **Android Text Inputs & TextAreas (Strict Architectural Rule - Mandatory)**:
     - **Never** use rigidly controlled `value={state}` with `onChangeText={setState}` inside `<BottomSheetTextInput>`, `<Modal>`, or screen forms. Always use `defaultValue={initialValue}` paired with dynamic keys (e.g. `key={id}` or `key={isOpen ? 'open' : 'closed'}`) to prevent native Android cursor jumping and character reversal.
     - **Decouple Keystrokes from Parent Re-renders**: **Never** call a parent-level `setState` directly on every keystroke/backspace in forms, sheets, or modals. Doing so re-renders the sheet/modal mid-keystroke, destroying Android's IME/Gboard input connection and dropping backspaces or restoring deleted characters (`diff: 0`).
     - **The Standard Pattern**:
       1. Store live draft text in a `useRef` (e.g. `inputRef.current = val`).
       2. Only trigger `useState` when validation state changes (e.g., `isSaveEnabled`, `hasContent`), NOT on raw string updates.
       3. On Submit/Save, read the finalized values directly from the ref (`ref.current`).

   - **Android Bottom Sheet White Flash on Content Expansion (Known Library Bug - Mandatory Fix)**:
     - **The Bug**: When a `BottomSheetModal` with `enableDynamicSizing` has its content height change **drastically** (e.g. switching from a 3-item scale to a 10-item scale), a random white gap/flash appears inside the sheet on Android during the expansion animation. It is intermittent. This is a confirmed bug in `@gorhom/bottom-sheet` (GitHub issue #2605), present in v5.1.5-v5.2.9+, unfixed by the library author.
     - **The Fix**: Add `detached={Platform.OS === 'android'}` to every `BottomSheetModal` that has `enableDynamicSizing` and dynamic content. Also ensure `bottomInset={insets.bottom}` is set.
     - **Already applied to**: `AddJournalQuestionDetailsSheet.tsx` (multi-select, single-choice, and scale question types).
     - **If a new sheet gets this issue**: Don't debug, don't add logs. Just add `detached={Platform.OS === 'android'}` + `bottomInset={insets.bottom}`.

   - **Draggable Floating Scroll Circle (DraggableScrollDownCircle) Positioning Across Android Devices (Mandatory Fix)**:
     - **The Bug / Problem**: On Android Edge-to-Edge displays, passing a static or hardcoded pixel offset (such as bottomOffset={16} or bottomOffset={20}) causes the floating scroll circle to spawn or sit directly behind the Android 3-button system navigation bar (which occupies ~48px) or collide with bottom action/tab bars.
     - **The Root Cause**: Edge-to-edge drawing extends the window canvas completely behind the system navigation bar. A hardcoded number measures from the physical glass bottom edge, ignoring the device navigation bar height.
     - **The Permanent Fix**: Never hardcode the bottom clearance. Always calculate it dynamically using useSafeAreaInsets():
       1. **Inside Full-Screen Sheets / Edge-to-Edge Modals** (isFullScreenModal={true}): Pass bottomOffset={insets.bottom + 16}. This guarantees a clean 16px visual margin above the 3-button bar (~64px total) or gesture bar (~32px total) on every Android phone.
       2. **On Tab Screen Pages** (like Create Routine main page with a bottom tab bar): Pass bottomOffset={bottomTabBarHeight + 16} so it rests cleanly above the tab bar rather than overlapping bottom buttons.
