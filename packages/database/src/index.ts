export { supabase, createAdminClient } from './client'
export type { Database } from './types/supabase'

// Export commonly used types
export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

export type Organization = Tables['organizations']['Row']
export type User = Tables['users']['Row']
export type Content = Tables['content']['Row']
export type Review = Tables['reviews']['Row']

export type UserRole = Enums['user_role']
export type ContentStatus = Enums['content_status']
export type ReviewDecision = Enums['review_decision']
export type ActivityType = Enums['activity_type']

// Helper types
export type InsertUser = Tables['users']['Insert']
export type UpdateUser = Tables['users']['Update']
export type InsertContent = Tables['content']['Insert']
export type UpdateContent = Tables['content']['Update']