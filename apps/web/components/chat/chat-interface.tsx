'use client'

import { useState, useEffect } from 'react'
import { ChatRoomList } from './chat-room-list'
import { ChatMessages } from './chat-messages'
import { createClient } from '@/lib/supabase/client'

interface ChatInterfaceProps {
  conferenceId: string
  conferenceName: string
  initialRooms: Array<{ id: string; name: string; room_type: string }>
}

export function ChatInterface({
  conferenceId,
  conferenceName,
  initialRooms,
}: ChatInterfaceProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    initialRooms[0]?.id || null
  )
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    getUser()
  }, [supabase])

  const selectedRoom = initialRooms.find((r) => r.id === selectedRoomId)

  return (
    <div className="flex h-[calc(100vh-12rem)] border rounded-lg overflow-hidden">
      {/* Sidebar - Room List */}
      <div className="w-64 border-r bg-muted/30 flex-shrink-0">
        <ChatRoomList
          conferenceId={conferenceId}
          selectedRoomId={selectedRoomId}
          onSelectRoom={setSelectedRoomId}
        />
      </div>

      {/* Main - Messages */}
      <div className="flex-1 flex flex-col">
        {currentUserId ? (
          <ChatMessages
            roomId={selectedRoomId}
            roomName={selectedRoom?.name || 'general'}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        )}
      </div>
    </div>
  )
}
