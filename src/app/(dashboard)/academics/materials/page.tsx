import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, FolderOpen } from 'lucide-react'

const terms = [
  {
    term: 'Term I',
    status: 'completed',
    courses: ['Microeconomics', 'Mathematics', 'Statistics', 'Business Communication', 'OB'],
  },
  {
    term: 'Term II',
    status: 'completed',
    courses: ['Macroeconomics', 'Cost Accounting', 'Marketing', 'Operations', 'IT'],
  },
  {
    term: 'Term III',
    status: 'ongoing',
    courses: ['DMG', 'LA', 'ETH', 'MIE-II', 'FRM', 'SI', 'ITD', 'PS'],
  },
]

export default function MaterialsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Course Materials</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Study materials, slides, and resources by term</p>
      </div>

      <div className="space-y-4">
        {terms.map((t) => (
          <div key={t.term} className="rounded-xl border border-zinc-100 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
              <div className="flex items-center gap-2">
                <FolderOpen size={16} className="text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-900">{t.term}</h2>
              </div>
              <Badge
                variant="outline"
                className={
                  t.status === 'ongoing'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 text-xs'
                    : 'border-zinc-200 text-zinc-400 text-xs'
                }
              >
                {t.status === 'ongoing' ? 'Current' : 'Archived'}
              </Badge>
            </div>
            <div className="p-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {t.courses.map((course) => (
                <button
                  key={course}
                  className="flex items-center gap-2 rounded-lg p-3 text-left border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 transition-all group"
                >
                  <FileText size={14} className="text-zinc-400 group-hover:text-zinc-600 shrink-0" />
                  <span className="text-sm text-zinc-700 group-hover:text-zinc-900 font-medium">
                    {course}
                  </span>
                </button>
              ))}
            </div>
            {t.status === 'ongoing' && (
              <p className="px-5 pb-4 text-xs text-zinc-400">
                Materials will be uploaded by faculty and shared via the Academic Committee.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
