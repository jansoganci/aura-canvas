# Aura Canvas - Project Instructions

## Project Overview

**Aura Canvas** is an interactive web application inspired by viral X (Twitter) threads where users guess and discuss each other's "aura color" matched with personality traits. Users upload profile photos, answer personality questions, and the community votes on their aura color.

### Tech Stack
- **Framework**: Next.js 15 (App Router, Static Export)
- **Deployment**: Cloudflare Pages (frontend) + Cloudflare Workers (API)
- **AI**: Google Gemini 2.5 Flash Image API via `@google/genai`
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts 3.4
- **Language**: TypeScript 5.8 (strict mode)

### Project Structure
```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main app with state management
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Tailwind imports
├── components/            # React components
│   ├── AuraDisplay.tsx    # Voting, charts, comments
│   ├── ImageEditor.tsx    # AI image editing
│   ├── ImageUploader.tsx  # Drag-and-drop upload
│   ├── PersonalityQuestions.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── LoadingSpinner.tsx
├── worker-api/            # Cloudflare Worker API
│   ├── index.ts          # Gemini API handler
│   └── wrangler.toml     # Worker config
├── types.ts              # TypeScript definitions
├── constants.ts          # App data (aura meanings, questions)
└── wrangler.toml         # Pages deployment config
```

## Development Guidelines

### Code Style
- Use functional components with TypeScript FC type
- Memoize callbacks with `useCallback`, computed values with `useMemo`
- Mark client components with `'use client'` directive
- Use Tailwind utility classes (no CSS modules)
- Follow mobile-first responsive design (sm:, md:, lg: breakpoints)

### Naming Conventions
- Components: PascalCase (`AuraDisplay.tsx`)
- Files: PascalCase for components, camelCase for utilities
- Variables: camelCase
- Types/Interfaces: PascalCase
- Enums: PascalCase with UPPER_CASE values

### Component Patterns
```tsx
'use client';

import { FC, useState, useCallback } from 'react';

interface MyComponentProps {
  prop1: string;
  onAction: (value: string) => void;
}

const MyComponent: FC<MyComponentProps> = ({ prop1, onAction }) => {
  const [state, setState] = useState('');

  const handleClick = useCallback(() => {
    onAction(state);
  }, [state, onAction]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* content */}
    </div>
  );
};

export default MyComponent;
```

### Aura Colors System
The app uses 8 aura colors defined in `types.ts`:
- RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE, PINK, WHITE

Each has:
- `name`: Display name
- `meaning`: Personality description
- `tailwindClass`: Background color class
- `borderColorClass`: Border color class

### API Integration
- **Endpoint**: Cloudflare Worker at `worker-api/index.ts`
- **Method**: POST with `{ imageData: base64, prompt: string }`
- **Response**: `{ imageUrl: base64 }` or `{ error: string }`
- **AI Model**: gemini-2.5-flash-preview-0520

### Environment Variables
```bash
# .env.local (frontend - not used currently)
NEXT_PUBLIC_API_URL=https://your-worker.workers.dev

# Cloudflare Worker Dashboard
GEMINI_API_KEY=your-api-key
```

## Current Status & TODOs

### Implemented
- [x] Landing page with hero
- [x] Image upload (drag-and-drop)
- [x] AI image editing with Gemini
- [x] Aura color voting (8 colors)
- [x] Vote distribution pie chart
- [x] Comments display and add
- [x] Personality questions (5)
- [x] Aura meanings grid
- [x] Responsive design

### Needs Implementation
- [ ] **Database**: Persistent storage for comments, votes, users
- [ ] **Authentication**: User accounts, OAuth
- [ ] **Stripe Integration**: Paid "personalized aura analysis"
- [ ] **Social Sharing**: Share aura results to social media
- [ ] **Image Storage**: Cloudflare R2 or similar
- [ ] **Real-time Updates**: Live voting/comments
- [ ] **User Profiles**: Public profile pages with aura history

