'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Pencil, X, Check } from 'lucide-react'

const ROLL_REGEX = /^202\dIPM[A-Za-z0-9]{3}$/

type Profile = {
  id: string
  email: string
  full_name: string | null
  section: string | null
  roll_number: string | null
  role: string | null
}

type EditState = {
  full_name: string
  section: string
  roll_number: string
}

type RowStatus = { type: 'success' | 'error'; message: string } | null

export function UserManager({ users }: { users: Profile[] }) {
  const supabase = createClient()
  const [editing, setEditing] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ full_name: '', section: '', roll_number: '' })
  const [saving, setSaving] = useState(false)
  const [rowStatus, setRowStatus] = useState<Record<string, RowStatus>>({})
  const [localUsers, setLocalUsers] = useState(users)
  const [search, setSearch] = useState('')

  function startEdit(u: Profile) {
    setEditing(u.id)
    setEditState({
      full_name: u.full_name ?? '',
      section: u.section ?? '',
      roll_number: u.roll_number ?? '',
    })
    setRowStatus((s) => ({ ...s, [u.id]: null }))
  }

  function cancelEdit() {
    setEditing(null)
  }

  async function saveEdit(userId: string) {
    const roll = editState.roll_number.trim().toUpperCase()
    if (roll && !ROLL_REGEX.test(roll)) {
      setRowStatus((s) => ({ ...s, [userId]: { type: 'error', message: 'Invalid format. Use 202XIPMABC (e.g. 2025IPM001).' } }))
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editState.full_name.trim() || null,
        section: editState.section || null,
        roll_number: roll || null,
      })
      .eq('id', userId)

    setSaving(false)

    if (error) {
      setRowStatus((s) => ({ ...s, [userId]: { type: 'error', message: error.message } }))
    } else {
      setLocalUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, full_name: editState.full_name.trim() || null, section: editState.section || null, roll_number: roll || null }
            : u
        )
      )
      setRowStatus((s) => ({ ...s, [userId]: { type: 'success', message: 'Saved' } }))
      setEditing(null)
    }
  }

  const filtered = localUsers.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name ?? '').toLowerCase().includes(q) ||
      (u.roll_number ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">User Management</h2>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or roll no."
          className="h-8 w-64 text-xs rounded-lg border-zinc-200 bg-zinc-50"
        />
      </div>

      <div className="rounded-lg border border-zinc-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Email</th>
              <th className="px-4 py-2.5 text-left font-medium">Full Name</th>
              <th className="px-4 py-2.5 text-left font-medium">Roll No.</th>
              <th className="px-4 py-2.5 text-left font-medium">Section</th>
              <th className="px-4 py-2.5 text-left font-medium">Role</th>
              <th className="px-4 py-2.5 text-left font-medium w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((u) => {
              const isEditing = editing === u.id
              const status = rowStatus[u.id]

              return (
                <tr key={u.id} className="bg-white">
                  <td className="px-4 py-3 text-zinc-500 text-xs max-w-[160px] truncate">{u.email}</td>

                  {/* Full Name */}
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <Input
                        value={editState.full_name}
                        onChange={(e) => setEditState((s) => ({ ...s, full_name: e.target.value }))}
                        className="h-8 text-sm border-zinc-300"
                        placeholder="Full name"
                      />
                    ) : (
                      <span className="text-zinc-900">{u.full_name || <span className="text-zinc-400">—</span>}</span>
                    )}
                  </td>

                  {/* Roll Number */}
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <div className="space-y-1">
                        <Input
                          value={editState.roll_number}
                          onChange={(e) => setEditState((s) => ({ ...s, roll_number: e.target.value.toUpperCase() }))}
                          className="h-8 text-sm border-zinc-300 font-mono"
                          placeholder="2025IPM001"
                        />
                        {status?.type === 'error' && (
                          <p className="text-xs text-red-500">{status.message}</p>
                        )}
                      </div>
                    ) : (
                      <span className="font-mono text-zinc-900">{u.roll_number || <span className="text-zinc-400">—</span>}</span>
                    )}
                  </td>

                  {/* Section */}
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <div className="flex gap-1">
                        {['A', 'B'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setEditState((st) => ({ ...st, section: s }))}
                            className={`h-8 w-10 rounded border text-sm font-medium transition-colors ${
                              editState.section === s
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-900">{u.section ? `Sec ${u.section}` : <span className="text-zinc-400">—</span>}</span>
                    )}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.role === 'admin'
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {u.role ?? 'student'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => saveEdit(u.id)}
                          disabled={saving}
                          className="p-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          title="Save"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-500 transition-colors"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startEdit(u)}
                          className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        {status?.type === 'success' && (
                          <CheckCircle size={14} className="text-emerald-500" />
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-sm text-zinc-400 text-center py-8">No users found.</p>
        )}
      </div>
    </section>
  )
}
