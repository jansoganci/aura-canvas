# Aura Canvas - Implementation Plan

## Executive Summary

Transform current MVP into a social-first "Guess My Aura" app where users create aura sessions with credits, share links for community voting, and see real-time results.

**Key Changes:**
- Add route-based navigation (App Router)
- Implement credit system with Stripe
- Add anonymous session auth (cookies)
- Add database for persistence (Cloudflare D1)
- Redesign UI with new design system
- Add social sharing with generated images

---

## Final Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend | Worker-only | Static export + single worker handles all API routes |
| Image Storage | Cloudflare R2 | Fast, cheap, same ecosystem |
| OG Images | Static for MVP | Dynamic via Worker later |
| Max Image Size | 5MB | Balance quality vs upload speed |
| Image Compression | Client-side | Compress to ~500KB before upload |
| Error UI | Toast notifications | Non-blocking, mobile-friendly |
| Rate Limiting | Skip for MVP | Add if abuse occurs |
| Analytics | Skip for MVP | Add when needed |

## Architecture Diagram

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────┐
│                 │     │                      │     │         │
│  Static Site    │────▶│  Worker API          │────▶│  D1 DB  │
│  (Pages)        │     │  (worker-api/)       │     │         │
│                 │     │                      │     └─────────┘
└─────────────────┘     │  POST /session       │
                        │  POST /aura          │     ┌─────────┐
   credentials:         │  GET  /aura/:id      │────▶│   R2    │
   'include'            │  POST /vote          │     │ (images)│
                        │  POST /credits       │     └─────────┘
                        │  POST /webhook/stripe│
                        │                      │
                        └──────────────────────┘
```

## Phase Overview

| Phase | Focus | Duration Estimate |
|-------|-------|-------------------|
| 1 | Foundation (Worker API, D1, R2, Auth) | Core infrastructure |
| 2 | Creator Flow (Upload, Questions, Result) | Main user journey |
| 3 | Voter Flow (Vote page, confirmation) | Viral loop |
| 4 | Credits & Payments (Stripe) | Monetization |
| 5 | Polish (Animations, Share images, Dark mode) | UX refinement |
| 6 | Launch Prep (Testing, Deploy) | Production ready |

---

## Phase 1: Foundation

### 1.1 Project Structure Changes

**Current → New Structure:**

```
app/
├── page.tsx                    → Landing page only
├── layout.tsx                  → Add providers, fonts
├── globals.css                 → Add dark mode vars
├── create/
│   ├── page.tsx               [NEW] Upload photo
│   └── questions/
│       └── page.tsx           [NEW] Personality questions
├── aura/
│   └── [id]/
│       └── page.tsx           [NEW] Result page
├── vote/
│   └── [id]/
│       └── page.tsx           [NEW] Vote page
└── credits/
    └── page.tsx               [NEW] Buy credits

worker-api/
├── index.ts                    → Expand with all routes
├── routes/
│   ├── session.ts             [NEW] Session management
│   ├── aura.ts                [NEW] Aura CRUD
│   ├── vote.ts                [NEW] Vote handling
│   ├── credits.ts             [NEW] Credit purchase
│   └── webhook.ts             [NEW] Stripe webhooks
├── lib/
│   ├── db.ts                  [NEW] D1 helpers
│   ├── r2.ts                  [NEW] R2 helpers
│   └── cors.ts                [NEW] CORS config
└── wrangler.toml              → Add D1 + R2 bindings

lib/                           [NEW] Shared frontend utilities
├── api.ts                     [NEW] API client with credentials
├── compress.ts                [NEW] Image compression
└── toast.ts                   [NEW] Toast notifications

