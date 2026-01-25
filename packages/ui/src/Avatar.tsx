import { styled, GetProps, Stack, Text, Image } from '@tamagui/core'
import { forwardRef } from 'react'

const AvatarFrame = styled(Stack, {
  name: 'Avatar',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  backgroundColor: '$accentBackground',

  variants: {
    size: {
      xs: {
        width: 24,
        height: 24,
        borderRadius: 12,
      },
      sm: {
        width: 32,
        height: 32,
        borderRadius: 16,
      },
      md: {
        width: 40,
        height: 40,
        borderRadius: 20,
      },
      lg: {
        width: 48,
        height: 48,
        borderRadius: 24,
      },
      xl: {
        width: 64,
        height: 64,
        borderRadius: 32,
      },
      xxl: {
        width: 96,
        height: 96,
        borderRadius: 48,
      },
    },

    variant: {
      circle: {},
      rounded: {
        borderRadius: '$3',
      },
      square: {
        borderRadius: '$1',
      },
    },

    bordered: {
      true: {
        borderWidth: 2,
        borderColor: '$borderColor',
      },
    },

    online: {
      true: {},
    },
  } as const,

  defaultVariants: {
    size: 'md',
    variant: 'circle',
  },
})

const AvatarImage = styled(Image, {
  name: 'AvatarImage',
  width: '100%',
  height: '100%',
})

const AvatarFallback = styled(Text, {
  name: 'AvatarFallback',
  fontFamily: '$body',
  fontWeight: '600',
  color: '$accentColor',

  variants: {
    size: {
      xs: {
        fontSize: 10,
      },
      sm: {
        fontSize: 12,
      },
      md: {
        fontSize: 14,
      },
      lg: {
        fontSize: 16,
      },
      xl: {
        fontSize: 20,
      },
      xxl: {
        fontSize: 28,
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
})

const OnlineIndicator = styled(Stack, {
  name: 'OnlineIndicator',
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: '$success',
  borderWidth: 2,
  borderColor: '$background',

  variants: {
    size: {
      xs: {
        width: 6,
        height: 6,
        borderRadius: 3,
      },
      sm: {
        width: 8,
        height: 8,
        borderRadius: 4,
      },
      md: {
        width: 10,
        height: 10,
        borderRadius: 5,
      },
      lg: {
        width: 12,
        height: 12,
        borderRadius: 6,
      },
      xl: {
        width: 14,
        height: 14,
        borderRadius: 7,
      },
      xxl: {
        width: 18,
        height: 18,
        borderRadius: 9,
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
  },
})

// Types
export type AvatarProps = GetProps<typeof AvatarFrame> & {
  src?: string | null
  fallback?: string
  alt?: string
}

// Get initials from name
function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Component
export const Avatar = forwardRef<any, AvatarProps>(
  ({ src, fallback = '?', alt, size = 'md', online, ...props }, ref) => {
    const initials = getInitials(fallback)

    return (
      <Stack position="relative">
        <AvatarFrame ref={ref} size={size} {...props}>
          {src ? (
            <AvatarImage source={{ uri: src }} alt={alt || fallback} />
          ) : (
            <AvatarFallback size={size}>{initials}</AvatarFallback>
          )}
        </AvatarFrame>
        {online && <OnlineIndicator size={size} />}
      </Stack>
    )
  }
)

Avatar.displayName = 'Avatar'

export { AvatarFrame, AvatarImage, AvatarFallback, OnlineIndicator }
