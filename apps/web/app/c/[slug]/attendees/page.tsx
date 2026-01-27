'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Loader2,
  UserPlus,
  Check,
  Clock,
  MessageSquare,
  Linkedin,
  Twitter,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Attendee = {
  user_id: string
  role: string
  profile: {
    id: string
    full_name: string | null
    avatar_url: string | null
    company: string | null
    job_title: string | null
    bio: string | null
    interests: string[] | null
    linkedin_url: string | null
    twitter_url: string | null
    networking_enabled: boolean
  } | null
}

type Connection = {
  id: string
  requester_id: string
  recipient_id: string
  status: 'pending' | 'accepted' | 'declined'
}

export default function AttendeesPage({
  params,
}: {
  params: { slug: string }
}) {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [sendingRequest, setSendingRequest] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadData() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      // Get conference
      const { data: conference } = await supabase
        .from('conferences')
        .select('id')
        .eq('slug', params.slug)
        .eq('is_public', true)
        .single()

      if (!conference) {
        setIsLoading(false)
        return
      }

      // Get attendees
      const { data: members } = await supabase
        .from('conference_members')
        .select(`
          user_id,
          role,
          profile:profiles(
            id,
            full_name,
            avatar_url,
            company,
            job_title,
            bio,
            interests,
            linkedin_url,
            twitter_url,
            networking_enabled
          )
        `)
        .eq('conference_id', conference.id)

      // Get user's connections
      if (user) {
        const { data: userConnections } = await supabase
          .from('connections')
          .select('id, requester_id, recipient_id, status')
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)

        setConnections(userConnections || [])
      }

      // Filter to only show attendees with networking enabled
      const networkingAttendees = (members || []).filter(
        (m) => m.profile?.networking_enabled !== false && m.user_id !== user?.id
      )

      setAttendees(networkingAttendees)
      setIsLoading(false)
    }

    loadData()
  }, [params.slug, supabase])

  const getConnectionStatus = (attendeeId: string) => {
    const connection = connections.find(
      (c) =>
        (c.requester_id === currentUserId && c.recipient_id === attendeeId) ||
        (c.recipient_id === currentUserId && c.requester_id === attendeeId)
    )

    if (!connection) return null
    if (connection.status === 'accepted') return 'connected'
    if (connection.requester_id === currentUserId) return 'pending-sent'
    return 'pending-received'
  }

  const sendConnectionRequest = async (recipientId: string) => {
    if (!currentUserId) {
      window.location.href = `/login?redirect=/c/${params.slug}/attendees`
      return
    }

    setSendingRequest(recipientId)

    const { data, error } = await supabase
      .from('connections')
      .insert({
        requester_id: currentUserId,
        recipient_id: recipientId,
        status: 'pending',
      })
      .select()
      .single()

    if (!error && data) {
      setConnections((prev) => [...prev, data])
    }

    setSendingRequest(null)
  }

  const acceptConnection = async (connectionId: string) => {
    const { error } = await supabase
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', connectionId)

    if (!error) {
      setConnections((prev) =>
        prev.map((c) => (c.id === connectionId ? { ...c, status: 'accepted' } : c))
      )
    }
  }

  // Filter attendees by search
  const filteredAttendees = attendees.filter((attendee) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    const profile = attendee.profile

    return (
      profile?.full_name?.toLowerCase().includes(query) ||
      profile?.company?.toLowerCase().includes(query) ||
      profile?.job_title?.toLowerCase().includes(query) ||
      profile?.interests?.some((i) => i.toLowerCase().includes(query))
    )
  })

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
        <h2 className="text-2xl font-bold">Attendees</h2>
        <p className="text-muted-foreground">
          Connect with other attendees at this conference
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, company, or interests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Attendee grid */}
      {filteredAttendees.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? 'No attendees found matching your search.' : 'No attendees to display.'}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAttendees.map((attendee) => {
            const profile = attendee.profile
            if (!profile) return null

            const connectionStatus = getConnectionStatus(attendee.user_id)
            const connection = connections.find(
              (c) =>
                (c.requester_id === currentUserId && c.recipient_id === attendee.user_id) ||
                (c.recipient_id === currentUserId && c.requester_id === attendee.user_id)
            )

            return (
              <Card key={attendee.user_id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden bg-muted">
                      {profile.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt={profile.full_name || 'Attendee'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-muted-foreground">
                          {profile.full_name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{profile.full_name || 'Anonymous'}</h3>
                      {profile.job_title && (
                        <p className="text-sm text-muted-foreground truncate">
                          {profile.job_title}
                        </p>
                      )}
                      {profile.company && (
                        <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {profile.company}
                        </p>
                      )}

                      {/* Role badge */}
                      {attendee.role !== 'attendee' && (
                        <span
                          className={cn(
                            'inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium',
                            attendee.role === 'speaker' && 'bg-blue-100 text-blue-700',
                            attendee.role === 'organizer' && 'bg-purple-100 text-purple-700',
                            attendee.role === 'sponsor' && 'bg-green-100 text-green-700'
                          )}
                        >
                          {attendee.role}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {profile.bio}
                    </p>
                  )}

                  {/* Interests */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {profile.interests.slice(0, 3).map((interest, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                        >
                          {interest}
                        </span>
                      ))}
                      {profile.interests.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{profile.interests.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2">
                    {connectionStatus === 'connected' ? (
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        <Check className="mr-2 h-4 w-4 text-green-600" />
                        Connected
                      </Button>
                    ) : connectionStatus === 'pending-sent' ? (
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        <Clock className="mr-2 h-4 w-4" />
                        Request Sent
                      </Button>
                    ) : connectionStatus === 'pending-received' ? (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => connection && acceptConnection(connection.id)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => sendConnectionRequest(attendee.user_id)}
                        disabled={sendingRequest === attendee.user_id}
                      >
                        {sendingRequest === attendee.user_id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus className="mr-2 h-4 w-4" />
                        )}
                        Connect
                      </Button>
                    )}

                    {/* Social links */}
                    <div className="flex gap-1">
                      {profile.linkedin_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {profile.twitter_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={profile.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Twitter className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
