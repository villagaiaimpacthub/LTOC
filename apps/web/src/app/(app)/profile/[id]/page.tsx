import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { 
  Calendar, MapPin, Globe, Linkedin, Twitter, 
  Mail, Users, FileText, Award, Briefcase,
  Edit, UserPlus, UserMinus
} from 'lucide-react'
import { Button } from '@ltoc/ui'
import { createServerClient } from '@/lib/supabase-server'
import Link from 'next/link'

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

  // Get profile data
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
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.display_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl font-semibold text-gray-600">
                    {profile.display_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.display_name}</h1>
              <p className="text-gray-600">{profile.role}</p>
              {profile.location && (
                <p className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {profile.location}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            {isOwnProfile ? (
              <Link href="/settings/profile">
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            ) : currentUser && (
              <>
                {following ? (
                  <Button variant="outline">
                    <UserMinus className="w-4 h-4 mr-2" />
                    Unfollow
                  </Button>
                ) : (
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                )}
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="text-gray-700 mb-6">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4 border-t border-b">
          <div className="text-center">
            <p className="text-2xl font-semibold">{stats?.theories_count || 0}</p>
            <p className="text-sm text-gray-500">Theories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold">{stats?.collaborations_count || 0}</p>
            <p className="text-sm text-gray-500">Collaborations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold">{stats?.contributions_count || 0}</p>
            <p className="text-sm text-gray-500">Contributions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold">{stats?.followers_count || 0}</p>
            <p className="text-sm text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold">{stats?.following_count || 0}</p>
            <p className="text-sm text-gray-500">Following</p>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center space-x-4 mt-4">
          {profile.website && (
            <a 
              href={profile.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-gray-600 hover:text-blue-600"
            >
              <Globe className="w-4 h-4 mr-1" />
              Website
            </a>
          )}
          {profile.linkedin_url && (
            <a 
              href={profile.linkedin_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-gray-600 hover:text-blue-600"
            >
              <Linkedin className="w-4 h-4 mr-1" />
              LinkedIn
            </a>
          )}
          {profile.twitter_handle && (
            <a 
              href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-gray-600 hover:text-blue-600"
            >
              <Twitter className="w-4 h-4 mr-1" />
              {profile.twitter_handle}
            </a>
          )}
          {profile.is_public && profile.email && (
            <a 
              href={`mailto:${profile.email}`}
              className="flex items-center text-gray-600 hover:text-blue-600"
            >
              <Mail className="w-4 h-4 mr-1" />
              Email
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills & Interests */}
          {(profile.skills?.length > 0 || profile.interests?.length > 0) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              {profile.skills?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {profile.interests?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Experience */}
          {profile.user_experiences?.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Experience
              </h3>
              <div className="space-y-4">
                {profile.user_experiences.map((exp: any) => (
                  <div key={exp.id} className="border-l-2 border-gray-200 pl-4">
                    <h4 className="font-medium">{exp.role}</h4>
                    <p className="text-sm text-gray-600">{exp.organization_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(exp.start_date).getFullYear()} - 
                      {exp.is_current ? ' Present' : ` ${new Date(exp.end_date).getFullYear()}`}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {profile.user_achievements?.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Achievements
              </h3>
              <div className="space-y-3">
                {profile.user_achievements.map((achievement: any) => (
                  <div key={achievement.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">{achievement.title}</h4>
                      {achievement.description && (
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      )}
                      {achievement.date_achieved && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(achievement.date_achieved).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Theories */}
          {recentTheories && recentTheories.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Recent Theories
              </h3>
              <div className="space-y-3">
                {recentTheories.map((theory) => (
                  <Link 
                    key={theory.id}
                    href={`/theories/${theory.id}`}
                    className="block hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                  >
                    <p className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      {theory.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(theory.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
              <Link 
                href={`/theories?author=${params.id}`}
                className="text-sm text-blue-600 hover:text-blue-700 mt-3 inline-block"
              >
                View all theories →
              </Link>
            </div>
          )}

          {/* Member Since */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              Member since {new Date(profile.created_at).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}