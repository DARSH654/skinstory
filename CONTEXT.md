# Skinstory - Project Key Decisions & Context
> Last updated: 2026-10-09

---

## 1. Business & Vision

**Company Name:** Skinstory (SkinsStory)
**Tagline:** Gamified skin journey

**3-Step Billion-Dollar Thesis:**
1. **App** — Gamified skin tracking (logs, insights, routines, mascot, XP, streaks)
2. **Device-as-a-Service** — Wearable skin pad (hydration, UV, temp) → paid tier for deep biometrics (deferred)
3. **Hyper-personalization** — Per-user custom skincare formulations from longitudinal biometric + product-response data

**Moat:** Longitudinal per-user skin dataset. NOT the app or the pad.

**Product Stack (confirmed app pages):**
- Home: General insights + streaks + scan CTA
- Insight: Scan analysis + AI skin breakdown
- Routine: AM/PM routines → generate shareable code (pilot)
- Streak: Daily gamification + badges
- Profile: Settings

---

## 2. Colors (FINAL, APPROVED)
Locked-in palette — do NOT change without re-approval.

| Role | Hex | Usage |
|---|---|---|
| Primary | `#8B7CF6` (Soft Violet) | Buttons, active tabs, progress rings, XP bars, **mascot body** |
| Secondary | `#FFB4A2` (Warm Peach) | Mascot blush/belly, celebrations, rewards, card highlights |
| Text (Light) | `#3D3654` (Deep Plum) | Body text, headings |
| Light bg | `#f5f5f7` | Unchanged |
| Dark bg | `#121212` | Unchanged |
| Dark text | `#FFFFFF` | Unchanged |

⚠️ Old theme.ts still has `#937abd` + `#d6cbe8`. Update after mascot ships (NOT yet per user orders).

---

## 3. Mascot (FINAL DESIGN + 2-PHASE FORMAT)

**Locked Format (exec IN THIS ORDER):**
- **Phase 1 (SHIP FIRST):** Transparent WebM (VP9 alpha) + APNG drop-in loops. 6 pre-rendered clips. No rigging. No custom dev build.
- **Phase 2 (AFTER Phase 1 retention lift confirmed ≥7 days live):** RIVE (.riv) — 2D bone rig + state machine. Duolingo's production stack. Zustand-bound inputs (`streakDays`, `mood`, `isTalking`).
- **Forbidden in app UI at all times:** 3D GLB, expo-three, three.js, Blender render pipelines, GIF. GPU-contends with MediaPipe Kotlin/C++ scanner.

**Final Design Reference (DO NOT REDESIGN):**
Use `assets/mascot/concepts/mascot.png` (transparent, preferred) or `mascot.jpg` as image-input reference to ALL AI animator tools. Exact character: cute chubby bipedal creature, round head, body Soft Violet `#8B7CF6`, belly+cheeks Warm Peach `#FFB4A2`, 3 small rounded tufts on head, large dark glossy eyes, stubby arms/legs, happy open-mouth smile, blush cheeks, neutral gender.

**6 LOCKED Animation State Names (used in BOTH phases):**
1. `idle_bounce_loop` — breathing + gentle blink, 3s loop
2. `wave_enter_from_left` — slide in from left waving, 1s clip
3. `celebrate_success` — jumps + arms up + sparkles, 1.5s clip
4. `thinking_encouraging` — head tilt + thought-bubbles float up, 2s loop
5. `sad_empty_state` — droop tufts + big tear, 3s loop
6. `point_down_to_button` — eye contact + point at bottom CTA, 1s clip

**Personality:** Finch-like growth — mascot visual state mirrors user skin progress (clearer/glowier/sparklier as routines complete). Phase 2 drives this via Zustand state-machine inputs.

**Future (Phase 2+):** Finch-style customization shop (outfits/accessories/skins = Rive artboard layers, future monetization); growth states tied to XP/streak milestones via `streakDays`.

---

## 4. Integrations Status

| Service | Status | Notes |
|---|---|---|
| GitHub MCP | ✅ Connected | DARSH654/skinstory |
| Supabase MCP | ✅ Connected | lib/supabase.js configured |
| Vercel (Deploy) | ✅ Built-in tool | `deploy_to_remote`. No MCP needed. |
| Vercel Account | ✅ Live | Project `skin-story111` → www.getskinstory.com. Auto-deploys on push. Env vars for Supabase/Razorpay keys already set. |

---

## 5. Mascot Core Rules

