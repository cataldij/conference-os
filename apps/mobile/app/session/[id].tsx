import { useState } from 'react'
import { ScrollView, Pressable } from 'react-native'
import { useLocalSearchParams, Stack, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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

// Mock data - will be replaced with real API calls
const mockSession = {
  id: '1',
  title: 'The Future of AI in Mobile Development',
  description:
    'Explore how artificial intelligence is revolutionizing mobile app development, from code generation to user experience personalization. Learn practical techniques for integrating AI into your React Native apps.',
  startTime: new Date('2024-06-15T10:00:00'),
  endTime: new Date('2024-06-15T11:00:00'),
  room: 'Grand Ballroom A',
  track: 'Mobile Development',
  trackColor: '#2563eb',
  speakers: [
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'Senior AI Engineer',
      company: 'TechCorp',
      avatarUrl: null,
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      title: 'Lead Mobile Developer',
      company: 'InnovateLabs',
      avatarUrl: null,
    },
  ],
  maxAttendees: 250,
  currentAttendees: 187,
  isLive: true,
  hasLivestream: true,
  isSaved: false,
}

const mockPoll = {
  id: '1',
  question: 'Which AI framework do you currently use in production?',
  options: [
    { id: '1', text: 'OpenAI GPT', votes: 42 },
    { id: '2', text: 'Google Gemini', votes: 28 },
    { id: '3', text: 'Anthropic Claude', votes: 35 },
    { id: '4', text: 'Open source models', votes: 18 },
  ],
  isActive: true,
  userVote: null,
  totalVotes: 123,
}

const mockQuestions = [
  {
    id: '1',
    question: 'How do you handle rate limiting when calling AI APIs?',
    author: 'Alex M.',
    upvotes: 24,
    isUpvoted: false,
    isAnswered: false,
    timestamp: new Date('2024-06-15T10:15:00'),
  },
  {
    id: '2',
    question: 'What are the best practices for prompt engineering in mobile apps?',
    author: 'Jamie K.',
    upvotes: 18,
    isUpvoted: true,
    isAnswered: false,
    timestamp: new Date('2024-06-15T10:12:00'),
  },
  {
    id: '3',
    question: 'Can you share examples of AI-powered features that improved user retention?',
    author: 'Taylor R.',
    upvotes: 31,
    isUpvoted: false,
    isAnswered: true,
    timestamp: new Date('2024-06-15T10:08:00'),
  },
]

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams()
  const insets = useSafeAreaInsets()
  const { profile } = useAuth()

  const [isSaved, setIsSaved] = useState(mockSession.isSaved)
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [questions, setQuestions] = useState(mockQuestions)
  const [activeTab, setActiveTab] = useState<'overview' | 'qa' | 'polls'>('overview')

  const handleSaveSession = () => {
    setIsSaved(!isSaved)
    // TODO: Call API to save/unsave session
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

  const capacityPercentage = (mockSession.currentAttendees / mockSession.maxAttendees) * 100

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
          <Pressable onPress={() => {}}>
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
        >
          <YStack paddingHorizontal="$5" paddingTop="$4" gap="$4">
            {/* Live Badge */}
            {mockSession.isLive && (
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
                {mockSession.hasLivestream && (
                  <Text color="$colorSecondary" fontSize="$2">
                    {mockSession.currentAttendees} watching
                  </Text>
                )}
              </XStack>
            )}

            {/* Title */}
            <H1>{mockSession.title}</H1>

            {/* Track Badge */}
            <XStack alignItems="center" gap="$2">
              <XStack
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$3"
                style={{ backgroundColor: mockSession.trackColor + '20' }}
              >
                <Text
                  fontSize="$2"
                  fontWeight="600"
                  style={{ color: mockSession.trackColor }}
                >
                  {mockSession.track}
                </Text>
              </XStack>
            </XStack>

            {/* Time & Location */}
            <YStack gap="$2">
              <XStack alignItems="center" gap="$3">
                <Clock size={18} color="$colorSecondary" />
                <Text color="$colorSecondary" fontSize="$3">
                  {mockSession.startTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {mockSession.endTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$3">
                <MapPin size={18} color="$colorSecondary" />
                <Text color="$colorSecondary" fontSize="$3">
                  {mockSession.room}
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$3">
                <Users size={18} color="$colorSecondary" />
                <YStack flex={1} gap="$1">
                  <Text color="$colorSecondary" fontSize="$3">
                    {mockSession.currentAttendees} / {mockSession.maxAttendees} attendees
                  </Text>
                  <Progress value={capacityPercentage} max={100}>
                    <Progress.Indicator animation="bouncy" />
                  </Progress>
                </YStack>
              </XStack>
            </YStack>

            {/* Action Buttons */}
            <XStack gap="$3">
              <Button
                flex={1}
                variant={isSaved ? 'secondary' : 'primary'}
                size="lg"
                onPress={handleSaveSession}
                icon={isSaved ? BookmarkCheck : Bookmark}
              >
                {isSaved ? 'Saved' : 'Save to Schedule'}
              </Button>
              {mockSession.isLive && mockSession.hasLivestream && (
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
                    {mockSession.description}
                  </Text>
                </YStack>

                {/* Speakers */}
                <YStack gap="$3">
                  <H4>Speakers</H4>
                  {mockSession.speakers.map((speaker) => (
                    <Card key={speaker.id} variant="outline" padding="$4">
                      <XStack gap="$3" alignItems="center">
                        <Avatar src={speaker.avatarUrl} fallback={speaker.name} size="lg" />
                        <YStack flex={1}>
                          <Text fontWeight="600" fontSize="$4">
                            {speaker.name}
                          </Text>
                          <Text color="$colorSecondary" fontSize="$3">
                            {speaker.title}
                          </Text>
                          <Text color="$colorTertiary" fontSize="$2">
                            {speaker.company}
                          </Text>
                        </YStack>
                      </XStack>
                    </Card>
                  ))}
                </YStack>
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
                                {q.author} •{' '}
                                {q.timestamp.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
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
                                  ▲
                                </Text>
                                <Text
                                  fontSize="$2"
                                  fontWeight="600"
                                  color={q.isUpvoted ? '#FFFFFF' : '$colorSecondary'}
                                >
                                  {q.upvotes}
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
                                    ? '$accentColor' + '10'
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
