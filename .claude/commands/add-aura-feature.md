# Add Aura Feature

Add a new feature related to aura colors or user interaction.

## Task
Implement the feature: $ARGUMENTS

## Checklist

### 1. Planning
- [ ] Identify affected components
- [ ] Define new types needed in `types.ts`
- [ ] Define new constants in `constants.ts`

### 2. Implementation
- [ ] Update/create components
- [ ] Add state management in `app/page.tsx` if needed
- [ ] Style with Tailwind (mobile-first)
- [ ] Handle loading/error states

### 3. Aura Color Consistency
If feature involves aura colors, use existing system from `constants.ts`:
- Use `AURA_COLORS_MEANING` for color data
- Use `tailwindClass` and `borderColorClass` for styling
- Maintain 8-color system: RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE, PINK, WHITE

### 4. Testing
- [ ] Test on mobile viewport
- [ ] Test all 8 aura colors
- [ ] Test loading states
- [ ] Test error handling

### 5. Integration
- [ ] Update claude.md if architectural changes
- [ ] Consider social sharing implications
