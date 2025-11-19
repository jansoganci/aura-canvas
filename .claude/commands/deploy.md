# Deploy Aura Canvas

Deploy the application to Cloudflare.

## Task
Run deployment commands and verify success.

## Steps

1. **Check for uncommitted changes** (if git initialized)

2. **Deploy API Worker** (if API changes made):
   ```bash
   npm run deploy:api
   ```

3. **Deploy Frontend**:
   ```bash
   npm run deploy
   ```

4. **Or deploy both**:
   ```bash
   npm run deploy:all
   ```

## Post-Deploy Verification
- Check Cloudflare Pages dashboard for build status
- Test the deployed URL
- Verify API endpoint is responding

## Common Issues
- Missing GEMINI_API_KEY in Worker environment variables
- Hardcoded API URL needs updating for custom domains
- Build errors from TypeScript strict mode
