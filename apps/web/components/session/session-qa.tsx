'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  ChevronUp,
  Send,
  Loader2,
  MessageCircleQuestion,
  CheckCircle,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Question = {
  id: string
  user_id: string
  question: string
  is_anonymous: boolean
  upvotes: number
  is_answered: boolean
  is_featured: boolean
  created_at: string
  user?: {
    full_name: string | null
    avatar_url: string | null
  }
}

interface SessionQAProps {
  sessionId: string
  isOrganizer?: boolean
}

export function SessionQA({ sessionId, isOrganizer = false }: SessionQAProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set())
  const [upvoting, setUpvoting] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadQuestions = useCallback(async () => {
    const { data } = await supabase
      .from('qa_questions')
      .select(`
        *,
        user:profiles(full_name, avatar_url)
      `)
      .eq('session_id', sessionId)
      .order('is_featured', { ascending: false })
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: false })

    setQuestions(data || [])
  }, [sessionId, supabase])

  useEffect(() => {
    async function init() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)

      // Load questions
      await loadQuestions()

      // Load user's upvotes
      if (user) {
        const { data: upvotes } = await supabase
          .from('qa_upvotes')
          .select('question_id')
          .eq('user_id', user.id)

        setUserUpvotes(new Set(upvotes?.map((u) => u.question_id) || []))
      }

      setIsLoading(false)

      // Subscribe to realtime updates
      const channel = supabase
        .channel(`qa-${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'qa_questions',
            filter: `session_id=eq.${sessionId}`,
          },
          () => {
            loadQuestions()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    init()
  }, [sessionId, supabase, loadQuestions])

  const submitQuestion = async () => {
    if (!newQuestion.trim() || !userId) return

    setIsSubmitting(true)

    const { error } = await supabase.from('qa_questions').insert({
      session_id: sessionId,
      user_id: userId,
      question: newQuestion.trim(),
      is_anonymous: isAnonymous,
    })

    if (!error) {
      setNewQuestion('')
      await loadQuestions()
    }

    setIsSubmitting(false)
  }

  const toggleUpvote = async (questionId: string) => {
    if (!userId) return

    setUpvoting(questionId)
    const hasUpvoted = userUpvotes.has(questionId)

    if (hasUpvoted) {
      // Remove upvote
      await supabase
        .from('qa_upvotes')
        .delete()
        .eq('question_id', questionId)
        .eq('user_id', userId)

      await supabase.rpc('decrement_upvotes', { question_id: questionId })

      setUserUpvotes((prev) => {
        const next = new Set(prev)
        next.delete(questionId)
        return next
      })
    } else {
      // Add upvote
      await supabase.from('qa_upvotes').insert({
        question_id: questionId,
        user_id: userId,
      })

      await supabase.rpc('increment_upvotes', { question_id: questionId })

      setUserUpvotes((prev) => new Set(prev).add(questionId))
    }

    await loadQuestions()
    setUpvoting(null)
  }

  const toggleAnswered = async (questionId: string, currentState: boolean) => {
    await supabase
      .from('qa_questions')
      .update({ is_answered: !currentState })
      .eq('id', questionId)

    await loadQuestions()
  }

  const toggleFeatured = async (questionId: string, currentState: boolean) => {
    await supabase
      .from('qa_questions')
      .update({ is_featured: !currentState })
      .eq('id', questionId)

    await loadQuestions()
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircleQuestion className="h-5 w-5" />
          Q&A
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ask a question */}
        {userId ? (
          <div className="space-y-3">
            <Textarea
              placeholder="Ask a question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={2}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                Ask anonymously
              </label>
              <Button
                size="sm"
                onClick={submitQuestion}
                disabled={isSubmitting || !newQuestion.trim()}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Submit
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            Sign in to ask questions
          </p>
        )}

        {/* Questions list */}
        <div className="space-y-3 pt-4 border-t">
          {questions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No questions yet. Be the first to ask!
            </p>
          ) : (
            questions.map((q) => (
              <div
                key={q.id}
                className={cn(
                  'flex gap-3 p-3 rounded-lg border',
                  q.is_featured && 'bg-yellow-50 border-yellow-200',
                  q.is_answered && 'bg-green-50 border-green-200'
                )}
              >
                {/* Upvote button */}
                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-8 w-8 p-0',
                      userUpvotes.has(q.id) && 'text-primary'
                    )}
                    onClick={() => toggleUpvote(q.id)}
                    disabled={!userId || upvoting === q.id}
                  >
                    {upvoting === q.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                  <span className="text-sm font-medium">{q.upvotes}</span>
                </div>

                {/* Question content */}
                <div className="flex-1">
                  <p className="text-sm">{q.question}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {q.is_anonymous ? 'Anonymous' : q.user?.full_name || 'Unknown'}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(q.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    {q.is_answered && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Answered
                        </span>
                      </>
                    )}
                    {q.is_featured && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Star className="h-3 w-3" />
                          Featured
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Organizer actions */}
                {isOrganizer && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAnswered(q.id, q.is_answered)}
                      title={q.is_answered ? 'Mark as unanswered' : 'Mark as answered'}
                    >
                      <CheckCircle
                        className={cn(
                          'h-4 w-4',
                          q.is_answered && 'text-green-600'
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFeatured(q.id, q.is_featured)}
                      title={q.is_featured ? 'Unfeature' : 'Feature'}
                    >
                      <Star
                        className={cn(
                          'h-4 w-4',
                          q.is_featured && 'text-yellow-600 fill-yellow-600'
                        )}
                      />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
