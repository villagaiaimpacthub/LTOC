import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileAbout } from '@/components/profile/ProfileAbout'
import { ProfileExperience } from '@/components/profile/ProfileExperience'
import { ProfileKnowledge } from '@/components/profile/ProfileKnowledge'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createServerClient()
  const { data: profile } = await supabase
    .from('users')
    .select('display_name, bio')
    .eq('id', params.id)
    .single()

  return {
    title: profile ? `${profile.display_name} - LTOC Platform` : 'User Profile',
    description: profile?.bio || 'View user profile on LTOC Platform',
  }
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  
  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const isOwnProfile = currentUser?.id === params.id

  // Get profile data with all related information
  const { data: profile, error } = await supabase
    .from('users')
    .select(`
      *,
      user_experiences(*),
      user_achievements(*),
      user_social_links(*)
    `)
    .eq('id', params.id)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Sort experiences by start date (most recent first)
  if (profile.user_experiences) {
    profile.user_experiences.sort((a: any, b: any) => 
      new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    )
  }

  // Get user stats
  const { data: stats } = await supabase
    .rpc('get_user_stats', { user_uuid: params.id })
    .single()

  // Check if following
  const { data: following } = currentUser
    ? await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', currentUser.id)
        .eq('following_id', params.id)
        .single()
    : { data: null }

  // Get recent theories
  const { data: recentTheories } = await supabase
    .from('content')
    .select('id, title, created_at')
    .eq('author_id', params.id)
    .eq('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(5)

  // Transform the profile data to include GitHub URL if stored in social links
  const githubLink = profile.user_social_links?.find((link: any) => link.platform === 'github')
  const enrichedProfile = {
    ...profile,
    github_url: githubLink?.url || profile.github_url
  }

  return (
    <div className="profile-container">
      {/* Profile Header with Stats and Social Links */}
      <ProfileHeader 
        profile={enrichedProfile}
        stats={stats || {
          theories_count: 0,
          collaborations_count: 0,
          contributions_count: 0,
          followers_count: 0,
          following_count: 0
        }}
        isOwnProfile={isOwnProfile}
        isFollowing={!!following}
        currentUserId={currentUser?.id}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <ProfileAbout 
            bio={profile.bio}
            skills={profile.skills}
            interests={profile.interests}
          />

          {/* Experience Section */}
          <ProfileExperience 
            experiences={profile.user_experiences || []}
          />
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Knowledge Hub */}
          <ProfileKnowledge 
            achievements={profile.user_achievements}
            recentTheories={recentTheories || []}
            userId={params.id}
          />
        </div>
      </div>
    </div>
  )
}