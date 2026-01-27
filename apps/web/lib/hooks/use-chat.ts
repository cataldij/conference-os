'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Message {
  id: string
  room_id: string
  sender_id: string
  content: string
  message_type: string
  metadata: Record<string, any>
  created_at: string
  sender?: {
    id: string
    full_name: string
    avatar_url: string
  }
}

export interface ChatRoom {
  id: string
  conference_id: string
  session_id: string | null
  name: string
  room_type: string
  is_public: boolean
  created_at: string
}

export function useChat(roomId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch initial messages
  useEffect(() => {
    if (!roomId) {
      setMessages([])
      setIsLoading(false)
      return
    }

    async function fetchMessages() {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (error) {
        console.error('Error fetching messages:', error)
        setError(error.message)
      } else {
        setMessages(data || [])
      }
      setIsLoading(false)
    }

    fetchMessages()
  }, [roomId, supabase])

  // Subscribe to realtime messages
  useEffect(() => {
    if (!roomId) return

    const channel: RealtimeChannel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Fetch the sender profile for the new message
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single()

          const newMessage: Message = {
            ...payload.new as Message,
            sender: sender || undefined,
          }

          setMessages((prev) => [...prev, newMessage])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, supabase])

  // Send a message
  const sendMessage = useCallback(
    async (content: string, messageType: string = 'text') => {
      if (!roomId || !content.trim()) return { error: 'Invalid message' }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return { error: 'Not authenticated' }

      const { error } = await supabase.from('messages').insert({
        room_id: roomId,
        sender_id: user.id,
        content: content.trim(),
        message_type: messageType,
      })

      if (error) {
        console.error('Error sending message:', error)
        return { error: error.message }
      }

      return { error: null }
    },
    [roomId, supabase]
  )

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  }
}

export function useChatRooms(conferenceId: string | null) {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!conferenceId) {
      setRooms([])
      setIsLoading(false)
      return
    }

    async function fetchRooms() {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('conference_id', conferenceId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching chat rooms:', error)
      } else {
        setRooms(data || [])
      }
      setIsLoading(false)
    }

    fetchRooms()
  }, [conferenceId, supabase])

  const createRoom = useCallback(
    async (name: string, roomType: string = 'group', isPublic: boolean = true) => {
      if (!conferenceId) return { error: 'No conference selected' }

      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          conference_id: conferenceId,
          name,
          room_type: roomType,
          is_public: isPublic,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating room:', error)
        return { data: null, error: error.message }
      }

      setRooms((prev) => [...prev, data])
      return { data, error: null }
    },
    [conferenceId, supabase]
  )

  return {
    rooms,
    isLoading,
    createRoom,
  }
}

export function usePresence(roomId: string | null, userId: string | null) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!roomId || !userId) return

    const channel = supabase.channel(`presence:${roomId}`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state)
          .flat()
          .map((p: any) => p.user_id)
        setOnlineUsers([...new Set(users)])
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, userId, supabase])

  return { onlineUsers }
}
