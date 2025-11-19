# Aura Canvas Design System Skill

Ensure UI consistency with the playful, Gen-Z/Millennial-focused design language.

## When to Use
- Building any new UI component
- Updating existing component styles
- Adding animations or interactions
- Creating shareable result screens

## Color Usage

### Aura Colors (use `aura-*` prefix)
```tsx
// Backgrounds
className="bg-aura-red"
className="bg-aura-purple"

// Text
className="text-aura-blue"

// Borders
className="border-aura-pink"

// Rings (for glow effects)
className="ring-aura-green ring-4 ring-opacity-50"
```

### Color Mapping
| Color | Hex | Tailwind Class | Use For |
|-------|-----|----------------|---------|
| Red | #FF4B5C | `aura-red` | Energy, passion |
| Orange | #FFAD69 | `aura-orange` | Creativity, joy |
| Yellow | #FFFB7D | `aura-yellow` | Optimism, intellect |
| Green | #75F7AE | `aura-green` | Growth, balance |
| Blue | #6EC1E4 | `aura-blue` | Peace, calm |
| Purple | #C77DFF | `aura-purple` | Spirituality, wisdom |
| Pink | #FCBAD3 | `aura-pink` | Love, tenderness |
| White | #F2F2F2 | `aura-white` | Purity, clarity |

## Component Patterns

### Cards
```tsx
<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
  {/* content */}
</div>
```

### Gradient Backgrounds
```tsx
// Page background
<div className="min-h-screen bg-gradient-to-br from-aura-purple/20 via-aura-pink/20 to-aura-blue/20">

// Card with gradient
<div className="bg-gradient-to-r from-aura-purple/10 to-aura-pink/10 rounded-2xl">
```

### Aura Badge (Voting Button)
```tsx
<button
  className={`
    px-4 py-3 rounded-xl font-medium
    transition-all duration-300
    bg-aura-purple text-white
    hover:scale-105 hover:shadow-aura
    active:scale-95
    focus:ring-4 focus:ring-aura-purple/50
  `}
>
  Purple
</button>
```

### Glowing Effect
```tsx
// On hover/active state
className="hover:shadow-[0_0_20px_rgba(199,125,255,0.5)]"

// Always glowing
className="animate-glow"

// Specific color glow
className="shadow-[0_0_20px_theme(colors.aura.green)]"
```

### Result Reveal Card
```tsx
<div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-aura-purple to-aura-pink">
  {/* Shimmer overlay */}
  <div className="absolute inset-0 bg-shimmer animate-shimmer" />

  {/* Content */}
  <div className="relative z-10 text-white text-center">
    <h2 className="text-3xl font-bold">Your Aura is</h2>
    <p className="text-5xl font-bold mt-4">Purple</p>
  </div>
</div>
```

## Typography

### Headers
```tsx
<h1 className="text-4xl font-bold text-gray-900">
<h2 className="text-2xl font-semibold text-gray-800">
<h3 className="text-xl font-medium text-gray-700">
```

### With Emoji Accent
```tsx
<h2 className="text-2xl font-bold">
  What's Your Aura? ✨
</h2>
```

### Body Text
```tsx
<p className="text-base text-gray-600 leading-relaxed">
```

## Interactions

### Touch-Friendly Buttons
```tsx
// Minimum 44px touch target
className="min-h-[44px] min-w-[44px] px-6 py-3"
```

### Hover States
```tsx
className="hover:scale-105 hover:shadow-lg transition-all duration-300"
```

### Active/Pressed States
```tsx
className="active:scale-95"
```

### Focus States (Accessibility)
```tsx
className="focus:outline-none focus:ring-4 focus:ring-aura-purple/50"
```

## Animations

### Float Animation
```tsx
<div className="animate-float">
  {/* Floating element */}
</div>
```

### Glow Animation
```tsx
<div className="animate-glow text-aura-purple">
  {/* Glowing element */}
</div>
```

### Shimmer Effect
```tsx
<div className="bg-shimmer bg-[length:200%_100%] animate-shimmer">
```

### Entry Animation (CSS-in-JS or Framer Motion)
```tsx
// Simple fade in
className="animate-[fadeIn_0.5s_ease-out]"

// Scale up
className="animate-[scaleIn_0.3s_ease-out]"
```

## Comments (TikTok Style)

```tsx
<div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
  {/* Avatar */}
  <div className="w-8 h-8 rounded-full bg-aura-purple/20 flex-shrink-0" />

  <div className="flex-1 min-w-0">
    {/* Username + Badge */}
    <div className="flex items-center gap-2">
      <span className="font-medium text-sm">@username</span>
      <span className="px-2 py-0.5 rounded-full text-xs bg-aura-blue text-white">
        Blue
      </span>
    </div>

    {/* Comment */}
    <p className="text-sm text-gray-600 mt-1">
      Definitely feeling blue vibes! 💙
    </p>
  </div>
</div>
```

## Social Share Buttons

```tsx
<div className="flex gap-3">
  {/* X/Twitter */}
  <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors">
    Share on X
  </button>

  {/* Copy Link */}
  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
    Copy Link
  </button>
</div>
```

## Monetization CTA

```tsx
<button className="
  relative overflow-hidden
  px-8 py-4 rounded-2xl
  bg-gradient-to-r from-aura-purple to-aura-pink
  text-white font-semibold
  shadow-aura-lg
  hover:scale-105 hover:shadow-[0_0_40px_rgba(199,125,255,0.6)]
  transition-all duration-300
">
  <span className="relative z-10">
    Unlock Detailed Analysis ✨
  </span>
  {/* Shimmer effect */}
  <div className="absolute inset-0 bg-shimmer bg-[length:200%_100%] animate-shimmer opacity-30" />
</button>
```

## Responsive Patterns

### Mobile-First Grid
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
```

### Stack on Mobile
```tsx
<div className="flex flex-col sm:flex-row gap-4">
```

### Hide on Mobile
```tsx
<div className="hidden sm:block">
```

## Accessibility Checklist
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] Touch targets ≥ 44px
- [ ] Focus indicators visible
- [ ] Alt text for images
- [ ] Semantic HTML (button, not div)
- [ ] aria-labels for icon buttons
