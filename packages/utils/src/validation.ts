import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// Email validation with additional security checks
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email too short')
  .max(255, 'Email too long')
  .refine(
    (email) => !email.includes('..') && !email.startsWith('.') && !email.endsWith('.'),
    'Invalid email format'
  )

// Password validation with security requirements
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

// Username/display name validation
export const displayNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name too long')
  .regex(/^[a-zA-Z0-9\s\-_']+$/, 'Name contains invalid characters')
  .transform((name) => name.trim())

// Organization name validation
export const organizationNameSchema = z
  .string()
  .min(2, 'Organization name must be at least 2 characters')
  .max(100, 'Organization name too long')
  .regex(/^[a-zA-Z0-9\s\-_'&,.]+$/, 'Organization name contains invalid characters')
  .transform((name) => name.trim())

// Content title validation
export const contentTitleSchema = z
  .string()
  .min(3, 'Title must be at least 3 characters')
  .max(200, 'Title too long')
  .transform((title) => sanitizeText(title))

// Content body validation (for rich text)
export const contentBodySchema = z
  .string()
  .min(10, 'Content must be at least 10 characters')
  .max(100000, 'Content exceeds maximum length')
  .transform((content) => {
    // Additional validation for Tiptap JSON content
    try {
      const parsed = JSON.parse(content)
      if (!parsed.type || parsed.type !== 'doc') {
        throw new Error('Invalid content format')
      }
      return content
    } catch {
      throw new Error('Invalid content format')
    }
  })

// Search query validation
export const searchQuerySchema = z
  .string()
  .min(2, 'Search query too short')
  .max(100, 'Search query too long')
  .transform((query) => sanitizeText(query))
  .refine(
    (query) => !query.includes('--') && !query.toLowerCase().includes('drop'),
    'Invalid search query'
  )

// Tag validation
export const tagSchema = z
  .string()
  .min(2, 'Tag too short')
  .max(30, 'Tag too long')
  .regex(/^[a-zA-Z0-9\-]+$/, 'Tag contains invalid characters')
  .transform((tag) => tag.toLowerCase())

// Review feedback validation
export const reviewFeedbackSchema = z
  .string()
  .min(10, 'Feedback must be at least 10 characters')
  .max(5000, 'Feedback too long')
  .transform((feedback) => sanitizeText(feedback))

// Synthesis prompt validation
export const synthesisPromptSchema = z
  .string()
  .min(10, 'Prompt must be at least 10 characters')
  .max(1000, 'Prompt too long')
  .transform((prompt) => sanitizeText(prompt))

// Helper function to sanitize text input
export function sanitizeText(text: string): string {
  // Remove any potential HTML/script tags
  return DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true 
  }).trim()
}

// Helper function to sanitize HTML content
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 
      'code', 'pre', 'a', 'img'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  })
}

// Rate limiting helper
const rateLimitStore = new Map<string, number[]>()

export function checkRateLimit(
  identifier: string, 
  maxAttempts: number = 5, 
  windowMs: number = 15 * 60 * 1000
): boolean {
  // This is a placeholder - in production, use Redis or similar
  // For now, we'll use in-memory storage (not suitable for production)
  const attempts = rateLimitStore.get(identifier) || []
  const now = Date.now()
  const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs)
  
  if (recentAttempts.length >= maxAttempts) {
    return false
  }
  
  // Store the attempt
  rateLimitStore.set(identifier, [...recentAttempts, now])
  
  return true
}

// CSRF token validation
export function generateCSRFToken(): string {
  return crypto.randomUUID()
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length === 36 // UUID length
}

// File upload validation
export const fileUploadSchema = z.object({
  name: z.string().max(255),
  type: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']),
  size: z.number().max(10 * 1024 * 1024) // 10MB max
})

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
})

// Date range validation
export const dateRangeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date()
}).refine((data) => data.from <= data.to, {
  message: 'From date must be before or equal to To date'
})

// Export all schemas for easy importing
export const validationSchemas = {
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  organizationName: organizationNameSchema,
  contentTitle: contentTitleSchema,
  contentBody: contentBodySchema,
  searchQuery: searchQuerySchema,
  tag: tagSchema,
  reviewFeedback: reviewFeedbackSchema,
  synthesisPrompt: synthesisPromptSchema,
  fileUpload: fileUploadSchema,
  pagination: paginationSchema,
  dateRange: dateRangeSchema
}

// Type exports
export type EmailInput = z.infer<typeof emailSchema>
export type PasswordInput = z.infer<typeof passwordSchema>
export type DisplayNameInput = z.infer<typeof displayNameSchema>
export type SearchQueryInput = z.infer<typeof searchQuerySchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
export type PaginationInput = z.infer<typeof paginationSchema>