import { styled, GetProps, Stack, Text, XStack, YStack } from '@tamagui/core'
import { Clock, MapPin, Users, Bookmark, ChevronRight } from '@tamagui/lucide-icons'
import { forwardRef } from 'react'

// Session card - the core UI element for agenda display
const SessionCardFrame = styled(Stack, {
  name: 'SessionCard',
  backgroundColor: '$surface',
  borderRadius: '$5',
  padding: '$4',
  gap: '$3',
  animation: 'medium',

  // Soft shadow
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 8,
  elevation: 3,

  hoverStyle: {
    backgroundColor: '$surfaceHover',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },

  pressStyle: {
    scale: 0.99,
    backgroundColor: '$surfacePress',
  },

  variants: {
    featured: {
      true: {
        borderLeftWidth: 4,
        borderLeftColor: '$accentColor',
      },
    },

    compact: {
      true: {
        padding: '$3',
        gap: '$2',
      },
    },

    live: {
      true: {
        borderWidth: 2,
        borderColor: '$error',
      },
    },
  } as const,
})

// Track indicator (colored dot + label)
const TrackBadge = styled(XStack, {
  name: 'TrackBadge',
  alignItems: 'center',
  gap: '$1.5',
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  backgroundColor: '$accentBackground',
  borderRadius: '$2',
  alignSelf: 'flex-start',
})

const TrackDot = styled(Stack, {
  name: 'TrackDot',
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: '$accentColor',
})

const TrackLabel = styled(Text, {
  name: 'TrackLabel',
  fontFamily: '$body',
  fontSize: '$2',
  fontWeight: '600',
  color: '$accentColor',
})

// Session title
const SessionTitle = styled(Text, {
  name: 'SessionTitle',
  fontFamily: '$heading',
  fontSize: '$6',
  fontWeight: '600',
  color: '$color',
  letterSpacing: -0.25,
  lineHeight: 24,
})

// Session meta info row
const SessionMeta = styled(XStack, {
  name: 'SessionMeta',
  alignItems: 'center',
  gap: '$4',
  flexWrap: 'wrap',
})

const MetaItem = styled(XStack, {
  name: 'MetaItem',
  alignItems: 'center',
  gap: '$1.5',
})

const MetaText = styled(Text, {
  name: 'MetaText',
  fontFamily: '$body',
  fontSize: '$3',
  color: '$colorSecondary',
})

// Speaker row
const SpeakerRow = styled(XStack, {
  name: 'SpeakerRow',
  alignItems: 'center',
  gap: '$2',
})

const SpeakerAvatar = styled(Stack, {
  name: 'SpeakerAvatar',
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: '$accentBackground',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
})

const SpeakerInfo = styled(YStack, {
  name: 'SpeakerInfo',
  flex: 1,
  gap: '$0.5',
})

const SpeakerName = styled(Text, {
  name: 'SpeakerName',
  fontFamily: '$body',
  fontSize: '$3',
  fontWeight: '500',
  color: '$color',
})

const SpeakerTitle = styled(Text, {
  name: 'SpeakerTitle',
  fontFamily: '$body',
  fontSize: '$2',
  color: '$colorTertiary',
})

// Live indicator
const LiveBadge = styled(XStack, {
  name: 'LiveBadge',
  alignItems: 'center',
  gap: '$1',
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  backgroundColor: '$error',
  borderRadius: '$2',
  alignSelf: 'flex-start',
})

const LiveDot = styled(Stack, {
  name: 'LiveDot',
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: '#FFFFFF',
  animation: 'fast',
})

const LiveText = styled(Text, {
  name: 'LiveText',
  fontFamily: '$body',
  fontSize: '$1',
  fontWeight: '700',
  color: '#FFFFFF',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
})

