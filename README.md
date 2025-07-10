# Living Theory of Change (LTOC) Platform

A collaborative knowledge management platform for systems change, built with Next.js, Supabase, and AI integration.

## 🌟 Features

- **📝 Content Management**: Create, review, and publish content with multi-stage workflow
- **👥 Collaborative Editing**: Real-time collaborative document editing with Yjs/WebRTC
- **🤖 AI Integration**: AI-powered synthesis and chat features (OpenAI/Claude)
- **🔍 Advanced Search**: Full-text search with filters, suggestions, and highlighting
- **🔔 Real-time Notifications**: Live updates for content changes, reviews, and mentions
- **🔐 Role-based Access**: Admin, Contributor, and Reader roles with granular permissions
- **📊 Admin Dashboard**: Comprehensive analytics, user management, and content moderation
- **🌐 Multi-tenant**: Organization-based data isolation with GDPR compliance

## 📚 Documentation

- **[Product Requirements Document](docs/living_theory_prd.md)** - Comprehensive product vision and roadmap
- **[Technical Implementation Guide](docs/living_theory_technical_companion.md)** - Architecture and development framework

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Vector embeddings)
- **AI**: OpenAI GPT-4 / Anthropic Claude
- **Collaboration**: Yjs with WebRTC
- **Testing**: Vitest, React Testing Library
- **Deployment**: Vercel / Any Node.js hosting
- **Monorepo**: Turborepo with pnpm workspaces

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project
- OpenAI or Anthropic API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/villagaiaimpacthub/LTOC.git
cd LTOC
```

2. **Install dependencies**
```bash
npx pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase and AI credentials
```

4. **Set up Supabase**
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Start Supabase locally (optional for development)
supabase start

# Or link to your cloud project
supabase link --project-ref your-project-ref
```

5. **Run database migrations**
```bash
# Apply all migrations to your Supabase project
supabase db push
```

6. **Start development server**
```bash
pnpm dev
```

Visit http://localhost:3000 to see the application.

## 📁 Project Structure

```
LTOC/
├── apps/
│   └── web/                 # Next.js application
│       ├── src/
│       │   ├── app/        # App router pages
│       │   ├── components/ # React components
│       │   ├── contexts/   # React contexts
│       │   ├── hooks/      # Custom hooks
│       │   └── lib/        # Utilities
│       └── public/         # Static assets
├── packages/
│   ├── database/           # Supabase types & client
│   ├── ui/                 # Shared UI components
│   └── utils/              # Shared utilities & AI
├── supabase/
│   ├── migrations/         # Database migrations
│   ├── functions/          # Edge functions
│   └── seed.sql           # Development data
├── docs/                   # Documentation
└── turbo.json             # Turborepo config
```

## 🔐 Environment Variables

Create a `.env.local` file with:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Service (Required - choose one)
OPENAI_API_KEY=your-openai-key
# OR
ANTHROPIC_API_KEY=your-anthropic-key
AI_PROVIDER=openai # or anthropic

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See `.env.example` for all available options.

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## 📦 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Set environment variables in Vercel dashboard**

### Manual Deployment

1. **Build the application**
```bash
pnpm build
```

2. **Set production environment variables**

3. **Start the production server**
```bash
pnpm start
```

## 🔒 Security Features

- Row Level Security (RLS) on all tables
- Rate limiting on API routes
- CSRF protection
- Security headers (CSP, HSTS, etc.)
- Input validation and sanitization
- Secure session management

## 🎯 Key Features Implementation

### Multi-tenancy
- Organization-based data isolation
- Automatic tenant context
- Cross-tenant data sharing controls

### Content Workflow
1. Draft → Review → Published
2. Minimum 2 approvals for publishing
3. Version history tracking
4. Collaborative editing with conflict resolution

### AI Integration
- Provider-agnostic design (OpenAI/Claude)
- Streaming responses
- Token usage tracking
- Cost monitoring

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read the [Technical Guide](docs/living_theory_technical_companion.md) for detailed development guidelines.

## 📈 Monitoring

- Health check endpoint: `/api/health`
- Built-in analytics dashboard
- Error tracking ready (Sentry compatible)
- Performance monitoring hooks

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check Supabase URL and keys
   - Ensure migrations are applied

2. **AI features not working**
   - Verify API keys are set
   - Check rate limits

3. **Realtime not updating**
   - Check Supabase Realtime is enabled
   - Verify RLS policies

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with ❤️ by the Village Impact Hub team for systems change practitioners worldwide.