import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Palette,
  Eye,
  Sparkles,
  Calendar,
  Users,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { DEMO_CONFERENCE, DEMO_SESSIONS, DEMO_TRACKS } from '@/lib/demo-data';

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/80">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">Demo Mode</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold">{DEMO_CONFERENCE.name}</h1>
            <p className="mt-1 text-lg text-white/90">{DEMO_CONFERENCE.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Sep 15-17, 2024</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{DEMO_CONFERENCE.venue_name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{DEMO_CONFERENCE.max_attendees?.toLocaleString()}+ attendees</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{DEMO_SESSIONS.length}</div>
            <div className="text-sm text-muted-foreground">Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{DEMO_TRACKS.length}</div>
            <div className="text-sm text-muted-foreground">Tracks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">48</div>
            <div className="text-sm text-muted-foreground">Speakers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">Sponsors</div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/0" />
          <CardHeader className="relative">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Palette className="h-6 w-6" />
            </div>
            <CardTitle>AI Design Studio</CardTitle>
            <CardDescription>
              Create stunning conference branding with AI-powered design generation.
              Try different styles, fonts, and color palettes.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Button asChild className="group-hover:bg-primary/90">
              <Link href="/demo/design" className="flex items-center gap-2">
                Try Design Studio
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-secondary/0" />
          <CardHeader className="relative">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <Eye className="h-6 w-6" />
            </div>
            <CardTitle>Conference Preview</CardTitle>
            <CardDescription>
              See how your conference site looks to attendees. Preview the
              registration page, schedule, and speaker profiles.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Button variant="secondary" asChild className="group-hover:bg-secondary/90 group-hover:text-white">
              <Link href="/demo/preview" className="flex items-center gap-2">
                View Preview
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tracks Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Conference Tracks</CardTitle>
          <CardDescription>
            Explore the different tracks available at TechSummit 2024
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {DEMO_TRACKS.map((track) => (
              <div
                key={track.id}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-white"
                style={{ backgroundColor: track.color }}
              >
                {track.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="flex flex-col items-center py-8 text-center">
          <Sparkles className="mb-4 h-10 w-10 text-primary" />
          <h2 className="text-2xl font-bold">Ready to create your own?</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Sign up for free and start building your conference experience in minutes.
          </p>
          <Button size="lg" asChild className="mt-6">
            <Link href="/register">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