components/
├── Toast.tsx                  [NEW] Toast component
└── ToastProvider.tsx          [NEW] Toast context
```

**Note:** No `app/api/` routes - all backend logic lives in `worker-api/`

### 1.2 Database Setup (Cloudflare D1)

**Create D1 Database:**
```bash
wrangler d1 create aura-canvas-db
```

**Schema (`schema.sql`):**
```sql
-- Sessions (anonymous users)
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  credits INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Auras (created sessions)
CREATE TABLE auras (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  personality_answers TEXT, -- JSON string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Votes
CREATE TABLE votes (
  id TEXT PRIMARY KEY,
  aura_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (aura_id) REFERENCES auras(id),
  UNIQUE(aura_id, visitor_id) -- One vote per visitor per aura
);

-- Purchases
CREATE TABLE purchases (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  credits INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Indexes
CREATE INDEX idx_auras_session ON auras(session_id);
CREATE INDEX idx_votes_aura ON votes(aura_id);
CREATE INDEX idx_purchases_session ON purchases(session_id);
```

### 1.3 Session Management

**Cookie-based anonymous auth:**

```typescript
// lib/session.ts
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';

export async function getOrCreateSession() {
  const cookieStore = cookies();
  let sessionToken = cookieStore.get('aura_session')?.value;

  if (!sessionToken) {
    sessionToken = nanoid();
    // Create in DB
    // Set cookie
  }

  return { sessionToken, session };
}
```

### 1.4 R2 Storage Setup

**Create R2 Bucket:**
```bash
wrangler r2 bucket create aura-images
```

**Add to worker-api/wrangler.toml:**
```toml
[[r2_buckets]]
binding = "IMAGES"
bucket_name = "aura-images"
```

**R2 Helper (worker-api/lib/r2.ts):**
```typescript
export async function uploadImage(
  r2: R2Bucket,
  key: string,
  data: ArrayBuffer,
  contentType: string
): Promise<string> {
  await r2.put(key, data, {
    httpMetadata: { contentType }
  });
  // Return public URL (configure in R2 settings)
  return `https://images.auracanvas.app/${key}`;
}
```

### 1.5 Dependencies to Add

```bash
npm install nanoid                    # ID generation
npm install stripe                    # Payments (worker)
npm install @stripe/stripe-js         # Payments (frontend)
npm install canvas-confetti           # Celebrations
npm install html-to-image             # Share image generation
npm install browser-image-compression # Client-side compression
npm install sonner                    # Toast notifications
```

### 1.5 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudflare Worker secrets
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=...
```

### 1.6 Update wrangler.toml

```toml
name = "aura-canvas"
compatibility_date = "2025-11-18"
pages_build_output_dir = "out"

[[d1_databases]]
binding = "DB"
database_name = "aura-canvas-db"
database_id = "your-database-id"

[vars]
APP_URL = "https://auracanvas.app"
```

---

## Phase 2: Creator Flow

### 2.1 Landing Page Redesign

**File:** `app/page.tsx`

**Changes:**
- Remove all current view state logic
- Simplify to landing only
- Add gradient background
- Add onboarding trigger
- New hero section
- 8-color preview dots

**Wireframe:**
```
┌─────────────────────────────┐
│ [Logo]              [🌙/☀️] │
│                             │
│  ┌─────────────────────┐    │
│  │ Gradient background │    │
│  │                     │    │
│  │  What's Your        │    │
│  │  Aura? ✨            │    │
│  │                     │    │
│  │  Upload your photo  │    │
│  │  and let others     │    │
│  │  reveal your true   │    │
│  │  aura color         │    │
│  │                     │    │
│  │  [Discover My Aura] │    │
│  │                     │    │
│  │  ● ● ● ● ● ● ● ●    │    │
│  │  (8 aura colors)    │    │
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│  [?] What are auras?        │
│                             │
│  Credits: 1 🎟️              │
└─────────────────────────────┘
```

### 2.2 Onboarding Modal

**File:** `components/OnboardingModal.tsx` [NEW]

**Features:**
- 2 swipeable/tappable slides
- Slide 1: How it works (4 steps)
- Slide 2: 8 aura colors overview
- Skip button
- Store "seen" in localStorage

### 2.3 Upload Page

**File:** `app/create/page.tsx` [NEW]

**Features:**
- Reuse `ImageUploader` component with new styling
- Show credit balance
- Check credits before proceeding
- Trigger buy modal if 0 credits
- Store image in state/context
- Navigate to questions on continue

**Wireframe:**
```
┌─────────────────────────────┐
│ ← Back              🎟️ 1    │
│                             │
│   Upload Your Photo         │
│                             │
│  ┌─────────────────────┐    │
│  │                     │    │
│  │                     │    │
│  │   📷 Tap to upload  │    │
│  │   or drag & drop    │    │
│  │                     │    │
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│  Your photo will be shown   │
│  to people who vote         │
│                             │
│  ┌─────────────────────┐    │
│  │     Continue        │    │
│  └─────────────────────┘    │
│  (disabled until upload)    │
│                             │
└─────────────────────────────┘
```

### 2.4 Questions Page

**File:** `app/create/questions/page.tsx` [NEW]

**Features:**
- 5 questions, one at a time
- Progress indicator (1/5, 2/5...)
- Thumbnail of uploaded photo
- Animated transitions between questions
- Styled pill buttons for options
- On complete: create aura in DB, deduct credit, redirect to result

**Wireframe:**
```
┌─────────────────────────────┐
│ ← Back              3/5     │
│                             │
│  ┌───────┐                  │
│  │ Photo │                  │
│  └───────┘                  │
│                             │
│  When making a decision,    │
│  do you rely more on:       │
│                             │
│  ┌─────────────────────┐    │
│  │  Logic and facts    │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │  Intuition and      │    │
│  │  feelings           │    │
│  └─────────────────────┘    │
│                             │
│  ○ ○ ● ○ ○                  │
│                             │
└─────────────────────────────┘
```

### 2.5 Result Page

**File:** `app/aura/[id]/page.tsx` [NEW]

**Features:**
- Fetch aura data + votes from DB
- Show user's photo (no glow, clean)
- Show dominant aura color + meaning
- Pie chart of vote distribution
- Vote count
- Share buttons (X, Copy link, Download)
- Real-time updates (polling or WebSocket)

**Two views:**
- Owner view: Full stats + share CTA
- Public view: Same, but with "Create yours" CTA

**Wireframe:**
```
┌─────────────────────────────┐
│ [Logo]              [🌙/☀️] │
│                             │
│  ┌─────────────────────┐    │
│  │                     │    │
│  │    [User Photo]     │    │
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│  Your Aura                  │
│                             │
│  ┌─────────────────────┐    │
│  │                     │    │
│  │   🟣 PURPLE         │    │
│  │                     │    │
│  │   Spirituality,     │    │
│  │   Wisdom,           │    │
│  │   Transformation    │    │
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│  23 votes                   │
│                             │
│  ┌─────────────────────┐    │
│  │   [Pie Chart]       │    │
│  │                     │    │
│  │   Purple 67%        │    │
│  │   Blue 20%          │    │
│  │   Pink 13%          │    │
│  └─────────────────────┘    │
│                             │
│  ┌────────┐ ┌────────┐      │
│  │Share X │ │ Copy 📋│      │
│  └────────┘ └────────┘      │
│                             │
│  ┌─────────────────────┐    │
│  │  Download Image 📥  │    │
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

---

## Phase 3: Voter Flow

### 3.1 Vote Page

**File:** `app/vote/[id]/page.tsx` [NEW]

**Features:**
- Fetch aura by ID (photo only, no results)
- Show photo
- 2x4 color grid for voting
- Color meanings tooltip/modal
- Submit vote to API
- Redirect to confirmation

**Wireframe:**
```
┌─────────────────────────────┐
│ [Logo]              [🌙/☀️] │
│                             │
│  ┌─────────────────────┐    │
│  │                     │    │
│  │   [Their Photo]     │    │
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│  What's their aura?         │
│                             │
│  ┌─────┬─────┬─────┬─────┐  │
│  │ 🔴  │ 🟠  │ 🟡  │ 🟢  │  │
│  │ Red │ Org │ Yel │ Grn │  │
│  ├─────┼─────┼─────┼─────┤  │
│  │ 🔵  │ 🟣  │ 🩷  │ ⚪  │  │
│  │ Blu │ Pur │ Pnk │ Wht │  │
│  └─────┴─────┴─────┴─────┘  │
│                             │
│  [?] What do colors mean?   │
│                             │
└─────────────────────────────┘
```

### 3.2 Vote Confirmation

**File:** `app/vote/[id]/confirmation/page.tsx` [NEW] or modal

**Features:**
- Thank you message
- Show their vote
- CTA: "Create your own aura"
- Optional: "See current results"

**Wireframe:**
```
┌─────────────────────────────┐
│                             │
│         ✓ Voted!            │
│                             │
│   You chose Purple 🟣        │
│                             │
│  ─────────────────────────  │
│                             │
│  Want to discover your      │
│  own aura color?            │
│                             │
│  ┌─────────────────────┐    │
│  │   Create My Aura    │    │
│  └─────────────────────┘    │
│                             │
│         or                  │
│                             │
│  ┌─────────────────────┐    │
│  │   See Results       │    │
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

### 3.3 Duplicate Vote Handling

- Check visitor ID (cookie) against existing votes
- If already voted: show "You already voted [Color]" with option to change

---

## Phase 4: Credits & Payments

### 4.1 Credits Display

**Component:** `components/CreditBalance.tsx` [NEW]

- Shows in header: "🎟️ 3"
- Clickable to open buy modal

### 4.2 Buy Credits Modal

**File:** `components/BuyCreditsModal.tsx` [NEW]

**Features:**
- Three tiers:
  - 1 credit: $0.99
  - 5 credits: $3.99 (Save 20%)
  - 10 credits: $6.99 (Best value)
- Stripe Checkout redirect
- Apple Pay / Google Pay buttons

**Wireframe:**
```
┌─────────────────────────────┐
│              ✕              │
│                             │
│   Get More Credits 🎟️       │
│                             │
│  ┌─────────────────────┐    │
│  │ 1 credit            │    │
│  │              $0.99  │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 5 credits           │    │
│  │ Save 20%     $3.99  │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 10 credits          │    │
│  │ Best value   $6.99  │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────┐ ┌─────────┐    │
│  │ 🍎 Pay  │ │ G Pay   │    │
│  └─────────┘ └─────────┘    │
│                             │
└─────────────────────────────┘
```

### 4.3 Stripe Integration

**API Routes:**

1. `app/api/credits/route.ts` - Create Stripe Checkout session
2. `app/api/webhook/stripe/route.ts` - Handle payment confirmation

**Flow:**
1. User selects tier → POST to /api/credits
2. Create Stripe Checkout session with metadata (sessionId, credits)
3. Redirect to Stripe Checkout
4. On success, webhook adds credits to session
5. Redirect back to app

### 4.4 Credit Deduction

In `app/api/aura/route.ts`:
- Check session has >= 1 credit
- Deduct 1 credit
- Create aura record
- Return aura ID

---

## Phase 5: Polish

### 5.1 Design System Application

**Files to update with new design system:**

| File | Changes |
|------|---------|
| `app/layout.tsx` | Add Inter font, theme provider |
| `app/globals.css` | Dark mode CSS variables |
| `components/Navbar.tsx` | Add theme toggle, credit display |
| `components/ImageUploader.tsx` | New styling, larger target |
| `components/AuraDisplay.tsx` | REMOVE (replaced by result page) |
| `components/PersonalityQuestions.tsx` | New styling, animations |

### 5.2 Animations

**Add to components:**

1. **Onboarding**: Slide transitions
2. **Questions**: Card flip/slide between questions
3. **Result reveal**:
   - Initial loading shimmer
   - Color reveal with glow animation
   - Confetti burst
4. **Vote**: Scale on tap, color pulse on selection
5. **Page transitions**: Fade between routes

**Libraries:**
- CSS animations (already in tailwind.config.js)
- `canvas-confetti` for celebrations
- Optional: Framer Motion for complex animations

### 5.3 Share Image Generation

**File:** `lib/generateShareImage.ts` [NEW]

**Using html-to-image:**
```typescript
import { toPng } from 'html-to-image';

export async function generateShareImage(elementId: string): Promise<string> {
  const element = document.getElementById(elementId);
  const dataUrl = await toPng(element, {
    width: 1080,
    height: 1920, // 9:16 ratio
    style: {
      // Override styles for export
    }
  });
  return dataUrl;
}
```

**Share card component** - Styled specifically for screenshot:
- User photo
- Aura color badge
- Vote percentage
- App branding

### 5.4 Dark Mode

**Implementation:**
1. Add `ThemeProvider` (next-themes or custom)
2. Add CSS variables for dark mode colors
3. Toggle in Navbar
4. Persist preference in localStorage
5. Respect system preference

**Colors:**
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
}
```

### 5.5 Sound (Optional)

**File:** `lib/sounds.ts` [NEW]

```typescript
export function playRevealSound() {
  if (localStorage.getItem('sound') !== 'off') {
    const audio = new Audio('/sounds/reveal.mp3');
    audio.volume = 0.3;
    audio.play();
  }
}
```

Add toggle in settings/menu.

### 5.6 Aura Meanings Bottom Sheet

**File:** `components/AuraMeaningsSheet.tsx` [NEW]

- Triggered by [?] button
- Slides up from bottom
- Scrollable list of 8 colors
- Tap outside to close

---

## Phase 6: Launch Prep

### 6.1 Testing

**Manual Testing Checklist:**
- [ ] Create flow (upload → questions → result)
- [ ] Vote flow (link → vote → confirmation)
- [ ] Credit system (check balance, deduct, buy)
- [ ] Stripe (test payments, webhooks)
- [ ] Share (X, copy link, download image)
- [ ] Dark mode toggle
- [ ] Mobile responsiveness
- [ ] Error states (no credits, failed upload, etc.)
- [ ] Duplicate vote handling

**Automated Testing (Future):**
- Unit tests for credit logic
- E2E tests for flows
- API route tests

### 6.2 Deployment

**Steps:**
1. Create Cloudflare D1 database
2. Run schema migration
3. Set environment variables in Cloudflare dashboard
4. Set Stripe webhook URL
5. Deploy worker API: `npm run deploy:api`
6. Deploy frontend: `npm run deploy`
7. Configure custom domain
8. Test production flow

### 6.3 Analytics (Optional)

- Add Plausible or Simple Analytics (privacy-friendly)
- Track: page views, aura creations, votes, purchases
- Event tracking for share button clicks

### 6.4 SEO & Open Graph

**In `app/aura/[id]/page.tsx`:**
```typescript
export async function generateMetadata({ params }) {
  const aura = await getAura(params.id);
  return {
    title: `See my aura result | Aura Canvas`,
    description: 'What aura color do you see?',
    openGraph: {
      images: [aura.shareImageUrl],
    },
    twitter: {
      card: 'summary_large_image',
    }
  };
}
```

---

## Files Summary

### New Files to Create

```
app/
├── create/
│   ├── page.tsx
│   └── questions/
│       └── page.tsx
├── aura/
│   └── [id]/
│       └── page.tsx
├── vote/
│   └── [id]/
│       └── page.tsx
├── api/
│   ├── session/route.ts
│   ├── aura/route.ts
│   ├── aura/[id]/route.ts
│   ├── vote/route.ts
│   ├── credits/route.ts
│   └── webhook/stripe/route.ts

components/
├── OnboardingModal.tsx
├── CreditBalance.tsx
├── BuyCreditsModal.tsx
├── AuraMeaningsSheet.tsx
├── ThemeToggle.tsx
├── ShareCard.tsx
├── VoteGrid.tsx
├── QuestionSlide.tsx

lib/
├── session.ts
├── db.ts
├── stripe.ts
├── generateShareImage.ts
├── sounds.ts (optional)

schema.sql
```

### Files to Modify

```
app/page.tsx           → Simplify to landing only
app/layout.tsx         → Add providers, fonts, theme
app/globals.css        → Dark mode variables
tailwind.config.js     → Already updated ✓
constants.ts           → Update color classes to aura-*
types.ts               → Add new types
components/Navbar.tsx  → Theme toggle, credits
components/ImageUploader.tsx → New styling
components/Footer.tsx  → Update styling
wrangler.toml          → Add D1 binding
package.json           → Add dependencies
```

### Files to Remove/Archive

```
components/AuraDisplay.tsx      → Replaced by result page
components/ImageEditor.tsx      → Not needed for MVP
(keep PersonalityQuestions but restyle)
```

---

## Implementation Order

### Sprint 1: Foundation
1. Set up D1 database + schema
2. Create session management (lib/session.ts)
3. Update wrangler.toml
4. Add dependencies
5. Create API route stubs

### Sprint 2: Creator Flow
1. Redesign landing page
2. Create onboarding modal
3. Build upload page
4. Build questions page
5. Create aura API (with credit check)
6. Build result page

### Sprint 3: Voter Flow
1. Build vote page
2. Create vote API
3. Build confirmation page
4. Add duplicate vote handling
5. Link voter flow to creator results

### Sprint 4: Payments
1. Set up Stripe account/products
2. Build buy credits modal
3. Create Stripe checkout API
4. Implement webhook handler
5. Test full payment flow

### Sprint 5: Polish
1. Apply design system to all components
2. Add animations (confetti, transitions)
3. Implement share image generation
4. Add dark mode
5. Add sounds (optional)
6. Build aura meanings sheet

### Sprint 6: Launch
1. Full manual testing
2. Deploy to production
3. Configure domain/DNS
4. Set up analytics
5. Monitor for issues

---

## Open Questions / Decisions Needed

1. **Image Storage**: Store base64 in DB, or use Cloudflare R2?
   - Recommendation: R2 for better performance

2. **Real-time Updates**: Polling vs WebSocket for live vote counts?
   - Recommendation: Polling every 5s for MVP

3. **Rate Limiting**: Prevent vote spam?
   - Recommendation: 1 vote per visitor ID per aura

4. **Expiration**: Do auras expire?
   - Recommendation: No for MVP, add later if needed

5. **Moderation**: Flag inappropriate photos?
   - Recommendation: Skip for MVP, add report button later

---

## Success Metrics

- **Conversion**: Visitors → Aura creations
- **Viral coefficient**: Votes per aura (target: 5+)
- **Monetization**: Free → Paid conversion rate
- **Sharing**: Share button click rate
- **Retention**: Return visitors

---

## Ready to Build?

This plan is your roadmap. Each phase builds on the previous one, and you can ship after Phase 3 for a working MVP (without payments).

**Recommended first step**: Phase 1.1 (Database setup) or Phase 2.1 (Landing page redesign) depending on if you prefer backend-first or frontend-first.

Which would you like to start with?
