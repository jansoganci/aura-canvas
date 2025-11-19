# Fix Issue

Debug and fix an issue in the Aura Canvas app.

## Task
Fix: $ARGUMENTS

## Debugging Steps

1. **Identify the issue location**
   - Check browser console for errors
   - Check terminal for build/runtime errors
   - Identify affected component(s)

2. **Common issue areas**
   - `app/page.tsx` - State management, view transitions
   - `components/AuraDisplay.tsx` - Voting, charts, comments
   - `components/ImageEditor.tsx` - API calls, image handling
   - `worker-api/index.ts` - API handler, Gemini integration

3. **Known project issues**
   - API URL hardcoded at `ImageEditor.tsx:30`
   - Type assertions (`as AuraColor`) in AuraDisplay
   - No persistence (comments lost on refresh)
   - No image size validation

4. **Fix and verify**
   - Implement the fix
   - Test the specific flow
   - Check for TypeScript errors
   - Test on mobile

5. **Document if needed**
   - Update claude.md for architectural fixes
   - Add comments for complex fixes
