import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AccountForm } from './account-form'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, section, roll_number, workshop_pts, workshop_pa, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="p-8 max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Profile</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{user.email}</p>
      </div>

      <AccountForm
        email={user.email ?? ''}
        fullName={profile?.full_name ?? ''}
        section={profile?.section ?? ''}
        rollNumber={profile?.roll_number ?? ''}
        workshopPts={profile?.workshop_pts ?? ''}
        workshopPa={profile?.workshop_pa ?? ''}
        isAdmin={profile?.role === 'admin'}
      />
    </div>
  )
}
