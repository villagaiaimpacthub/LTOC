'use client'
import { useState } from 'react'
import { 
  Brain, FileText, Sparkles, Download, 
  RefreshCw, Settings, ChevronRight
} from 'lucide-react'

export default function SynthesisPage() {
  const [selectedTheories, setSelectedTheories] = useState<number[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [synthesis, setSynthesis] = useState('')
  
  const availableTheories = [
    { id: 1, title: 'Education Innovation Framework', category: 'Education' },
    { id: 2, title: 'Climate Action Roadmap 2030', category: 'Environment' },
    { id: 3, title: 'Healthcare Access Equity Model', category: 'Health' },
    { id: 4, title: 'Economic Empowerment Strategy', category: 'Economy' },
    { id: 5, title: 'Digital Inclusion Initiative', category: 'Technology' },
  ]

  const generateSynthesis = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setSynthesis(`# AI-Generated Synthesis Report

## Executive Summary
Based on the analysis of ${selectedTheories.length} theories of change, several cross-cutting themes emerge that highlight the interconnected nature of systems change initiatives.

## Common Patterns Identified

### 1. Community-Centered Approaches
All selected theories emphasize the importance of community engagement and local ownership. This pattern suggests that sustainable change requires:
- Active participation from beneficiaries
- Local capacity building
- Cultural sensitivity and adaptation

### 2. Technology as an Enabler
Technology appears as a recurring enabler across theories:
- Digital platforms for education access
- Data systems for healthcare delivery
- Mobile solutions for financial inclusion

### 3. Multi-Stakeholder Collaboration
Success factors consistently include:
- Public-private partnerships
- Cross-sector collaboration
- Coordinated funding strategies

## Synthesis of Strategies

### Integrated Intervention Framework
By combining insights from the selected theories, an integrated approach emerges:

1. **Foundation Layer**: Community engagement and trust building
2. **Infrastructure Layer**: Technology and physical systems
3. **Service Layer**: Delivery of interventions
4. **Sustainability Layer**: Local capacity and funding models

## Recommended Actions

1. **Create Cross-Theory Working Groups**
   - Share learnings and best practices
   - Identify collaboration opportunities
   - Develop integrated metrics

2. **Develop Unified Impact Measurement**
   - Common indicators across theories
   - Shared data collection methods
   - Regular synthesis reports

3. **Resource Optimization**
   - Identify shared infrastructure needs
   - Pool funding for common elements
   - Coordinate implementation timelines

## Conclusion
The synthesis reveals significant opportunities for leveraging synergies across different theories of change. By adopting an integrated systems approach, organizations can amplify their impact and create more sustainable outcomes.`)
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Synthesis Generator</h1>
        <p className="text-gray-600">Generate insights by synthesizing multiple theories of change</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Select Theories</h2>
            <p className="text-sm text-gray-600 mb-4">
              Choose theories to include in the synthesis
            </p>
            
            <div className="space-y-2">
              {availableTheories.map((theory) => (
                <label
                  key={theory.id}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTheories.includes(theory.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTheories([...selectedTheories, theory.id])
                      } else {
                        setSelectedTheories(selectedTheories.filter(id => id !== theory.id))
                      }
                    }}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{theory.title}</p>
                    <p className="text-xs text-gray-500">{theory.category}</p>
                  </div>
                </label>
              ))}
            </div>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={generateSynthesis}
                disabled={selectedTheories.length < 2 || isGenerating}
                className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Synthesis
                  </>
                )}
              </button>
              
              <button className="w-full btn-secondary justify-center">
                <Settings className="w-4 h-4" />
                Advanced Options
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Synthesis Result</h2>
              {synthesis && (
                <button className="btn-secondary">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              )}
            </div>
            
            <div className="p-6">
              {synthesis ? (
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ 
                    __html: synthesis
                      .split('\n')
                      .map(line => {
                        if (line.startsWith('# ')) return `<h1 class="text-2xl font-bold mb-4">${line.slice(2)}</h1>`
                        if (line.startsWith('## ')) return `<h2 class="text-xl font-semibold mt-6 mb-3">${line.slice(3)}</h2>`
                        if (line.startsWith('### ')) return `<h3 class="text-lg font-medium mt-4 mb-2">${line.slice(4)}</h3>`
                        if (line.startsWith('- ')) return `<li class="ml-6">${line.slice(2)}</li>`
                        if (line.startsWith('1. ')) return `<li class="ml-6 list-decimal"><strong>${line.slice(3).split(':')[0]}</strong>:${line.slice(3).split(':').slice(1).join(':')}</li>`
                        if (line.trim() === '') return '<br/>'
                        return `<p class="mb-3">${line}</p>`
                      })
                      .join('\n')
                  }} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No synthesis generated yet</h3>
                  <p className="text-gray-600">
                    Select at least 2 theories and click "Generate Synthesis" to create an AI-powered analysis
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {synthesis && (
            <div className="mt-6 card p-6">
              <h3 className="font-semibold mb-4">Synthesis Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">87%</div>
                  <div className="text-sm text-gray-600">Strategy Overlap</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">12</div>
                  <div className="text-sm text-gray-600">Common Themes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">5</div>
                  <div className="text-sm text-gray-600">Action Items</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
