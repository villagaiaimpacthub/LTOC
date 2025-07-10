# LTOC Platform Deployment Guide

## Pre-Deployment Checklist

### 1. Supabase Setup
- [ ] Create a new Supabase project at https://app.supabase.com
- [ ] Run database migrations:
  ```bash
  # In Supabase SQL editor, run each migration file in order:
  # 001_initial_schema.sql
  # 002_rls_policies.sql
  # 003_functions.sql
  # 004_health_check.sql
  ```
- [ ] Enable required extensions:
  - `uuid-ossp`
  - `pg_trgm` (for search)
- [ ] Copy your Supabase URL and keys

### 2. Environment Variables
- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Fill in all required values:
  - Supabase credentials
  - AI API keys (OpenAI or Anthropic)
  - Application URL
  - Security keys

### 3. Vercel Setup
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Link to project: `vercel link`

### 4. Configure Vercel Environment Variables
```bash
# Add each environment variable
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production
vercel env add ANTHROPIC_API_KEY production
```

## Deployment Steps

### Option 1: Deploy via CLI

```bash
# Build and deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub

1. Push code to GitHub:
```bash
git add .
git commit -m "Deploy LTOC platform to production"
git push origin main
```

2. Connect GitHub repo to Vercel:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure build settings (already in vercel.json)
   - Deploy

## Post-Deployment Steps

### 1. Verify Deployment
- [ ] Check health endpoint: `https://your-domain.com/api/health`
- [ ] Test authentication flow
- [ ] Verify database connection
- [ ] Test AI features

### 2. Create Initial Admin User
```sql
-- Run in Supabase SQL editor
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

### 3. Configure Email
- [ ] Set up email templates in Supabase
- [ ] Configure SMTP settings
- [ ] Test password reset flow

### 4. Set Up Monitoring
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring

### 5. Security Final Checks
- [ ] Verify all environment variables are set
- [ ] Check CSP headers in browser
- [ ] Test rate limiting
- [ ] Verify HTTPS is enforced

## Production URLs

- **Application**: https://your-domain.vercel.app
- **API Health**: https://your-domain.vercel.app/api/health
- **Supabase Dashboard**: https://app.supabase.com/project/[project-id]

## Troubleshooting

### Build Failures
- Check Node version (requires 18+)
- Verify all dependencies are installed
- Check build logs in Vercel dashboard

### Database Connection Issues
- Verify Supabase URL and keys
- Check RLS policies are applied
- Ensure migrations ran successfully

### Authentication Issues
- Verify redirect URLs in Supabase
- Check JWT expiry settings
- Ensure cookies are set correctly

## Rollback Procedure

If issues occur:
```bash
# Revert to previous deployment
vercel rollback

# Or redeploy specific commit
vercel --prod --force
```

## Maintenance Mode

To enable maintenance mode:
1. Set environment variable: `NEXT_PUBLIC_MAINTENANCE_MODE=true`
2. Redeploy: `vercel --prod`

---

**Support**: For deployment issues, check:
- Vercel Status: https://vercel-status.com
- Supabase Status: https://status.supabase.com