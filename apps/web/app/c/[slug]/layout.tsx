import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

async function getConference(slug: string) {
  const supabase = await createClient()

  const { data: conference } = await supabase
    .from('conferences')
    .select(`
      *,
      members:conference_members(count)
    `)
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  return conference
}

export default async function PublicConferenceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const conference = await getConference(params.slug)

  if (!conference) {
    notFound()
  }

  const startDate = new Date(conference.start_date)
  const endDate = new Date(conference.end_date)

  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' }
    const startStr = start.toLocaleDateString('en-US', options)
    const endStr = end.toLocaleDateString('en-US', { ...options, year: 'numeric' })
    return `${startStr} - ${endStr}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Banner */}
      <div
        className="relative h-64 md:h-80"
        style={{ backgroundColor: conference.primary_color || '#2563eb' }}
      >
        {conference.banner_url && (
          <Image
            src={conference.banner_url}
            alt={conference.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30" />

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        {/* Conference info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <div className="mx-auto max-w-5xl">
            {conference.logo_url && (
              <Image
                src={conference.logo_url}
                alt={`${conference.name} logo`}
                width={80}
                height={80}
                className="mb-4 rounded-lg bg-white p-2"
              />
            )}
            <h1 className="text-3xl md:text-4xl font-bold">{conference.name}</h1>
            {conference.tagline && (
              <p className="mt-2 text-lg text-white/90">{conference.tagline}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDateRange(startDate, endDate)}</span>
              </div>
              {conference.venue_name && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{conference.venue_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{conference.members?.[0]?.count || 0} attendees</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <Link
                href={`/c/${params.slug}`}
                className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Overview
              </Link>
              <Link
                href={`/c/${params.slug}/agenda`}
                className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Agenda
              </Link>
              <Link
                href={`/c/${params.slug}/speakers`}
                className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Speakers
              </Link>
              <Link
                href={`/c/${params.slug}/sponsors`}
                className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sponsors
              </Link>
              <Link
                href={`/c/${params.slug}/attendees`}
                className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Attendees
              </Link>
            </div>
            {conference.registration_open && (
              <Button size="sm" asChild>
                <Link href={`/c/${params.slug}/register`}>Register Now</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {conference.name}. Powered by Conference OS.</p>
          {conference.website_url && (
            <a
              href={conference.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block hover:underline"
            >
              Visit website
            </a>
          )}
        </div>
      </footer>
    </div>
  )
}
