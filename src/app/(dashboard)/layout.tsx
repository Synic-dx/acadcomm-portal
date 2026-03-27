import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/app-sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, section, role, roll_number, workshop_pts, workshop_pa')
    .eq('id', user.id)
    .single()

  const userProps = {
    email: user.email ?? '',
    full_name: profile?.full_name ?? undefined,
    section: profile?.section ?? undefined,
    role: profile?.role ?? undefined,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <AppSidebar user={userProps} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
