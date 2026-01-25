# Conference OS - Setup Guide

This guide will walk you through setting up Conference OS for development and TestFlight deployment.

## Prerequisites

- Node.js 18+ installed
- Expo CLI: `npm install -g expo-cli eas-cli`
- Supabase CLI: `npm install -g supabase`
- Apple Developer account (for TestFlight)
- Supabase project created

---

## Step 1: Install Dependencies

```bash
# From the root directory
npm install

# Or with pnpm (recommended for monorepo)
pnpm install
```

---

## Step 2: Configure Expo / EAS

### 2.1 Login to Expo

```bash
eas login
```

### 2.2 Link to your Expo project

```bash
cd apps/mobile

# Create a new EAS project (or link existing)
eas init

# This will give you a project ID like: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### 2.3 Update Configuration

Edit `apps/mobile/app.json` and replace the placeholders:

```json
{
  "expo": {
    "owner": "YOUR_EXPO_USERNAME",    // <-- Your Expo account username
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID"  // <-- From eas init
      }
    },
    "updates": {
      "url": "https://u.expo.dev/YOUR_PROJECT_ID"  // <-- Same project ID
    }
  }
}
```

Edit `apps/mobile/eas.json` and replace the Apple credentials:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",      // <-- Your Apple ID email
        "ascAppId": "1234567890",                   // <-- App Store Connect App ID
        "appleTeamId": "ABCDEF1234"                 // <-- Your Apple Team ID
      }
    }
  }
}
```

**How to find these values:**
- `appleId`: Your Apple Developer account email
- `ascAppId`: App Store Connect → Apps → Your App → App Information → Apple ID
- `appleTeamId`: [Apple Developer Account](https://developer.apple.com/account) → Membership → Team ID

---

## Step 3: Configure Supabase

### 3.1 Link to your Supabase project

```bash
# Login to Supabase CLI
supabase login

# Link to your project (get ref from Supabase dashboard URL)
supabase link --project-ref your-project-ref
```

### 3.2 Run Database Migrations

```bash
# Push all migrations to your Supabase project
supabase db push
```

### 3.3 Deploy Edge Functions

```bash
# Deploy all edge functions
supabase functions deploy transcribe-audio
supabase functions deploy session-summary
supabase functions deploy live-translation
supabase functions deploy tts-announcement
```

### 3.4 Set Edge Function Secrets

```bash
# Set secrets for edge functions
supabase secrets set OPENAI_API_KEY=sk-your-key
supabase secrets set ELEVENLABS_API_KEY=your-key
supabase secrets set DEEPL_API_KEY=your-key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your-key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your-key
```

---

## Step 4: Environment Variables

### 4.1 Mobile App

Create `apps/mobile/.env`:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Edit with your values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4.2 Web App

Create `apps/web/.env.local`:

```bash
cp apps/web/.env.example apps/web/.env.local
```

---

## Step 5: Generate Assets

```bash
cd apps/mobile

# Generate PNG assets from SVG templates
npm run generate-assets
```

This creates placeholder icons. Replace with your actual app icons before production.

---

## Step 6: Build for TestFlight

### 6.1 Development Build (for testing on device)

```bash
cd apps/mobile

# Build development client for iOS
eas build --profile development --platform ios
```

This creates a development build you can install via QR code.

### 6.2 Preview Build (internal testing)

```bash
# Build preview for internal distribution
eas build --profile preview --platform ios
```

### 6.3 Production Build (for TestFlight)

```bash
# Build for App Store / TestFlight
eas build --profile production --platform ios

# After build completes, submit to TestFlight
eas submit --platform ios --profile production
```

---

## Step 7: Run Locally

### Mobile App

```bash
cd apps/mobile
npm run dev

# Scan QR code with Expo Go app (limited features)
# Or use development build for full native features
```

### Web Dashboard

```bash
cd apps/web
npm run dev

# Open http://localhost:3000
```

---

## Common Commands

```bash
# Mobile
npm run dev              # Start Expo dev server
npm run build:dev        # Build development client
npm run build:preview    # Build for internal testing
npm run build:prod       # Build for production
npm run submit:ios       # Submit to TestFlight

# Web
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server

# Supabase
supabase db push         # Push migrations
supabase functions deploy <name>  # Deploy edge function
supabase functions serve  # Run functions locally
```

---

## Troubleshooting

### "Bundle identifier already exists"
Your bundle ID is already registered. Either:
1. Use a different bundle ID in `app.json`
2. Register the existing one in App Store Connect first

### "Missing credentials"
Run `eas credentials` to set up or update your Apple credentials.

### "Edge function deployment failed"
Check that you're logged in: `supabase login`
Check project link: `supabase link --project-ref your-ref`

### Build fails with native module error
Make sure you're using a development build, not Expo Go, for native modules like maps and camera.

---

## Next Steps

1. ✅ Complete setup above
2. 🎨 Design custom app icons and splash screen
3. 📱 Test on real devices via TestFlight
4. 🚀 Submit to App Store when ready

Need help? Check the [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed documentation.
