import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Users, Mic, Building2, ArrowRight } from 'lucide-react'

async function getConferenceData(slug: string) {
  const supabase = await createClient()

  const { data: conference } = await supabase
    .from('conferences')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (!conference) return null

  // Get sessions count
  const { count: sessionsCount } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('conference_id', conference.id)

  // Get featured sessions
  const { data: featuredSessions } = await supabase
    .from('sessions')
    .select(`
      id,
      title,
      description,
      session_type,
      start_time,
      end_time,
      room:rooms(name),
      track:tracks(name, color)
    `)
    .eq('conference_id', conference.id)
    .eq('is_featured', true)
    .order('start_time', { ascending: true })
    .limit(3)

  // Get featured speakers
  const { data: speakerProfiles } = await supabase
    .from('speaker_profiles')
    .select(`
      user:profiles(id, full_name, avatar_url),
      company,
      title,
      is_featured
    `)
    .eq('conference_id', conference.id)
    .eq('is_featured', true)
    .limit(4)

  // Get sponsors by tier
  const { data: sponsors } = await supabase
    .from('sponsors')
    .select('id, name, logo_url, tier, website_url')
    .eq('conference_id', conference.id)
    .order('created_at', { ascending: true })

  return {
    conference,
    sessionsCount: sessionsCount || 0,
    featuredSessions: featuredSessions || [],
    featuredSpeakers: speakerProfiles || [],
    sponsors: sponsors || [],
  }
}

export default async function PublicConferencePage({
  params,
}: {
  params: { slug: string }
}) {
  const data = await getConferenceData(params.slug)

  if (!data) {
    notFound()
  }

  const { conference, sessionsCount, featuredSessions, featuredSpeakers, sponsors } = data

  const platinumSponsors = sponsors.filter((s) => s.tier === 'platinum')
  const goldSponsors = sponsors.filter((s) => s.tier === 'gold')

  return (
    <div className="space-y-12">
      {/* About Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">About</h2>
        <div className="prose prose-slate max-w-none">
          <p className="text-muted-foreground text-lg leading-relaxed">
            {conference.description || 'Welcome to ' + conference.name + '!'}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{sessionsCount}</p>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Mic className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{featuredSpeakers.length}+</p>
              <p className="text-sm text-muted-foreground">Speakers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{sponsors.length}</p>
              <p className="text-sm text-muted-foreground">Sponsors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{conference.max_attendees || '500'}+</p>
              <p className="text-sm text-muted-foreground">Expected</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Sessions */}
      {featuredSessions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Featured Sessions</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/c/${params.slug}/agenda`}>
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featuredSessions.map((session) => {
              const startTime = new Date(session.start_time)
              const endTime = new Date(session.end_time)

              return (
                <Card key={session.id} className="overflow-hidden">
                  {session.track && (
                    <div
                      className="h-1"
                      style={{ backgroundColor: session.track.color || '#2563eb' }}
                    />
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {session.session_type}
                      </span>
                      {session.track && (
                        <span className="text-xs text-muted-foreground">
                          {session.track.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2">{session.title}</h3>
                    {session.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {session.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {startTime.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {session.room && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{session.room.name}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Featured Speakers */}
      {featuredSpeakers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Featured Speakers</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/c/${params.slug}/speakers`}>
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
            {featuredSpeakers.map((speaker) => (
              <div key={speaker.user?.id} className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden bg-muted">
                  {speaker.user?.avatar_url ? (
                    <Image
                      src={speaker.user.avatar_url}
                      alt={speaker.user?.full_name || 'Speaker'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                      {speaker.user?.full_name?.charAt(0) || 'S'}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold">{speaker.user?.full_name}</h3>
                {speaker.title && (
                  <p className="text-sm text-muted-foreground">{speaker.title}</p>
                )}
                {speaker.company && (
                  <p className="text-sm text-muted-foreground">{speaker.company}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sponsors */}
      {sponsors.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Sponsors</h2>

          {platinumSponsors.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Platinum Sponsors
              </h3>
              <div className="flex flex-wrap justify-center gap-8">
                {platinumSponsors.map((sponsor) => (
                  <a
                    key={sponsor.id}
                    href={sponsor.website_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {sponsor.logo_url ? (
                      <Image
                        src={sponsor.logo_url}
                        alt={sponsor.name}
                        width={180}
                        height={80}
                        className="object-contain grayscale hover:grayscale-0 transition-all"
                      />
                    ) : (
                      <div className="px-6 py-4 border rounded-lg text-lg font-semibold">
                        {sponsor.name}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {goldSponsors.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Gold Sponsors
              </h3>
              <div className="flex flex-wrap justify-center gap-6">
                {goldSponsors.map((sponsor) => (
                  <a
                    key={sponsor.id}
                    href={sponsor.website_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {sponsor.logo_url ? (
                      <Image
                        src={sponsor.logo_url}
                        alt={sponsor.name}
                        width={140}
                        height={60}
                        className="object-contain grayscale hover:grayscale-0 transition-all"
                      />
                    ) : (
                      <div className="px-4 py-3 border rounded-lg font-medium">
                        {sponsor.name}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href={`/c/${params.slug}/sponsors`}>View all sponsors</Link>
            </Button>
          </div>
        </section>
      )}

      {/* CTA */}
      {conference.registration_open && (
        <section className="text-center py-12 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl">
          <h2 className="text-2xl font-bold mb-2">Ready to join?</h2>
          <p className="text-muted-foreground mb-6">
            Register now to secure your spot at {conference.name}
          </p>
          <Button size="lg" asChild>
            <Link href={`/c/${params.slug}/register`}>Register Now</Link>
          </Button>
        </section>
      )}
    </div>
  )
}
