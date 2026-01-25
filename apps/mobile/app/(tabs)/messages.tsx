import { FlatList } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { formatDistanceToNow } from 'date-fns'
import {
  YStack,
  XStack,
  Text,
  Stack,
  H2,
  Avatar,
} from '@conference-os/ui'
import { Search, Edit } from '@tamagui/lucide-icons'

// Conversation item component
function ConversationItem({
  name,
  lastMessage,
  timestamp,
  unreadCount,
  avatarUrl,
  onPress,
}: {
  name: string
  lastMessage: string
  timestamp: Date
  unreadCount?: number
  avatarUrl?: string
  onPress: () => void
}) {
  const hasUnread = unreadCount && unreadCount > 0

  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      paddingVertical="$3"
      paddingHorizontal="$4"
      backgroundColor={hasUnread ? '$accentBackground' : 'transparent'}
      borderRadius="$3"
      onPress={onPress}
      cursor="pointer"
      hoverStyle={{
        backgroundColor: '$backgroundHover',
      }}
    >
      <Avatar src={avatarUrl} fallback={name} size="lg" />
      <YStack flex={1} marginLeft="$3" gap="$0.5">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontWeight={hasUnread ? '700' : '600'} fontSize="$4">
            {name}
          </Text>
          <Text color="$colorTertiary" fontSize="$2">
            {formatDistanceToNow(timestamp, { addSuffix: false })}
          </Text>
        </XStack>
        <XStack justifyContent="space-between" alignItems="center">
          <Text
            color={hasUnread ? '$color' : '$colorSecondary'}
            fontSize="$3"
            numberOfLines={1}
            flex={1}
            marginRight="$2"
            fontWeight={hasUnread ? '500' : '400'}
          >
            {lastMessage}
          </Text>
          {hasUnread && (
            <Stack
              width={20}
              height={20}
              borderRadius={10}
              backgroundColor="$accentColor"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="#FFFFFF" fontSize="$1" fontWeight="700">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </Stack>
          )}
        </XStack>
      </YStack>
    </Stack>
  )
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets()

  // Mock conversations
  const mockConversations = [
    {
      id: '1',
      name: 'Sarah Chen',
      lastMessage: 'Great meeting you! Let\'s grab coffee tomorrow.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
      unreadCount: 2,
    },
    {
      id: '2',
      name: 'AI & ML Track',
      lastMessage: 'Alex: The session on MLOps was fantastic!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      unreadCount: 5,
    },
    {
      id: '3',
      name: 'James Wilson',
      lastMessage: 'Thanks for the tip about React performance',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unreadCount: 0,
    },
    {
      id: '4',
      name: 'Tech Conference 2024',
      lastMessage: 'Organizer: Reminder - Keynote starts in 1 hour',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      unreadCount: 0,
    },
    {
      id: '5',
      name: 'Maria Garcia',
      lastMessage: 'I\'ll share the design system resources',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      unreadCount: 0,
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
        <XStack justifyContent="space-between" alignItems="center">
          <H2>Messages</H2>
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
              backgroundColor="$accentColor"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
            >
              <Edit size={20} color="#FFFFFF" />
            </Stack>
          </XStack>
        </XStack>
      </YStack>

      {/* Conversations List */}
      <FlatList
        data={mockConversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <Stack
            height={1}
            backgroundColor="$borderColor"
            marginLeft={76}
            marginRight={20}
          />
        )}
        renderItem={({ item }) => (
          <ConversationItem
            name={item.name}
            lastMessage={item.lastMessage}
            timestamp={item.timestamp}
            unreadCount={item.unreadCount}
            onPress={() => {
              // TODO: Navigate to chat
            }}
          />
        )}
        ListEmptyComponent={
          <YStack alignItems="center" padding="$8">
            <Text color="$colorSecondary">No messages yet</Text>
            <Text color="$colorTertiary" fontSize="$3" textAlign="center" marginTop="$2">
              Start networking to connect with other attendees
            </Text>
          </YStack>
        }
      />
    </YStack>
  )
}
