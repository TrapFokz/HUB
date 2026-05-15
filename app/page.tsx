'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Layers, CalendarDays, Home, ChevronsUp, AlertCircle, ShieldCheck, LogOut, UserCog } from 'lucide-react'
import { Filter, Project, SupabaseProject, mapSupabaseProject } from '@/data/projects'
import { createClient } from '@/lib/supabase-client'
import ProjectCard from '@/components/ProjectCard'
import FilterBar from '@/components/FilterBar'

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl" style={{ background: 'rgba(0,0,0,0.06)' }} />
        <div className="w-9 h-9 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }} />
      </div>
      <div className="h-4 rounded-full mb-2" style={{ background: 'rgba(0,0,0,0.06)', width: '55%' }} />
      <div className="h-3 rounded-full mb-1" style={{ background: 'rgba(0,0,0,0.06)', width: '80%' }} />
      <div className="h-3 rounded-full" style={{ background: 'rgba(0,0,0,0.06)', width: '60%' }} />
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-16 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }} />
        <div className="h-6 w-12 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const supabaseClient = useMemo(() => createClient(), [])

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<Filter>('tous')
  const [searchQuery, setSearchQuery] = useState('')
  const [progress, setProgress] = useState(0)
  const [role, setRole] = useState<string | null>(null)
  const [dateStr, setDateStr] = useState('')

  // Vérifie la session et charge le rôle
  useEffect(() => {
    supabaseClient.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/login'); return }

      const { data } = await supabaseClient
        .from('whitelist')
        .select('role')
        .eq('email', user.email!)
        .single()

      setRole(data?.role ?? null)
    })
  }, [router, supabaseClient])

  useEffect(() => {
    supabaseClient
      .from('projets')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
        } else {
          setProjects((data as SupabaseProject[]).map(mapSupabaseProject))
        }
        setLoading(false)
      })
  }, [supabaseClient])

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = document.documentElement.scrollTop
      const total = document.documentElement.scrollHeight - document.documentElement.clientHeight
      setProgress(total > 0 ? (scrolled / total) * 100 : 100)
    }
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }))
  }, [])

  const handleFilterChange = useCallback((filter: Filter) => setActiveFilter(filter), [])
  const handleSearchChange = useCallback((query: string) => setSearchQuery(query), [])

  const handleLogout = useCallback(async () => {
    await supabaseClient.auth.signOut()
    router.replace('/login')
  }, [router, supabaseClient])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return projects.filter((p) => {
      const matchCtx = activeFilter === 'tous' || p.context === activeFilter
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      return matchCtx && matchSearch
    })
  }, [activeFilter, searchQuery, projects])

  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1" style={{ background: 'rgba(0,0,0,0.06)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#3b5ae0,#818cf8)', transition: 'width 0.12s linear' }} />
      </div>

      {/* Liquid Mesh background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ opacity: 0.42 }}>
        <div className="blob-1 absolute rounded-full" style={{ width: 520, height: 520, top: -80, left: '10%', background: '#bfdbfe', filter: 'blur(110px)' }} />
        <div className="blob-2 absolute rounded-full" style={{ width: 440, height: 440, top: '30%', right: '8%', background: '#c7d2fe', filter: 'blur(100px)' }} />
        <div className="blob-3 absolute rounded-full" style={{ width: 380, height: 380, bottom: '10%', left: '35%', background: '#fef9c3', filter: 'blur(100px)' }} />
        <div className="blob-1 absolute rounded-full" style={{ width: 300, height: 300, bottom: '5%', right: '20%', background: '#e0e7ff', filter: 'blur(90px)', animationDelay: '-6s' }} />
      </div>

      <main className="mx-auto max-w-4xl px-6 pt-24 pb-44">
        {/* Hero */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: '#3b5ae0', letterSpacing: '.18em' }}>
            Dashboard
          </p>
          <h1 className="font-black tracking-tighter mb-4 leading-none" style={{ fontSize: 'clamp(3rem,7vw,5rem)', color: '#111827' }}>
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
              {loading ? '…' : `${filtered.length} projet${filtered.length > 1 ? 's' : ''}`}
            </span>
          </div>
          <div style={{ width: 1, height: 18, background: '#e5e7eb' }} />
          <div className="flex items-center gap-2">
            <CalendarDays size={15} color="#9ca3af" />
            <span className="text-sm" style={{ color: '#4b5563' }}>
              {dateStr}
            </span>
          </div>
          {role === 'admin' && (
            <>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 font-bold text-sm"
                style={{ height: 30, padding: '0 12px', borderRadius: 100, border: 'none', background: 'rgba(59,90,224,0.10)', color: '#3b5ae0', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
              >
                <ShieldCheck size={13} />
                Administration
              </button>
            </>
          )}
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
          {loading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : error ? (
            <div className="col-span-full card p-8 flex items-center gap-4" style={{ borderLeft: '3px solid #f87171' }}>
              <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0 }} />
              <div>
                <p className="text-sm font-bold mb-1" style={{ color: '#111827' }}>Impossible de charger les projets</p>
                <p className="text-xs" style={{ color: '#9ca3af' }}>{error}</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full card p-8 text-center">
              <p className="text-sm font-bold mb-1" style={{ color: '#111827' }}>Aucun projet trouvé</p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Essayez de modifier votre recherche ou le filtre actif.</p>
            </div>
          ) : (
            filtered.map((project) => <ProjectCard key={project.id} project={project} />)
          )}
        </div>
      </main>

      {/* Bottom floating nav */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="nav-pill flex items-center gap-3 px-4 py-2">
          <button className="nav-btn" title="Haut de page" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Home size={17} />
          </button>
          <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
          <span className="font-mono text-sm font-semibold" style={{ color: '#111827', letterSpacing: '.05em' }}>
            {loading ? '–' : String(filtered.length).padStart(2, '0')}
          </span>
          <span className="text-xs" style={{ color: '#9ca3af' }}>projets</span>
          <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
          <button className="nav-btn" title="Retour en haut" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <ChevronsUp size={17} />
          </button>
          <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
          <button className="nav-btn" title="Changer mon mot de passe" onClick={() => router.push('/profile')}>
            <UserCog size={17} />
          </button>
          <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
          <button className="nav-btn" title="Déconnexion" onClick={handleLogout}>
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </>
  )
}
