import { Stack } from 'expo-router'
import { useTheme, YStack } from '@tamagui/core'

export default function AuthLayout() {
  const theme = useTheme()

  return (
    <YStack flex={1} backgroundColor="$background">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.background?.val,
          },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
      </Stack>
    </YStack>
  )
}
