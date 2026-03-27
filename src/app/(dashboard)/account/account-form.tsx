'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, AlertCircle } from 'lucide-react'

const PTS_OPTIONS = ['PT', 'Badminton', 'Football', 'Swimming', 'Yoga'] as const
const PA_OPTIONS  = ['Dance', 'Drama'] as const

// Format: 202XIPMABC — e.g. 2025IPM001, 2026IPMA12
const ROLL_REGEX = /^202\dIPM[A-Za-z0-9]{3}$/

type Status = { type: 'success' | 'error'; message: string } | null

export function AccountForm(props: {
  email: string
  fullName: string
  section: string
  rollNumber: string
  workshopPts: string
  workshopPa: string
  isAdmin?: boolean
}) {
  const supabase = createClient()
  const router = useRouter()

  const [fullName, setFullName]       = useState(props.fullName)
  const [section, setSection]         = useState(props.section)
  const [rollNumber, setRollNumber]   = useState(props.rollNumber)
  const [workshopPts, setWorkshopPts] = useState(props.workshopPts)
  const [workshopPa, setWorkshopPa]   = useState(props.workshopPa)
  const [saving, setSaving]           = useState(false)
  const [profileStatus, setProfileStatus] = useState<Status>(null)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [changingPw, setChangingPw] = useState(false)
  const [pwStatus, setPwStatus]   = useState<Status>(null)

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileStatus(null)

    if (props.isAdmin && !fullName.trim()) {
      setProfileStatus({ type: 'error', message: 'Full name is required.' }); return
    }
    if (!rollNumber.trim()) {
      setProfileStatus({ type: 'error', message: 'Roll number is required.' }); return
    }
    if (!ROLL_REGEX.test(rollNumber.trim())) {
      setProfileStatus({ type: 'error', message: 'Roll number must be in the format 202XIPMABC (e.g. 2025IPM001).' }); return
    }
    if (!workshopPts) {
      setProfileStatus({ type: 'error', message: 'Select a Physical Training & Sports option.' }); return
    }
    if (!workshopPa) {
      setProfileStatus({ type: 'error', message: 'Select a Performing Arts option.' }); return
    }

    setSaving(true)

    const updates: Record<string, string> = {
      roll_number: rollNumber.trim().toUpperCase(),
      workshop_pts: workshopPts,
      workshop_pa: workshopPa,
    }
    if (props.isAdmin) {
      updates.full_name = fullName.trim()
      updates.section   = section
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', (await supabase.auth.getUser()).data.user!.id)

    setSaving(false)

    if (error) {
      setProfileStatus({ type: 'error', message: error.message })
    } else {
      setProfileStatus({ type: 'success', message: 'Profile saved.' })
      router.refresh()
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw.length < 8) { setPwStatus({ type: 'error', message: 'New password must be at least 8 characters.' }); return }
    if (newPw !== confirmPw) { setPwStatus({ type: 'error', message: 'Passwords do not match.' }); return }

    setChangingPw(true)
    setPwStatus(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: props.email,
      password: currentPw,
    })

    if (signInError) {
      setChangingPw(false)
      setPwStatus({ type: 'error', message: 'Current password is incorrect.' })
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPw })
    setChangingPw(false)

    if (error) {
      setPwStatus({ type: 'error', message: error.message })
    } else {
      setPwStatus({ type: 'success', message: 'Password updated successfully.' })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    }
  }

  return (
    <div className="space-y-8">

      {/* ── Profile ── */}
      <section className="space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Profile</h2>

        <form onSubmit={saveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
                Full Name {props.isAdmin && <span className="text-red-500">*</span>}
              </Label>
              {props.isAdmin ? (
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="h-10 rounded-lg border-zinc-200 bg-zinc-50 text-sm"
                />
              ) : (
                <p className="text-sm text-zinc-900 h-10 flex items-center px-3 rounded-lg bg-zinc-50 border border-zinc-200">
                  {props.fullName || '—'}
                </p>
              )}
            </div>

            {/* Section */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Section</Label>
              {props.isAdmin ? (
                <div className="flex gap-2 h-10 items-center">
                  {['A', 'B'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSection(s)}
                      className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${
                        section === s
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      Section {s}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-900 h-10 flex items-center px-3 rounded-lg bg-zinc-50 border border-zinc-200">
                  Section {props.section || '—'}
                </p>
              )}
            </div>
          </div>

          {/* Roll Number */}
          <div className="space-y-1.5">
            <Label htmlFor="roll" className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
              Roll Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="roll"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
              placeholder="e.g. 2025IPM001"
              className="h-10 rounded-lg border-zinc-200 bg-zinc-50 text-sm font-mono"
            />
            <p className="text-xs text-zinc-400">Format: 202XIPMABC (e.g. 2025IPM001)</p>
          </div>

          {/* Physical Training & Sports */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
              Physical Training &amp; Sports <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-zinc-400">Choose one workshop course for Term III</p>
            <div className="flex flex-wrap gap-2">
              {PTS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setWorkshopPts(opt)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                    workshopPts === opt
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Performing Arts */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
              Performing Arts <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-zinc-400">Choose one workshop course for Term III</p>
            <div className="flex flex-wrap gap-2">
              {PA_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setWorkshopPa(opt)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                    workshopPa === opt
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {profileStatus && (
            <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
              profileStatus.type === 'success'
                ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                : 'bg-red-50 border border-red-100 text-red-600'
            }`}>
              {profileStatus.type === 'success'
                ? <CheckCircle size={15} className="shrink-0" />
                : <AlertCircle size={15} className="shrink-0" />}
              {profileStatus.message}
            </div>
          )}

          <Button type="submit" disabled={saving} className="w-full h-10">
            {saving ? 'Saving…' : 'Save Profile'}
          </Button>
        </form>
      </section>

      <div className="border-t border-zinc-100" />

      {/* ── Change Password ── */}
      <section className="space-y-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Change Password</h2>

        <form onSubmit={changePassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-pw" className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Current Password</Label>
            <Input id="current-pw" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••" className="h-10 rounded-lg border-zinc-200 bg-zinc-50 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-pw" className="text-xs font-medium text-zinc-600 uppercase tracking-wide">New Password</Label>
            <Input id="new-pw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
              placeholder="Min. 8 characters" className="h-10 rounded-lg border-zinc-200 bg-zinc-50 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-pw" className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Confirm New Password</Label>
            <Input id="confirm-pw" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="••••••••" className="h-10 rounded-lg border-zinc-200 bg-zinc-50 text-sm" />
          </div>

          {pwStatus && (
            <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
              pwStatus.type === 'success'
                ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                : 'bg-red-50 border border-red-100 text-red-600'
            }`}>
              {pwStatus.type === 'success'
                ? <CheckCircle size={15} className="shrink-0" />
                : <AlertCircle size={15} className="shrink-0" />}
              {pwStatus.message}
            </div>
          )}

          <Button type="submit" disabled={changingPw} variant="outline" className="w-full h-10">
            {changingPw ? 'Updating…' : 'Update Password'}
          </Button>
        </form>
      </section>
    </div>
  )
}