// Bookmark button
const BookmarkButton = styled(Stack, {
  name: 'BookmarkButton',
  padding: '$2',
  borderRadius: '$3',
  cursor: 'pointer',
  animation: 'fast',

  hoverStyle: {
    backgroundColor: '$backgroundHover',
  },

  pressStyle: {
    scale: 0.95,
  },
})

// Types
export type SessionCardProps = GetProps<typeof SessionCardFrame> & {
  title: string
  startTime: string
  endTime: string
  room?: string
  track?: string
  trackColor?: string
  speakerName?: string
  speakerTitle?: string
  speakerAvatar?: string
  attendeeCount?: number
  isLive?: boolean
  isSaved?: boolean
  onSave?: () => void
  onPress?: () => void
}

// Component
export const SessionCard = forwardRef<any, SessionCardProps>(
  (
    {
      title,
      startTime,
      endTime,
      room,
      track,
      trackColor,
      speakerName,
      speakerTitle,
      speakerAvatar,
      attendeeCount,
      isLive,
      isSaved,
      onSave,
      onPress,
      ...props
    },
    ref
  ) => {
    return (
      <SessionCardFrame
        ref={ref}
        live={isLive}
        onPress={onPress}
        cursor={onPress ? 'pointer' : undefined}
        {...props}
      >
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1} gap="$2">
            {(track || isLive) && (
              <XStack gap="$2">
                {isLive && (
                  <LiveBadge>
                    <LiveDot />
                    <LiveText>Live</LiveText>
                  </LiveBadge>
                )}
                {track && (
                  <TrackBadge>
                    <TrackDot
                      backgroundColor={trackColor || '$accentColor'}
                    />
                    <TrackLabel>{track}</TrackLabel>
                  </TrackBadge>
                )}
              </XStack>
            )}

            <SessionTitle numberOfLines={2}>{title}</SessionTitle>
          </YStack>

          {onSave && (
            <BookmarkButton onPress={onSave}>
              <Bookmark
                size={20}
                color={isSaved ? '$accentColor' : '$colorSecondary'}
                fill={isSaved ? '$accentColor' : 'transparent'}
              />
            </BookmarkButton>
          )}
        </XStack>

        <SessionMeta>
          <MetaItem>
            <Clock size={14} color="$colorSecondary" />
            <MetaText>
              {startTime} - {endTime}
            </MetaText>
          </MetaItem>

          {room && (
            <MetaItem>
              <MapPin size={14} color="$colorSecondary" />
              <MetaText>{room}</MetaText>
            </MetaItem>
          )}

          {attendeeCount !== undefined && (
            <MetaItem>
              <Users size={14} color="$colorSecondary" />
              <MetaText>{attendeeCount}</MetaText>
            </MetaItem>
          )}
        </SessionMeta>

        {speakerName && (
          <SpeakerRow>
            <SpeakerAvatar>
              {speakerAvatar ? (
                <Stack
                  width="100%"
                  height="100%"
                  backgroundColor="$accentBackground"
                />
              ) : (
                <Text fontSize="$2" fontWeight="600" color="$accentColor">
                  {speakerName.charAt(0)}
                </Text>
              )}
            </SpeakerAvatar>
            <SpeakerInfo>
              <SpeakerName>{speakerName}</SpeakerName>
              {speakerTitle && <SpeakerTitle>{speakerTitle}</SpeakerTitle>}
            </SpeakerInfo>
            <ChevronRight size={16} color="$colorMuted" />
          </SpeakerRow>
        )}
      </SessionCardFrame>
    )
  }
)

SessionCard.displayName = 'SessionCard'

export {
  SessionCardFrame,
  TrackBadge,
  TrackDot,
  TrackLabel,
  SessionTitle,
  SessionMeta,
  MetaItem,
  MetaText,
  SpeakerRow,
  SpeakerAvatar,
  SpeakerInfo,
  SpeakerName,
  SpeakerTitle,
  LiveBadge,
  LiveDot,
  LiveText,
  BookmarkButton,
}
