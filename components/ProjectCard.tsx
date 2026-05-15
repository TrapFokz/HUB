import { ArrowRight, ExternalLink } from 'lucide-react'
import { Project } from '@/data/projects'

export default function ProjectCard({ project }: { project: Project }) {
  const inner = (
    <>
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex items-center justify-center w-10 h-10 text-xl rounded-xl"
          style={{ background: 'rgba(59,90,224,.09)' }}
        >
          {project.emoji}
        </div>
        <div
          className="flex items-center justify-center w-9 h-9 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100"
          style={{ background: '#3b5ae0' }}
        >
          {project.external
            ? <ExternalLink size={16} color="#fff" />
            : <ArrowRight size={16} color="#fff" />
          }
        </div>
      </div>

      <h2 className="font-bold text-base tracking-tight mb-1" style={{ color: '#111827' }}>
        {project.name}
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: '#4b5563' }}>
        {project.description}
      </p>

      <div className="mt-4 flex items-center gap-2">
        {project.tags.map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
        <span className={project.context === 'perso' ? 'badge-perso' : 'badge-pro'}>
          {project.context === 'perso' ? 'Perso' : 'Pro'}
        </span>
      </div>
    </>
  )

  if (project.external) {
    return (
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className="card block p-5 no-underline group"
      >
        {inner}
      </a>
    )
  }

  return (
    <a href={project.href} className="card block p-5 no-underline group">
      {inner}
    </a>
  )
}
