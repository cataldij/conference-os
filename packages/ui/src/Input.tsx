import { styled, GetProps, Stack, Text, XStack } from '@tamagui/core'
import { forwardRef, useState } from 'react'

// Input wrapper for label and error states
const InputWrapper = styled(Stack, {
  name: 'InputWrapper',
  gap: '$1.5',
  width: '100%',
})

const InputLabel = styled(Text, {
  name: 'InputLabel',
  fontFamily: '$body',
  fontSize: '$3',
  fontWeight: '500',
  color: '$color',
})

const InputFrame = styled(Stack, {
  name: 'Input',
  tag: 'input',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$borderColor',
  borderRadius: '$3',
  paddingHorizontal: '$3',
  fontFamily: '$body',
  fontSize: '$4',
  color: '$color',
  animation: 'fast',
  outlineWidth: 0,

  hoverStyle: {
    borderColor: '$borderColorHover',
  },

  focusStyle: {
    borderColor: '$accentColor',
    borderWidth: 2,
  },

  placeholderTextColor: '$colorTertiary',

  variants: {
    size: {
      sm: {
        height: 36,
        fontSize: '$3',
        borderRadius: '$2',
      },
      md: {
        height: 44,
        fontSize: '$4',
        borderRadius: '$3',
      },
      lg: {
        height: 52,
        fontSize: '$5',
        borderRadius: '$3',
      },
    },

    variant: {
      default: {},
      filled: {
        backgroundColor: '$backgroundStrong',
        borderColor: 'transparent',
        focusStyle: {
          borderColor: '$accentColor',
          backgroundColor: '$background',
        },
      },
    },

    error: {
      true: {
        borderColor: '$error',
        focusStyle: {
          borderColor: '$error',
        },
      },
    },

    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
})

const InputError = styled(Text, {
  name: 'InputError',
  fontFamily: '$body',
  fontSize: '$2',
  color: '$error',
})

const InputHint = styled(Text, {
  name: 'InputHint',
  fontFamily: '$body',
  fontSize: '$2',
  color: '$colorTertiary',
})

// Input with icon support
const InputContainer = styled(XStack, {
  name: 'InputContainer',
  position: 'relative',
  alignItems: 'center',
  width: '100%',
})

const InputIcon = styled(Stack, {
  name: 'InputIcon',
  position: 'absolute',
  left: '$3',
  zIndex: 1,
  pointerEvents: 'none',
})

const InputIconRight = styled(Stack, {
  name: 'InputIconRight',
  position: 'absolute',
  right: '$3',
  zIndex: 1,
})

// Types
export type InputProps = GetProps<typeof InputFrame> & {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

// Component
export const Input = forwardRef<any, InputProps>(
  ({ label, error, hint, icon, iconRight, size = 'md', ...props }, ref) => {
    const hasIcon = !!icon
    const hasIconRight = !!iconRight

    return (
      <InputWrapper>
        {label && <InputLabel>{label}</InputLabel>}
        <InputContainer>
          {icon && <InputIcon>{icon}</InputIcon>}
          <InputFrame
            ref={ref}
            size={size}
            error={!!error}
            paddingLeft={hasIcon ? '$10' : '$3'}
            paddingRight={hasIconRight ? '$10' : '$3'}
            width="100%"
            {...props}
          />
          {iconRight && <InputIconRight>{iconRight}</InputIconRight>}
        </InputContainer>
        {error && <InputError>{error}</InputError>}
        {hint && !error && <InputHint>{hint}</InputHint>}
      </InputWrapper>
    )
  }
)

Input.displayName = 'Input'

export {
  InputWrapper,
  InputLabel,
  InputFrame,
  InputError,
  InputHint,
  InputContainer,
  InputIcon,
  InputIconRight,
}
