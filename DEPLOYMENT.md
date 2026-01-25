# Deployment Guide

This guide covers deploying Conference OS to production with optimal security and scalability.

## Table of Contents

1. [Infrastructure Setup](#infrastructure-setup)
2. [Database Deployment](#database-deployment)
3. [Web Dashboard Deployment](#web-dashboard-deployment)
4. [Mobile App Distribution](#mobile-app-distribution)
5. [Edge Functions Deployment](#edge-functions-deployment)
6. [Security Checklist](#security-checklist)
7. [Monitoring Setup](#monitoring-setup)
8. [Scaling Considerations](#scaling-considerations)

## Infrastructure Setup

### Required Accounts

1. **Supabase** (Database & Auth)
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Vercel** (Web Hosting)
   - Sign up at [vercel.com](https://vercel.com)
   - Connect your GitHub repository

3. **Expo** (Mobile Distribution)
   - Sign up at [expo.dev](https://expo.dev)
   - Create a new project
   - Get your access token

4. **Stripe** (Payments)
   - Sign up at [stripe.com](https://stripe.com)
   - Get API keys (start with test mode)

5. **Additional Services**
   - OpenAI API key
   - ElevenLabs API key
   - DeepL API key
   - Sentry DSN (error tracking)

## Database Deployment

### 1. Create Supabase Project

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push

# Optional: Load seed data
npx supabase db execute --file supabase/seed.sql
```

### 2. Configure Row-Level Security

Verify RLS is enabled on all tables:

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- All tables should have rowsecurity = true
```

### 3. Set Up Database Backups

```bash
# Enable automatic backups in Supabase dashboard
# Settings > Database > Backups
# Recommended: Daily backups with 7-day retention
```

### 4. Connection Pooling

Configure PgBouncer for connection pooling (included in Supabase):

```
Max connections: 200
Pool mode: Transaction
Pool size: 15
```

## Web Dashboard Deployment

### Vercel Deployment

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Configure Environment Variables**

   In Vercel Dashboard → Settings → Environment Variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx (secret)
   STRIPE_SECRET_KEY=sk_live_xxx (secret)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   OPENAI_API_KEY=sk-xxx (secret)
   ELEVENLABS_API_KEY=xxx (secret)
   DEEPL_API_KEY=xxx (secret)
   SENTRY_DSN=https://xxx@sentry.io/xxx
   NEXT_PUBLIC_APP_URL=https://conferenceoscmd.vercel.app
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Custom Domain**
   - Add domain in Vercel dashboard
   - Update DNS records
   - SSL automatically provisioned

### Docker Deployment (Alternative)

```dockerfile
# Build
docker build -t conference-os-web -f apps/web/Dockerfile .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
  conference-os-web
```

## Mobile App Distribution

### iOS App Store

1. **Configure App**
   ```bash
   cd apps/mobile
   eas build:configure
   ```

2. **Build for Production**
   ```bash
   eas build --platform ios --profile production
   ```

3. **Submit to App Store**
   ```bash
   eas submit --platform ios
   ```

### Google Play Store

1. **Build for Android**
   ```bash
   eas build --platform android --profile production
   ```

2. **Submit to Play Store**
   ```bash
   eas submit --platform android
   ```

### Over-the-Air (OTA) Updates

```bash
# Publish update without rebuilding
eas update --branch production --message "Fix critical bug"
```

## Edge Functions Deployment

### Deploy All Functions

```bash
# Deploy all Edge Functions
npx supabase functions deploy

# Deploy specific function
npx supabase functions deploy ai-recommendations
```

### Set Function Secrets

```bash
# Set environment variables for Edge Functions
npx supabase secrets set OPENAI_API_KEY=sk-xxx
npx supabase secrets set ELEVENLABS_API_KEY=xxx
npx supabase secrets set DEEPL_API_KEY=xxx
```

## Security Checklist

### Pre-Production

- [ ] Enable RLS on all tables
- [ ] Audit RLS policies for correctness
- [ ] Set up rate limiting (already in middleware)
- [ ] Configure CORS properly
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Configure CSP headers
- [ ] Enable database SSL
- [ ] Rotate default secrets
- [ ] Set up Web Application Firewall (WAF)
- [ ] Enable DDoS protection
- [ ] Configure IP allowlisting for admin routes

### Authentication

- [ ] Enable multi-factor authentication (MFA)
- [ ] Configure password complexity requirements
- [ ] Set session timeout (default: 1 hour)
- [ ] Enable email verification
- [ ] Configure OAuth providers
- [ ] Set up password reset flow
- [ ] Enable account lockout after failed attempts

### Data Protection

- [ ] Enable at-rest encryption
- [ ] Use TLS 1.3 for in-transit encryption
- [ ] Configure database backups
- [ ] Set up audit logging
- [ ] Implement data retention policies
- [ ] Configure GDPR compliance features
- [ ] Set up PII data encryption

## Monitoring Setup

### Sentry (Error Tracking)

```bash
# Install Sentry
npm install @sentry/nextjs @sentry/react-native

# Configure Sentry
npx sentry-wizard
```

Add to `next.config.js`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(config, {
  org: 'your-org',
  project: 'conference-os',
})
```

### PostHog (Analytics)

```typescript
// Add to app initialization
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: 'https://app.posthog.com'
})
```

### Uptime Monitoring

Set up monitors for:
- Web dashboard: https://conferenceoscmd.vercel.app
- API health: https://conferenceoscmd.vercel.app/api/health
- Supabase: Check database connection
- Edge Functions: Test each function endpoint

## Scaling Considerations

### Database Scaling

**Vertical Scaling (Easy)**
- Upgrade Supabase plan
- Increase database resources
- Current limits: Up to 64 vCPU, 256GB RAM

**Horizontal Scaling (Advanced)**
- Read replicas for analytics queries
- Caching layer (Redis) for frequently accessed data
- CDN for static assets

### Application Scaling

**Vercel**
- Automatic scaling included
- Edge functions replicated globally
- No configuration needed

**Load Testing**
```bash
# Install k6
brew install k6

# Run load test
k6 run load-test.js
```

### Cost Optimization

**Supabase**
- Enable connection pooling
- Index frequently queried columns
- Archive old data to storage
- Use database functions for complex queries

**Vercel**
- Enable ISR (Incremental Static Regeneration)
- Optimize images with next/image
- Use edge caching headers
- Minimize API route usage

**Mobile**
- Implement request deduplication
- Cache API responses locally
- Lazy load images and content
- Use background fetch sparingly

## Performance Targets

### Web Dashboard
- Time to First Byte (TTFB): < 200ms
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s

### Mobile App
- App launch: < 2s
- API response time: < 500ms
- Frame rate: 60fps constant
- Memory usage: < 150MB

### Database
- Query response time: < 100ms (p95)
- Connection pool utilization: < 80%
- Cache hit rate: > 90%

## Disaster Recovery

### Backup Strategy

**Database**
- Automated daily backups (7-day retention)
- Weekly backups (30-day retention)
- Monthly backups (1-year retention)

**Code**
- Git repository (GitHub)
- Docker images (registry)
- Build artifacts (Vercel/Expo)

### Recovery Procedures

**Database Restore**
```bash
# List backups
npx supabase db backups list

# Restore from backup
npx supabase db restore --backup-id xxx
```

**Application Rollback**
```bash
# Vercel rollback
vercel rollback

# Expo rollback
eas update --branch production --message "Rollback"
```

## Post-Deployment

### Health Checks

Create `/api/health` endpoint:

```typescript
export async function GET() {
  try {
    // Check database
    const { data, error } = await supabase
      .from('conferences')
      .select('count')
      .limit(1)

    if (error) throw error

    return Response.json({ status: 'healthy', timestamp: new Date() })
  } catch (error) {
    return Response.json({ status: 'unhealthy', error }, { status: 500 })
  }
}
```

### Monitoring Dashboard

Set up a status page with:
- API uptime (%)
- Response time (ms)
- Error rate (%)
- Active users
- Database connections

## Support

For deployment issues:
- Email: devops@conferenceoscmd
- Slack: #deployment-support
- Docs: https://docs.conferenceoscmd/deployment
