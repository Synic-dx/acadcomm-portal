'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, XCircle, Plus, Pencil, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

export type Exam = {
  id: string
  subject: string
  type: string
  date: string
  start: string
  end: string
  sections: string[]
  status: 'pending' | 'approved' | 'rejected'
  source: 'timetable' | 'manual'
  notes?: string
}

const TYPE_OPTIONS = ['quiz', 'midterm', 'endterm', 'assignment', 'presentation', 'viva', 'other']
const TYPE_BADGE: Record<string, string> = {
  quiz: 'bg-amber-100 text-amber-700',
  midterm: 'bg-blue-100 text-blue-700',
  endterm: 'bg-red-100 text-red-700',
  assignment: 'bg-purple-100 text-purple-700',
  presentation: 'bg-sky-100 text-sky-700',
  viva: 'bg-orange-100 text-orange-700',
  other: 'bg-zinc-100 text-zinc-600',
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

type ExamFormData = {
  subject: string; type: string; date: string; start: string; end: string; notes: string
}

const EMPTY_FORM: ExamFormData = {
  subject: '', type: 'quiz', date: '', start: '', end: '', notes: '',
}

function ExamForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: ExamFormData
  onSave: (data: ExamFormData) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<ExamFormData>(initial)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="col-span-2">
        <label className="text-xs font-medium text-zinc-500">Subject</label>
        <input
          className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
          value={form.subject}
          onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
          placeholder="e.g. PS Quiz 3"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">Type</label>
        <select
          className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
          value={form.type}
          onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
        >
          {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">Date</label>
        <input
          type="date"
          className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">Start time</label>
        <input
          type="time"
          className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
          value={form.start}
          onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500">End time</label>
        <input
          type="time"
          className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
          value={form.end}
          onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
        />
      </div>
      <div className="col-span-2">
        <label className="text-xs font-medium text-zinc-500">Notes (optional)</label>
        <input
          className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="e.g. Venue: D-301"
        />
      </div>
      <div className="col-span-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving || !form.subject || !form.date || !form.start || !form.end}
          onClick={() => onSave(form)}
          className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-40 transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export function ExamManager({ initialExams }: { initialExams: Exam[] }) {
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [scanning, startScan] = useTransition()
  const [scanMsg, setScanMsg] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showRejected, setShowRejected] = useState(false)

  async function refresh() {
    const res = await fetch('/api/admin/exams')
    if (res.ok) setExams(await res.json())
  }

  function scanTimetable() {
    startScan(async () => {
      setScanMsg(null)
      const res = await fetch('/api/admin/exams/scan', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setScanMsg(`Scan complete — ${data.inserted} new suggestion${data.inserted !== 1 ? 's' : ''} added, ${data.skipped} already existed.`)
        await refresh()
      } else {
        setScanMsg(`Error: ${data.error}`)
      }
    })
  }

  async function setStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
    const res = await fetch(`/api/admin/exams/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setExams(prev => prev.map(e => e.id === id ? { ...e, status } : e))
    }
  }

  async function deleteExam(id: string) {
    if (!confirm('Delete this exam?')) return
    await fetch(`/api/admin/exams/${id}`, { method: 'DELETE' })
    setExams(prev => prev.filter(e => e.id !== id))
  }

  async function saveEdit(id: string, data: ExamFormData) {
    setSaving(true)
    const res = await fetch(`/api/admin/exams/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, sections: ['A', 'B'] }),
    })
    if (res.ok) {
      const updated = await res.json()
      setExams(prev => prev.map(e => e.id === id ? updated : e))
      setEditingId(null)
    }
    setSaving(false)
  }

  async function createExam(data: ExamFormData) {
    setSaving(true)
    const res = await fetch('/api/admin/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, sections: ['A', 'B'], status: 'approved', source: 'manual' }),
    })
    if (res.ok) {
      const created = await res.json()
      setExams(prev => [...prev, created].sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start)))
      setShowAddForm(false)
    }
    setSaving(false)
  }

  const pending  = exams.filter(e => e.status === 'pending')
  const approved = exams.filter(e => e.status === 'approved')
  const rejected = exams.filter(e => e.status === 'rejected')

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Exam Dates</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={scanTimetable}
            disabled={scanning}
            className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={12} className={scanning ? 'animate-spin' : ''} />
            Scan Timetable
          </button>
          <button
            onClick={() => { setShowAddForm(v => !v); setEditingId(null) }}
            className="flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            <Plus size={12} /> Add Exam
          </button>
        </div>
      </div>

      {scanMsg && (
        <p className="text-xs text-zinc-500 bg-zinc-50 border border-zinc-100 rounded-md px-3 py-2">{scanMsg}</p>
      )}

      {showAddForm && (
        <ExamForm
          initial={EMPTY_FORM}
          onSave={createExam}
          onCancel={() => setShowAddForm(false)}
          saving={saving}
        />
      )}

      {/* ── Pending suggestions ── */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-widest">
            {pending.length} Pending Suggestion{pending.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {pending.map(exam => (
              <div key={exam.id}>
                {editingId === exam.id ? (
                  <ExamForm
                    initial={{ subject: exam.subject, type: exam.type, date: exam.date, start: exam.start, end: exam.end, notes: exam.notes ?? '' }}
                    onSave={(data) => saveEdit(exam.id, data)}
                    onCancel={() => setEditingId(null)}
                    saving={saving}
                  />
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
                    <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TYPE_BADGE[exam.type] ?? TYPE_BADGE.other}`}>
                      {exam.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{exam.subject}</p>
                      <p className="text-xs text-zinc-500">{formatDate(exam.date)} · {exam.start}–{exam.end}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => { setEditingId(exam.id); setShowAddForm(false) }}
                        className="rounded p-1.5 text-zinc-400 hover:bg-white hover:text-zinc-700 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setStatus(exam.id, 'approved')}
                        className="rounded p-1.5 text-emerald-600 hover:bg-emerald-100 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle size={15} />
                      </button>
                      <button
                        onClick={() => setStatus(exam.id, 'rejected')}
                        className="rounded p-1.5 text-red-500 hover:bg-red-50 transition-colors"
                        title="Reject"
                      >
                        <XCircle size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Approved exams ── */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
          Approved ({approved.length})
        </p>
        {approved.length === 0 ? (
          <p className="text-sm text-zinc-400 py-2">No approved exams yet. Approve suggestions or add one manually.</p>
        ) : (
          <div className="rounded-lg border border-zinc-100 overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Subject</th>
                  <th className="px-4 py-2.5 text-left font-medium">Type</th>
                  <th className="px-4 py-2.5 text-left font-medium">Date</th>
                  <th className="px-4 py-2.5 text-left font-medium">Time</th>
                  <th className="px-4 py-2.5 text-left font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {approved.map(exam => (
                  editingId === exam.id ? (
                    <tr key={exam.id}>
                      <td colSpan={6} className="px-4 py-3">
                        <ExamForm
                          initial={{ subject: exam.subject, type: exam.type, date: exam.date, start: exam.start, end: exam.end, notes: exam.notes ?? '' }}
                          onSave={(data) => saveEdit(exam.id, data)}
                          onCancel={() => setEditingId(null)}
                          saving={saving}
                        />
                      </td>
                    </tr>
                  ) : (
                    <tr key={exam.id} className="bg-white">
                      <td className="px-4 py-3 font-medium text-zinc-900">{exam.subject}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TYPE_BADGE[exam.type] ?? TYPE_BADGE.other}`}>
                          {exam.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{formatDate(exam.date)}</td>
                      <td className="px-4 py-3 text-zinc-500">{exam.start}–{exam.end}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingId(exam.id); setShowAddForm(false) }}
                            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => deleteExam(exam.id)}
                            className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Rejected (collapsible) ── */}
      {rejected.length > 0 && (
        <div>
          <button
            onClick={() => setShowRejected(v => !v)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {showRejected ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {rejected.length} rejected suggestion{rejected.length !== 1 ? 's' : ''}
          </button>
          {showRejected && (
            <div className="mt-2 space-y-1">
              {rejected.map(exam => (
                <div key={exam.id} className="flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-2.5 opacity-60">
                  <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TYPE_BADGE[exam.type] ?? TYPE_BADGE.other}`}>
                    {exam.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-700 truncate">{exam.subject}</p>
                    <p className="text-xs text-zinc-400">{formatDate(exam.date)}</p>
                  </div>
                  <button
                    onClick={() => setStatus(exam.id, 'pending')}
                    className="shrink-0 text-xs text-zinc-400 hover:text-zinc-700 underline"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => deleteExam(exam.id)}
                    className="rounded p-1 text-zinc-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
