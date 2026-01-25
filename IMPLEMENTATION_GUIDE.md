# Conference OS - Implementation Guide

## Getting Started

This guide will walk you through setting up and deploying Conference OS from scratch.

---

## Prerequisites

### Required Software
- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** or **yarn**
- **Git** ([download](https://git-scm.com/))
- **Docker Desktop** ([download](https://www.docker.com/products/docker-desktop/)) - for local Supabase

### Required Accounts
1. **Supabase** - [supabase.com](https://supabase.com) (free tier available)
2. **Stripe** - [stripe.com](https://stripe.com) (test mode available)
3. **OpenAI** - [platform.openai.com](https://platform.openai.com)
4. **ElevenLabs** - [elevenlabs.io](https://elevenlabs.io)
5. **DeepL** - [deepl.com/pro](https://www.deepl.com/pro-api) (free tier: 500k chars/month)
6. **Expo** - [expo.dev](https://expo.dev) (free tier available)
7. **Vercel** - [vercel.com](https://vercel.com) (free tier available) - optional for deployment

---

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/conference-os.git
cd conference-os

# Install dependencies
npm install

# Or use the automated setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

---

## Step 2: Supabase Setup

### Option A: Local Development (Recommended for Development)

```bash
# Start local Supabase (requires Docker)
npx supabase start

# You'll see output like:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Anon Key: eyJhbGc...
# Service Role Key: eyJhbGc...
```

### Option B: Supabase Cloud (Recommended for Production)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details
4. Wait for project to provision (~2 minutes)
5. Go to Settings → API to get your keys

### Run Database Migrations

```bash
# If using local Supabase
npx supabase db push

# If using Supabase Cloud
# 1. Link your project
npx supabase link --project-ref your-project-ref

# 2. Push migrations
npx supabase db push
```

### Load Seed Data (Optional)

```bash
# Local Supabase
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/seed.sql

# Supabase Cloud
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" < supabase/seed.sql
```

---

## Step 3: Environment Variables

### Mobile App (.env for apps/mobile)

Create `apps/mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Web App (.env.local for apps/web)

Create `apps/web/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# ElevenLabs
ELEVENLABS_API_KEY=xxx

# DeepL
DEEPL_API_KEY=xxx

# Expo Push Notifications
EXPO_ACCESS_TOKEN=xxx
```

### Edge Functions (Supabase Dashboard)

1. Go to Supabase Dashboard → Settings → Secrets
2. Add the following secrets:
   - `OPENAI_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `DEEPL_API_KEY`
   - `EXPO_ACCESS_TOKEN`

---

## Step 4: Start Development Servers

### Option A: Run Everything (Monorepo)

```bash
npm run dev
```

This starts:
- Mobile app on port 8081 (Expo Dev Server)
- Web app on port 3000 (Next.js)

### Option B: Run Individually

**Mobile App:**
```bash
cd apps/mobile
npm run dev

# Then scan QR code with:
# - Expo Go app (iOS/Android)
# - Or press 'i' for iOS simulator
# - Or press 'a' for Android emulator
```

**Web Dashboard:**
```bash
cd apps/web
npm run dev

# Open http://localhost:3000
```

---

## Step 5: Deploy Edge Functions

```bash
# Deploy all Edge Functions
npx supabase functions deploy ai-recommendations
npx supabase functions deploy send-push-notification
npx supabase functions deploy session-summary
npx supabase functions deploy live-translation
npx supabase functions deploy tts-announcement

# Or deploy all at once
for func in ai-recommendations send-push-notification session-summary live-translation tts-announcement; do
  npx supabase functions deploy $func
done
```

---

## Step 6: Testing the Application

### Create Your First Conference

1. **Web Dashboard:**
   - Open http://localhost:3000
   - Sign up with email/password
   - Go to "Conferences" → "Create Conference"
   - Fill in conference details
   - Add tracks, rooms, and sessions

2. **Mobile App:**
   - Open the app on your device/simulator
   - Sign in with the same credentials
   - You should see your conference in the list
   - Tap to "join" the conference

### Test Key Features

- [ ] Sign up and create profile
- [ ] Create a conference (web)
- [ ] Join conference (mobile)
- [ ] View agenda
- [ ] Save sessions to schedule
- [ ] Browse attendees
- [ ] Send connection request
- [ ] View analytics (web)
- [ ] Test location services
- [ ] Test beacon scanning (if using physical beacons)

---

## Step 7: API Keys Setup

### Stripe (Payments)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Enable Test Mode (toggle in sidebar)
3. Go to Developers → API Keys
4. Copy:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
5. Go to Developers → Webhooks → Add endpoint
6. URL: `https://your-domain.com/api/webhooks/stripe`
7. Events: `payment_intent.succeeded`, `payment_intent.failed`
8. Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

### OpenAI (AI Features)

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy to `OPENAI_API_KEY`
4. Add credits to your account (min $5)

### ElevenLabs (Text-to-Speech)

1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign up for free account (10k characters/month)
3. Go to Profile → API Keys
4. Copy to `ELEVENLABS_API_KEY`

### DeepL (Translation)

1. Go to [deepl.com/pro-api](https://www.deepl.com/pro-api)
2. Sign up for free account (500k characters/month)
3. Copy API key to `DEEPL_API_KEY`

### Expo (Push Notifications)

1. Go to [expo.dev/accounts](https://expo.dev/accounts)
2. Click on your username → Access Tokens
3. Create new token
4. Copy to `EXPO_ACCESS_TOKEN`

---

## Step 8: Production Deployment

### Deploy Web App (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd apps/web
vercel --prod

# Add environment variables in Vercel Dashboard
# Go to your project → Settings → Environment Variables
```

### Deploy Mobile App (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
cd apps/mobile
eas build:configure

# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Create production build
eas build --profile production --platform ios
eas build --profile production --platform android

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

### Deploy Edge Functions

```bash
# Already deployed in Step 5, but for production:
# 1. Update Supabase secrets with production API keys
# 2. Redeploy all functions
npx supabase functions deploy ai-recommendations
# ... etc
```

---

## Step 9: Post-Deployment Checklist

### Security
- [ ] Enable RLS policies on all tables (already done in migrations)
- [ ] Rotate all API keys
- [ ] Enable 2FA on all service accounts
- [ ] Set up Sentry for error tracking
- [ ] Configure rate limiting (already in middleware)
- [ ] Review security headers (already in next.config.js)
- [ ] Enable HTTPS (automatic with Vercel)

### Monitoring
- [ ] Set up Sentry error tracking
- [ ] Enable Supabase logs monitoring
- [ ] Set up Vercel Analytics
- [ ] Configure PostHog for product analytics
- [ ] Set up database backups (Supabase automatic)
- [ ] Create status page (e.g., status.io)

### Performance
- [ ] Enable Vercel Edge Functions for API routes
- [ ] Configure CDN for static assets
- [ ] Optimize images (Next.js automatic)
- [ ] Test mobile app performance (Expo dev tools)
- [ ] Run Lighthouse audit (web)
- [ ] Load test with 1000+ concurrent users

### Legal
- [ ] Add Privacy Policy
- [ ] Add Terms of Service
- [ ] Add Cookie Policy
- [ ] Add GDPR compliance (data export, deletion)
- [ ] Add CCPA compliance
- [ ] Review App Store guidelines

---

## Common Issues & Solutions

### Issue: Supabase connection fails

**Solution:**
```bash
# Check if Docker is running
docker ps

# Restart Supabase
npx supabase stop
npx supabase start

# Check connection
curl http://localhost:54321/rest/v1/
```

### Issue: Expo won't connect to dev server

**Solution:**
```bash
# Clear cache
npx expo start -c

# Try tunnel mode if on different network
npx expo start --tunnel
```

### Issue: TypeScript errors

**Solution:**
```bash
# Regenerate types from Supabase
npx supabase gen types typescript --local > packages/api/src/types.ts

# Or for cloud
npx supabase gen types typescript --project-id your-project-ref > packages/api/src/types.ts
```

### Issue: Edge Functions not working

**Solution:**
```bash
# Check function logs
npx supabase functions logs ai-recommendations

# Test locally
npx supabase functions serve ai-recommendations

# Check secrets are set
npx supabase secrets list
```

### Issue: Mobile app crashes on location access

**Solution:**
1. Make sure location permissions are granted
2. Check `app.json` for location permission strings
3. Rebuild development build with `eas build`

---

## Development Workflow

### Daily Development

```bash
# 1. Start Supabase (if using local)
npx supabase start

# 2. Start dev servers
npm run dev

# 3. Make changes and test

# 4. Commit changes
git add .
git commit -m "feat: add new feature"
git push
```

### Adding a New Feature

1. Plan the feature (update FEATURES.md)
2. Update database schema (create new migration)
3. Update API types
4. Implement backend (Edge Functions if needed)
5. Implement frontend (mobile and/or web)
6. Write tests
7. Update documentation
8. Create PR

### Database Changes

```bash
# Create new migration
npx supabase migration new your_migration_name

# Edit the file in supabase/migrations/

# Apply migration
npx supabase db push

# Reset database (CAUTION: deletes all data)
npx supabase db reset
```

---

## Architecture Decision Records

### Why Supabase?
- **Pros**: Postgres, realtime, auth, storage, edge functions all in one
- **Cons**: Vendor lock-in (mitigated by open-source)
- **Alternative considered**: Firebase (less powerful querying)

### Why Expo?
- **Pros**: Fast development, OTA updates, managed workflow
- **Cons**: Larger bundle size
- **Alternative considered**: React Native CLI (more complex setup)

### Why Tamagui for Mobile UI?
- **Pros**: Premium feel, cross-platform, optimized for RN
- **Cons**: Smaller ecosystem than Material/NativeBase
- **Alternative considered**: React Native Paper

### Why shadcn/ui for Web?
- **Pros**: Copy-paste components, full control, Tailwind-based
- **Cons**: More code to maintain
- **Alternative considered**: Material-UI (more opinionated)

### Why Turborepo?
- **Pros**: Fast builds, easy caching, great DX
- **Cons**: Overkill for small teams
- **Alternative considered**: Nx (more complex), Lerna (outdated)

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Web First Contentful Paint | < 1.5s | TBD |
| Web Time to Interactive | < 3.5s | TBD |
| Mobile App Launch Time | < 2s | TBD |
| API Response Time (p95) | < 300ms | TBD |
| Database Query Time (p95) | < 100ms | TBD |
| Edge Function Cold Start | < 500ms | TBD |

---

## Scaling Considerations

### Database
- Current: Single Postgres instance (Supabase)
- 1K users: Supabase Pro plan ($25/mo)
- 10K users: Supabase Pro + read replicas
- 100K+ users: Consider sharding by conference

### File Storage
- Current: Supabase Storage (S3-compatible)
- 10GB+: Enable CDN (Supabase automatic)
- 1TB+: Consider separate CDN provider

### Compute
- Current: Vercel serverless functions
- High traffic: Enable Vercel Edge Functions
- Very high traffic: Dedicated server + load balancer

### Realtime Connections
- Current: Supabase Realtime (WebSocket)
- 1K concurrent: Default Supabase limits
- 10K+: Upgrade Supabase plan or custom WebSocket server

---

## Support & Community

- **Documentation**: [docs.conferenceoscmd](https://docs.conferenceoscmd)
- **GitHub**: [github.com/yourusername/conference-os](https://github.com/yourusername/conference-os)
- **Discord**: [discord.gg/conference-os](https://discord.gg/conference-os)
- **Email**: support@conferenceoscmd

---

## License

MIT License - see LICENSE file for details

---

**Next Steps:** After completing setup, refer to FEATURES.md for detailed feature documentation and DEPLOYMENT.md for advanced deployment configurations.
