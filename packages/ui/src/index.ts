// Tamagui config
export { tamaguiConfig, type TamaguiConfig } from './tamagui.config'

// Core components
export * from './Button'
export * from './Card'
export * from './Input'
export * from './Avatar'
export * from './Typography'
export * from './SessionCard'
export * from './Progress'

// Re-export Tamagui primitives for convenience
export {
  Stack,
  XStack,
  YStack,
  Text,
  Image,
  styled,
  Theme,
  TamaguiProvider,
  createTamagui,
  useTheme,
  useMedia,
} from '@tamagui/core'

// Re-export icons
export * from '@tamagui/lucide-icons'
