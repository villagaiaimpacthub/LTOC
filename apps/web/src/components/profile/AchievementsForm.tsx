'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Award, BookOpen, ExternalLink, Plus, X, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@ltoc/ui'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase-client'
import type { UserAchievement } from '@/types/profile'

const achievementSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  date_achieved: z.string().optional(),
  category: z.enum(['certification', 'award', 'publication', 'project', 'other']),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type AchievementFormData = z.infer<typeof achievementSchema>

interface AchievementsFormProps {
  userId: string
  achievements: UserAchievement[]
  onUpdate?: () => void
}

export function AchievementsForm({ userId, achievements, onUpdate }: AchievementsFormProps) {
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [userAchievements, setUserAchievements] = useState(achievements)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<AchievementFormData>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      category: 'other'
    }
  })

  const handleAdd = async (data: AchievementFormData) => {
    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          ...data,
          url: data.url || null,
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Achievement added successfully',
      })

      // Refresh achievements
      const { data: updated } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('date_achieved', { ascending: false, nullsFirst: false })

      if (updated) {
        setUserAchievements(updated)
      }

      reset()
      setIsAdding(false)
      onUpdate?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return

    try {
      const { error } = await supabase
        .from('user_achievements')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Achievement deleted successfully',
      })

      setUserAchievements(userAchievements.filter(ach => ach.id !== id))
      onUpdate?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const getCategoryIcon = (category: UserAchievement['category']) => {
    switch (category) {
      case 'publication':
        return <BookOpen className="w-4 h-4" />
      case 'award':
        return <Award className="w-4 h-4" />
      case 'certification':
        return <Award className="w-4 h-4" />
      default:
        return <Award className="w-4 h-4" />
    }
  }

  const getCategoryLabel = (category: UserAchievement['category']) => {
    switch (category) {
      case 'publication':
        return 'Publication'
      case 'award':
        return 'Award'
      case 'certification':
        return 'Certification'
      case 'project':
        return 'Project'
      default:
        return 'Other'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Achievements & Publications</h3>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Achievement
          </Button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <form 
          onSubmit={handleSubmit(handleAdd)}
          className="bg-gray-50 rounded-lg p-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              {...register('title')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Achievement title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="certification">Certification</option>
                <option value="award">Award</option>
                <option value="publication">Publication</option>
                <option value="project">Project</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                {...register('date_achieved')}
                type="date"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL (optional)</label>
            <input
              {...register('url')}
              type="url"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
            {errors.url && (
              <p className="text-red-500 text-sm mt-1">{errors.url.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                setIsAdding(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Achievement'}
            </Button>
          </div>
        </form>
      )}

      {/* Achievements List */}
      <div className="space-y-3">
        {userAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getCategoryIcon(achievement.category)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                  {achievement.description && (
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {getCategoryLabel(achievement.category)}
                    </span>
                    {achievement.date_achieved && (
                      <span className="text-xs text-gray-500">
                        {new Date(achievement.date_achieved).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    )}
                    {achievement.url && (
                      <a 
                        href={achievement.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleDelete(achievement.id)}
                className="p-1 hover:bg-red-100 rounded ml-2"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}

        {userAchievements.length === 0 && !isAdding && (
          <p className="text-center text-gray-500 py-8">
            No achievements added yet. Add your certifications, awards, or publications to showcase your expertise.
          </p>
        )}
      </div>
    </div>
  )
}