import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@ltoc/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@ltoc/ui'
import { SynthesisGenerator } from '@/components/synthesis-generator'
import { Brain, Sparkles } from 'lucide-react'

export default async function SynthesisPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  // Get existing syntheses
  const { data: syntheses } = await supabase
    .from('ai_syntheses')
    .select(`
      *,
      organization:organizations(name)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get published content count for context
  const { count: contentCount } = await supabase
    .from('content')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Synthesis</h1>
        </div>
        <p className="text-muted-foreground">
          Generate AI-powered synthesis from our collective knowledge base
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SynthesisGenerator contentCount={contentCount || 0} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Our AI synthesis engine analyzes multiple contributions to create
                comprehensive overviews while maintaining proper attribution.
              </p>
              <p>
                Select content pieces and choose a synthesis level:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Executive</strong>: Brief 200-300 word summary</li>
                <li><strong>Detailed</strong>: Thorough 500-800 word analysis</li>
                <li><strong>Comprehensive</strong>: In-depth 1000+ word synthesis</li>
              </ul>
              <p>
                Each synthesis includes confidence scores, identified gaps,
                and full attribution to original contributors.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Syntheses</CardTitle>
              <CardDescription>
                Previously generated syntheses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syntheses && syntheses.length > 0 ? (
                <div className="space-y-3">
                  {syntheses.slice(0, 5).map((synthesis) => (
                    <div key={synthesis.id} className="space-y-1">
                      <p className="text-sm font-medium">
                        {synthesis.synthesis_level} synthesis
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {synthesis.content_ids.length} sources • 
                        {synthesis.confidence_score ? ` ${Math.round(synthesis.confidence_score * 100)}% confidence • ` : ' '}
                        {new Date(synthesis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No syntheses generated yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}