import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'unknown',
      ai: 'unknown',
      environment: 'unknown'
    }
  }

  try {
    // Check database connection using anon key (safer for health checks)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      
      // Use a simple query that doesn't require authentication
      const { error } = await supabase.rpc('get_database_health')
      checks.checks.database = error ? 'unhealthy' : 'healthy'
    }

    // Check AI configuration
    checks.checks.ai = (process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) ? 'configured' : 'not configured'

    // Check environment
    checks.checks.environment = process.env.NODE_ENV || 'development'

    // Overall health
    const isHealthy = checks.checks.database === 'healthy'
    checks.status = isHealthy ? 'healthy' : 'unhealthy'

    return NextResponse.json(checks, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    checks.status = 'error'
    return NextResponse.json(checks, { status: 503 })
  }
}