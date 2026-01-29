import { useState } from 'react'
import { ScrollView, Pressable, RefreshControl, Share } from 'react-native'
import { useLocalSearchParams, Stack, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import {
  YStack,
  XStack,
  Text,
  H1,
  H3,
  H4,
  Card,
  Button,
  Avatar,
  Progress,
  Separator,
} from '@conference-os/ui'
import {
  Clock,
  MapPin,
  Users,
  Bookmark,
  BookmarkCheck,
  Video,
  MessageCircle,
  ChevronLeft,
  Share2,
  Bell,
} from '@tamagui/lucide-icons'
import { useAuth } from '../../hooks/useAuth'
import { useConference } from '../../hooks/useConference'
import {
  getSessionById,
  saveSession,
  unsaveSession,
  getUserSavedSessions,
  trackSessionInteraction,
} from '@conference-os/api'

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const { user, profile } = useAuth()
  const { activeConference, theme } = useConference()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<'overview' | 'qa' | 'polls'>('overview')
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  // Fetch session details
  const { data: session, isLoading, refetch } = useQuery({
    queryKey: ['session', id],
    queryFn: () => getSessionById(id!),
    enabled: !!id,
  })

  // Fetch saved sessions to check if current session is saved
  const { data: savedSessions } = useQuery({
    queryKey: ['saved-sessions', user?.id, activeConference?.id],
    queryFn: () => getUserSavedSessions(user!.id, activeConference!.id),
    enabled: !!user && !!activeConference,
  })

  // Track session view
  useQuery({
    queryKey: ['track-view', id, user?.id],
    queryFn: async () => {
      if (user && id) {
        await trackSessionInteraction(id, 'viewed')
      }
      return true
    },
    enabled: !!user && !!id,
    staleTime: Infinity, // Only track once per session
  })

  // Save/unsave mutation
  const saveMutation = useMutation({
    mutationFn: async (save: boolean) => {
      if (save) {
        await saveSession(user!.id, id!)
      } else {
        await unsaveSession(user!.id, id!)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-sessions'] })
    },
  })

  const isSaved = savedSessions?.some((s) => s.id === id) || false

  const handleSaveSession = () => {
    saveMutation.mutate(!isSaved)
  }

  const handleShare = async () => {
    if (!session) return
    try {
      await Share.share({
        title: session.title,
        message: `Check out "${session.title}" at ${activeConference?.name || 'the conference'}`,
      })
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  // Mock Q&A data (will be replaced with real API)
  const [questions, setQuestions] = useState([
    {
      id: '1',
      question: 'How do you handle rate limiting when calling AI APIs?',
      author: 'Alex M.',
      upvotes: 24,
      isUpvoted: false,
      isAnswered: false,
      timestamp: new Date(),
    },
    {
      id: '2',
      question: 'What are the best practices for prompt engineering?',
      author: 'Jamie K.',
      upvotes: 18,
      isUpvoted: true,
      isAnswered: false,
      timestamp: new Date(),
    },
  ])

  // Mock poll data (will be replaced with real API)
  const mockPoll = {
    id: '1',
    question: 'Which framework do you currently use in production?',
    options: [
      { id: '1', text: 'React Native', votes: 42 },
      { id: '2', text: 'Flutter', votes: 28 },
      { id: '3', text: 'Native iOS/Android', votes: 35 },
      { id: '4', text: 'Other', votes: 18 },
    ],
    isActive: true,
    totalVotes: 123,
  }

  const handleVote = () => {
    if (!selectedPollOption) return
    setHasVoted(true)
    // TODO: Call API to submit vote
  }

  const handleUpvoteQuestion = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, isUpvoted: !q.isUpvoted, upvotes: q.isUpvoted ? q.upvotes - 1 : q.upvotes + 1 }
          : q
      )
    )
    // TODO: Call API to upvote question
  }

  if (isLoading || !session) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
          <Text color="$colorSecondary">Loading session...</Text>
        </YStack>
      </>
    )
  }

  const sessionStart = parseISO(session.start_time)
  const sessionEnd = parseISO(session.end_time)
  const now = new Date()
  const isLive = now >= sessionStart && now <= sessionEnd
  const track = (session as any).track
  const room = (session as any).room
  const speakers = (session as any).speakers || []
  const maxAttendees = session.max_attendees || 200
  const currentAttendees = 87 // TODO: Get from real data
  const capacityPercentage = (currentAttendees / maxAttendees) * 100

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <YStack flex={1} backgroundColor="$background">
        {/* Custom Header */}
        <XStack
          paddingTop={insets.top + 12}
          paddingBottom="$3"
          paddingHorizontal="$4"
          backgroundColor="$background"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
          alignItems="center"
          gap="$3"
        >
          <Pressable onPress={() => router.back()}>
            <XStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="$backgroundStrong"
              alignItems="center"
              justifyContent="center"
            >
              <ChevronLeft size={24} color="$color" />
            </XStack>
          </Pressable>
          <Text flex={1} fontSize="$5" fontWeight="600" numberOfLines={1}>
            Session Details
          </Text>
          <Pressable onPress={handleShare}>
            <XStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="$backgroundStrong"
              alignItems="center"
              justifyContent="center"
            >
              <Share2 size={20} color="$color" />
            </XStack>
          </Pressable>
        </XStack>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 100,
          }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        >
          <YStack paddingHorizontal="$5" paddingTop="$4" gap="$4">
            {/* Live Badge */}
            {isLive && (
              <XStack alignItems="center" gap="$2">
                <XStack
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$4"
                  backgroundColor="$error"
                  alignItems="center"
                  gap="$2"
                >
                  <XStack width={8} height={8} borderRadius={4} backgroundColor="#FFFFFF" />
                  <Text color="#FFFFFF" fontSize="$2" fontWeight="700">
                    LIVE NOW
                  </Text>
                </XStack>
                <Text color="$colorSecondary" fontSize="$2">
                  {currentAttendees} attending
                </Text>
              </XStack>
            )}

            {/* Title */}
            <H1>{session.title}</H1>

            {/* Track Badge */}
            {track && (
              <XStack alignItems="center" gap="$2">
                <XStack
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$3"
                  style={{ backgroundColor: (track.color || theme.primaryColor) + '20' }}
                >
                  <Text
                    fontSize="$2"
                    fontWeight="600"
                    style={{ color: track.color || theme.primaryColor }}
                  >
                    {track.name}
                  </Text>
                </XStack>
              </XStack>
            )}

            {/* Time & Location */}
            <YStack gap="$2">
              <XStack alignItems="center" gap="$3">
                <Clock size={18} color="$colorSecondary" />
                <Text color="$colorSecondary" fontSize="$3">
                  {format(sessionStart, 'h:mm a')} - {format(sessionEnd, 'h:mm a')}
                </Text>
              </XStack>
              {room && (
                <XStack alignItems="center" gap="$3">
                  <MapPin size={18} color="$colorSecondary" />
                  <Text color="$colorSecondary" fontSize="$3">
                    {room.name}
                  </Text>
                </XStack>
              )}
              {maxAttendees && (
                <XStack alignItems="center" gap="$3">
                  <Users size={18} color="$colorSecondary" />
                  <YStack flex={1} gap="$1">
                    <Text color="$colorSecondary" fontSize="$3">
                      {currentAttendees} / {maxAttendees} attendees
                    </Text>
                    <Progress value={capacityPercentage} max={100}>
                      <Progress.Indicator animation="bouncy" />
                    </Progress>
                  </YStack>
                </XStack>
              )}
            </YStack>

            {/* Action Buttons */}
            <XStack gap="$3">
              <Button
                flex={1}
                variant={isSaved ? 'secondary' : 'primary'}
                size="lg"
                onPress={handleSaveSession}
                icon={isSaved ? BookmarkCheck : Bookmark}
                disabled={saveMutation.isPending}
              >
                {isSaved ? 'Saved' : 'Save to Schedule'}
              </Button>
              {isLive && session.livestream_url && (
                <Button variant="primary" size="lg" icon={Video}>
                  Watch Live
                </Button>
              )}
            </XStack>

            {/* Tabs */}
            <XStack gap="$2" marginTop="$2">
              <Pressable onPress={() => setActiveTab('overview')} style={{ flex: 1 }}>
                <XStack
                  flex={1}
                  paddingVertical="$3"
                  borderBottomWidth={2}
                  borderBottomColor={activeTab === 'overview' ? '$accentColor' : 'transparent'}
                  justifyContent="center"
                >
                  <Text
                    fontWeight={activeTab === 'overview' ? '700' : '500'}
                    color={activeTab === 'overview' ? '$accentColor' : '$colorSecondary'}
                  >
                    Overview
                  </Text>
                </XStack>
              </Pressable>
              <Pressable onPress={() => setActiveTab('qa')} style={{ flex: 1 }}>
                <XStack
                  flex={1}
                  paddingVertical="$3"
                  borderBottomWidth={2}
                  borderBottomColor={activeTab === 'qa' ? '$accentColor' : 'transparent'}
                  justifyContent="center"
                >
                  <Text
                    fontWeight={activeTab === 'qa' ? '700' : '500'}
                    color={activeTab === 'qa' ? '$accentColor' : '$colorSecondary'}
                  >
                    Q&A ({questions.length})
                  </Text>
                </XStack>
              </Pressable>
              <Pressable onPress={() => setActiveTab('polls')} style={{ flex: 1 }}>
                <XStack
                  flex={1}
                  paddingVertical="$3"
                  borderBottomWidth={2}
                  borderBottomColor={activeTab === 'polls' ? '$accentColor' : 'transparent'}
                  justifyContent="center"
                >
                  <Text
                    fontWeight={activeTab === 'polls' ? '700' : '500'}
                    color={activeTab === 'polls' ? '$accentColor' : '$colorSecondary'}
                  >
                    Polls
                  </Text>
                </XStack>
              </Pressable>
            </XStack>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <YStack gap="$4" marginTop="$2">
                {/* Description */}
                <YStack gap="$2">
                  <H4>About This Session</H4>
                  <Text color="$colorSecondary" lineHeight={24}>
                    {session.description || 'No description available.'}
                  </Text>
                </YStack>

                {/* Speakers */}
                {speakers.length > 0 && (
                  <YStack gap="$3">
                    <H4>Speakers</H4>
                    {speakers.map((speaker: any) => (
                      <Card key={speaker.id} variant="outline" padding="$4">
                        <XStack gap="$3" alignItems="center">
                          <Avatar
                            src={speaker.profile?.avatar_url}
                            fallback={speaker.profile?.full_name || 'S'}
                            size="lg"
                          />
                          <YStack flex={1}>
                            <Text fontWeight="600" fontSize="$4">
                              {speaker.profile?.full_name || 'Speaker'}
                            </Text>
                            <Text color="$colorSecondary" fontSize="$3">
                              {speaker.profile?.job_title || speaker.role}
                            </Text>
                            {speaker.profile?.company && (
                              <Text color="$colorTertiary" fontSize="$2">
                                {speaker.profile.company}
                              </Text>
                            )}
                          </YStack>
                        </XStack>
                      </Card>
                    ))}
                  </YStack>
                )}
              </YStack>
            )}

            {activeTab === 'qa' && (
              <YStack gap="$3" marginTop="$2">
                <Button variant="primary" size="lg" icon={MessageCircle}>
                  Ask a Question
                </Button>

                <YStack gap="$2">
                  {questions
                    .sort((a, b) => b.upvotes - a.upvotes)
                    .map((q) => (
                      <Card key={q.id} variant="outline" padding="$4">
                        <YStack gap="$2">
                          <XStack justifyContent="space-between" alignItems="flex-start">
                            <YStack flex={1} gap="$1">
                              <Text fontSize="$4" fontWeight="500">
                                {q.question}
                              </Text>
                              <Text color="$colorTertiary" fontSize="$2">
                                {q.author} • {format(q.timestamp, 'h:mm a')}
                              </Text>
                            </YStack>
                            {q.isAnswered && (
                              <XStack
                                paddingHorizontal="$2"
                                paddingVertical="$1"
                                borderRadius="$2"
                                backgroundColor="$success"
                              >
                                <Text color="#FFFFFF" fontSize="$1" fontWeight="700">
                                  ANSWERED
                                </Text>
                              </XStack>
                            )}
                          </XStack>
                          <XStack gap="$2">
                            <Pressable onPress={() => handleUpvoteQuestion(q.id)}>
                              <XStack
                                paddingHorizontal="$3"
                                paddingVertical="$2"
                                borderRadius="$3"
                                backgroundColor={q.isUpvoted ? '$accentColor' : '$backgroundStrong'}
                                alignItems="center"
                                gap="$2"
                              >
                                <Text
                                  fontSize="$2"
                                  fontWeight="600"
                                  color={q.isUpvoted ? '#FFFFFF' : '$colorSecondary'}
                                >
                                  ▲ {q.upvotes}
                                </Text>
                              </XStack>
                            </Pressable>
                          </XStack>
                        </YStack>
                      </Card>
                    ))}
                </YStack>
              </YStack>
            )}

            {activeTab === 'polls' && (
              <YStack gap="$3" marginTop="$2">
                {mockPoll.isActive ? (
                  <Card variant="default" padding="$4">
                    <YStack gap="$4">
                      <YStack gap="$2">
                        <XStack justifyContent="space-between" alignItems="center">
                          <Text fontSize="$5" fontWeight="600">
                            Live Poll
                          </Text>
                          <XStack
                            paddingHorizontal="$2"
                            paddingVertical="$1"
                            borderRadius="$2"
                            backgroundColor="$success"
                          >
                            <Text color="#FFFFFF" fontSize="$1" fontWeight="700">
                              ACTIVE
                            </Text>
                          </XStack>
                        </XStack>
                        <Text color="$colorSecondary" fontSize="$4">
                          {mockPoll.question}
                        </Text>
                      </YStack>

                      {!hasVoted ? (
                        <YStack gap="$2">
                          {mockPoll.options.map((option) => (
                            <Pressable
                              key={option.id}
                              onPress={() => setSelectedPollOption(option.id)}
                            >
                              <XStack
                                paddingVertical="$3"
                                paddingHorizontal="$4"
                                borderRadius="$3"
                                borderWidth={2}
                                borderColor={
                                  selectedPollOption === option.id
                                    ? '$accentColor'
                                    : '$borderColor'
                                }
                                backgroundColor={
                                  selectedPollOption === option.id
                                    ? '$backgroundFocus'
                                    : '$background'
                                }
                                alignItems="center"
                                gap="$2"
                              >
                                <XStack
                                  width={20}
                                  height={20}
                                  borderRadius={10}
                                  borderWidth={2}
                                  borderColor={
                                    selectedPollOption === option.id
                                      ? '$accentColor'
                                      : '$borderColor'
                                  }
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  {selectedPollOption === option.id && (
                                    <XStack
                                      width={10}
                                      height={10}
                                      borderRadius={5}
                                      backgroundColor="$accentColor"
                                    />
                                  )}
                                </XStack>
                                <Text flex={1} fontSize="$3" fontWeight="500">
                                  {option.text}
                                </Text>
                              </XStack>
                            </Pressable>
                          ))}
                          <Button
                            variant="primary"
                            size="lg"
                            onPress={handleVote}
                            disabled={!selectedPollOption}
                            marginTop="$2"
                          >
                            Submit Vote
                          </Button>
                        </YStack>
                      ) : (
                        <YStack gap="$2">
                          {mockPoll.options.map((option) => {
                            const percentage = (option.votes / mockPoll.totalVotes) * 100
                            return (
                              <YStack key={option.id} gap="$1">
                                <XStack justifyContent="space-between" alignItems="center">
                                  <Text fontSize="$3" fontWeight="500">
                                    {option.text}
                                  </Text>
                                  <Text fontSize="$3" fontWeight="600" color="$accentColor">
                                    {Math.round(percentage)}%
                                  </Text>
                                </XStack>
                                <Progress value={percentage} max={100}>
                                  <Progress.Indicator animation="bouncy" />
                                </Progress>
                              </YStack>
                            )
                          })}
                          <Text color="$colorTertiary" fontSize="$2" marginTop="$2">
                            {mockPoll.totalVotes} votes
                          </Text>
                        </YStack>
                      )}
                    </YStack>
                  </Card>
                ) : (
                  <Card variant="outline" padding="$6">
                    <YStack alignItems="center" gap="$2">
                      <MessageCircle size={32} color="$colorTertiary" />
                      <Text color="$colorTertiary" textAlign="center">
                        No active polls at the moment
                      </Text>
                    </YStack>
                  </Card>
                )}
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </>
  )
}
