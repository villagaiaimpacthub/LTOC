# Living Theory of Change (LTOC) Platform

A collaborative knowledge creation system that enables systems change practitioners, researchers, and stakeholders to collectively develop, synthesize, and apply theoretical frameworks for social transformation.

## Overview

The Living Theory of Change platform visualizes knowledge as a living organism that grows and evolves through community contributions. It combines individual expertise with collective intelligence through AI-enhanced collaboration.

## Documentation

- **[Product Requirements Document](docs/living_theory_prd.md)** - Comprehensive product vision, features, and roadmap
- **[Technical Implementation Companion](docs/living_theory_technical_companion.md)** - Test-driven development framework with systems architecture

## Key Features

- **Collaborative Knowledge Creation** - Real-time collaborative editing with attribution tracking
- **AI-Powered Synthesis** - Intelligent content synthesis across contributions
- **Peer Review System** - Structured review and consensus building
- **Interactive Visualizations** - Knowledge represented as a living, evolving organism
- **Multi-Stakeholder Tools** - Tailored resources for practitioners, researchers, and implementers

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **AI Integration**: OpenAI API with pgvector (Claude ready)
- **Testing**: Vitest + React Testing Library
- **UI**: Radix UI + Tailwind CSS
- **Monorepo**: Turborepo

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Supabase CLI
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/villagaiaimpacthub/LTOC.git
cd LTOC
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

4. Start Supabase locally:
```bash
npx supabase start
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. Seed the database (optional):
```bash
npm run db:seed
```

7. Start the development server:
```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

## Project Structure

```
LTOC/
├── apps/
│   └── web/                 # Next.js frontend application
├── packages/
│   ├── database/           # Supabase client and types
│   ├── ui/                 # Shared UI components
│   └── utils/              # Shared utilities and AI abstraction
├── supabase/
│   ├── migrations/         # Database migrations
│   ├── functions/          # Edge functions
│   └── seed.sql           # Mock data for development
└── docs/                   # Project documentation
```

## Development Workflow

### Branching Strategy

- `main` - Production branch (protected)
- `develop` - Integration branch
- `feature/*` - Feature branches

### Creating a Feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Testing

Run tests before committing:
```bash
npm run test
```

### Committing Changes

The project uses conventional commits. Examples:
- `feat: add user authentication`
- `fix: resolve content loading issue`
- `docs: update setup instructions`

## Key Architectural Decisions

1. **Multi-tenancy**: Organizations isolate data
2. **Soft Deletes**: Data recovery and GDPR compliance
3. **Role-Based Access**: Admin, Contributor, Reader
4. **AI Abstraction**: Easy switching between providers
5. **Test-Driven**: 80% pass threshold for deployment

## Environment Variables

Key variables to configure:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - For AI features (or future `ANTHROPIC_API_KEY`)
- `GOOGLE_CLIENT_ID/SECRET` - For Google OAuth
- `LINKEDIN_CLIENT_ID/SECRET` - For LinkedIn OAuth

See `.env.example` for the complete list.

## Contributing

Please read the [Technical Implementation Companion](docs/living_theory_technical_companion.md) for development guidelines and testing requirements.

## License

*License information to be determined*