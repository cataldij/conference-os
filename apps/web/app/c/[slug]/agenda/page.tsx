'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, Users, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Session = {
  id: string
  title: string
  description: string | null
  session_type: string
  start_time: string
  end_time: string
  is_featured: boolean
  room: { name: string } | null
  track: { name: string; color: string | null } | null
  speakers: Array<{
    user: { id: string; full_name: string; avatar_url: string | null } | null
  }>
}

type Track = {
  id: string
  name: string
  color: string | null
}

export default function PublicAgendaPage({
  params,
}: {
  params: { slug: string }
}) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [savedSessions, setSavedSessions] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const [savingSession, setSavingSession] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadData() {
      // Get conference
      const { data: conference } = await supabase
        .from('conferences')
        .select('id')
        .eq('slug', params.slug)
        .eq('is_public', true)
        .single()

      if (!conference) return

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)

      // Get sessions
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select(`
          id,
          title,
          description,
          session_type,
          start_time,
          end_time,
          is_featured,
          room:rooms(name),
          track:tracks(name, color),
          speakers:session_speakers(
            user:profiles(id, full_name, avatar_url)
          )
        `)
        .eq('conference_id', conference.id)
        .order('start_time', { ascending: true })

      // Get tracks
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('id, name, color')
        .eq('conference_id', conference.id)
        .order('sort_order')

      // Get saved sessions if logged in
      if (user) {
        const { data: saved } = await supabase
          .from('saved_sessions')
          .select('session_id')
          .eq('user_id', user.id)

        if (saved) {
          setSavedSessions(new Set(saved.map((s) => s.session_id)))
        }
      }

      setSessions(sessionsData || [])
      setTracks(tracksData || [])
      setIsLoading(false)

      // Set initial selected day
      if (sessionsData && sessionsData.length > 0) {
        const firstDay = new Date(sessionsData[0].start_time).toDateString()
        setSelectedDay(firstDay)
      }
    }

    loadData()
  }, [params.slug, supabase])

  const toggleSaveSession = async (sessionId: string) => {
    if (!userId) {
      // Redirect to login
      window.location.href = `/login?redirect=/c/${params.slug}/agenda`
      return
    }

    setSavingSession(sessionId)

    if (savedSessions.has(sessionId)) {
      // Remove from saved
      await supabase
        .from('saved_sessions')
        .delete()
        .eq('user_id', userId)
        .eq('session_id', sessionId)

      setSavedSessions((prev) => {
        const next = new Set(prev)
        next.delete(sessionId)
        return next
      })
    } else {
      // Add to saved
      await supabase.from('saved_sessions').insert({
        user_id: userId,
        session_id: sessionId,
      })

      setSavedSessions((prev) => new Set(prev).add(sessionId))
    }

    setSavingSession(null)
  }

  // Get unique days
  const days = Array.from(
    new Set(sessions.map((s) => new Date(s.start_time).toDateString()))
  )

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const sessionDay = new Date(session.start_time).toDateString()
    if (selectedDay && sessionDay !== selectedDay) return false
    if (selectedTrack && session.track?.name !== selectedTrack) return false
    return true
  })

  // Group by time slot
  const groupedSessions = filteredSessions.reduce(
    (acc, session) => {
      const timeKey = new Date(session.start_time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
      if (!acc[timeKey]) acc[timeKey] = []
      acc[timeKey].push(session)
      return acc
    },
    {} as Record<string, Session[]>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Agenda</h2>
        <p className="text-muted-foreground">Browse sessions and build your schedule</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Day selector */}
        <div className="flex gap-2">
          {days.map((day) => {
            const date = new Date(day)
            return (
              <Button
                key={day}
                variant={selectedDay === day ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDay(day)}
              >
                {date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Button>
            )
          })}
        </div>

        {/* Track filter */}
        {tracks.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant={selectedTrack === null ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTrack(null)}
            >
              All Tracks
            </Button>
            {tracks.map((track) => (
              <Button
                key={track.id}
                variant={selectedTrack === track.name ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTrack(track.name)}
                className="gap-2"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: track.color || '#2563eb' }}
                />
                {track.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Sessions */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No sessions found for the selected filters.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSessions).map(([time, timeSessions]) => (
            <div key={time} className="space-y-3">
              <h3 className="text-lg font-semibold text-muted-foreground">{time}</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {timeSessions.map((session) => {
                  const endTime = new Date(session.end_time)
                  const isSaved = savedSessions.has(session.id)
                  const isSaving = savingSession === session.id

                  return (
                    <Card
                      key={session.id}
                      className={cn(
                        'overflow-hidden transition-all',
                        isSaved && 'ring-2 ring-primary'
                      )}
                    >
                      {session.track && (
                        <div
                          className="h-1"
                          style={{ backgroundColor: session.track.color || '#2563eb' }}
                        />
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                {session.session_type}
                              </span>
                              {session.is_featured && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                                  Featured
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold mb-1">{session.title}</h4>
                            {session.track && (
                              <p className="text-xs text-muted-foreground mb-2">
                                {session.track.name}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            onClick={() => toggleSaveSession(session.id)}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isSaved ? (
                              <BookmarkCheck className="h-4 w-4 text-primary" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {session.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {session.description}
                          </p>
                        )}

                        {/* Speakers */}
                        {session.speakers && session.speakers.length > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {session.speakers
                                .map((s) => s.user?.full_name)
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              until{' '}
                              {endTime.toLocaleTimeString('en-US', {
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