1. ❌ No 3D/camera-rotate/cinematic spins in app UI.
2. ✅ Only short, simple animations matching the 6 states above.
3. ✅ Small team (1 dev + AI tooling). No specialized animator team.
4. ✅ Expo SDK 56 / RN 0.85. MediaPipe scanner uses GPU. Mascot must NOT contend GPU memory:
   - Phase 1 (WebM/APNG) = trivial GPU usage. ✅ Safe.
   - Phase 2 (Rive C++ runtime) = separate render context. ✅ Safe alongside MediaPipe.

---

## 6. Existing Mascot Files In Repo

| Path | Status |
|---|---|
| `assets/mascot/concepts/HOW_TO_UPLOAD.txt` | ✅ Exists |
| `assets/mascot/concepts/mascot.jpg` | ✅ **FINAL LOCKED DESIGN REFERENCE.** |
| `assets/mascot/concepts/mascot.png` | ✅ **FINAL LOCKED DESIGN REFERENCE.** Transparent. Preferred AI animator input. |
| `apps/web/vercel.json` | ✅ Exists (Next.js framework preset + env vars) |

---

## 7. Format Comparison + 2-PHASE EXECUTION ORDER

**Competitor Benchmark:**
| App | In-app format |
|---|---|
| Duolingo (Duo) | **RIVE state machines** + WebM/APNG onboarding hero loops |
| Finch (Birb) | 2D rig + WebM hero overlays (3D only in TRAU ads, NEVER in app) |
| Tolan | Lottie (micro anims) + transparent WebM (heroes) |

**Format Decision Matrix:**
| Format | Size (3s) | Expo support | Interactivity | Effort | Verdict |
|---|---|---|---|---|---|
| **🚀 WebM + APNG (Phase 1)** | WebM 50-300KB · APNG 400-1500KB | ✅ `expo-av` + `react-native-fast-image`. No native rebuild. Expo Go works. | Drop-in `<MascotAnim name="wave" />`. `Platform.select` iOS=APNG / Android=WebM. | ⭐⭐⭐⭐⭐ FASTEST. 2 days. | ✅ **DO FIRST.** |
| **💎 RIVE .riv (Phase 2)** | 50–200KB TOTAL all states | ✅ `rive-react-native` + Nitro. C++ runtime, 60fps. Custom dev build only. | Zustand: `useRiveNumber('SM','streakDays',n)` → emotion reacts live. | Medium, MCP auto-rig available. | ✅ **DO AFTER retention proven.** |
| Lottie JSON | 5-100KB vectors | ✅ `lottie-react-native` mature | OK for micro-icons, NOT character mascot | ⚠️ Needs AE/Figma plugins | ⚠️ UI spinners/badges only |
| GIF | 1-5 MB | ✅ Works | Jagged alpha, 256-color dither kills our gradients | ❌ Finch/Duolingo dumped GIF | ❌ **NEVER USE** |

**PHASE 1 — SHIP IN 2 DAYS (no rigging, no custom build):**
Generate all 6 states from `mascot.png` via AI animator → download 12 files (6× WebM + 6× APNG) → drop in `apps/mobile/assets/mascot/`. Wrap in `<MascotAnim name="celebrate_success" loop={true} />`. Place on 5 screens. 4-6 hrs total work.

**PHASE 2 — SHIP AFTER 7+ DAYS of Phase 1 metrics (IF completion/retention is up):**
Replace all 12 files with ONE `mascot.riv` (~150KB) → bundle drops 80%. State machine inputs: `streakDays: number`, `mood: enum (default/celebrate/thinking/sad/ctaPoint)`, `isTalking: bool`. Wire Zustand. Delete MascotAnim.tsx + 12 asset files. 3-7 days with MCP auto-rig.

**WHY BOTH PHASES (enforce this gating — NEVER skip Phase 1):**
1. Time to ship = 2 days vs 1-2 weeks. Prove WHERE mascot moves metrics BEFORE rigging.
2. If 5 placements don't lift empty-state CTA CTR / onboarding completion / D1 return — the placement is wrong, not the format. Don't waste 1 week rigging.
3. Discard cost of Phase 1 = delete 12 files + 1 small component. Zero architecture change.

---

## 8. PHASE 1 — NEXT ACTIONS (START HERE)

### STEP 1 — Install Expo packages (apps/mobile/, NO native rebuild, Expo Go works):
```bash
cd apps/mobile
npx expo install expo-av react-native-fast-image
```
(If ERESOLVE: `npx expo install --fix` — auto-picks SDK 56 compatible versions, deletes node_modules, rebuilds lockfile.)

