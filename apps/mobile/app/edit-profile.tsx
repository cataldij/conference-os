import { useState } from 'react'
import {
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Stack, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import {
  YStack,
  XStack,
  Text,
  H2,
  Card,
  Button,
  Input,
  TextArea,
  Avatar,
} from '@conference-os/ui'
import {
  ChevronLeft,
  Camera,
  User,
  Briefcase,
  Building2,
  FileText,
  Linkedin,
  Twitter,
  Globe,
  Save,
} from '@tamagui/lucide-icons'
import { useAuth } from '../hooks/useAuth'

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets()
  const { profile, refreshProfile } = useAuth()

  // Form state
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [jobTitle, setJobTitle] = useState(profile?.job_title || '')
  const [company, setCompany] = useState(profile?.company || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || '')
  const [twitterUrl, setTwitterUrl] = useState(profile?.twitter_url || '')
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [isSaving, setIsSaving] = useState(false)

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setAvatarUrl(result.assets[0].uri)
      // TODO: Upload to Supabase Storage and get public URL
    }
  }

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your camera.')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setAvatarUrl(result.assets[0].uri)
      // TODO: Upload to Supabase Storage and get public URL
    }
  }

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.')
      return
    }

    setIsSaving(true)

    try {
      // TODO: Call Supabase to update profile
      // await supabase.from('profiles').update({
      //   full_name: fullName,
      //   job_title: jobTitle,
      //   company,
      //   bio,
      //   linkedin_url: linkedinUrl,
      //   twitter_url: twitterUrl,
      //   website_url: websiteUrl,
      //   avatar_url: avatarUrl,
      // }).eq('id', profile?.id)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      await refreshProfile()

      Alert.alert('Success', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const showAvatarOptions = () => {
    Alert.alert('Change Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Library', onPress: handlePickImage },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <YStack flex={1} backgroundColor="$background">
          {/* Header */}
          <XStack
            paddingTop={insets.top + 12}
            paddingBottom="$3"
            paddingHorizontal="$4"
            backgroundColor="$background"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
            alignItems="center"
            gap="$3"
          >
            <Pressable onPress={() => router.back()}>
              <XStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor="$backgroundStrong"
                alignItems="center"
                justifyContent="center"
              >
                <ChevronLeft size={24} color="$color" />
              </XStack>
            </Pressable>
            <H2 flex={1}>Edit Profile</H2>
            <Button
              variant="primary"
              size="sm"
              onPress={handleSave}
              disabled={isSaving}
              icon={Save}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </XStack>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 32,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <YStack paddingHorizontal="$5" paddingTop="$6" gap="$6">
              {/* Avatar */}
              <YStack alignItems="center" gap="$3">
                <Pressable onPress={showAvatarOptions}>
                  <YStack position="relative">
                    <Avatar
                      src={avatarUrl}
                      fallback={fullName || 'U'}
                      size="xxl"
                    />
                    <XStack
                      position="absolute"
                      bottom={0}
                      right={0}
                      width={36}
                      height={36}
                      borderRadius={18}
                      backgroundColor="$accentColor"
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={3}
                      borderColor="$background"
                    >
                      <Camera size={18} color="#FFFFFF" />
                    </XStack>
                  </YStack>
                </Pressable>
                <Text color="$colorSecondary" fontSize="$3">
                  Tap to change photo
                </Text>
              </YStack>

              {/* Basic Info */}
              <YStack gap="$4">
                <YStack gap="$2">
                  <XStack alignItems="center" gap="$2" paddingHorizontal="$1">
                    <User size={16} color="$colorSecondary" />
                    <Text fontSize="$3" fontWeight="600" color="$colorSecondary">
                      Full Name *
                    </Text>
                  </XStack>
                  <Input
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Your full name"
                    size="lg"
                  />
                </YStack>

                <YStack gap="$2">
                  <XStack alignItems="center" gap="$2" paddingHorizontal="$1">
                    <Briefcase size={16} color="$colorSecondary" />
                    <Text fontSize="$3" fontWeight="600" color="$colorSecondary">
                      Job Title
                    </Text>
                  </XStack>
                  <Input
                    value={jobTitle}
                    onChangeText={setJobTitle}
                    placeholder="e.g., Senior Product Manager"
                    size="lg"
                  />
                </YStack>

                <YStack gap="$2">
                  <XStack alignItems="center" gap="$2" paddingHorizontal="$1">
                    <Building2 size={16} color="$colorSecondary" />
                    <Text fontSize="$3" fontWeight="600" color="$colorSecondary">
                      Company
                    </Text>
                  </XStack>
                  <Input
                    value={company}
                    onChangeText={setCompany}
                    placeholder="e.g., Acme Corp"
                    size="lg"
                  />
                </YStack>

                <YStack gap="$2">
                  <XStack alignItems="center" gap="$2" paddingHorizontal="$1">
                    <FileText size={16} color="$colorSecondary" />
                    <Text fontSize="$3" fontWeight="600" color="$colorSecondary">
                      Bio
                    </Text>
                  </XStack>
                  <TextArea
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell others about yourself..."
                    numberOfLines={4}
                    size="lg"
                  />
                  <Text fontSize="$2" color="$colorTertiary" paddingHorizontal="$1">
                    {bio.length}/500 characters
                  </Text>
                </YStack>
              </YStack>

              {/* Social Links */}
              <YStack gap="$4">
                <Text fontSize="$4" fontWeight="700">
                  Social Links
                </Text>

                <YStack gap="$2">
                  <XStack alignItems="center" gap="$2" paddingHorizontal="$1">
                    <Linkedin size={16} color="$colorSecondary" />
                    <Text fontSize="$3" fontWeight="600" color="$colorSecondary">
                      LinkedIn
                    </Text>
                  </XStack>
                  <Input
                    value={linkedinUrl}
                    onChangeText={setLinkedinUrl}
                    placeholder="https://linkedin.com/in/username"
                    autoCapitalize="none"
                    keyboardType="url"
                    size="lg"
                  />
                </YStack>

                <YStack gap="$2">
                  <XStack alignItems="center" gap="$2" paddingHorizontal="$1">
                    <Twitter size={16} color="$colorSecondary" />
                    <Text fontSize="$3" fontWeight="600" color="$colorSecondary">
                      Twitter
                    </Text>
                  </XStack>
                  <Input
                    value={twitterUrl}
                    onChangeText={setTwitterUrl}
                    placeholder="https://twitter.com/username"
                    autoCapitalize="none"
                    keyboardType="url"
                    size="lg"
                  />
                </YStack>

                <YStack gap="$2">
                  <XStack alignItems="center" gap="$2" paddingHorizontal="$1">
                    <Globe size={16} color="$colorSecondary" />
                    <Text fontSize="$3" fontWeight="600" color="$colorSecondary">
                      Website
                    </Text>
                  </XStack>
                  <Input
                    value={websiteUrl}
                    onChangeText={setWebsiteUrl}
                    placeholder="https://yourwebsite.com"
                    autoCapitalize="none"
                    keyboardType="url"
                    size="lg"
                  />
                </YStack>
              </YStack>

              {/* Info Card */}
              <Card variant="outline" padding="$4">
                <Text color="$colorTertiary" fontSize="$2" textAlign="center">
                  Your profile is visible to other conference attendees.
                  You can control visibility in Settings.
                </Text>
              </Card>
            </YStack>
          </ScrollView>
        </YStack>
      </KeyboardAvoidingView>
    </>
  )
}
