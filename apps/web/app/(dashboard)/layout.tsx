import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard/nav'
import { DashboardHeader } from '@/components/dashboard/header'

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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="print:hidden">
        <DashboardNav />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <div className="print:hidden">
          <DashboardHeader />
        </div>
        <main className="relative flex-1 overflow-y-auto bg-hero p-8 print:bg-white print:p-4">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35]" />
          <div className="relative">{children}</div>
        </main>
      </div>
    </div>
  )
}
