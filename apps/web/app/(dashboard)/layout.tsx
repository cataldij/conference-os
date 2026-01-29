import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppNav } from '@/components/shared/app-nav'
import { AppHeader } from '@/components/shared/app-header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get user profile for display
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', session.user.id)
    .single()

  const user = {
    name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
    email: session.user.email || '',
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="print:hidden">
        <AppNav basePath="" isDemo={false} user={user} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <div className="print:hidden">
          <AppHeader isDemo={false} user={user} />
        </div>
        <main className="relative flex-1 overflow-y-auto bg-hero p-8 print:bg-white print:p-4">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35]" />
          <div className="relative">{children}</div>
        </main>
      </div>
    </div>
  )
}
