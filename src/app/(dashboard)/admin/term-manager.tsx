'use client'

import { useState } from 'react'
import { Plus, CheckCircle, Archive } from 'lucide-react'
import type { Term } from '@/data/timetable'

const today = new Date().toISOString().slice(0, 10)

type TermStatus = 'active' | 'over' | 'upcoming' | 'inactive'

function getTermStatus(term: Term): TermStatus {
  if (term.is_active) return 'active'
  if (term.end_date < today) return 'over'
  if (term.start_date > today) return 'upcoming'
  return 'inactive'
}

const STATUS_BADGE: Record<TermStatus, string> = {
  active:   'bg-emerald-100 text-emerald-700',
  over:     'bg-zinc-100 text-zinc-400',
  upcoming: 'bg-blue-50 text-blue-600',
  inactive: 'bg-zinc-100 text-zinc-500',
}

const STATUS_LABEL: Record<TermStatus, string> = {
  active:   'Active',
  over:     'Over',
  upcoming: 'Upcoming',
  inactive: 'Inactive',
}

export function TermManager({ initialTerms }: { initialTerms: Term[] }) {
  const [terms, setTerms] = useState<Term[]>(initialTerms)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', start_date: '', end_date: '' })

  async function activate(id: string) {
    const res = await fetch(`/api/admin/terms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: true }),
    })
    if (res.ok) {
      setTerms(prev => prev.map(t => ({ ...t, is_active: t.id === id })))
    }
  }

  async function markOver(id: string) {
    const res = await fetch(`/api/admin/terms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      // Set end_date to yesterday and deactivate — term is definitively over
      body: JSON.stringify({ is_active: false, end_date: today }),
    })
    if (res.ok) {
      setTerms(prev => prev.map(t =>
        t.id === id ? { ...t, is_active: false, end_date: today } : t
      ))
    }
  }

  async function create() {
    if (!form.name || !form.start_date || !form.end_date) return
    setSaving(true)
    const res = await fetch('/api/admin/terms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, is_active: terms.length === 0 }),
    })
    if (res.ok) {
      const created: Term = await res.json()
      setTerms(prev => {
        const updated = created.is_active ? prev.map(t => ({ ...t, is_active: false })) : prev
        return [created, ...updated]
      })
      setForm({ name: '', start_date: '', end_date: '' })
      setShowForm(false)
    }
    setSaving(false)
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Terms / Semesters</h2>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          <Plus size={12} /> New Term
        </button>
      </div>

      {showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <div>
            <label className="text-xs font-medium text-zinc-500">Term name</label>
            <input
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Term III 2025-26"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">Start date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
              value={form.start_date}
              onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500">End date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
              value={form.end_date}
              onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-3 flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="rounded-md px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 transition-colors">
              Cancel
            </button>
            <button
              disabled={saving || !form.name || !form.start_date || !form.end_date}
              onClick={create}
              className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-40 transition-colors"
            >
              {saving ? 'Creating…' : 'Create Term'}
            </button>
          </div>
        </div>
      )}

      {terms.length === 0 ? (
        <p className="text-sm text-zinc-400 py-2">No terms yet. Create one to get started.</p>
      ) : (
        <div className="rounded-lg border border-zinc-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Name</th>
                <th className="px-4 py-2.5 text-left font-medium">Dates</th>
                <th className="px-4 py-2.5 text-left font-medium">Status</th>
                <th className="px-4 py-2.5 text-left font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {terms.map(term => {
                const status = getTermStatus(term)
                return (
                  <tr key={term.id} className="bg-white">
                    <td className="px-4 py-3 font-medium text-zinc-900">{term.name}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {term.start_date} → {term.end_date}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[status]}`}>
                        {status === 'active' && <CheckCircle size={10} />}
                        {STATUS_LABEL[status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {status === 'active' && (
                          <button
                            onClick={() => markOver(term.id)}
                            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-500 transition-colors"
                            title="Mark this term as over"
                          >
                            <Archive size={12} /> Mark Over
                          </button>
                        )}
                        {(status === 'inactive' || status === 'upcoming') && (
                          <button
                            onClick={() => activate(term.id)}
                            className="text-xs text-zinc-400 hover:text-zinc-900 underline transition-colors"
                          >
                            Set active
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
