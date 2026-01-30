'use client'

import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { ios, getTypographyStyles } from './tokens'

// ============================================
// iOS Text Component
// ============================================

type TypographyVariant = keyof typeof ios.typography

interface IOSTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TypographyVariant
  color?: string
  align?: 'left' | 'center' | 'right'
  weight?: number
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'label'
}

export function IOSText({
  variant = 'body',
  color = ios.colors.label,
  align = 'left',
  weight,
  as: Component = 'span',
  style,
  children,
  ...props
}: IOSTextProps) {
  const typographyStyles = getTypographyStyles(variant)

  return (
    <Component
      style={{
        ...typographyStyles,
        color,
        textAlign: align,
        fontWeight: weight ?? typographyStyles.fontWeight,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
        margin: 0,
        padding: 0,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  )
}

// ============================================
// iOS Card Component
// ============================================

interface IOSCardProps extends HTMLMotionProps<'div'> {
  variant?: 'elevated' | 'filled' | 'grouped'
  padding?: keyof typeof ios.spacing | number
  radius?: keyof typeof ios.radius | number
  pressable?: boolean
}

export const IOSCard = React.forwardRef<HTMLDivElement, IOSCardProps>(
  (
    {
      variant = 'elevated',
      padding = 4,
      radius = 'card',
      pressable = false,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const paddingValue = typeof padding === 'number' ? padding : ios.spacing[padding]
    const radiusValue = typeof radius === 'number' ? radius : ios.radius[radius]

    const variants = {
      elevated: {
        backgroundColor: ios.colors.systemBackground,
        boxShadow: ios.shadow.card,
      },
      filled: {
        backgroundColor: ios.colors.secondarySystemBackground,
        boxShadow: 'none',
      },
      grouped: {
        backgroundColor: ios.colors.secondaryGroupedBackground,
        boxShadow: 'none',
      },
    }

    return (
      <motion.div
        ref={ref}
        style={{
          ...variants[variant],
          padding: paddingValue,
          borderRadius: radiusValue,
          ...style,
        }}
        whileHover={pressable ? { scale: 1.02 } : undefined}
        whileTap={pressable ? { scale: 0.98 } : undefined}
        transition={ios.animation.spring.snappy}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

IOSCard.displayName = 'IOSCard'

// ============================================
// iOS Button Component
// ============================================

interface IOSButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'filled' | 'tinted' | 'plain' | 'gray'
  size?: 'sm' | 'md' | 'lg'
  color?: string
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  children?: React.ReactNode
}

export const IOSButton = React.forwardRef<HTMLButtonElement, IOSButtonProps>(
  (
    {
      variant = 'filled',
      size = 'md',
      color = ios.colors.systemBlue,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      style,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: { height: 32, padding: '0 12px', fontSize: 14 },
      md: { height: 44, padding: '0 16px', fontSize: 17 },
      lg: { height: 50, padding: '0 20px', fontSize: 17 },
    }

    const getVariantStyles = () => {
      switch (variant) {
        case 'filled':
          return {
            backgroundColor: color,
            color: '#FFFFFF',
          }
        case 'tinted':
          return {
            backgroundColor: `${color}20`,
            color: color,
          }
        case 'gray':
          return {
            backgroundColor: ios.colors.systemGray5,
            color: ios.colors.label,
          }
        case 'plain':
        default:
          return {
            backgroundColor: 'transparent',
            color: color,
          }
      }
    }

    const variantStyles = getVariantStyles()
    const sizeStyles = sizes[size]

    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        style={{
          ...variantStyles,
          height: sizeStyles.height,
          padding: sizeStyles.padding,
          fontSize: sizeStyles.fontSize,
          fontWeight: 600,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
          borderRadius: ios.radius.button,
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          width: fullWidth ? '100%' : 'auto',
          letterSpacing: -0.41,
          WebkitTapHighlightColor: 'transparent',
          ...style,
        }}
        whileHover={!disabled ? { opacity: 0.9 } : undefined}
        whileTap={!disabled ? { scale: 0.97 } : undefined}
        transition={ios.animation.spring.snappy}
        {...props}
      >
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </motion.button>
    )
  }
)

IOSButton.displayName = 'IOSButton'

// ============================================
// iOS Blur View Component
// ============================================

interface IOSBlurViewProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: 'ultraThin' | 'thin' | 'regular' | 'prominent' | 'thick'
  tint?: 'light' | 'dark' | 'default'
}

export function IOSBlurView({
  intensity = 'regular',
  tint = 'light',
  style,
  children,
  ...props
}: IOSBlurViewProps) {
  const blurValues = {
    ultraThin: 'blur(10px)',
    thin: 'blur(15px)',
    regular: 'blur(20px)',
    prominent: 'blur(30px)',
    thick: 'blur(40px)',
  }

  const tintColors = {
    light: 'rgba(255, 255, 255, 0.7)',
    dark: 'rgba(0, 0, 0, 0.5)',
    default: 'rgba(255, 255, 255, 0.85)',
  }

  return (
    <div
      style={{
        backgroundColor: tintColors[tint],
        backdropFilter: `saturate(180%) ${blurValues[intensity]}`,
        WebkitBackdropFilter: `saturate(180%) ${blurValues[intensity]}`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================
// iOS Separator Component
// ============================================

interface IOSSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: number
}

export function IOSSeparator({ inset = 0, style, ...props }: IOSSeparatorProps) {
  return (
    <div
      style={{
        height: 0.5,
        backgroundColor: ios.colors.separator,
        marginLeft: inset,
        ...style,
      }}
      {...props}
    />
  )
}

// ============================================
// iOS List Item Component
// ============================================

interface IOSListItemProps extends HTMLMotionProps<'div'> {
  title: string
  subtitle?: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
  showChevron?: boolean
  onPress?: () => void
}

export function IOSListItem({
  title,
  subtitle,
  leading,
  trailing,
  showChevron = false,
  onPress,
  style,
  ...props
}: IOSListItemProps) {
  return (
    <motion.div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        backgroundColor: ios.colors.secondaryGroupedBackground,
        cursor: onPress ? 'pointer' : 'default',
        ...style,
      }}
      whileTap={onPress ? { backgroundColor: ios.colors.systemGray5 } : undefined}
      onClick={onPress}
      {...props}
    >
      {leading && <div style={{ flexShrink: 0 }}>{leading}</div>}

      <div style={{ flex: 1, minWidth: 0 }}>
        <IOSText variant="body" style={{ display: 'block' }}>
          {title}
        </IOSText>
        {subtitle && (
          <IOSText
            variant="subheadline"
            color={ios.colors.secondaryLabel}
            style={{ display: 'block', marginTop: 2 }}
          >
            {subtitle}
          </IOSText>
        )}
      </div>

      {trailing && <div style={{ flexShrink: 0 }}>{trailing}</div>}

      {showChevron && (
        <svg
          width="8"
          height="13"
          viewBox="0 0 8 13"
          fill="none"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M1.5 1L6.5 6.5L1.5 12"
            stroke={ios.colors.tertiaryLabel}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </motion.div>
  )
}

// ============================================
// iOS Badge Component
// ============================================

interface IOSBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  count?: number
  dot?: boolean
  color?: string
  size?: 'sm' | 'md'
}

export function IOSBadge({
  count,
  dot = false,
  color = ios.colors.systemRed,
  size = 'md',
  style,
  ...props
}: IOSBadgeProps) {
  if (!dot && (count === undefined || count === 0)) return null

  const sizes = {
    sm: { minWidth: 16, height: 16, fontSize: 11, padding: '0 4px' },
    md: { minWidth: 20, height: 20, fontSize: 13, padding: '0 6px' },
  }

  if (dot) {
    return (
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
          ...style,
        }}
        {...props}
      />
    )
  }

  const sizeStyles = sizes[size]
  const displayCount = count && count > 99 ? '99+' : count

  return (
    <span
      style={{
        ...sizeStyles,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color,
        color: '#FFFFFF',
        fontWeight: 600,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
        borderRadius: sizeStyles.height / 2,
        ...style,
      }}
      {...props}
    >
      {displayCount}
    </span>
  )
}
