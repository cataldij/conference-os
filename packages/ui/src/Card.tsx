import { styled, GetProps, Stack, Text, XStack, YStack } from '@tamagui/core'
import { forwardRef } from 'react'

// Premium card with soft shadows and rounded corners
const CardFrame = styled(Stack, {
  name: 'Card',
  backgroundColor: '$surface',
  borderRadius: '$6',
  overflow: 'hidden',
  animation: 'medium',

  // Soft shadow
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 8,
  elevation: 3,

  variants: {
    variant: {
      default: {},
      elevated: {
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 16,
        elevation: 6,
      },
      outline: {
        borderWidth: 1,
        borderColor: '$borderColor',
        shadowOpacity: 0,
        elevation: 0,
      },
      ghost: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      },
    },

    interactive: {
      true: {
        cursor: 'pointer',
        hoverStyle: {
          backgroundColor: '$surfaceHover',
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 12,
          elevation: 5,
          scale: 1.01,
        },
        pressStyle: {
          backgroundColor: '$surfacePress',
          scale: 0.99,
        },
      },
    },

    size: {
      sm: {
        padding: '$3',
      },
      md: {
        padding: '$4',
      },
      lg: {
        padding: '$5',
      },
    },

    fullWidth: {
      true: {
        width: '100%',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

// Card Header
const CardHeader = styled(YStack, {
  name: 'CardHeader',
  gap: '$1',
  marginBottom: '$3',
})

const CardTitle = styled(Text, {
  name: 'CardTitle',
  fontFamily: '$heading',
  fontWeight: '600',
  fontSize: '$7',
  color: '$color',
  letterSpacing: -0.5,
})

const CardDescription = styled(Text, {
  name: 'CardDescription',
  fontFamily: '$body',
  fontSize: '$4',
  color: '$colorSecondary',
  lineHeight: 20,
})

// Card Content
const CardContent = styled(YStack, {
  name: 'CardContent',
  gap: '$2',
})

// Card Footer
const CardFooter = styled(XStack, {
  name: 'CardFooter',
  marginTop: '$3',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '$2',
})

// Card Image (hero image at top)
const CardImage = styled(Stack, {
  name: 'CardImage',
  width: '100%',
  aspectRatio: 16 / 9,
  backgroundColor: '$backgroundStrong',
  marginTop: '$-4',
  marginHorizontal: '$-4',
  marginBottom: '$3',
  overflow: 'hidden',
})

// Card Badge (small tag/label)
const CardBadge = styled(Stack, {
  name: 'CardBadge',
  paddingHorizontal: '$2',
  paddingVertical: '$1',
  backgroundColor: '$accentBackground',
  borderRadius: '$2',
  alignSelf: 'flex-start',
})

const CardBadgeText = styled(Text, {
  name: 'CardBadgeText',
  fontFamily: '$body',
  fontSize: '$2',
  fontWeight: '600',
  color: '$accentColor',
})

// Types
export type CardProps = GetProps<typeof CardFrame>

// Compound component
export const Card = Object.assign(
  forwardRef<any, CardProps>((props, ref) => (
    <CardFrame ref={ref} {...props} />
  )),
  {
    Header: CardHeader,
    Title: CardTitle,
    Description: CardDescription,
    Content: CardContent,
    Footer: CardFooter,
    Image: CardImage,
    Badge: CardBadge,
    BadgeText: CardBadgeText,
  }
)

Card.displayName = 'Card'

export {
  CardFrame,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
  CardBadge,
  CardBadgeText,
}
