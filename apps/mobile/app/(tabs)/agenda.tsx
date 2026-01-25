import { useState } from 'react'
import { ScrollView, FlatList } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { format, addDays, isSameDay } from 'date-fns'
import {
  YStack,
  XStack,
  Text,
  Stack,
  H2,
  SessionCard,
} from '@conference-os/ui'
import { Calendar, Filter, Search } from '@tamagui/lucide-icons'
import { useConference } from '../../hooks/useConference'

// Date pill component
function DatePill({
  date,
  isSelected,
  onPress,
}: {
  date: Date
  isSelected: boolean
  onPress: () => void
}) {
  const dayName = format(date, 'EEE')
  const dayNum = format(date, 'd')
  const isToday = isSameDay(date, new Date())

  return (
    <Stack
      alignItems="center"
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius="$4"
      backgroundColor={isSelected ? '$accentColor' : 'transparent'}
      onPress={onPress}
      cursor="pointer"
      minWidth={56}
    >
      <Text
        fontSize="$2"
        color={isSelected ? '#FFFFFF' : '$colorSecondary'}
        fontWeight="500"
      >
        {dayName}
      </Text>
      <Text
        fontSize="$6"
        fontWeight="700"
        color={isSelected ? '#FFFFFF' : '$color'}
      >
        {dayNum}
      </Text>
      {isToday && !isSelected && (
        <Stack
          width={6}
          height={6}
          borderRadius={3}
          backgroundColor="$accentColor"
          marginTop="$1"
        />
      )}
    </Stack>
  )
}

export default function AgendaScreen() {
  const insets = useSafeAreaInsets()
  const { activeConference, accentColor } = useConference()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)

  // Generate dates for the conference (mock: 3 days)
  const dates = Array.from({ length: 5 }, (_, i) => addDays(new Date(), i - 1))

  // Mock sessions
  const mockSessions = [
    {
      id: '1',
      title: 'Opening Keynote: The Future is Now',
      startTime: '9:00 AM',
      endTime: '10:00 AM',
      room: 'Main Hall',
      track: 'Keynote',
      trackColor: '#2563EB',
      speakerName: 'Dr. Jane Smith',
      speakerTitle: 'CEO, Future Labs',
      isLive: true,
    },
    {
      id: '2',
      title: 'Building Scalable Microservices',
      startTime: '10:30 AM',
      endTime: '11:30 AM',
      room: 'Room 101',
      track: 'Engineering',
      trackColor: '#10B981',
      speakerName: 'Mike Johnson',
      speakerTitle: 'Staff Engineer, BigTech',
    },
    {
      id: '3',
      title: 'Design Systems at Scale',
      startTime: '11:30 AM',
      endTime: '12:30 PM',
      room: 'Room 102',
      track: 'Design',
      trackColor: '#F59E0B',
      speakerName: 'Sarah Lee',
      speakerTitle: 'Design Director, Creative Co',
    },
    {
      id: '4',
      title: 'Lunch Break & Networking',
      startTime: '12:30 PM',
      endTime: '2:00 PM',
      room: 'Expo Hall',
      track: 'Break',
      trackColor: '#6B7280',
    },
    {
      id: '5',
      title: 'AI/ML in Production',
      startTime: '2:00 PM',
      endTime: '3:00 PM',
      room: 'Main Hall',
      track: 'AI & ML',
      trackColor: '#8B5CF6',
      speakerName: 'Alex Chen',
      speakerTitle: 'ML Lead, AI Startup',
    },
  ]

  // Tracks
  const tracks = [
    { id: 'all', name: 'All', color: accentColor },
    { id: 'keynote', name: 'Keynote', color: '#2563EB' },
    { id: 'engineering', name: 'Engineering', color: '#10B981' },
    { id: 'design', name: 'Design', color: '#F59E0B' },
    { id: 'ai', name: 'AI & ML', color: '#8B5CF6' },
  ]

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <YStack
        paddingTop={insets.top + 16}
        paddingHorizontal="$5"
        paddingBottom="$3"
        backgroundColor="$background"
      >
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <H2>Agenda</H2>
          <XStack gap="$2">
            <Stack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="$backgroundStrong"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
            >
              <Search size={20} color="$color" />
            </Stack>
            <Stack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="$backgroundStrong"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
            >
              <Filter size={20} color="$color" />
            </Stack>
          </XStack>
        </XStack>

        {/* Date Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {dates.map((date) => (
            <DatePill
              key={date.toISOString()}
              date={date}
              isSelected={isSameDay(date, selectedDate)}
              onPress={() => setSelectedDate(date)}
            />
          ))}
        </ScrollView>

        {/* Track Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 16 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {tracks.map((track) => (
            <Stack
              key={track.id}
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$3"
              backgroundColor={
                selectedTrack === track.id || (selectedTrack === null && track.id === 'all')
                  ? track.color
                  : '$backgroundStrong'
              }
              onPress={() => setSelectedTrack(track.id === 'all' ? null : track.id)}
              cursor="pointer"
            >
              <Text
                fontSize="$3"
                fontWeight="500"
                color={
                  selectedTrack === track.id || (selectedTrack === null && track.id === 'all')
                    ? '#FFFFFF'
                    : '$color'
                }
              >
                {track.name}
              </Text>
            </Stack>
          ))}
        </ScrollView>
      </YStack>

      {/* Sessions List */}
      <FlatList
        data={mockSessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SessionCard
            title={item.title}
            startTime={item.startTime}
            endTime={item.endTime}
            room={item.room}
            track={item.track}
            trackColor={item.trackColor}
            speakerName={item.speakerName}
            speakerTitle={item.speakerTitle}
            isLive={item.isLive}
            onPress={() => {
              // TODO: Navigate to session detail
            }}
            onSave={() => {
              // TODO: Save session
            }}
          />
        )}
      />
    </YStack>
  )
}
