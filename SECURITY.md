# LTOC Security Documentation

## Overview

This document outlines the security measures implemented in the LTOC (Living Theory of Change) platform. Security is a top priority, and we follow industry best practices to protect user data and maintain system integrity.

## Security Features

### 1. Authentication & Authorization

- **Supabase Auth**: Industry-standard authentication with JWT tokens
- **Role-Based Access Control (RBAC)**: Three roles - Admin, Contributor, Reader
- **Row Level Security (RLS)**: Database-level access control
- **Session Management**: Secure session handling with automatic refresh

### 2. Input Validation & Sanitization

All user inputs are validated using Zod schemas with strict rules:

- **Email Validation**: RFC-compliant email validation with length limits
- **Password Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
  - Maximum 128 characters
- **Content Sanitization**: DOMPurify for HTML content
- **SQL Injection Prevention**: Parameterized queries via Supabase

### 3. Cross-Site Scripting (XSS) Protection

- **Content Security Policy (CSP)**: Strict CSP headers
- **HTML Sanitization**: DOMPurify with whitelist approach
- **React's Built-in Protection**: Automatic escaping of values
- **X-XSS-Protection Header**: Legacy browser protection

### 4. Cross-Site Request Forgery (CSRF) Protection

- **CSRF Tokens**: Generated for each session
- **Double Submit Cookie Pattern**: Token validation
- **SameSite Cookies**: Strict same-site policy
- **Custom Headers**: X-CSRF-Token validation

### 5. Rate Limiting

- **API Rate Limiting**: 100 requests per minute (configurable)
- **Per-IP Tracking**: Rate limits by IP address
- **Graceful Degradation**: Clear error messages with retry information

### 6. Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload (production only)
```

### 7. Data Protection

- **Encryption in Transit**: HTTPS everywhere
- **Encryption at Rest**: Supabase encrypted storage
- **Soft Deletes**: GDPR-compliant data retention
- **Personal Data Handling**: Minimal PII collection

### 8. API Security

- **CORS Configuration**: Strict origin validation
- **API Key Management**: Environment variables only
- **Service Role Protection**: No service keys in client code
- **Health Check Endpoint**: Uses anonymous access

## Security Best Practices

### For Developers

1. **Never commit secrets**: Use environment variables
2. **Validate all inputs**: Use the validation schemas
3. **Sanitize all outputs**: Especially user-generated content
4. **Keep dependencies updated**: Regular security updates
5. **Follow least privilege**: Minimal permissions for all operations

### For Deployment

1. **Environment Variables**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key # Server-only
   OPENAI_API_KEY=your_api_key # Server-only
   ANTHROPIC_API_KEY=your_api_key # Server-only
   ```

2. **Production Checklist**:
   - [ ] Enable HTTPS
   - [ ] Set secure CSP policy
   - [ ] Configure rate limiting
   - [ ] Enable HSTS
   - [ ] Set up monitoring
   - [ ] Configure backups
   - [ ] Review RLS policies

### For Users

1. **Strong Passwords**: Use the password requirements
2. **Unique Passwords**: Don't reuse passwords
3. **Report Issues**: Security concerns to security@ltoc.app

## Vulnerability Reporting

If you discover a security vulnerability, please:

1. **Do NOT** create a public GitHub issue
2. Email security@ltoc.app with details
3. Include steps to reproduce if possible
4. Allow reasonable time for fix before disclosure

## Security Monitoring

### Logging

- Failed authentication attempts
- Rate limit violations
- CSRF token failures
- Input validation errors

### Alerts

- Multiple failed login attempts
- Unusual API usage patterns
- Database access anomalies

## Compliance

### GDPR Compliance

- Right to erasure (soft deletes)
- Data portability (export features)
- Privacy by design
- Minimal data collection

### Security Standards

- OWASP Top 10 protection
- NIST Cybersecurity Framework alignment
- SOC 2 Type II readiness

## Regular Security Tasks

### Daily
- Monitor error logs
- Check rate limit violations

### Weekly
- Review authentication logs
- Check for dependency updates

### Monthly
- Security patch updates
- Access control review

### Quarterly
- Full security audit
- Penetration testing
- Update this documentation

## Known Limitations

1. **Rate Limiting**: Currently in-memory (use Redis for production scale)
2. **File Uploads**: Size limits need enforcement
3. **2FA**: Not yet implemented (planned)

## Contact

- Security Issues: security@ltoc.app
- General Support: support@ltoc.app

---

Last Updated: {{current_date}}
Version: 1.0.0