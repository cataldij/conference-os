# Conference OS

> The Universal Conference Platform - One app, one identity, all conferences

Conference OS is a cross-platform conference management system with mobile apps for attendees and web dashboards for organizers. Built with premium Apple-level UI/UX and enterprise-grade security.

## 🎯 Features

### For Attendees (Mobile App)
- **Universal Conference Passport** - One profile across all conferences
- **Premium UI/UX** - Apple Keynote-inspired design with smooth animations
- **Smart Agenda** - AI-powered session recommendations
- **Networking** - Consent-based connections that persist across events
- **Live Features** - Real-time captions, translation, polls, and Q&A
- **Venue Navigation** - AR wayfinding and beacon-based indoor positioning
- **Push Notifications** - Session reminders and live updates

### For Organizers (Web Dashboard)
- **Conference Management** - Create and manage events with ease
- **Attendee Management** - Check-in, badges, and analytics
- **Session Builder** - Drag-and-drop agenda creation
- **Speaker Portal** - Speaker profiles, slides, and bio management
- **Sponsor Management** - Lead capture and booth tracking
- **Real-time Analytics** - Attendance, engagement, and revenue metrics
- **Messaging** - Send announcements and chat with attendees

## 🏗️ Architecture

```
conference-os/
├── apps/
│   ├── mobile/         # React Native (Expo) - iOS/Android
│   └── web/            # Next.js 14 - Organizer Dashboard
├── packages/
│   ├── ui/             # Tamagui - Premium UI components
│   ├── api/            # Supabase client + typed queries
│   ├── shared/         # Shared utilities and types
│   └── ai/             # AI utilities (Whisper, ElevenLabs, OpenAI)
└── supabase/
    ├── migrations/     # Database schema
    └── functions/      # Edge Functions
```

### Tech Stack

**Frontend**
- React Native (Expo) for mobile
- Next.js 14 (App Router) for web
- Tamagui for premium mobile UI
- Tailwind CSS + shadcn/ui for web
- TypeScript for type safety

**Backend**
- Supabase (PostgreSQL, Auth, Realtime, Storage)
- Row-Level Security (RLS) for data isolation
- Edge Functions (Deno) for serverless logic

**External Services**
- OpenAI (Whisper for transcription, GPT for AI)
- ElevenLabs (Text-to-Speech)
- DeepL (Translation)
- Agora/Mux (Live streaming)
- Stripe (Payments)
- Expo Push Notifications

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker (for local Supabase)
- Expo CLI (for mobile development)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/conference-os.git
cd conference-os
npm install
```

### 2. Set Up Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
npx supabase start

# Run migrations
npx supabase db push

# Optional: Load seed data
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/seed.sql
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Mobile (Expo)
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# ElevenLabs
ELEVENLABS_API_KEY=xxx

# DeepL
DEEPL_API_KEY=xxx
```

### 4. Start Development Servers

**Mobile App:**
```bash
cd apps/mobile
npm run dev
```

**Web Dashboard:**
```bash
cd apps/web
npm run dev
```

**Monorepo (all apps):**
```bash
npm run dev
```

## 📱 Mobile App Development

### Running on Device/Simulator

```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

### Building for Production

```bash
# Development build
eas build --profile development

# Production build
eas build --profile production
```

## 🌐 Web Dashboard Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

### Docker

```bash
docker build -t conference-os-web -f apps/web/Dockerfile .
docker run -p 3000:3000 conference-os-web
```

## 🗄️ Database Schema

The database follows a multi-tenant architecture with global user identity and per-conference isolation.

### Key Tables

- `profiles` - Global user profiles
- `conferences` - Conference/event definitions
- `conference_members` - User membership in conferences
- `sessions` - Conference sessions/talks
- `tracks` - Session categories
- `rooms` - Venue locations
- `saved_sessions` - User's personal agenda
- `connections` - Cross-conference networking
- `messages` - Real-time chat
- `sponsors` - Exhibitors and sponsors
- `orders` - Ticket purchases

See `supabase/migrations/001_init.sql` for complete schema.

## 🔐 Security Features

- **Row-Level Security (RLS)** - Every table protected
- **Rate Limiting** - 100 requests/minute per IP
- **CSRF Protection** - Built into Next.js
- **SQL Injection Prevention** - Parameterized queries only
- **XSS Protection** - Content Security Policy headers
- **Authentication** - Supabase Auth with JWT
- **Authorization** - Role-based access control (RBAC)
- **Data Encryption** - At rest and in transit (TLS)
- **Security Headers** - HSTS, X-Frame-Options, CSP
- **Audit Logging** - All sensitive actions logged

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests (when added)
npm run test

# E2E tests (when added)
npm run test:e2e
```

## 📊 Monitoring & Analytics

- **Sentry** - Error tracking and performance monitoring
- **PostHog** - Product analytics and feature flags
- **Supabase Analytics** - Database query performance
- **Vercel Analytics** - Web vitals and edge performance

## 🔄 CI/CD Pipeline

GitHub Actions automatically:
- Runs type checking and linting
- Builds mobile and web apps
- Runs security scans
- Deploys to staging (develop branch)
- Deploys to production (main branch)

## 📖 API Documentation

### Edge Functions

#### `/ai-recommendations`
Get personalized session recommendations based on user interests.

```typescript
POST /ai-recommendations
{
  "conferenceId": "uuid"
}
```

#### `/send-push-notification`
Send push notifications to users.

```typescript
POST /send-push-notification
{
  "conferenceId": "uuid",
  "title": "string",
  "body": "string",
  "data": {}
}
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Mobile UI powered by [Tamagui](https://tamagui.dev)
- Deployed on [Vercel](https://vercel.com)

## 📧 Support

- Documentation: [docs.conferenceoscmd](https://docs.conferenceoscmd)
- Email: support@conferenceoscmd
- Twitter: [@conferenceoscmd](https://twitter.com/conferenceoscmd)

---

**Built with ❤️ for the conference community**
