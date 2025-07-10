export interface UserProfile {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
  linkedin_url?: string
  twitter_handle?: string
  github_url?: string
  skills?: string[]
  interests?: string[]
  role: string
  is_public: boolean
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface UserExperience {
  id: string
  user_id: string
  organization_name: string
  role: string
  description?: string
  start_date: string
  end_date?: string
  is_current: boolean
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  title: string
  description?: string
  date_achieved?: string
  category: 'certification' | 'award' | 'publication' | 'project' | 'other'
  url?: string
  created_at: string
}

export interface UserSocialLink {
  id: string
  user_id: string
  platform: string
  url: string
  username?: string
  created_at: string
}

export interface UserStats {
  theories_count: number
  collaborations_count: number
  contributions_count: number
  followers_count: number
  following_count: number
}

export interface UserFollow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface ProfileWithRelations extends UserProfile {
  user_experiences?: UserExperience[]
  user_achievements?: UserAchievement[]
  user_social_links?: UserSocialLink[]
}