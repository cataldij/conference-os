// @ts-nocheck
// TODO: Fix Supabase type inference issues
import { getSupabase, Profile, Message } from './client'

// Chat room with additional info
export interface ChatRoom {
  id: string
  conference_id: string | null
  session_id: string | null
  name: string | null
  room_type: 'conference' | 'session' | 'direct' | 'group'
  is_public: boolean
  created_at: string
}

// Chat room with last message and other user info (for list view)
export interface ChatRoomWithDetails extends ChatRoom {
  lastMessage?: {
    content: string
    created_at: string
    sender_id: string
  }
  unreadCount: number
  otherParticipants: Profile[]
}

// Message with sender info
export interface MessageWithSender extends Message {
  sender: Profile
}

// Get or create a direct chat room between two users
export async function getOrCreateDirectChat(
  otherUserId: string,
  conferenceId?: string
): Promise<ChatRoom> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Look for existing direct chat between these users
  const { data: existingRooms } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      members:chat_room_members(user_id)
    `)
    .eq('room_type', 'direct')

  // Find a room where both users are members
  const existingRoom = existingRooms?.find(room => {
    const memberIds = room.members?.map((m: any) => m.user_id) || []
    return memberIds.includes(user.id) && memberIds.includes(otherUserId) && memberIds.length === 2
  })

  if (existingRoom) {
    return existingRoom as ChatRoom
  }

  // Create new direct chat room
  const { data: newRoom, error: roomError } = await supabase
    .from('chat_rooms')
    .insert({
      room_type: 'direct',
      conference_id: conferenceId,
      is_public: false,
    })
    .select()
    .single()

  if (roomError) throw roomError

  // Add both users as members
  const { error: memberError } = await supabase
    .from('chat_room_members')
    .insert([
      { room_id: newRoom.id, user_id: user.id },
      { room_id: newRoom.id, user_id: otherUserId },
    ])

  if (memberError) throw memberError

  return newRoom
}

// Get user's chat rooms with last message
export async function getUserChatRooms(): Promise<ChatRoomWithDetails[]> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Get rooms user is a member of
  const { data: memberships, error: memberError } = await supabase
    .from('chat_room_members')
    .select(`
      room_id,
      last_read_at,
      room:chat_rooms(*)
    `)
    .eq('user_id', user.id)

  if (memberError) throw memberError
  if (!memberships) return []

  const roomIds = memberships.map(m => m.room_id)

  // Get last message for each room
  const { data: lastMessages } = await supabase
    .from('messages')
    .select('room_id, content, created_at, sender_id')
    .in('room_id', roomIds)
    .order('created_at', { ascending: false })

  // Get unread counts
  const lastMessageMap = new Map<string, any>()
  lastMessages?.forEach(msg => {
    if (!lastMessageMap.has(msg.room_id)) {
      lastMessageMap.set(msg.room_id, msg)
    }
  })

  // Get other participants for direct chats
  const { data: allMembers } = await supabase
    .from('chat_room_members')
    .select(`
      room_id,
      user_id,
      profile:profiles(*)
    `)
    .in('room_id', roomIds)

  const participantsMap = new Map<string, Profile[]>()
  allMembers?.forEach(member => {
    if (member.user_id !== user.id && member.profile) {
      const existing = participantsMap.get(member.room_id) || []
      existing.push(member.profile as Profile)
      participantsMap.set(member.room_id, existing)
    }
  })

  // Build result
  const result: ChatRoomWithDetails[] = memberships.map(membership => {
    const room = membership.room as ChatRoom
    const lastMessage = lastMessageMap.get(room.id)
    const lastReadAt = membership.last_read_at ? new Date(membership.last_read_at) : new Date(0)

    // Count unread messages
    let unreadCount = 0
    lastMessages?.forEach(msg => {
      if (msg.room_id === room.id &&
          new Date(msg.created_at) > lastReadAt &&
          msg.sender_id !== user.id) {
        unreadCount++
      }
    })

    return {
      ...room,
      lastMessage: lastMessage ? {
        content: lastMessage.content,
        created_at: lastMessage.created_at,
        sender_id: lastMessage.sender_id,
      } : undefined,
      unreadCount,
      otherParticipants: participantsMap.get(room.id) || [],
    }
  })

  // Sort by last message time
  result.sort((a, b) => {
    const aTime = a.lastMessage?.created_at || a.created_at
    const bTime = b.lastMessage?.created_at || b.created_at
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })

  return result
}

// Get messages for a room
export async function getRoomMessages(
  roomId: string,
  options?: { limit?: number; before?: string }
): Promise<MessageWithSender[]> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  let query = supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!sender_id(*)
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(options?.limit || 50)

  if (options?.before) {
    query = query.lt('created_at', options.before)
  }

  const { data, error } = await query

  if (error) throw error

  // Reverse to get oldest first for display
  return (data || []).reverse().map(msg => ({
    ...msg,
    sender: msg.sender as Profile,
  }))
}

// Send a message
export async function sendMessage(
  roomId: string,
  content: string,
  messageType: 'text' | 'image' | 'file' = 'text',
  metadata?: Record<string, any>
): Promise<Message> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('messages')
    .insert({
      room_id: roomId,
      sender_id: user.id,
      content,
      message_type: messageType,
      metadata: metadata || {},
    })
    .select()
    .single()

  if (error) throw error

  // Update last_read_at for sender
  await supabase
    .from('chat_room_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', user.id)

  return data
}

// Mark room as read
export async function markRoomAsRead(roomId: string): Promise<void> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('chat_room_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', user.id)

  if (error) throw error
}

// Subscribe to new messages in a room (returns unsubscribe function)
export function subscribeToRoomMessages(
  roomId: string,
  onMessage: (message: Message) => void
): () => void {
  const supabase = getSupabase()

  const subscription = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        onMessage(payload.new as Message)
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

// Subscribe to user's chat list updates
export function subscribeToUserChats(
  userId: string,
  onUpdate: () => void
): () => void {
  const supabase = getSupabase()

  const subscription = supabase
    .channel(`user-chats:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
      },
      () => {
        onUpdate()
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

// Get room details by ID
export async function getChatRoom(roomId: string): Promise<ChatRoomWithDetails | null> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data: room, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  // Get other participants
  const { data: members } = await supabase
    .from('chat_room_members')
    .select(`
      user_id,
      profile:profiles(*)
    `)
    .eq('room_id', roomId)

  const otherParticipants = members
    ?.filter(m => m.user_id !== user.id)
    .map(m => m.profile as Profile) || []

  return {
    ...room,
    unreadCount: 0,
    otherParticipants,
  }
}
