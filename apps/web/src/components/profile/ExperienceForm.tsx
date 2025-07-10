'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Briefcase, Calendar, Plus, X, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@ltoc/ui'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase-client'
import type { UserExperience } from '@/types/profile'

const experienceSchema = z.object({
  organization_name: z.string().min(2, 'Organization name is required'),
  role: z.string().min(2, 'Role is required'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  is_current: z.boolean(),
})

type ExperienceFormData = z.infer<typeof experienceSchema>

interface ExperienceFormProps {
  userId: string
  experiences: UserExperience[]
  onUpdate?: () => void
}

export function ExperienceForm({ userId, experiences, onUpdate }: ExperienceFormProps) {
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [userExperiences, setUserExperiences] = useState(experiences)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
  })

  const isCurrent = watch('is_current')

  const handleAdd = async (data: ExperienceFormData) => {
    try {
      const { error } = await supabase
        .from('user_experiences')
        .insert({
          user_id: userId,
          ...data,
          end_date: data.is_current ? null : data.end_date,
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Experience added successfully',
      })

      // Refresh experiences
      const { data: updated } = await supabase
        .from('user_experiences')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false })

      if (updated) {
        setUserExperiences(updated)
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

  const handleEdit = async (data: ExperienceFormData) => {
    if (!editingId) return

    try {
      const { error } = await supabase
        .from('user_experiences')
        .update({
          ...data,
          end_date: data.is_current ? null : data.end_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Experience updated successfully',
      })

      // Refresh experiences
      const { data: updated } = await supabase
        .from('user_experiences')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false })

      if (updated) {
        setUserExperiences(updated)
      }

      reset()
      setEditingId(null)
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
    if (!confirm('Are you sure you want to delete this experience?')) return

    try {
      const { error } = await supabase
        .from('user_experiences')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Experience deleted successfully',
      })

      setUserExperiences(userExperiences.filter(exp => exp.id !== id))
      onUpdate?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const startEdit = (experience: UserExperience) => {
    setEditingId(experience.id)
    setValue('organization_name', experience.organization_name)
    setValue('role', experience.role)
    setValue('description', experience.description || '')
    setValue('start_date', experience.start_date.split('T')[0])
    setValue('end_date', experience.end_date ? experience.end_date.split('T')[0] : '')
    setValue('is_current', experience.is_current)
    setIsAdding(false)
  }

  const cancelEdit = () => {
    reset()
    setEditingId(null)
    setIsAdding(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Work Experience</h3>
        {!isAdding && !editingId && (
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <form 
          onSubmit={handleSubmit(editingId ? handleEdit : handleAdd)}
          className="bg-gray-50 rounded-lg p-4 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Organization</label>
              <input
                {...register('organization_name')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Company name"
              />
              {errors.organization_name && (
                <p className="text-red-500 text-sm mt-1">{errors.organization_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <input
                {...register('role')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Your position"
              />
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your responsibilities and achievements..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                {...register('start_date')}
                type="date"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                {...register('end_date')}
                type="date"
                disabled={isCurrent}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  {...register('is_current')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">I currently work here</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={cancelEdit}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Add'} Experience
            </Button>
          </div>
        </form>
      )}

      {/* Experience List */}
      <div className="space-y-4">
        {userExperiences.map((experience) => (
          <div
            key={experience.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{experience.role}</h4>
                  <p className="text-gray-600">{experience.organization_name}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(experience.start_date).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })} - {
                      experience.is_current
                        ? 'Present'
                        : experience.end_date
                          ? new Date(experience.end_date).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'Present'
                    }
                  </div>
                  {experience.description && (
                    <p className="text-sm text-gray-700 mt-2">{experience.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => startEdit(experience)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(experience.id)}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}