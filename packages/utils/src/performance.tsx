import React from 'react'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private timers: Map<string, number> = new Map()

  // Start timing an operation
  startTimer(name: string): void {
    this.timers.set(name, performance.now())
  }

  // End timing and record the metric
  endTimer(name: string, metadata?: Record<string, any>): number | null {
    const startTime = this.timers.get(name)
    if (!startTime) {
      console.warn(`Timer ${name} was not started`)
      return null
    }

    const duration = performance.now() - startTime
    this.timers.delete(name)

    this.recordMetric(name, duration, 'ms', metadata)
    return duration
  }

  // Record a custom metric
  recordMetric(
    name: string, 
    value: number, 
    unit: string = 'count',
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      ...metadata
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const metrics = this.metrics.get(name)!
    metrics.push(metric)

    // Keep only last 100 metrics per name to prevent memory leaks
    if (metrics.length > 100) {
      metrics.shift()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value}${unit}`, metadata)
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      this.sendToAnalytics(metric)
    }
  }

  // Get metrics for a specific operation
  getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || []
  }

  // Get average for a metric
  getAverage(name: string): number | null {
    const metrics = this.getMetrics(name)
    if (metrics.length === 0) return null

    const sum = metrics.reduce((acc, m) => acc + m.value, 0)
    return sum / metrics.length
  }

  // Get percentile for a metric
  getPercentile(name: string, percentile: number): number | null {
    const metrics = this.getMetrics(name)
    if (metrics.length === 0) return null

    const sorted = [...metrics].sort((a, b) => a.value - b.value)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[index].value
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear()
    this.timers.clear()
  }

  // Send metrics to analytics service
  private sendToAnalytics(metric: PerformanceMetric): void {
    // Example: Send to Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'performance', {
        event_category: 'Performance',
        event_label: metric.name,
        value: Math.round(metric.value),
        metric_unit: metric.unit
      })
    }

    // Example: Send to custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'performance',
          ...metric 
        })
      }).catch(err => console.error('Failed to send analytics:', err))
    }
  }

  // Get a performance report
  getReport(): Record<string, any> {
    const report: Record<string, any> = {}

    this.metrics.forEach((metrics, name) => {
      if (metrics.length === 0) return

      const values = metrics.map(m => m.value)
      const sorted = [...values].sort((a, b) => a - b)

      report[name] = {
        count: metrics.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
        unit: metrics[0].unit
      }
    })

    return report
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return performanceMonitor
}

// HOC for monitoring component render performance
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    React.useEffect(() => {
      performanceMonitor.startTimer(`${componentName}.mount`)
      return () => {
        performanceMonitor.endTimer(`${componentName}.mount`)
      }
    }, [])

    React.useEffect(() => {
      performanceMonitor.recordMetric(`${componentName}.render`, 1)
    })

    return <Component {...props} />
  }
}

// Utility to measure async operations
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  performanceMonitor.startTimer(name)
  try {
    const result = await operation()
    performanceMonitor.endTimer(name, { ...metadata, status: 'success' })
    return result
  } catch (error) {
    performanceMonitor.endTimer(name, { ...metadata, status: 'error' })
    throw error
  }
}

// Web Vitals integration
export function reportWebVitals(metric: any) {
  performanceMonitor.recordMetric(
    `web-vitals.${metric.name}`,
    metric.value,
    'ms',
    {
      id: metric.id,
      label: metric.label,
      navigation: metric.attribution?.navigation
    }
  )
}