### STEP 2 — Create `<MascotAnim.tsx>` wrapper (~30 lines):
**File:** `apps/mobile/src/components/MascotAnim.tsx`
- Props: `name: string` (6 states above), `loop?: boolean = true`, `size?: number = 180`, `style?: StyleProp<ViewStyle>`.
- Internals:
  - iOS → `FastImage` (react-native-fast-image) loading `{name}.apng`.
  - Android → `Video` (expo-av) loading `{name}.webm`, with: `useNativeControls={false}`, `shouldPlay={true}`, `isLooping={loop}`, `resizeMode="cover"`, `isMuted={true}`.
  - Graceful fallback: if asset file missing → render empty transparent View (NO crash).

### STEP 3 — Write AI animator prompts file:
**File:** `apps/mobile/assets/mascot/PROMPTS_FOR_AI_ANIMATORS.md`
Prompts MUST:
- Use `mascot.png` (transparent) as IMAGE REFERENCE INPUT (not text-only).
- Pick tool (tiers below): Pika Labs / Runway / Ziggle.art.
- Specify output: "(1) transparent WebM VP9, 1080×1080, alpha enabled. (2) APNG 1080×1080, dithering disabled, transparent background."
- All 6 prompts (exact state names + descriptions from Section 3).
- Enforce exact brand colors: body #8B7CF6, belly+blush #FFB4A2, eyes/brows #3D3654, mouth inside #FFB4A2.

### STEP 4 — Which AI animator tool to open (tier guide):

