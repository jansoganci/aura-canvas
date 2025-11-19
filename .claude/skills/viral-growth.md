# Viral Growth Skill

Implement features to drive organic growth and social sharing.

## When to Use
- Adding share functionality
- Optimizing for social platforms
- Creating engaging result displays
- Implementing referral features

## Core Viral Mechanics

### 1. Shareable Results
The most important viral feature - make results easy and desirable to share.

```tsx
// Share result component
const ShareResult: FC<{ aura: AuraColor; imageUrl: string }> = ({ aura, imageUrl }) => {
  const shareText = `My aura is ${aura}! What's yours?`;
  const shareUrl = `https://auracanvas.app/result/${sessionId}`;

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  return (
    <div className="flex gap-2">
      <button onClick={shareToTwitter}>Share on X</button>
      <button onClick={() => navigator.share({ text: shareText, url: shareUrl })}>
        Share
      </button>
    </div>
  );
};
```

### 2. Result Image Generation
Create shareable images with aura overlay:

```typescript
// Use canvas API or server-side image generation
const generateShareImage = async (imageUrl: string, aura: AuraColor) => {
  // Overlay aura color glow
  // Add "My aura is [COLOR]" text
  // Add app branding
  // Return as downloadable image
};
```

### 3. Open Graph Meta Tags
```tsx
// app/result/[id]/page.tsx
export async function generateMetadata({ params }) {
  const result = await getResult(params.id);
  return {
    title: `${result.username}'s Aura is ${result.aura}!`,
    description: 'Discover your aura color',
    openGraph: {
      images: [result.shareImageUrl],
    },
    twitter: {
      card: 'summary_large_image',
    }
  };
}
```

## Growth Features

### Engagement Hooks
1. **"Guess my aura"** - Invite friends to vote
2. **Aura comparison** - "You and @friend are both Purple!"
3. **Trending auras** - "Purple is trending today"
4. **Daily prompt** - "What's your Wednesday aura?"

### Gamification
1. **Aura streak** - Daily check-ins
2. **Collector badges** - "Collected all 8 auras"
3. **Accuracy score** - How well you guess others
4. **Leaderboard** - Top aura readers

### Social Proof
1. **Vote counter** - "1,234 people have checked their aura"
2. **Live feed** - Recent aura reveals
3. **Celebrity auras** - (If applicable/permitted)

### Referral System
```typescript
// Simple referral tracking
const referralLink = `https://auracanvas.app?ref=${userId}`;

// Track in database
if (searchParams.ref) {
  await trackReferral(searchParams.ref, newUserId);
}

// Reward: Free premium analysis for 3 referrals
```

## Platform-Specific Tips

### Twitter/X
- Short, punchy share text
- Include color emoji (🔴🟠🟡🟢🔵🟣)
- Ask question to drive replies
- Thread-friendly format

### Instagram
- Focus on visual result image
- Stories-optimized format (9:16)
- Add poll stickers
- Link in bio

### TikTok
- Video reveal format
- Trending sounds
- Duet/stitch friendly

## Analytics to Track
- Share button clicks
- Shares per platform
- Viral coefficient (invites → signups)
- Session-to-share conversion
- Referral attribution

## Quick Implementation Priority
1. Twitter share button (highest ROI)
2. Result image generation
3. Copy link button
4. Open Graph tags
5. Referral tracking
