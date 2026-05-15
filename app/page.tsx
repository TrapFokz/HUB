'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Layers, CalendarDays, Home, ChevronsUp } from 'lucide-react'
import { projects, Filter } from '@/data/projects'
import ProjectCard from '@/components/ProjectCard'
import FilterBar from '@/components/FilterBar'

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('tous')
  const [searchQuery, setSearchQuery] = useState('')
  const [progress, setProgress] = useState(0)

  const handleFilterChange = useCallback((filter: Filter) => {
    setActiveFilter(filter)
  }, [])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = document.documentElement.scrollTop
      const total =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight
      setProgress(total > 0 ? (scrolled / total) * 100 : 100)
    }
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return projects.filter((p) => {
      const matchCtx = activeFilter === 'tous' || p.context === activeFilter
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      return matchCtx && matchSearch
    })
  }, [activeFilter, searchQuery])

  return (
    <>
      {/* Progress bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-1"
        style={{ background: 'rgba(0,0,0,0.06)' }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg,#3b5ae0,#818cf8)',
            transition: 'width 0.12s linear',
          }}
        />
      </div>

      {/* Liquid Mesh background */}
      <div
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
        style={{ opacity: 0.42 }}
      >
        <div
          className="blob-1 absolute rounded-full"
          style={{ width: 520, height: 520, top: -80, left: '10%', background: '#bfdbfe', filter: 'blur(110px)' }}
        />
        <div
          className="blob-2 absolute rounded-full"
          style={{ width: 440, height: 440, top: '30%', right: '8%', background: '#c7d2fe', filter: 'blur(100px)' }}
        />
        <div
          className="blob-3 absolute rounded-full"
          style={{ width: 380, height: 380, bottom: '10%', left: '35%', background: '#fef9c3', filter: 'blur(100px)' }}
        />
        <div
          className="blob-1 absolute rounded-full"
          style={{ width: 300, height: 300, bottom: '5%', right: '20%', background: '#e0e7ff', filter: 'blur(90px)', animationDelay: '-6s' }}
        />
      </div>

      <main className="mx-auto max-w-4xl px-6 pt-24 pb-44">
        {/* Hero */}
        <div className="text-center mb-14">
          <p
            className="text-xs font-bold tracking-widest uppercase mb-5"
            style={{ color: '#3b5ae0', letterSpacing: '.18em' }}
          >
            Dashboard
          </p>
          <h1
            className="font-black tracking-tighter mb-4 leading-none"
            style={{ fontSize: 'clamp(3rem,7vw,5rem)', color: '#111827' }}
          >
            Mes Projets
          </h1>
          <p className="text-base" style={{ color: '#4b5563' }}>
            Sélectionnez un projet pour l'ouvrir
          </p>
        </div>

        {/* Stats bar */}
        <div className="stat-bar flex items-center gap-5 px-6 py-4 mb-8">
          <div className="flex items-center gap-2">
            <Layers size={16} color="#3b5ae0" />
            <span className="text-sm font-bold" style={{ color: '#111827' }}>
              {filtered.length} projet{filtered.length > 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ width: 1, height: 18, background: '#e5e7eb' }} />
          <div className="flex items-center gap-2">
            <CalendarDays size={15} color="#9ca3af" />
            <span className="text-sm" suppressHydrationWarning style={{ color: '#4b5563' }}>
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <FilterBar
          activeFilter={activeFilter}
          searchQuery={searchQuery}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>

      {/* Bottom floating nav */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="nav-pill flex items-center gap-3 px-4 py-2">
          <button
            className="nav-btn"
            title="Haut de page"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Home size={17} />
          </button>
          <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
          <span
            className="font-mono text-sm font-semibold"
            style={{ color: '#111827', letterSpacing: '.05em' }}
          >
            {String(filtered.length).padStart(2, '0')}
          </span>
          <span className="text-xs" style={{ color: '#9ca3af' }}>
            projets
          </span>
          <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
          <button
            className="nav-btn"
            title="Retour en haut"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ChevronsUp size={17} />
          </button>
        </div>
      </div>
    </>
  )
}