**🥇 Pika Labs (https://pika.art) — FREE FOREVER pick:**
- 30 generations/day, no credit card, 3s clips, 1080p, no watermark, all models.
- For alpha WebM: append prompt tags `--alpha --vp9 --background transparent`.
- ⚠️ Free = no commercial license. Commercial = Creator $35/mo (skip — use Ziggle for cheaper commercial rights).
- Internal prototyping = free is fine.

**🥈 Runway (https://runwayml.com) — backup credit pick:**
- 125 one-time non-expiring credits signup (~20s Gen-4 Turbo). Transparent WebM toggle in render settings.
- Paid: Standard $15/mo = 625 monthly credits, no watermark.

**🥉 Ziggle.art (https://ziggle.art) — PAID COMMERCIAL pick:**
- $20/mo Hobby = 100 credits. Built EXACTLY for app mascots.
- Credit math for 6 loops: 6 anims × 3s × 3 credits/sec = **54 credits** (46 left for re-rolls).
- Native output: transparent WebM 50-300KB per loop + JSON metadata → drops straight in assets folder. Zero post-processing.
- Upload your own mascot.png reference → animates YOUR character (not a generated one).
- No free tier (occasional promo only). Pay $20 once, cancel after month.

**❌ TOOLS TO AVOID (wasted time — confirmed):**
CapCut (no true alpha), Canva AI Animate (MP4/GIF only, baked bg), Kling AI Free (watermark + no commercial rights), Luma Dream Machine Free (watermark + worse mascot consistency), GIF (jagged + dither kills our violet/peach gradients).

### STEP 5 — Asset folder layout after download:
```
apps/mobile/assets/mascot/
  PROMPTS_FOR_AI_ANIMATORS.md
  idle_bounce_loop.webm       idle_bounce_loop.apng
  wave_enter_from_left.webm   wave_enter_from_left.apng
  celebrate_success.webm      celebrate_success.apng
  thinking_encouraging.webm   thinking_encouraging.apng
  sad_empty_state.webm        sad_empty_state.apng
  point_down_to_button.webm   point_down_to_button.apng
```
Rule: Android = `.webm` (smaller VP9 alpha). iOS = `.apng` (universal fallback simpler cross-gen). `Platform.select()` inside MascotAnim handles this.

### STEP 6 — Wire mascot into 5 HIGH-ROI placements (IN THIS EXACT ORDER):
Track metrics after each: empty-state CTA CTR, onboarding step-3+ completion, D1/D7 return, insight dwell-time, rage-quit on empty routine.
1. **Onboarding page-1** — `apps/mobile/src/app/onboarding/page-1.tsx`: drop `wave_enter_from_left` mascot top-center waving. Text below.
2. **Home Dashboard header** — `apps/mobile/src/app/(tabs)/index.tsx`: drop `idle_bounce_loop` top-right near Scan CTA. Streak/XP on left.
3. **Empty Routine state** — `apps/mobile/src/app/(tabs)/routine.tsx`: if `routines.length === 0`, show `sad_empty_state` above big CTA button "Create your first skincare routine".
4. **Streak Success + XP awarded** — `apps/mobile/src/app/(tabs)/streak.tsx` + any XP-giving screen: overlay `celebrate_success` full-center absolute for 1.6s, then auto-dismiss + confetti.
5. **Insight loading skeleton** — `apps/mobile/src/app/insight.tsx`: drop `thinking_encouraging` centered above the biometrics loading bars.

---

## 9. PHASE 2 — (AFTER Phase 1 live ≥7 days + metrics lifted)

### ⏱ Time: 3-7 days (6-8 hrs with MCP auto-rig) / 💰 Cost: $9/seat/mo (Rive Cadet annual, no splash)
### 🚨 RIVE IS 100% PURE 2D. NOT 3D. EVER.
Rive = 2D vector shapes + 2D bone rig + state machine layer graph. No meshes/cameras/GLB/3D transforms. Spiritual Flash successor (Adobe Animate maintenance mode Feb 2026). One .riv = all 6 states = smaller than one Phase 1 APNG.

### Compatibility (Expo SDK 56):
✅ Fully compatible. Requirements already satisfied (SDK 53+, RN 0.78+, iOS 15.1+, Android SDK 24+, Nitro 0.25.2+). Install:
```bash
cd apps/mobile
npx expo install expo-dev-client
npx expo install @rive-app/react-native react-native-nitro-modules
npx expo prebuild --clean
```
⚠️ Rive has native C++ code → NOT Expo Go compatible. Fine — MediaPipe already requires custom dev build. Your workflow remains `npx expo run:android`. Rebuild ~60s.

### TWO RIVE MCP SERVERS (AI builds 80% of the rig):
**🅰️ OFFICIAL Rive Desktop MCP (HTTP on `http://127.0.0.1:9791/mcp`):**
- Rive desktop app for Windows (free) → leave running. Add to Cursor/Claude via HTTP MCP JSON. TRAE: add same JSON to MCP config if supports HTTP entries, OR just open repo in Cursor alongside TRAE for rigging phase.
- AI manages files, hierarchy, shapes, state machines, transitions, keyframes, data binding, Luau/WGSL.
- Limitation: no PNG auto-rig — need SVG in first, then rig.

**🅱️ COMMUNITY `rive-mcp-server` npm (v0.6.1, PNG AUTO-RIG — OUR PICK):**
- Install: `npm i -g rive-mcp-server`. Add stdio MCP entry: `{"mcpServers":{"riveMCP":{"command":"rive-mcp-server"}}}`.
- One call PNG → rigged .riv with cutout parts, bone head mesh, eye blink, idle/happy anims + state machine already built.
- 32 tools total: `riv_create` (builds full .riv from scratch: shapes/gradients/PNGs/bones/skinning/IK/meshes/keyframes/state machines/particles/audio), `riv_import_svg`, `riv_decompile`, `riv_inspect`, `riv_critique` (motion quality lint 0-100), 28 pre-tuned motion presets (`pop-in`, `breathing`, `parallax-drift` etc.), local web Studio UI (hierarchy/canvas/inspector/timeline/state machine graph/onion skin/bone drag), Human⇄AI notes panel.
- No Rive editor installed. No cloud. No Rive subscription needed for MCP itself (only Rive Cadet for splash-free commercial export).

### Zustand Wiring (copy verbatim — 3 lines of logic):
```tsx
import { RiveView, useRiveFile, useRiveNumber, useRiveEnum } from '@rive-app/react-native';

const ScreenWithMascot = () => {
  const { riveFile } = useRiveFile(require('../assets/mascot/mascot.riv'));
  const streakDays = useStore(s => s.streakDays);
  const mood       = useStore(s => s.mascotMood); // 'default'|'celebrate'|'thinking'|'sad'|'ctaPoint'
  useRiveNumber('MainSM', 'streakDays', streakDays, riveFile);
  useRiveEnum(  'MainSM', 'mood',        mood,       riveFile);
  return riveFile ? <RiveView file={riveFile} style={{width:180,height:180}} fit="cover" /> : null;
};
```
No timers / no animation libraries. State machine inside Rive handles all blending. C++ Rive runtime = separate thread from JS + separate render context from MediaPipe → **NO GPU contention.**

### Gating rule (ENFORCE — do NOT bypass):
Phase 2 work ONLY allowed IF Phase 1 shows ≥1 metric lift (from baseline): empty-state CTA CTR +3%, onboarding step-3+ completion +5%, D1 return +3%. If nothing lifts — fix mascot placement first, don't rig Rive.

### Upgrade path (after 14 days if Phase 1 lifts):
Buy Rive Cadet $9/mo (annual, $108/yr) → install `rive-mcp-server` → auto-rig mascot.png → add 5 states + transitions → export splash-free .riv → install Expo runtime → wire Zustand (above snippet) → delete all 12 WebM/APNG + MascotAnim.tsx → replace with MascotRive.tsx → ship.
