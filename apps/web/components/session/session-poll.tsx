'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BarChart3, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type PollOption = {
  id: string
  text: string
}

type Poll = {
  id: string
  question: string
  options: PollOption[]
  is_active: boolean
  show_results: boolean
  created_at: string
  closed_at: string | null
}

type PollResponse = {
  poll_id: string
  option_id: string
}

interface SessionPollProps {
  sessionId: string
  isOrganizer?: boolean
}

export function SessionPoll({ sessionId, isOrganizer = false }: SessionPollProps) {
  const [polls, setPolls] = useState<Poll[]>([])
  const [responses, setResponses] = useState<Map<string, Map<string, number>>>(new Map())
  const [userResponses, setUserResponses] = useState<Map<string, string>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [voting, setVoting] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadPolls = useCallback(async () => {
    // Get polls for this session
    const { data: pollsData } = await supabase
      .from('polls')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })

    if (!pollsData) return

    setPolls(pollsData)

    // Get response counts for each poll
    const responseMap = new Map<string, Map<string, number>>()

    for (const poll of pollsData) {
      const { data: pollResponses } = await supabase
        .from('poll_responses')
        .select('option_id')
        .eq('poll_id', poll.id)

      const counts = new Map<string, number>()
      pollResponses?.forEach((r) => {
        counts.set(r.option_id, (counts.get(r.option_id) || 0) + 1)
      })
      responseMap.set(poll.id, counts)
    }

    setResponses(responseMap)
  }, [sessionId, supabase])

  useEffect(() => {
    async function init() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)

      // Load polls
      await loadPolls()

      // Load user's responses
      if (user) {
        const { data: userResponsesData } = await supabase
          .from('poll_responses')
          .select('poll_id, option_id')
          .eq('user_id', user.id)

        const userResponseMap = new Map<string, string>()
        userResponsesData?.forEach((r) => {
          userResponseMap.set(r.poll_id, r.option_id)
        })
        setUserResponses(userResponseMap)
      }

      setIsLoading(false)

      // Subscribe to realtime updates
      const channel = supabase
        .channel(`polls-${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'polls',
            filter: `session_id=eq.${sessionId}`,
          },
          () => {
            loadPolls()
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'poll_responses',
          },
          () => {
            loadPolls()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    init()
  }, [sessionId, supabase, loadPolls])

  const vote = async (pollId: string, optionId: string) => {
    if (!userId) return

    setVoting(pollId)

    const { error } = await supabase.from('poll_responses').insert({
      poll_id: pollId,
      user_id: userId,
      option_id: optionId,
    })

    if (!error) {
      setUserResponses((prev) => new Map(prev).set(pollId, optionId))
      await loadPolls()
    }

    setVoting(null)
  }

  const togglePollActive = async (pollId: string, currentState: boolean) => {
    await supabase
      .from('polls')
      .update({ is_active: !currentState })
      .eq('id', pollId)

    await loadPolls()
  }

  const toggleShowResults = async (pollId: string, currentState: boolean) => {
    await supabase
      .from('polls')
      .update({ show_results: !currentState })
      .eq('id', pollId)

    await loadPolls()
  }

  // Filter to only show active polls for non-organizers
  const visiblePolls = isOrganizer ? polls : polls.filter((p) => p.is_active)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (visiblePolls.length === 0) {
    return null // Don't show anything if no polls
  }

  return (
    <div className="space-y-4">
      {visiblePolls.map((poll) => {
        const pollResponses = responses.get(poll.id) || new Map()
        const totalVotes = Array.from(pollResponses.values()).reduce((a, b) => a + b, 0)
        const userVote = userResponses.get(poll.id)
        const hasVoted = !!userVote
        const showResults = poll.show_results || hasVoted || isOrganizer

        return (
          <Card key={poll.id} className={cn(!poll.is_active && 'opacity-60')}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" />
                  {poll.question}
                </CardTitle>
                {isOrganizer && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePollActive(poll.id, poll.is_active)}
                    >
                      {poll.is_active ? 'Close' : 'Open'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleShowResults(poll.id, poll.show_results)}
                    >
                      {poll.show_results ? 'Hide Results' : 'Show Results'}
                    </Button>
                  </div>
                )}
              </div>
              {totalVotes > 0 && (
                <p className="text-sm text-muted-foreground">
                  {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {poll.options.map((option) => {
                const votes = pollResponses.get(option.id) || 0
                const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
                const isSelected = userVote === option.id

                return (
                  <div key={option.id}>
                    {!hasVoted && poll.is_active && userId ? (
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start h-auto py-3',
                          voting === poll.id && 'opacity-50'
                        )}
                        onClick={() => vote(poll.id, option.id)}
                        disabled={voting === poll.id}
                      >
                        {voting === poll.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {option.text}
                      </Button>
                    ) : (
                      <div
                        className={cn(
                          'relative rounded-lg border p-3',
                          isSelected && 'border-primary bg-primary/5'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                            <span className={isSelected ? 'font-medium' : ''}>
                              {option.text}
                            </span>
                          </div>
                          {showResults && (
                            <span className="text-sm font-medium">{percentage}%</span>
                          )}
                        </div>
                        {showResults && (
                          <Progress
                            value={percentage}
                            className="mt-2 h-2"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {!userId && poll.is_active && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  Sign in to vote
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
