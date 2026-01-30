/**
 * iOS Design Tokens
 * Based on Apple Human Interface Guidelines
 * https://developer.apple.com/design/human-interface-guidelines/
 */

export const ios = {
  // System Colors (Light Mode)
  colors: {
    // Backgrounds
    systemBackground: '#FFFFFF',
    secondarySystemBackground: '#F2F2F7',
    tertiarySystemBackground: '#FFFFFF',
    groupedBackground: '#F2F2F7',
    secondaryGroupedBackground: '#FFFFFF',

    // Labels
    label: '#000000',
    secondaryLabel: 'rgba(60, 60, 67, 0.6)',
    tertiaryLabel: 'rgba(60, 60, 67, 0.3)',
    quaternaryLabel: 'rgba(60, 60, 67, 0.18)',

    // Fills
    systemFill: 'rgba(120, 120, 128, 0.2)',
    secondarySystemFill: 'rgba(120, 120, 128, 0.16)',
    tertiarySystemFill: 'rgba(118, 118, 128, 0.12)',
    quaternarySystemFill: 'rgba(116, 116, 128, 0.08)',

    // System Grays
    systemGray: '#8E8E93',
    systemGray2: '#AEAEB2',
    systemGray3: '#C7C7CC',
    systemGray4: '#D1D1D6',
    systemGray5: '#E5E5EA',
    systemGray6: '#F2F2F7',

    // Separators
    separator: 'rgba(60, 60, 67, 0.12)',
    opaqueSeparator: '#C6C6C8',

    // System Colors
    systemBlue: '#007AFF',
    systemGreen: '#34C759',
    systemIndigo: '#5856D6',
    systemOrange: '#FF9500',
    systemPink: '#FF2D55',
    systemPurple: '#AF52DE',
    systemRed: '#FF3B30',
    systemTeal: '#5AC8FA',
    systemYellow: '#FFCC00',
  },

  // Blur Effects
  blur: {
    regular: 'saturate(180%) blur(20px)',
    prominent: 'saturate(200%) blur(30px)',
    ultraThin: 'saturate(150%) blur(10px)',
    thick: 'saturate(190%) blur(25px)',
    chrome: 'saturate(180%) blur(20px)',
  },

  // Shadows
  shadow: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
    xl: '0 12px 40px rgba(0, 0, 0, 0.16)',

    // iOS-specific shadows
    card: '0 2px 8px rgba(0, 0, 0, 0.08)',
    elevated: '0 8px 32px rgba(0, 0, 0, 0.12)',
    float: '0 16px 48px rgba(0, 0, 0, 0.2)',
  },

  // Border Radius
  radius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 22,
    '2xl': 28,
    '3xl': 38,
    full: 9999,

    // iOS-specific
    card: 13,
    button: 12,
    input: 10,
    modal: 38,
    dynamicIsland: 44,
  },

  // Spacing (based on 4pt grid)
  spacing: {
    0: 0,
    px: 1,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    2.5: 10,
    3: 12,
    3.5: 14,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,

    // Safe Areas
    safeAreaTop: 59,      // Dynamic Island + status bar
    safeAreaBottom: 34,   // Home indicator
    tabBarHeight: 83,     // Tab bar including safe area
    navBarHeight: 44,     // Navigation bar
    statusBarHeight: 54,  // Status bar with Dynamic Island
  },

  // Typography
  typography: {
    // Large Title - Used for main screens
    largeTitle: {
      size: 34,
      lineHeight: 41,
      weight: 700,
      tracking: 0.37,
    },

    // Title 1 - Section headers
    title1: {
      size: 28,
      lineHeight: 34,
      weight: 700,
      tracking: 0.36,
    },

    // Title 2 - Subsection headers
    title2: {
      size: 22,
      lineHeight: 28,
      weight: 700,
      tracking: 0.35,
    },

    // Title 3 - Card titles
    title3: {
      size: 20,
      lineHeight: 25,
      weight: 600,
      tracking: 0.38,
    },

    // Headline - Important text
    headline: {
      size: 17,
      lineHeight: 22,
      weight: 600,
      tracking: -0.41,
    },

    // Body - Standard text
    body: {
      size: 17,
      lineHeight: 22,
      weight: 400,
      tracking: -0.41,
    },

    // Callout - Slightly smaller body
    callout: {
      size: 16,
      lineHeight: 21,
      weight: 400,
      tracking: -0.32,
    },

    // Subheadline - Secondary text
    subheadline: {
      size: 15,
      lineHeight: 20,
      weight: 400,
      tracking: -0.24,
    },

    // Footnote - Small text
    footnote: {
      size: 13,
      lineHeight: 18,
      weight: 400,
      tracking: -0.08,
    },

    // Caption 1 - Very small text
    caption1: {
      size: 12,
      lineHeight: 16,
      weight: 400,
      tracking: 0,
    },

    // Caption 2 - Smallest text
    caption2: {
      size: 11,
      lineHeight: 13,
      weight: 400,
      tracking: 0.07,
    },
  },

  // Animation durations (in ms)
  animation: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,

    // iOS spring presets
    spring: {
      snappy: { type: 'spring', stiffness: 400, damping: 30 },
      bouncy: { type: 'spring', stiffness: 300, damping: 20 },
      gentle: { type: 'spring', stiffness: 200, damping: 25 },
    },
  },

  // iPhone 15 Pro dimensions
  device: {
    width: 393,           // Logical points
    height: 852,          // Logical points
    dynamicIsland: {
      width: 126,
      height: 37.33,
      radius: 44,
    },
    homeIndicator: {
      width: 134,
      height: 5,
      radius: 2.5,
    },
  },
} as const

// Type exports
export type IOSColors = typeof ios.colors
export type IOSTypography = typeof ios.typography
export type IOSSpacing = typeof ios.spacing
export type IOSRadius = typeof ios.radius
export type IOSShadow = typeof ios.shadow

// Helper to get typography styles as CSS
export function getTypographyStyles(variant: keyof typeof ios.typography) {
  const t = ios.typography[variant]
  return {
    fontSize: `${t.size}px`,
    lineHeight: `${t.lineHeight}px`,
    fontWeight: t.weight,
    letterSpacing: `${t.tracking}px`,
  }
}

// Helper to create iOS-style color with opacity
export function withOpacity(color: string, opacity: number): string {
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/, `${opacity})`)
  }
  if (color.startsWith('#')) {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  return color
}
