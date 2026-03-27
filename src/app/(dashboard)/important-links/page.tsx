import { ExternalLink } from 'lucide-react'

const categories = [
  {
    category: 'Institute Portals',
    links: [
      { label: 'IIM Indore Student Portal', url: 'https://student.iimidr.ac.in', desc: 'Official student portal for academic records' },
      { label: 'IIM Indore Website', url: 'https://www.iimidr.ac.in', desc: 'Main institute website' },
      { label: 'Library Portal', url: 'https://library.iimidr.ac.in', desc: 'E-resources, journals, and books' },
    ],
  },
  {
    category: 'Academic Resources',
    links: [
      { label: 'MOODLE / LMS', url: 'https://lms.iimidr.ac.in', desc: 'Course materials and assignments' },
      { label: 'JSTOR', url: 'https://www.jstor.org', desc: 'Academic journals and research papers' },
      { label: 'EBSCO', url: 'https://www.ebscohost.com', desc: 'Business research databases' },
    ],
  },
  {
    category: 'Student Life',
    links: [
      { label: 'IPM Alumni Network', url: '#', desc: 'Connect with IPM alumni' },
      { label: 'Hostel / Mess Portal', url: '#', desc: 'Hostel bookings and mess feedback' },
      { label: 'Health Centre', url: '#', desc: 'Campus health and medical services' },
    ],
  },
  {
    category: 'Examinations',
    links: [
      { label: 'Timetable (Term III)', url: 'https://docs.google.com/spreadsheets/d/1MJ1HaBVTSvqVV0PbzOpFy-gMr0IOq8XBcI5TL5H-tdA', desc: 'IPM 2025-30 Batch Term III timetable' },
      { label: 'Grading Policy', url: '#', desc: 'Relative grading and attendance policy' },
      { label: 'Re-evaluation Guidelines', url: '#', desc: 'Process for requesting re-evaluation' },
    ],
  },
]

export default function ImportantLinksPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Important Links</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Curated resources for IPM students</p>
      </div>

      <div className="space-y-5">
        {categories.map((cat) => (
          <div key={cat.category}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
              {cat.category}
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {cat.links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 rounded-xl border border-zinc-100 bg-white p-4 hover:border-zinc-200 hover:shadow-sm transition-all"
                >
                  <ExternalLink
                    size={14}
                    className="mt-0.5 shrink-0 text-zinc-300 group-hover:text-zinc-500 transition-colors"
                  />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 group-hover:text-black leading-tight">
                      {link.label}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-snug">{link.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
