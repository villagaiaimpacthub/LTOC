import { MainNav } from '@/components/main-nav'
import { UserNav } from '@/components/user-nav'
import { SearchBar } from '@/components/search/search-bar'
import { Breadcrumbs } from '@/components/breadcrumbs'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <MainNav />
          <div className="flex items-center space-x-4">
            <SearchBar className="hidden lg:block w-full max-w-md" />
            <UserNav />
          </div>
        </div>
      </div>
      {/* Breadcrumbs below the main header */}
      <div className="border-t bg-gray-50/80">
        <div className="container mx-auto px-4 py-2">
          <Breadcrumbs />
        </div>
      </div>
    </header>
  )
}