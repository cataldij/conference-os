import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Users, ArrowLeft, Bookmark, ExternalLink } from 'lucide-react'
import { SessionQA } from '@/components/session/session-qa'
import { SessionPoll } from '@/components/session/session-poll'

async function getSessionData(slug: string, sessionId: string) {
  const supabase = await createClient()

  // Get conference
  const { data: conference } = await supabase
    .from('conferences')
    .select('id, name')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (!conference) return null

  // Get session with related data
  const { data: session } = await supabase
    .from('sessions')
    .select(`
      *,
      room:rooms(name, capacity),
      track:tracks(name, color),
      speakers:session_speakers(
        speaker:profiles(id, full_name, avatar_url, job_title, company)
      )
    `)
    .eq('id', sessionId)
    .eq('conference_id', conference.id)
    .single()

  if (!session) return null

  // Check if user is registered
  const { data: { user } } = await supabase.auth.getUser()
  let isRegistered = false
  let isSaved = false

  if (user) {
    const { data: membership } = await supabase
      .from('conference_members')
      .select('id')
      .eq('conference_id', conference.id)
      .eq('user_id', user.id)
      .single()

    isRegistered = !!membership

    const { data: saved } = await supabase
      .from('saved_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .single()

    isSaved = !!saved
  }

  return {
    conference,
    session,
    isRegistered,
    isSaved,
    userId: user?.id,
  }
}

export default async function SessionDetailPage({
  params,
}: {
  params: { slug: string; sessionId: string }
}) {
  const data = await getSessionData(params.slug, params.sessionId)

  if (!data) {
    notFound()
  }

  const { conference, session, isRegistered, isSaved, userId } = data
  const startTime = new Date(session.start_time)
  const endTime = new Date(session.end_time)
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60)

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/c/${params.slug}/agenda`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Agenda
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session header */}
          <div>
            {session.track && (
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: session.track.color || '#2563eb' }}
                />
                <span className="text-sm font-medium">{session.track.name}</span>
              </div>
            )}
            <h1 className="text-3xl font-bold">{session.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                  session.session_type === 'keynote'
                    ? 'bg-blue-100 text-blue-700'
                    : session.session_type === 'workshop'
                      ? 'bg-purple-100 text-purple-700'
                      : session.session_type === 'panel'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                }`}
              >
                {session.session_type}
              </span>
              {session.is_featured && (
                <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                  Featured
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {session.description && (
            <Card>
              <CardHeader>
                <CardTitle>About this session</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {session.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Speakers */}
          {session.speakers && session.speakers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Speakers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {session.speakers.map((s: any) => {
                    const speaker = s.speaker
                    if (!speaker) return null

                    return (
                      <div key={speaker.id} className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted">
                          {speaker.avatar_url ? (
                            <Image
                              src={speaker.avatar_url}
                              alt={speaker.full_name || 'Speaker'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-muted-foreground">
                              {speaker.full_name?.charAt(0) || 'S'}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{speaker.full_name}</h4>
                          {speaker.job_title && (
                            <p className="text-sm text-muted-foreground">
                              {speaker.job_title}
                            </p>
                          )}
                          {speaker.company && (
                            <p className="text-sm text-muted-foreground">
                              {speaker.company}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Polls */}
          <SessionPoll sessionId={params.sessionId} />

          {/* Q&A Section */}
          {isRegistered && <SessionQA sessionId={params.sessionId} />}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session details */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {startTime.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {startTime.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {endTime.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">{duration} minutes</p>
                </div>
              </div>

              {session.room && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{session.room.name}</p>
                    {session.room.capacity && (
                      <p className="text-sm text-muted-foreground">
                        Capacity: {session.room.capacity}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {session.max_attendees && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Limited seating</p>
                    <p className="text-sm text-muted-foreground">
                      {session.max_attendees} spots
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t space-y-3">
                {userId ? (
                  <Button className="w-full" variant={isSaved ? 'secondary' : 'default'}>
                    <Bookmark
                      className={`mr-2 h-4 w-4 ${isSaved ? 'fill-current' : ''}`}
                    />
                    {isSaved ? 'Saved to Schedule' : 'Save to Schedule'}
                  </Button>
                ) : (
                  <Button className="w-full" asChild>
                    <Link href={`/login?redirect=/c/${params.slug}/session/${params.sessionId}`}>
                      Sign in to save
                    </Link>
                  </Button>
                )}

                {session.livestream_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={session.livestream_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Watch Livestream
                    </a>
                  </Button>
                )}

                {session.replay_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={session.replay_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Watch Replay
                    </a>
                  </Button>
                )}

                {session.slides_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={session.slides_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Slides
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Registration prompt */}
          {!isRegistered && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Join the conversation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Register for {conference.name} to participate in Q&A and networking.
                </p>
                <Button asChild>
                  <Link href={`/c/${params.slug}/register`}>Register Now</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