### Known Issues
- API URL hardcoded in `ImageEditor.tsx:30` - needs env var
- Comments lost on refresh (no persistence)
- No image size validation before upload
- `as AuraColor` type assertions in AuraDisplay

## Deployment

### Local Development
```bash
npm run dev          # Start Next.js dev server
```

### Deploy to Cloudflare
```bash
npm run deploy:api   # Deploy Worker API
npm run deploy       # Deploy Pages frontend
npm run deploy:all   # Deploy both
```

### Post-Deploy
1. Set `GEMINI_API_KEY` in Cloudflare Worker dashboard
2. Update API URL in code if using custom domain
3. Configure custom domain in Pages settings

## Testing Guidelines

Currently no test setup. When adding tests:
- Use Vitest for unit tests
- Use Playwright for E2E
- Test voting logic, API integration, form validation

## Design System

### Target Audience
- **Primary**: Gen-Z and Millennials active on X/Twitter and Instagram
- **Personality**: Social, trend-following, enjoy memes and participatory games
- **Behavior**: Fast mobile experiences, share results, buy small digital products

### Design Language
**Style**: Playful, pastel, mobile-first (inspired by TikTok, Instagram Stories, Co-Star)

### Color Palette (Aura Colors)
```
Red:    #FF4B5C  →  aura-red
Orange: #FFAD69  →  aura-orange
Yellow: #FFFB7D  →  aura-yellow
Green:  #75F7AE  →  aura-green
Blue:   #6EC1E4  →  aura-blue
Purple: #C77DFF  →  aura-purple
Pink:   #FCBAD3  →  aura-pink
White:  #F2F2F2  →  aura-white
```

### Typography
- **Primary Font**: Inter, Nunito, or Poppins
- **Headers**: Bold, rounded, with emoji accents
- **Body**: Clear hierarchy, high contrast for mobile

### Component Patterns

#### Cards
- Soft shadows (`shadow-lg`)
- Rounded corners (`rounded-2xl`)
- Pastel gradient backgrounds

#### Aura Badges (Voting)
- Glowing effect on hover/tap (`ring-4 ring-opacity-50`)
- Color-matched glow
- Touch-friendly size (min 44px)

#### Result Reveal
- Confetti animation
- Shimmer/glow border effect
- Color pulse animation

#### Comments
- TikTok/Instagram stacked style
- Avatar + username + color badge
- Swipeable on mobile

#### Aura Meanings
- Floating modal or bottom sheet
- Collapsible/swipeable
- Icon for each color

### UI Patterns

#### Onboarding
- Stories-style intro (1-3 screens)
- Quick explanation of concept
- Skip option

#### Navigation
- Single-action per screen
- Swipe or tap to progress
- Minimal back navigation

#### Social Sharing
- Prominent share buttons (X, Instagram)
- Screenshot-friendly result cards
- Copy link option

#### Monetization
- Subtle upsell button with glow animation
- Mobile-first payments (Apple Pay, Google Pay, Stripe)
- "Unlock detailed analysis" CTA

### Animations
- `transition-all duration-300` for interactions
- Confetti library for celebrations
- CSS keyframes for glow/pulse effects

### Inspirational References
- Instagram Stories quiz templates
- TikTok "What's my vibe?" overlays
- Bumble/Hinge playful cards
- Co-Star, 16Personalities aesthetic

## Working with Claude

### Priorities
1. Code quality and TypeScript safety
2. User experience and performance
3. Clean, maintainable components
4. Mobile-first responsive design

### When Making Changes
- Read existing code first to match patterns
- Update types.ts when adding new data structures
- Update constants.ts for new static data
- Use existing Tailwind classes for consistency
- Test on mobile viewport

### File References
- Main app logic: `app/page.tsx`
- Core voting UI: `components/AuraDisplay.tsx`
- Type definitions: `types.ts`
- Static data: `constants.ts`
- API handler: `worker-api/index.ts`
