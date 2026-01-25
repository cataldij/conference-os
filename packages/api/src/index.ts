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
  saveSession,
  unsaveSession,
  getUserSavedSessions,
  getConferenceTracks,
  getConferenceRooms,
  createConference,
  conferenceSchema,
} from './conferences'
export type { ConferenceInput, ConferenceWithDetails } from './conferences'

// Database types
export type { Json } from './database.types'
