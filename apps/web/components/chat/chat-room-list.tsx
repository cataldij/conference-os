'use client'

import { useState } from 'react'
import { useChatRooms, type ChatRoom } from '@/lib/hooks/use-chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Hash, Plus, Users, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatRoomListProps {
  conferenceId: string
  selectedRoomId: string | null
  onSelectRoom: (roomId: string) => void
}

export function ChatRoomList({
  conferenceId,
  selectedRoomId,
  onSelectRoom,
}: ChatRoomListProps) {
  const { rooms, isLoading, createRoom } = useChatRooms(conferenceId)
  const [newRoomName, setNewRoomName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return

    setIsCreating(true)
    const { data, error } = await createRoom(newRoomName.trim(), 'group', true)
    setIsCreating(false)

    if (!error && data) {
      setNewRoomName('')
      setDialogOpen(false)
      onSelectRoom(data.id)
    }
  }

  const getRoomIcon = (roomType: string) => {
    switch (roomType) {
      case 'direct':
        return <Users className="h-4 w-4" />
      case 'session':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Hash className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 bg-muted animate-pulse rounded-md"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Channels
          </h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Channel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Channel name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                />
                <Button
                  onClick={handleCreateRoom}
                  disabled={isCreating || !newRoomName.trim()}
                  className="w-full"
                >
                  {isCreating ? 'Creating...' : 'Create Channel'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {rooms.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No channels yet.
            <br />
            Create one to start chatting!
          </div>
        ) : (
          rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                'hover:bg-muted',
                selectedRoomId === room.id
                  ? 'bg-muted font-medium'
                  : 'text-muted-foreground'
              )}
            >
              {getRoomIcon(room.room_type)}
              <span className="truncate">{room.name || 'Unnamed Channel'}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
