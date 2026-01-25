# Conference OS - Quick Start Guide

⚡ **Get up and running in 5 minutes**

---

## Prerequisites Checklist

- [x] Node.js 18+ installed
- [x] Docker Desktop running (for local Supabase)
- [x] Git installed
- [x] Code editor (VS Code recommended)

---

## 1. Clone & Install (1 minute)

```bash
git clone https://github.com/yourusername/conference-os.git
cd conference-os
npm install
```

---

## 2. Start Supabase (2 minutes)

```bash
# Start local Supabase
npx supabase start

# You'll see output with your credentials
# Save these for the next step
```

**Copy these values:**
- API URL: `http://localhost:54321`
- Anon Key: `eyJhbGc...`
- Service Role Key: `eyJhbGc...`

---

## 3. Configure Environment (1 minute)

### Mobile App

Create `apps/mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Web App

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

## 4. Set Up Database (1 minute)

```bash
# Run migrations
npx supabase db push

# Load demo data (optional)
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/seed.sql
```

---

## 5. Start Dev Servers

### Option A: Everything at once

```bash
npm run dev
```

### Option B: Separately

**Terminal 1 - Mobile:**
```bash
cd apps/mobile
npm run dev
# Then scan QR code with Expo Go app
```

**Terminal 2 - Web:**
```bash
cd apps/web
npm run dev
# Open http://localhost:3000
```

---

## 🎉 You're Ready!

### Test the App

1. **Web:** Go to http://localhost:3000
2. **Mobile:** Scan QR code with Expo Go
3. **Sign up** with email: `demo@example.com` / password: `password123`
4. **Explore** the demo conference data

---

## Common Commands

### Development

```bash
# Start everything
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Clean & reinstall
rm -rf node_modules && npm install
```

### Database

```bash
# Create new migration
npx supabase migration new migration_name

# Apply migrations
npx supabase db push

# Reset database (⚠️ deletes all data)
npx supabase db reset

# Generate TypeScript types
npx supabase gen types typescript --local > packages/api/src/types.ts
```

### Mobile (Expo)

```bash
# Clear cache
npx expo start -c

# iOS simulator
npx expo start --ios

# Android emulator
npx expo start --android

# Build for production
eas build --profile production --platform all
```

### Edge Functions

```bash
# Deploy single function
npx supabase functions deploy function-name

# Deploy all functions
for func in ai-recommendations send-push-notification session-summary live-translation tts-announcement; do
  npx supabase functions deploy $func
done

# View logs
npx supabase functions logs function-name
```

---

## Project Structure

```
conference-os/
├── apps/
│   ├── mobile/          # React Native (Expo)
│   │   ├── app/         # Screens
│   │   ├── components/  # UI components
│   │   └── hooks/       # Custom hooks
│   └── web/             # Next.js dashboard
│       ├── app/         # App router pages
│       ├── components/  # UI components
│       └── lib/         # Utilities
├── packages/
│   ├── ui/              # Shared UI (Tamagui)
│   ├── api/             # Supabase client
│   └── shared/          # Utilities
├── supabase/
│   ├── migrations/      # Database schema
│   └── functions/       # Edge functions
└── docs/
    ├── README.md
    ├── FEATURES.md
    ├── STATUS.md
    └── DEPLOYMENT.md
```

---

## Key Features to Test

### As Attendee (Mobile App)
1. ✅ Sign up and create profile
2. ✅ Join demo conference
3. ✅ Browse agenda and save sessions
4. ✅ View attendees and send connection
5. ✅ Send messages
6. ✅ Check nearby attendees
7. ✅ View venue map

### As Organizer (Web Dashboard)
1. ✅ Log in to dashboard
2. ✅ View analytics
3. ✅ Create new session
4. ✅ Check in attendees
5. ✅ Send announcement
6. ✅ View reports

---

## Default Demo Accounts

After loading seed data, you can log in with:

### Attendee
- Email: `attendee1@example.com`
- Password: `password123`

### Organizer
- Email: `organizer@example.com`
- Password: `password123`

### Speaker
- Email: `speaker1@example.com`
- Password: `password123`

---

## Troubleshooting

### "Can't connect to Supabase"

```bash
# Check if Docker is running
docker ps

# Restart Supabase
npx supabase stop
npx supabase start
```

### "Module not found" errors

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### "Expo won't connect"

```bash
# Clear cache and restart
npx expo start -c

# Try tunnel mode
npx expo start --tunnel
```

### "TypeScript errors"

```bash
# Regenerate Supabase types
npx supabase gen types typescript --local > packages/api/src/types.ts
```

---

## Next Steps

1. ✅ **Read the docs:** Check `README.md` for detailed overview
2. ✅ **Explore features:** See `FEATURES.md` for complete feature list
3. ✅ **Review status:** Check `STATUS.md` for current progress
4. ✅ **Deploy:** Follow `DEPLOYMENT.md` for production setup
5. ✅ **Customize:** Update branding, colors, and conference data

---

## API Keys (for Advanced Features)

To enable AI features, add these to your `.env.local` files:

```env
# OpenAI (session summaries, recommendations)
OPENAI_API_KEY=sk-xxx

# ElevenLabs (text-to-speech announcements)
ELEVENLABS_API_KEY=xxx

# DeepL (live translation)
DEEPL_API_KEY=xxx

# Expo (push notifications)
EXPO_ACCESS_TOKEN=xxx

# Stripe (payments)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

Get these from:
- OpenAI: https://platform.openai.com/api-keys
- ElevenLabs: https://elevenlabs.io
- DeepL: https://www.deepl.com/pro-api
- Expo: https://expo.dev/accounts
- Stripe: https://dashboard.stripe.com/test/apikeys

---

## Production Deployment

### Web (Vercel)

```bash
npm install -g vercel
cd apps/web
vercel --prod
```

### Mobile (EAS)

```bash
npm install -g eas-cli
cd apps/mobile
eas build --profile production --platform all
```

### Database (Supabase Cloud)

1. Create project at https://supabase.com
2. Link project: `npx supabase link --project-ref your-ref`
3. Push migrations: `npx supabase db push`

---

## Support

- 📖 **Docs:** All markdown files in project root
- 🐛 **Issues:** GitHub Issues
- 💬 **Chat:** Discord (link in README)
- 📧 **Email:** support@conferenceoscmd

---

## License

MIT License - see LICENSE file

---

**Built with ❤️ for the conference community**

🚀 **Ready to build something amazing?** Start coding!
