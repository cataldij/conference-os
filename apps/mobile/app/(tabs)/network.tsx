import { ScrollView, FlatList } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  YStack,
  XStack,
  Text,
  Stack,
  H2,
  Card,
  Avatar,
  Button,
} from '@conference-os/ui'
import { Search, Filter, UserPlus, MessageCircle, MapPin } from '@tamagui/lucide-icons'

// Attendee card component
function AttendeeCard({
  name,
  title,
  company,
  interests,
  isNearby,
  onConnect,
  onMessage,
}: {
  name: string
  title: string
  company: string
  interests: string[]
  isNearby?: boolean
  onConnect: () => void
  onMessage: () => void
}) {
  return (
    <Card variant="default" size="md" interactive>
      <YStack gap="$3">
        <XStack gap="$3" alignItems="flex-start">
          <Avatar fallback={name} size="lg" />
          <YStack flex={1}>
            <XStack alignItems="center" gap="$2">
              <Text fontWeight="600" fontSize="$5">
                {name}
              </Text>
              {isNearby && (
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  gap="$1"
                  paddingHorizontal="$2"
                  paddingVertical="$0.5"
                  backgroundColor="$successBackground"
                  borderRadius="$2"
                >
                  <MapPin size={10} color="$success" />
                  <Text fontSize="$1" color="$success" fontWeight="600">
                    Nearby
                  </Text>
                </Stack>
              )}
            </XStack>
            <Text color="$colorSecondary" fontSize="$3">
              {title}
            </Text>
            <Text color="$colorTertiary" fontSize="$2">
              {company}
            </Text>
          </YStack>
        </XStack>

        {/* Interests */}
        <XStack gap="$1.5" flexWrap="wrap">
          {interests.slice(0, 3).map((interest, index) => (
            <Stack
              key={index}
              paddingHorizontal="$2"
              paddingVertical="$1"
              backgroundColor="$accentBackground"
              borderRadius="$2"
            >
              <Text fontSize="$2" color="$accentColor">
                {interest}
              </Text>
            </Stack>
          ))}
        </XStack>

        {/* Actions */}
        <XStack gap="$2">
          <Button
            variant="primary"
            size="sm"
            flex={1}
            icon={<UserPlus size={16} color="#FFFFFF" />}
            onPress={onConnect}
          >
            Connect
          </Button>
          <Button
            variant="secondary"
            size="sm"
            flex={1}
            icon={<MessageCircle size={16} color="$color" />}
            onPress={onMessage}
          >
            Message
          </Button>
        </XStack>
      </YStack>
    </Card>
  )
}

export default function NetworkScreen() {
  const insets = useSafeAreaInsets()

  // Mock attendees
  const mockAttendees = [
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'VP of Engineering',
      company: 'TechCorp',
      interests: ['AI/ML', 'Leadership', 'Scaling'],
      isNearby: true,
    },
    {
      id: '2',
      name: 'Alex Johnson',
      title: 'Product Manager',
      company: 'Startup Inc',
      interests: ['Product', 'Growth', 'Analytics'],
      isNearby: true,
    },
    {
      id: '3',
      name: 'Maria Garcia',
      title: 'UX Designer',
      company: 'Design Co',
      interests: ['Design Systems', 'Research', 'Accessibility'],
      isNearby: false,
    },
    {
      id: '4',
      name: 'James Wilson',
      title: 'Software Engineer',
      company: 'BigTech',
      interests: ['React', 'TypeScript', 'Performance'],
      isNearby: false,
    },
    {
      id: '5',
      name: 'Emily Brown',
      title: 'Data Scientist',
      company: 'AI Labs',
      interests: ['Machine Learning', 'Python', 'MLOps'],
      isNearby: false,
    },
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
          <H2>Network</H2>
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

        {/* Quick Stats */}
        <XStack gap="$3">
          <Card variant="outline" size="sm" flex={1}>
            <YStack alignItems="center">
              <Text fontSize="$8" fontWeight="700" color="$accentColor">
                12
              </Text>
              <Text fontSize="$2" color="$colorSecondary">
                Connections
              </Text>
            </YStack>
          </Card>
          <Card variant="outline" size="sm" flex={1}>
            <YStack alignItems="center">
              <Text fontSize="$8" fontWeight="700" color="$success">
                5
              </Text>
              <Text fontSize="$2" color="$colorSecondary">
                Nearby
              </Text>
            </YStack>
          </Card>
          <Card variant="outline" size="sm" flex={1}>
            <YStack alignItems="center">
              <Text fontSize="$8" fontWeight="700" color="$warning">
                3
              </Text>
              <Text fontSize="$2" color="$colorSecondary">
                Pending
              </Text>
            </YStack>
          </Card>
        </XStack>
      </YStack>

      {/* Attendees List */}
      <FlatList
        data={mockAttendees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text color="$colorSecondary" fontSize="$3" marginBottom="$2">
            Suggested Connections
          </Text>
        }
        renderItem={({ item }) => (
          <AttendeeCard
            name={item.name}
            title={item.title}
            company={item.company}
            interests={item.interests}
            isNearby={item.isNearby}
            onConnect={() => {
              // TODO: Send connection request
            }}
            onMessage={() => {
              // TODO: Open chat
            }}
          />
        )}
      />
    </YStack>
  )
}
