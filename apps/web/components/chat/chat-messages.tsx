'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat, usePresence, type Message } from '@/lib/hooks/use-chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessagesProps {
  roomId: string | null
  roomName: string
  currentUserId: string
}

export function ChatMessages({
  roomId,
  roomName,
  currentUserId,
}: ChatMessagesProps) {
  const { messages, isLoading, error, sendMessage } = useChat(roomId)
  const { onlineUsers } = usePresence(roomId, currentUserId)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const { error } = await sendMessage(newMessage)
    setIsSending(false)

    if (!error) {
      setNewMessage('')
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!roomId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a channel to start chatting
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-destructive">
        Error loading messages: {error}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="font-semibold"># {roomName}</h2>
          <p className="text-xs text-muted-foreground">
            {onlineUsers.length} online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.sender_id === currentUserId
            const showAvatar =
              index === 0 ||
              messages[index - 1].sender_id !== message.sender_id

            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  isOwnMessage && 'flex-row-reverse'
                )}
              >
                {showAvatar ? (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.sender?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {getInitials(message.sender?.full_name || null)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8 flex-shrink-0" />
                )}

                <div
                  className={cn(
                    'flex flex-col max-w-[70%]',
                    isOwnMessage && 'items-end'
                  )}
                >
                  {showAvatar && (
                    <div
                      className={cn(
                        'flex items-center gap-2 mb-1',
                        isOwnMessage && 'flex-row-reverse'
                      )}
                    >
                      <span className="text-sm font-medium">
                        {message.sender?.full_name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm',
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <Input
            placeholder={`Message #${roomName}`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
