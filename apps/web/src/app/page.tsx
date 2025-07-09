import Link from 'next/link'
import { Button } from '@ltoc/ui'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">LTOC</span>
            </Link>
          </div>
          <nav className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
              Living Theory of Change Platform
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              A collaborative knowledge creation system that enables systems change practitioners,
              researchers, and stakeholders to collectively develop, synthesize, and apply
              theoretical frameworks for social transformation.
            </p>
          </div>
          <div className="flex gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Join the Community</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/content">Browse Content</Link>
            </Button>
          </div>
        </section>
        
        <section className="container py-8 md:py-12">
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Collaborative Knowledge</h3>
                  <p className="text-sm text-muted-foreground">
                    Work together to build comprehensive theories of change with
                    attribution and version control.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">AI-Powered Synthesis</h3>
                  <p className="text-sm text-muted-foreground">
                    Intelligent synthesis of contributions to create coherent
                    overviews while maintaining attribution.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">Living Knowledge</h3>
                  <p className="text-sm text-muted-foreground">
                    Watch knowledge evolve as a living organism through
                    community contributions and peer review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built for systems change practitioners worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}