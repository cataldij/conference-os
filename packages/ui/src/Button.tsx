import { styled, GetProps, Stack, Text } from '@tamagui/core'
import { Loader2 } from '@tamagui/lucide-icons'
import { forwardRef } from 'react'

// Base button styles
const ButtonFrame = styled(Stack, {
  name: 'Button',
  tag: 'button',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: '$2',
  cursor: 'pointer',
  borderWidth: 1,
  borderColor: 'transparent',
  animation: 'fast',

  hoverStyle: {
    opacity: 0.9,
  },

  pressStyle: {
    opacity: 0.8,
    scale: 0.98,
  },

  focusStyle: {
    outlineWidth: 2,
    outlineColor: '$accentColor',
    outlineStyle: 'solid',
    outlineOffset: 2,
  },

  disabledStyle: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: '$accentColor',
        hoverStyle: {
          backgroundColor: '$accentColorHover',
        },
        pressStyle: {
          backgroundColor: '$accentColorPress',
        },
      },
      secondary: {
        backgroundColor: '$backgroundStrong',
        borderColor: '$borderColor',
        hoverStyle: {
          backgroundColor: '$backgroundHover',
          borderColor: '$borderColorHover',
        },
        pressStyle: {
          backgroundColor: '$backgroundPress',
        },
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: '$borderColor',
        hoverStyle: {
          backgroundColor: '$backgroundHover',
          borderColor: '$borderColorHover',
        },
        pressStyle: {
          backgroundColor: '$backgroundPress',
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        hoverStyle: {
          backgroundColor: '$backgroundHover',
        },
        pressStyle: {
          backgroundColor: '$backgroundPress',
        },
      },
      danger: {
        backgroundColor: '$error',
        hoverStyle: {
          opacity: 0.9,
        },
        pressStyle: {
          opacity: 0.8,
        },
      },
    },

    size: {
      sm: {
        height: 36,
        paddingHorizontal: '$3',
        borderRadius: '$2',
      },
      md: {
        height: 44,
        paddingHorizontal: '$4',
        borderRadius: '$3',
      },
      lg: {
        height: 52,
        paddingHorizontal: '$5',
        borderRadius: '$3',
      },
      xl: {
        height: 60,
        paddingHorizontal: '$6',
        borderRadius: '$4',
      },
    },

    fullWidth: {
      true: {
        width: '100%',
      },
    },

    circular: {
      true: {
        borderRadius: 1000,
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

const ButtonText = styled(Text, {
  name: 'ButtonText',
  fontFamily: '$body',
  fontWeight: '600',
  userSelect: 'none',

  variants: {
    variant: {
      primary: {
        color: '#FFFFFF',
      },
      secondary: {
        color: '$color',
      },
      outline: {
        color: '$color',
      },
      ghost: {
        color: '$color',
      },
      danger: {
        color: '#FFFFFF',
      },
    },

    size: {
      sm: {
        fontSize: '$3',
      },
      md: {
        fontSize: '$4',
      },
      lg: {
        fontSize: '$5',
      },
      xl: {
        fontSize: '$6',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

// Types
export type ButtonProps = GetProps<typeof ButtonFrame> & {
  loading?: boolean
  icon?: React.ReactNode
  iconAfter?: React.ReactNode
  children?: React.ReactNode
}

// Component
export const Button = forwardRef<any, ButtonProps>(
  (
    {
      children,
      loading,
      icon,
      iconAfter,
      variant = 'primary',
      size = 'md',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <ButtonFrame
        ref={ref}
        variant={variant}
        size={size}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2
            size={size === 'sm' ? 16 : size === 'md' ? 18 : 20}
            color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : undefined}
            animation="spin"
          />
        ) : (
          icon
        )}
        {typeof children === 'string' ? (
          <ButtonText variant={variant} size={size}>
            {children}
          </ButtonText>
        ) : (
          children
        )}
        {iconAfter}
      </ButtonFrame>
    )
  }
)

Button.displayName = 'Button'

export { ButtonFrame, ButtonText }
