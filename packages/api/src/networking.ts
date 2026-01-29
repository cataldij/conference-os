// @ts-nocheck
// TODO: Fix Supabase type inference issues
import { getSupabase, Profile, Connection } from './client'

// Extended profile with connection status
export interface AttendeeProfile extends Profile {
  connectionStatus?: 'none' | 'pending_sent' | 'pending_received' | 'connected'
  connectionId?: string
}

// Connection with profile info
export interface ConnectionWithProfile extends Connection {
  profile: Profile
}

// Get attendees for a conference (excluding self)
export async function getConferenceAttendees(
  conferenceId: string,
  options?: {
    limit?: number
    offset?: number
    searchQuery?: string
  }
): Promise<AttendeeProfile[]> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Get all conference members with their profiles
  let query = supabase
    .from('conference_members')
    .select(`
      user_id,
      role,
      profile:profiles(*)
    `)
    .eq('conference_id', conferenceId)
    .neq('user_id', user.id)

  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }

  const { data: members, error } = await query

  if (error) throw error
  if (!members) return []

  // Get user's connections to determine status
  const { data: connections } = await supabase
    .from('connections')
    .select('*')
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)

  const connectionMap = new Map<string, { status: string; id: string; isRequester: boolean }>()
  connections?.forEach(conn => {
    const otherUserId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id
    connectionMap.set(otherUserId, {
      status: conn.status,
      id: conn.id,
      isRequester: conn.requester_id === user.id,
    })
  })

  // Map to attendee profiles with connection status
  const attendees: AttendeeProfile[] = members
    .filter(m => m.profile)
    .map(m => {
      const profile = m.profile as Profile
      const connection = connectionMap.get(profile.id)

      let connectionStatus: AttendeeProfile['connectionStatus'] = 'none'
      if (connection) {
        if (connection.status === 'accepted') {
          connectionStatus = 'connected'
        } else if (connection.status === 'pending') {
          connectionStatus = connection.isRequester ? 'pending_sent' : 'pending_received'
        }
      }

      return {
        ...profile,
        connectionStatus,
        connectionId: connection?.id,
      }
    })

  // Filter by search query if provided
  if (options?.searchQuery) {
    const query = options.searchQuery.toLowerCase()
    return attendees.filter(a =>
      a.full_name?.toLowerCase().includes(query) ||
      a.company?.toLowerCase().includes(query) ||
      a.job_title?.toLowerCase().includes(query)
    )
  }

  return attendees
}

// Get user's connections
export async function getUserConnections(
  status?: 'pending' | 'accepted' | 'all'
): Promise<ConnectionWithProfile[]> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('connections')
    .select('*')
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: connections, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  if (!connections) return []

  // Get all unique user IDs (the other person in each connection)
  const otherUserIds = connections.map(c =>
    c.requester_id === user.id ? c.recipient_id : c.requester_id
  )

  // Fetch profiles for these users
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', otherUserIds)

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

  return connections.map(conn => {
    const otherUserId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id
    return {
      ...conn,
      profile: profileMap.get(otherUserId) as Profile,
    }
  }).filter(c => c.profile)
}

// Get pending connection requests (received by user)
export async function getPendingConnectionRequests(): Promise<ConnectionWithProfile[]> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: connections, error } = await supabase
    .from('connections')
    .select('*')
    .eq('recipient_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!connections) return []

  // Fetch requester profiles
  const requesterIds = connections.map(c => c.requester_id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', requesterIds)

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

  return connections.map(conn => ({
    ...conn,
    profile: profileMap.get(conn.requester_id) as Profile,
  })).filter(c => c.profile)
}

// Send connection request
export async function sendConnectionRequest(
  recipientId: string,
  conferenceId?: string,
  notes?: string
): Promise<Connection> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Check if connection already exists
  const { data: existing } = await supabase
    .from('connections')
    .select('*')
    .or(`and(requester_id.eq.${user.id},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${user.id})`)
    .single()

  if (existing) {
    throw new Error('Connection already exists')
  }

  const { data, error } = await supabase
    .from('connections')
    .insert({
      requester_id: user.id,
      recipient_id: recipientId,
      status: 'pending',
      met_at_conference_id: conferenceId,
      notes,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Respond to connection request
export async function respondToConnectionRequest(
  connectionId: string,
  accept: boolean
): Promise<Connection> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Verify user is the recipient
  const { data: connection } = await supabase
    .from('connections')
    .select('*')
    .eq('id', connectionId)
    .eq('recipient_id', user.id)
    .single()

  if (!connection) {
    throw new Error('Connection request not found')
  }

  const { data, error } = await supabase
    .from('connections')
    .update({
      status: accept ? 'accepted' : 'declined',
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectionId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Remove connection
export async function removeConnection(connectionId: string): Promise<void> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('id', connectionId)
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)

  if (error) throw error
}

// Get connection stats for a user
export async function getConnectionStats(): Promise<{
  totalConnections: number
  pendingReceived: number
  pendingSent: number
}> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: connections } = await supabase
    .from('connections')
    .select('status, requester_id, recipient_id')
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)

  if (!connections) {
    return { totalConnections: 0, pendingReceived: 0, pendingSent: 0 }
  }

  let totalConnections = 0
  let pendingReceived = 0
  let pendingSent = 0

  connections.forEach(conn => {
    if (conn.status === 'accepted') {
      totalConnections++
    } else if (conn.status === 'pending') {
      if (conn.recipient_id === user.id) {
        pendingReceived++
      } else {
        pendingSent++
      }
    }
  })

  return { totalConnections, pendingReceived, pendingSent }
}
