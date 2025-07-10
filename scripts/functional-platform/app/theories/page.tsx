'use client'
import { Plus, FileText, Clock, Users, TrendingUp, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'
import { useData } from '@/lib/data-context'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

export default function TheoriesPage() {
  const { theories, deleteTheory } = useData()
  const router = useRouter()

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this theory?')) {
      deleteTheory(id)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Theories</h1>
          <Link href="/theories/new" className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Theory
          </Link>
        </div>

        <div className="grid gap-6">
          {theories.map((theory) => (
            <div key={theory.id} className="profile-card p-6">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-2">{theory.title}</h3>
                  <div className="flex items-center gap-6 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Updated {format(new Date(theory.updated), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {theory.collaborators} collaborators
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Impact: {theory.impact}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  theory.status === 'published' ? 'bg-green-100 text-green-700' :
                  theory.status === 'in-review' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {theory.status.replace('-', ' ')}
                </span>
              </div>
              <div className="mt-4 flex gap-3">
                <Link href={`/theories/${theory.id}`} className="btn-accent px-3 py-1.5 rounded text-sm flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <Link href={`/theories/${theory.id}/edit`} className="btn-secondary px-3 py-1.5 rounded text-sm flex items-center gap-1">
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button 
                  onClick={() => handleDelete(theory.id)}
                  className="px-3 py-1.5 rounded text-sm flex items-center gap-1 bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
