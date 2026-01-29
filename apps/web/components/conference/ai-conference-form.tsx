'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, X, MessageCircle, Loader2, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface AIGenerationResult {
  name?: string
  tagline?: string
  description?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// AI Button component for individual field generation
function AIButton({
  onClick,
  isLoading,
  label = 'Generate with AI',
}: {
  onClick: () => void
  isLoading?: boolean
  label?: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="gap-1.5 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      {label}
    </Button>
  )
}

// Floating AI Chat Assistant
function AIChatAssistant({
  isOpen,
  onClose,
  onApplySuggestion,
}: {
  isOpen: boolean
  onClose: () => void
  onApplySuggestion: (suggestion: AIGenerationResult) => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI conference planning assistant. Tell me about the conference you want to create, and I'll help you with names, descriptions, track ideas, and more. What kind of conference are you planning?",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          previousMessages: messages,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.content },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-white rounded-xl shadow-2xl border flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">AI Conference Assistant</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your conference..."
            className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-gray-500 text-center">
          AI can help with naming, descriptions, track ideas, and more
        </p>
      </div>
    </div>
  )
}

// Main form component with AI enhancement
export function AIConferenceForm({
  children,
  action,
}: {
  children: React.ReactNode
  action: (formData: FormData) => Promise<void>
}) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingField, setGeneratingField] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Generate conference details with AI
  const generateConferenceDetails = async () => {
    setIsGenerating(true)
    setGeneratingField('details')

    // Get current form values for context
    const form = formRef.current
    if (!form) return

    const formData = new FormData(form)
    const currentName = formData.get('name') as string

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'conference_details',
          context: {
            topic: currentName || 'technology conference',
            audience: 'professionals and enthusiasts',
          },
        }),
      })

      if (!response.ok) throw new Error('Generation failed')

      const data = await response.json()
      const content = data.content

      // Fill in the form fields
      const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement
      const taglineInput = form.querySelector('input[name="tagline"]') as HTMLInputElement
      const descInput = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement

      if (content.name && nameInput && !nameInput.value) {
        nameInput.value = content.name
      }
      if (content.tagline && taglineInput) {
        taglineInput.value = content.tagline
      }
      if (content.description && descInput) {
        descInput.value = content.description
      }
    } catch (error) {
      console.error('AI generation error:', error)
    } finally {
      setIsGenerating(false)
      setGeneratingField(null)
    }
  }

  const handleApplySuggestion = (suggestion: AIGenerationResult) => {
    const form = formRef.current
    if (!form) return

    if (suggestion.name) {
      const input = form.querySelector('input[name="name"]') as HTMLInputElement
      if (input) input.value = suggestion.name
    }
    if (suggestion.tagline) {
      const input = form.querySelector('input[name="tagline"]') as HTMLInputElement
      if (input) input.value = suggestion.tagline
    }
    if (suggestion.description) {
      const textarea = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement
      if (textarea) textarea.value = suggestion.description
    }
  }

  return (
    <>
      <form ref={formRef} action={action} className="space-y-8">
        {/* AI Helper Banner */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Conference Builder</h3>
                  <p className="text-sm text-gray-600">
                    Let AI help you create your conference details, or chat for personalized suggestions
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsChatOpen(true)}
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat with AI
                </Button>
                <Button
                  type="button"
                  onClick={generateConferenceDetails}
                  disabled={isGenerating}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  Generate All Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conference Details Card with AI Buttons */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Conference Details</CardTitle>
                <CardDescription>
                  Basic information attendees will see in the app.
                </CardDescription>
              </div>
              <AIButton
                onClick={generateConferenceDetails}
                isLoading={generatingField === 'details'}
                label="Auto-fill with AI"
              />
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Conference name</label>
              </div>
              <input
                name="name"
                required
                placeholder="e.g., Future of Work Summit"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <input
                name="slug"
                placeholder="auto-generated if left blank"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tagline</label>
              <input
                name="tagline"
                placeholder="Short one-line summary"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Describe the conference focus and audience"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dates & Location</CardTitle>
            <CardDescription>
              Keep dates and venue information up to date for attendees.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start date</label>
              <input
                name="start_date"
                type="date"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End date</label>
              <input
                name="end_date"
                type="date"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <input
                name="timezone"
                defaultValue="UTC"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Venue name</label>
              <input
                name="venue_name"
                placeholder="Venue or city"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Venue address</label>
              <input
                name="venue_address"
                placeholder="Street address"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding & Settings</CardTitle>
            <CardDescription>
              Customize the public-facing experience and registration behavior.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary color</label>
              <input
                name="primary_color"
                type="color"
                defaultValue="#2563eb"
                className="h-10 w-full rounded-md border border-input bg-background px-2 py-1"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secondary color</label>
              <input
                name="secondary_color"
                type="color"
                defaultValue="#8b5cf6"
                className="h-10 w-full rounded-md border border-input bg-background px-2 py-1"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Website URL</label>
              <input
                name="website_url"
                placeholder="https://"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="is_public" defaultChecked />
                Public listing
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="is_hybrid" />
                Hybrid event
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="registration_open" defaultChecked />
                Registration open
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max attendees</label>
              <input
                name="max_attendees"
                type="number"
                min="0"
                placeholder="Optional capacity"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {children}
      </form>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* AI Chat Assistant */}
      <AIChatAssistant
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onApplySuggestion={handleApplySuggestion}
      />
    </>
  )
}
