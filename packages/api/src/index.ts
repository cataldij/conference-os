// Client
export { getSupabase, getSupabaseAdmin } from './client'
export type {
  Database,
  Tables,
  Profile,
  Conference,
  ConferenceMember,
  Session,
  Track,
  Room,
  SavedSession,
  Connection,
  Message,
} from './client'

// Auth
export {
  signUp,
  signIn,
  signInWithOAuth,
  signOut,
  resetPassword,
  updatePassword,
  getSession,
  getUser,
  getProfile,
  getCurrentProfile,
  updateProfile,
  updateAvatar,
  onAuthStateChange,
  signUpSchema,
  signInSchema,
  profileUpdateSchema,
} from './auth'
export type { SignUpInput, SignInInput, ProfileUpdateInput } from './auth'

// Conferences
export {
  getPublicConferences,
  getUpcomingConferences,
  getConferenceBySlug,
  getConferenceById,
  getUserConferences,
  joinConference,
  getConferenceMembership,
  checkInAttendee,
  getConferenceSessions,
  getSessionsByDate,
  getSessionById,
  getSessionQuestions,
  getUserUpvotedQuestionIds,
  askSessionQuestion,
  toggleSessionQuestionUpvote,
  getSessionPolls,
  getPollResponseCounts,
  getUserPollResponses,
  submitPollResponse,
  getSessionAttendanceCount,
  saveSession,
  unsaveSession,
  getUserSavedSessions,
  getConferenceTracks,
  getConferenceRooms,
  createConference,
  conferenceSchema,
  // AI Recommendations
  getSessionRecommendations,
  trackSessionInteraction,
  updateUserInterests,
} from './conferences'
export type {
  ConferenceInput,
  ConferenceWithDetails,
  SessionRecommendation,
  SessionQuestion,
  SessionPoll,
  SessionPollOption,
  PollResponseCounts,
  UserPollResponses,
} from './conferences'

// Networking
export {
  getConferenceAttendees,
  getUserConnections,
  getPendingConnectionRequests,
  sendConnectionRequest,
  respondToConnectionRequest,
  removeConnection,
  getConnectionStats,
} from './networking'
export type { AttendeeProfile, ConnectionWithProfile } from './networking'

// Messaging
export {
  getOrCreateDirectChat,
  getUserChatRooms,
  getRoomMessages,
  sendMessage,
  markRoomAsRead,
  subscribeToRoomMessages,
  subscribeToUserChats,
  getChatRoom,
} from './messaging'
export type { ChatRoom, ChatRoomWithDetails, MessageWithSender } from './messaging'

// AI Conference Builder
export {
  generateConferenceDetails,
  generateTracks,
  generateSessions,
  generateSessionDescription,
  generateSpeakerBio,
  generateSchedule,
  generateMarketingCopy,
  chatWithAssistant,
  streamChatWithAssistant,
} from './ai-builder'
export type {
  AIGenerationType,
  ConferenceDetailsResponse,
  TrackSuggestion,
  TracksResponse,
  SessionSuggestion,
  SessionsResponse,
  SessionDescriptionResponse,
  SpeakerBioResponse,
  ScheduleResponse,
  MarketingCopyResponse,
  ChatMessage,
  AIGenerationResult,
  ConferenceDetailsContext,
  TracksContext,
  SessionsContext,
  SessionDescriptionContext,
  SpeakerBioContext,
  ScheduleContext,
  MarketingCopyContext,
} from './ai-builder'

// Design System
export {
  tokensToCSSVariables,
  tokensToCSS,
  getDesignTokens,
  getDesignTokensHistory,
  saveDesignTokens,
  revertToVersion,
  getSystemVariants,
  getConferenceVariants,
  createCustomVariant,
  getPageSections,
  savePageSections,
  reorderSections,
  getDesignPresets,
  getFeaturedPresets,
  applyPreset,
  generateStyles,
  saveAIGeneration,
  rateAIGeneration,
} from './design-system'
export type {
  DesignTokens,
  ColorTokens,
  TypographyTokens,
  SpacingTokens,
  BorderRadiusTokens,
  ShadowTokens,
  AnimationTokens,
  ComponentType,
  ComponentVariant,
  ComponentConfig,
  PageType,
  SectionType,
  PageSection,
  DesignPreset,
  AIStylePrompt,
  AIStyleGeneration,
  DesignTokensRecord,
  CSSVariables,
} from './design-system'
export { DEFAULT_TOKENS } from './design-system/types'

// Database types
export type { Json } from './database.types'
