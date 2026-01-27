'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, Calendar, MapPin, Users, AlertCircle } from 'lucide-react'

type Conference = {
  id: string
  name: string
  tagline: string | null
  start_date: string
  end_date: string
  venue_name: string | null
  registration_open: boolean
  max_attendees: number | null
}

export default function RegisterPage({
  params,
}: {
  params: { slug: string }
}) {
  const router = useRouter()
  const [conference, setConference] = useState<Conference | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [attendeeCount, setAttendeeCount] = useState(0)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadData() {
      // Get conference
      const { data: conf } = await supabase
        .from('conferences')
        .select('id, name, tagline, start_date, end_date, venue_name, registration_open, max_attendees')
        .eq('slug', params.slug)
        .eq('is_public', true)
        .single()

      if (!conf) {
        setIsLoading(false)
        return
      }

      setConference(conf)

      // Get attendee count
      const { count } = await supabase
        .from('conference_members')
        .select('*', { count: 'exact', head: true })
        .eq('conference_id', conf.id)

      setAttendeeCount(count || 0)

      // Check if user is logged in
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email || '' })

        // Check if already registered
        const { data: membership } = await supabase
          .from('conference_members')
          .select('id')
          .eq('conference_id', conf.id)
          .eq('user_id', authUser.id)
          .single()

        if (membership) {
          setIsRegistered(true)
        }
      }

      setIsLoading(false)
    }

    loadData()
  }, [params.slug, supabase])

  const handleRegister = async () => {
    if (!user || !conference) return

    setIsRegistering(true)
    setError(null)

    try {
      // Generate a ticket code
      const ticketCode = `${params.slug.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

      const { error: insertError } = await supabase.from('conference_members').insert({
        conference_id: conference.id,
        user_id: user.id,
        role: 'attendee',
        ticket_type: 'general',
        ticket_code: ticketCode,
      })

      if (insertError) {
        if (insertError.code === '23505') {
          setError('You are already registered for this conference.')
        } else {
          throw insertError
        }
      } else {
        setIsRegistered(true)
        setAttendeeCount((prev) => prev + 1)
      }
    } catch (err) {
      setError('Failed to register. Please try again.')
      console.error(err)
    } finally {
      setIsRegistering(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!conference) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Conference not found</h2>
        <p className="text-muted-foreground mt-2">
          This conference may not exist or is not accepting public registration.
        </p>
      </div>
    )
  }

  const startDate = new Date(conference.start_date)
  const endDate = new Date(conference.end_date)
  const isFull = conference.max_attendees && attendeeCount >= conference.max_attendees

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isRegistered ? 'You\'re Registered!' : 'Register for ' + conference.name}
          </CardTitle>
          <CardDescription>
            {conference.tagline || 'Join us for this exciting event'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event details */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>
                {startDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {startDate.toDateString() !== endDate.toDateString() && (
                  <>
                    {' - '}
                    {endDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </>
                )}
              </span>
            </div>
            {conference.venue_name && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{conference.venue_name}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>
                {attendeeCount} registered
                {conference.max_attendees && ` / ${conference.max_attendees} spots`}
              </span>
            </div>
          </div>

          {/* Registration status */}
          {isRegistered ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Registration confirmed!</p>
                <p className="text-sm text-muted-foreground">
                  Check your email for your ticket and event details.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href={`/c/${params.slug}/agenda`}>Browse Agenda</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </div>
          ) : !conference.registration_open ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">Registration is closed</p>
                <p className="text-sm text-muted-foreground">
                  Registration for this conference is not currently open.
                </p>
              </div>
            </div>
          ) : isFull ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">Conference is full</p>
                <p className="text-sm text-muted-foreground">
                  Unfortunately, this conference has reached its maximum capacity.
                </p>
              </div>
            </div>
          ) : !user ? (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Sign in or create an account to register for this conference.
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href={`/login?redirect=/c/${params.slug}/register`}>
                    Sign In
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/register?redirect=/c/${params.slug}/register`}>
                    Create Account
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Registering as:</p>
                <p className="font-medium">{user.email}</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleRegister}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By registering, you agree to receive event-related communications.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
