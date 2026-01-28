import { Tabs } from 'expo-router'
import { useTheme as useTamaguiTheme } from '@tamagui/core'
import { Home, Calendar, Users, MessageCircle, User } from '@tamagui/lucide-icons'
import { useConference } from '../../hooks/useConference'

export default function TabsLayout() {
  const tamaguiTheme = useTamaguiTheme()
  const { theme: conferenceTheme } = useConference()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: conferenceTheme.tabBarActiveColor,
        tabBarInactiveTintColor: tamaguiTheme.colorSecondary?.val,
        tabBarStyle: {
          backgroundColor: conferenceTheme.tabBarColor,
          borderTopColor: tamaguiTheme.borderColor?.val,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          title: 'Network',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <MessageCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
