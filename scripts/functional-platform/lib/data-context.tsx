'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface Theory {
  id: string
  title: string
  content: string
  status: 'draft' | 'in-review' | 'published'
  author: string
  collaborators: number
  impact: number
  created: string
  updated: string
}

interface DataContextType {
  theories: Theory[]
  addTheory: (theory: Omit<Theory, 'id' | 'created' | 'updated'>) => void
  updateTheory: (id: string, updates: Partial<Theory>) => void
  deleteTheory: (id: string) => void
  getTheory: (id: string) => Theory | undefined
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [theories, setTheories] = useState<Theory[]>([
    {
      id: '1',
      title: 'Education Reform Through Technology',
      content: '# Education Reform Through Technology\n\n## Executive Summary\n\nThis theory of change outlines how technology can be leveraged to transform education systems, making them more accessible, personalized, and effective.\n\n## Problem Statement\n\nTraditional education systems are struggling to meet the diverse needs of modern learners. Key challenges include:\n- One-size-fits-all approach\n- Limited access in rural areas\n- Outdated teaching methods\n- Lack of personalization\n\n## Theory of Change\n\nIf we integrate adaptive learning technologies and provide teacher training, then we can create personalized learning experiences that improve outcomes for all students.\n\n## Implementation Strategy\n\n1. **Phase 1**: Pilot program in 10 schools\n2. **Phase 2**: Scale to 100 schools\n3. **Phase 3**: National rollout\n\n## Expected Outcomes\n\n- 30% improvement in student engagement\n- 25% increase in learning outcomes\n- Reduced education inequality',
      status: 'published',
      author: 'Sarah Anderson',
      collaborators: 12,
      impact: 8.5,
      created: '2024-01-01',
      updated: '2024-01-15'
    },
    {
      id: '2',
      title: 'Climate Action Framework',
      content: '# Climate Action Framework\n\n## Overview\n\nA comprehensive approach to address climate change through community-driven initiatives.\n\n## Key Components\n\n1. Renewable energy adoption\n2. Sustainable transportation\n3. Waste reduction programs\n4. Community education',
      status: 'in-review',
      author: 'Sarah Anderson',
      collaborators: 8,
      impact: 9.2,
      created: '2024-01-05',
      updated: '2024-01-18'
    }
  ])

  const addTheory = (theory: Omit<Theory, 'id' | 'created' | 'updated'>) => {
    const newTheory: Theory = {
      ...theory,
      id: Date.now().toString(),
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }
    setTheories([...theories, newTheory])
  }

  const updateTheory = (id: string, updates: Partial<Theory>) => {
    setTheories(theories.map(theory => 
      theory.id === id 
        ? { ...theory, ...updates, updated: new Date().toISOString() }
        : theory
    ))
  }

  const deleteTheory = (id: string) => {
    setTheories(theories.filter(theory => theory.id !== id))
  }

  const getTheory = (id: string) => {
    return theories.find(theory => theory.id === id)
  }

  return (
    <DataContext.Provider value={{ theories, addTheory, updateTheory, deleteTheory, getTheory }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
