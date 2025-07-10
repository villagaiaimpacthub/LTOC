# LTOC Profile System Documentation

## Overview

The LTOC platform now includes a comprehensive user profile system with the following features:

- Custom-styled profile pages with the specified design system
- Profile management with experience and achievements tracking
- Social links integration (LinkedIn, Twitter, GitHub)
- Follow/unfollow functionality
- Profile statistics tracking
- Rich profile editing capabilities

## Components

### Profile Display Components

1. **ProfileHeader** (`/apps/web/src/components/profile/ProfileHeader.tsx`)
   - Displays user avatar, name, role, and location
   - Shows profile statistics (theories, collaborations, etc.)
   - Handles follow/unfollow actions
   - Displays social links

2. **ProfileAbout** (`/apps/web/src/components/profile/ProfileAbout.tsx`)
   - Shows user bio
   - Displays skills and interests with custom styling

3. **ProfileExperience** (`/apps/web/src/components/profile/ProfileExperience.tsx`)
   - Timeline view of work experience
   - Company logos support
   - Duration calculations

4. **ProfileKnowledge** (`/apps/web/src/components/profile/ProfileKnowledge.tsx`)
   - Recent theories display
   - Achievements and publications
   - External links support

### Profile Management Components

1. **ProfileForm** (`/apps/web/src/components/profile/ProfileForm.tsx`)
   - Basic profile information editing
   - Avatar upload
   - Social links management
   - Skills and interests management

2. **ExperienceForm** (`/apps/web/src/components/profile/ExperienceForm.tsx`)
   - Add/edit/delete work experience
   - Current position toggle
   - Rich descriptions

3. **AchievementsForm** (`/apps/web/src/components/profile/AchievementsForm.tsx`)
   - Manage certifications, awards, publications
   - Category-based organization
   - External URL support

## Database Schema

### New Fields Added to Users Table
- `github_url` - GitHub profile URL

### Existing Profile Tables
- `user_experiences` - Work history
- `user_achievements` - Awards, certifications, publications
- `user_social_links` - Social media profiles
- `user_follows` - Following relationships

## Styling

The profile system uses a custom color scheme defined in `globals.css`:

```css
--profile-primary: #B79277;
--profile-secondary: #406B63;
--profile-accent: #F4F0EB;
--profile-text: #333333;
--profile-text-light: #666666;
--profile-border: #E5E7EB;
--profile-hover: rgba(183, 146, 119, 0.1);
```

Custom CSS classes include:
- `.profile-container` - Main container layout
- `.profile-card` - Card styling with shadows
- `.profile-header` - Header gradient background
- `.profile-button-primary/secondary` - Custom button styles
- `.profile-timeline` - Experience timeline styling
- `.profile-tag` - Skill and interest tags

## Routes

- `/profile/[id]` - View user profile
- `/settings/profile` - Edit profile settings

## TypeScript Types

All profile-related types are defined in `/apps/web/src/types/profile.ts`:
- `UserProfile` - Main user profile interface
- `UserExperience` - Work experience interface
- `UserAchievement` - Achievement interface
- `UserStats` - Profile statistics interface

## Features

### Implemented
- ✅ Profile viewing with custom design
- ✅ Profile editing with all fields
- ✅ Experience management (CRUD)
- ✅ Achievement management (CRUD)
- ✅ Follow/unfollow functionality
- ✅ Social links (LinkedIn, Twitter, GitHub)
- ✅ Skills and interests tagging
- ✅ Profile statistics
- ✅ Avatar upload
- ✅ Responsive design

### Migration Required

Run the following migration to add GitHub URL support:
```bash
supabase migration up 009_add_github_profile
```

## Usage Examples

### Viewing a Profile
```typescript
// Navigate to profile
<Link href={`/profile/${userId}`}>View Profile</Link>
```

### Editing Profile
```typescript
// Navigate to settings
<Link href="/settings/profile">Edit Profile</Link>
```

### Following a User
The ProfileHeader component handles follow/unfollow actions automatically when a user clicks the follow button.

## Next Steps

Future enhancements could include:
- Profile visibility settings
- Custom profile themes
- Portfolio/project showcase
- Integration with content creation metrics
- Export profile as PDF/resume