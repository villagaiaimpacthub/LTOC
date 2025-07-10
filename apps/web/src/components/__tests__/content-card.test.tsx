import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContentCard } from '../content-card'
import { formatDistanceToNow } from 'date-fns'

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn((date) => '2 days ago')
}))

describe('ContentCard', () => {
  const defaultProps = {
    content: {
      id: '1',
      title: 'Test Content',
      summary: 'This is a test summary',
      created_at: new Date('2024-01-01').toISOString(),
      reading_time_minutes: 5,
      author: {
        display_name: 'John Doe'
      },
      tags: ['test', 'example']
    }
  }

  it('renders content information correctly', () => {
    render(<ContentCard {...defaultProps} />)

    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(screen.getByText('This is a test summary')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('1/1/2024')).toBeInTheDocument()
    expect(screen.getByText('5 min read')).toBeInTheDocument()
  })

  it('renders tags', () => {
    render(<ContentCard {...defaultProps} />)

    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('example')).toBeInTheDocument()
  })

  it('handles missing reading time', () => {
    const contentWithoutTime = {
      ...defaultProps.content,
      reading_time_minutes: null
    }

    render(<ContentCard content={contentWithoutTime} />)

    expect(screen.queryByText(/min read/)).not.toBeInTheDocument()
  })

  it('renders with highlight when specified', () => {
    const contentWithHighlight = {
      ...defaultProps.content,
      title: 'Test <mark>Content</mark>',
      summary: 'This is a <mark>test</mark> summary'
    }

    render(<ContentCard content={contentWithHighlight} showHighlight={true} />)

    const title = screen.getByRole('heading')
    expect(title.innerHTML).toContain('<mark>Content</mark>')
  })

  it('handles missing author gracefully', () => {
    const contentWithoutAuthor = {
      ...defaultProps.content,
      author: null
    }

    render(<ContentCard content={contentWithoutAuthor} />)

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
  })

  it('handles missing summary', () => {
    const contentWithoutSummary = {
      ...defaultProps.content,
      summary: null
    }

    render(<ContentCard content={contentWithoutSummary} />)

    expect(screen.queryByText('This is a test summary')).not.toBeInTheDocument()
  })

  it('handles empty tags array', () => {
    const contentWithoutTags = {
      ...defaultProps.content,
      tags: []
    }

    render(<ContentCard content={contentWithoutTags} />)

    // Should render without errors
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('links to content detail page', () => {
    render(<ContentCard {...defaultProps} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/content/1')
  })

  it('displays date in correct format', () => {
    const todayContent = {
      ...defaultProps.content,
      created_at: new Date().toISOString()
    }

    render(<ContentCard content={todayContent} />)

    // Should display today's date in local format
    const todayFormatted = new Date().toLocaleDateString()
    expect(screen.getByText(todayFormatted)).toBeInTheDocument()
  })

  it('applies hover styles', () => {
    const { container } = render(<ContentCard {...defaultProps} />)

    const card = container.querySelector('.hover\\:border-primary')
    expect(card).toBeTruthy()
    expect(card).toHaveClass('transition-colors')
  })
})