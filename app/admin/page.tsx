'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Plus, Trash2, Pencil, X, Check,
  Loader2, AlertCircle, ShieldCheck, FolderOpen,
  UserPlus, Users, Send, CheckCircle, LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { SupabaseProject } from '@/data/projects'

// ── Types ────────────────────────────────────────────────────────────────────

interface WhitelistEntry {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at: string
}

type ProjectForm = {
  nom: string
  description: string
  type: 'local' | 'externe'
  url: string
  contexte: 'perso' | 'pro'
  icone: string
  tags: string
  statut: string
}

const EMPTY_FORM: ProjectForm = {
  nom: '', description: '', type: 'local', url: '',
  contexte: 'perso', icone: '📁', tags: '', statut: 'actif',
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  height: 40, width: '100%',
  border: '1.5px solid rgba(0,0,0,0.10)', borderRadius: 10,
  background: 'rgba(255,255,255,0.82)', fontSize: '0.875rem',
  color: '#111827', outline: 'none', padding: '0 12px',
  fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s',
}

const focusStyle = (el: EventTarget & HTMLElement) => {
  el.style.borderColor = '#3b5ae0'
  el.style.boxShadow = '0 0 0 3px rgba(59,90,224,0.10)'
}
const blurStyle = (el: EventTarget & HTMLElement) => {
  el.style.borderColor = 'rgba(0,0,0,0.10)'
  el.style.boxShadow = 'none'
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  // ── Auth + role check ──
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/login'); return }
      const { data } = await supabase.from('whitelist').select('role').eq('email', user.email!).single()
      if (data?.role !== 'admin') router.replace('/')
    })
  }, [router, supabase])

  // ── Projects state ──
  const [projects, setProjects] = useState<SupabaseProject[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState<string | null>(null)

  // ── Whitelist state ──
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([])
  const [whitelistLoading, setWhitelistLoading] = useState(true)
  const [whitelistError, setWhitelistError] = useState<string | null>(null)

  // ── Project form state ──
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // ── Invite state ──
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'user'>('user')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteResult, setInviteResult] = useState<{ email: string; tempPassword: string } | null>(null)

  // ── Delete confirmation ──
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'project' | 'user'; id: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ── Refresh trigger ──
  const [tick, setTick] = useState(0)
  const refresh = () => setTick(t => t + 1)

  // ── Data fetching ──
  useEffect(() => {
    setProjectsLoading(true)
    setWhitelistLoading(true)

    supabase.from('projets').select('*').order('created_at', { ascending: true })
      .then(({ data, error }) => {
        setProjectsError(error?.message ?? null)
        setProjects((data ?? []) as SupabaseProject[])
        setProjectsLoading(false)
      })

    supabase.from('whitelist').select('*').order('created_at', { ascending: true })
      .then(({ data, error }) => {
        setWhitelistError(error?.message ?? null)
        setWhitelist((data ?? []) as WhitelistEntry[])
        setWhitelistLoading(false)
      })
  }, [tick, supabase])

  // ── Logout ──
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  // ── Project form handlers ──
  const field = (key: keyof ProjectForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }))

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowForm(true)
    setTimeout(() => document.getElementById('field-nom')?.focus(), 50)
  }

  const openEdit = (p: SupabaseProject) => {
    setEditingId(p.id)
    setForm({
      nom: p.nom, description: p.description, type: p.type,
      url: p.url, contexte: p.contexte, icone: p.icone,
      tags: (p.tags ?? []).join(', '), statut: p.statut ?? 'actif',
    })
    setFormError(null)
    setShowForm(true)
    setTimeout(() => document.getElementById('field-nom')?.focus(), 50)
  }

  const closeForm = () => { setShowForm(false); setEditingId(null); setFormError(null) }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitting(true)
    setFormError(null)

    const payload = {
      nom: form.nom.trim(),
      description: form.description.trim(),
      type: form.type,
      url: form.url.trim(),
      contexte: form.contexte,
      icone: form.icone.trim() || '📁',
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      statut: form.statut,
    }

    const { error } = editingId
      ? await supabase.from('projets').update(payload).eq('id', editingId)
      : await supabase.from('projets').insert(payload)

    if (error) { setFormError(error.message) } else { closeForm(); refresh() }
    setFormSubmitting(false)
  }

  // ── Delete handler ──
  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    if (confirmDelete.type === 'project') {
      await supabase.from('projets').delete().eq('id', confirmDelete.id)
    } else {
      await supabase.from('whitelist').delete().eq('id', confirmDelete.id)
    }
    setConfirmDelete(null)
    setDeleting(false)
    refresh()
  }

  // ── Invite handler ──
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteLoading(true)
    setInviteError(null)
    setInviteResult(null)

    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
    })

    const json = await res.json()
    if (!res.ok) {
      setInviteError(json.error ?? 'Une erreur est survenue')
    } else {
      setInviteResult({ email: json.email, tempPassword: json.tempPassword })
      setInviteEmail('')
      setInviteRole('user')
      refresh()
    }
    setInviteLoading(false)
  }

  // ── Copy password ──
  const copyPassword = (pwd: string) => {
    navigator.clipboard.writeText(pwd)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Liquid Mesh background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ opacity: 0.42 }}>
        <div className="blob-1 absolute rounded-full" style={{ width: 520, height: 520, top: -80, left: '10%', background: '#bfdbfe', filter: 'blur(110px)' }} />
        <div className="blob-2 absolute rounded-full" style={{ width: 440, height: 440, top: '30%', right: '8%', background: '#c7d2fe', filter: 'blur(100px)' }} />
        <div className="blob-3 absolute rounded-full" style={{ width: 380, height: 380, bottom: '10%', left: '35%', background: '#fef9c3', filter: 'blur(100px)' }} />
        <div className="blob-1 absolute rounded-full" style={{ width: 300, height: 300, bottom: '5%', right: '20%', background: '#e0e7ff', filter: 'blur(90px)', animationDelay: '-6s' }} />
      </div>

      {/* Modale mot de passe temporaire */}
      {inviteResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}
        >
          <div className="card p-6 flex flex-col gap-4" style={{ maxWidth: 420, width: '90%' }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0" style={{ background: '#f0fdf4' }}>
                <CheckCircle size={20} color="#16a34a" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#111827' }}>Utilisateur créé avec succès</p>
                <p className="text-xs" style={{ color: '#6b7280' }}>{inviteResult.email}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 p-4 rounded-2xl" style={{ background: 'rgba(0,0,0,0.035)' }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6b7280', letterSpacing: '.1em' }}>
                Mot de passe temporaire
              </p>
              <div className="flex items-center gap-2">
                <code
                  className="flex-1 font-mono text-base font-bold px-3 py-2 rounded-xl select-all"
                  style={{ background: 'rgba(255,255,255,0.9)', color: '#111827', border: '1.5px solid rgba(0,0,0,0.08)', letterSpacing: '.08em' }}
                >
                  {inviteResult.tempPassword}
                </code>
                <button
                  type="button"
                  onClick={() => copyPassword(inviteResult.tempPassword)}
                  title="Copier"
                  style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: '#3b5ae0', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <Check size={15} />
                </button>
              </div>
            </div>

            <p className="text-xs" style={{ color: '#6b7280', lineHeight: 1.6 }}>
              Communique ce mot de passe à l'utilisateur. Il pourra le modifier après sa première connexion via son profil.
            </p>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setInviteResult(null)}
                style={{ height: 36, padding: '0 20px', borderRadius: 100, border: 'none', background: '#3b5ae0', fontSize: '0.82rem', fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation overlay */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}
          onClick={() => !deleting && setConfirmDelete(null)}
        >
          <div className="card p-6 flex flex-col gap-4" style={{ maxWidth: 360, width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full" style={{ background: '#fef2f2' }}>
                <Trash2 size={18} color="#dc2626" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: '#111827' }}>Confirmer la suppression</p>
                <p className="text-xs" style={{ color: '#6b7280' }}>Cette action est irréversible.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setConfirmDelete(null)} disabled={deleting}
                style={{ height: 36, padding: '0 16px', borderRadius: 100, border: '1.5px solid rgba(0,0,0,0.10)', background: 'transparent', fontSize: '0.82rem', fontWeight: 700, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>
                Annuler
              </button>
              <button type="button" onClick={handleDelete} disabled={deleting}
                className="flex items-center gap-2"
                style={{ height: 36, padding: '0 16px', borderRadius: 100, border: 'none', background: '#dc2626', fontSize: '0.82rem', fontWeight: 700, color: '#fff', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1, fontFamily: 'inherit' }}>
                {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-4xl px-6 pt-16 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => router.push('/')}
              className="flex items-center gap-2 font-bold text-sm"
              style={{ height: 38, padding: '0 16px', borderRadius: 100, border: '1.5px solid rgba(0,0,0,0.10)', background: 'rgba(255,255,255,0.82)', color: '#374151', cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(20px)' }}>
              <ArrowLeft size={15} />
              Dashboard
            </button>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#3b5ae0', letterSpacing: '.18em' }}>Administration</p>
              <h1 className="font-black tracking-tighter leading-tight" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: '#111827' }}>Back Office</h1>
            </div>
          </div>
          <button type="button" onClick={handleLogout}
            className="flex items-center gap-2 font-bold text-sm"
            style={{ height: 38, padding: '0 16px', borderRadius: 100, border: '1.5px solid rgba(0,0,0,0.10)', background: 'rgba(255,255,255,0.82)', color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(20px)', flexShrink: 0 }}>
            <LogOut size={15} />
            Déconnexion
          </button>
        </div>

        {/* ── PROJETS ─────────────────────────────────────────────────────── */}
        <section className="mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FolderOpen size={17} color="#3b5ae0" />
                <span className="font-bold text-base" style={{ color: '#111827' }}>Projets</span>
                {!projectsLoading && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,90,224,0.09)', color: '#3b5ae0' }}>
                    {projects.length}
                  </span>
                )}
              </div>
              {!showForm && (
                <button type="button" onClick={openAdd} className="flex items-center gap-2 font-bold text-sm"
                  style={{ height: 36, padding: '0 14px', borderRadius: 100, border: 'none', background: '#3b5ae0', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Plus size={14} />
                  Ajouter
                </button>
              )}
            </div>

            {projectsError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm mb-4" style={{ background: '#fef2f2', color: '#dc2626' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />{projectsError}
              </div>
            )}

            {projectsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin" color="#9ca3af" />
              </div>
            ) : projects.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: '#9ca3af' }}>Aucun projet pour l'instant.</p>
            ) : (
              <div className="flex flex-col gap-2 mb-2">
                {projects.map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: editingId === p.id ? 'rgba(59,90,224,0.06)' : 'rgba(0,0,0,0.025)', border: editingId === p.id ? '1.5px solid rgba(59,90,224,0.15)' : '1.5px solid transparent' }}>
                    <span className="text-xl" style={{ flexShrink: 0 }}>{p.icone}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: '#111827' }}>{p.nom}</p>
                      <p className="text-xs truncate" style={{ color: '#6b7280' }}>{p.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: p.contexte === 'perso' ? '#EAF3DE' : '#E6F1FB', color: p.contexte === 'perso' ? '#27500A' : '#0C447C' }}>
                        {p.contexte}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.05)', color: '#6b7280' }}>
                        {p.type}
                      </span>
                      <button type="button" onClick={() => openEdit(p)} title="Modifier"
                        style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'rgba(59,90,224,0.08)', color: '#3b5ae0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Pencil size={13} />
                      </button>
                      <button type="button" onClick={() => setConfirmDelete({ type: 'project', id: p.id })} title="Supprimer"
                        style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'rgba(220,38,38,0.08)', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Project form */}
            {showForm && (
              <div className="mt-4 pt-4" style={{ borderTop: '1.5px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-sm" style={{ color: '#111827' }}>
                    {editingId ? 'Modifier le projet' : 'Nouveau projet'}
                  </p>
                  <button type="button" onClick={closeForm}
                    style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.06)', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={13} />
                  </button>
                </div>

                <form onSubmit={handleProjectSubmit} className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="field-nom" className="text-xs font-bold" style={{ color: '#374151' }}>Nom *</label>
                      <input id="field-nom" type="text" required value={form.nom} onChange={field('nom')} placeholder="Mon projet" style={inputStyle} onFocus={e => focusStyle(e.target)} onBlur={e => blurStyle(e.target)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold" style={{ color: '#374151' }}>Icône (emoji)</label>
                      <input type="text" value={form.icone} onChange={field('icone')} placeholder="📁" style={{ ...inputStyle, fontSize: '1.2rem' }} onFocus={e => focusStyle(e.target)} onBlur={e => blurStyle(e.target)} />
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-xs font-bold" style={{ color: '#374151' }}>Description</label>
                      <input type="text" value={form.description} onChange={field('description')} placeholder="Courte description du projet" style={inputStyle} onFocus={e => focusStyle(e.target)} onBlur={e => blurStyle(e.target)} />
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-xs font-bold" style={{ color: '#374151' }}>URL *</label>
                      <input type="text" required value={form.url} onChange={field('url')} placeholder="https://... ou /projects/mon-projet/" style={inputStyle} onFocus={e => focusStyle(e.target)} onBlur={e => blurStyle(e.target)} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold" style={{ color: '#374151' }}>Type</label>
                      <select value={form.type} onChange={field('type')} style={{ ...inputStyle, cursor: 'pointer' }} onFocus={e => focusStyle(e.target)} onBlur={e => blurStyle(e.target)}>
                        <option value="local">Local</option>
                        <option value="externe">Externe</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold" style={{ color: '#374151' }}>Contexte</label>
                      <select value={form.contexte} onChange={field('contexte')} style={{ ...inputStyle, cursor: 'pointer' }} onFocus={e => focusStyle(e.target)} onBlur={e => blurStyle(e.target)}>
                        <option value="perso">Perso</option>
                        <option value="pro">Pro</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-xs font-bold" style={{ color: '#374151' }}>
                        Tags <span style={{ color: '#9ca3af', fontWeight: 400 }}>(séparés par des virgules)</span>
                      </label>
                      <input type="text" value={form.tags} onChange={field('tags')} placeholder="Template, React, Interne" style={inputStyle} onFocus={e => focusStyle(e.target)} onBlur={e => blurStyle(e.target)} />
                    </div>
                  </div>

                  {formError && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm" style={{ background: '#fef2f2', color: '#dc2626' }}>
                      <AlertCircle size={14} style={{ flexShrink: 0 }} />{formError}
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-1">
                    <button type="button" onClick={closeForm} disabled={formSubmitting}
                      style={{ height: 38, padding: '0 16px', borderRadius: 100, border: '1.5px solid rgba(0,0,0,0.10)', background: 'transparent', fontSize: '0.82rem', fontWeight: 700, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Annuler
                    </button>
                    <button type="submit" disabled={formSubmitting} className="flex items-center gap-2"
                      style={{ height: 38, padding: '0 16px', borderRadius: 100, border: 'none', background: formSubmitting ? 'rgba(59,90,224,0.5)' : '#3b5ae0', fontSize: '0.82rem', fontWeight: 700, color: '#fff', cursor: formSubmitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                      {formSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      {editingId ? 'Enregistrer' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>

        {/* ── INVITER UN UTILISATEUR ───────────────────────────────────────── */}
        <section className="mb-8">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <UserPlus size={17} color="#3b5ae0" />
              <span className="font-bold text-base" style={{ color: '#111827' }}>Inviter un utilisateur</span>
            </div>

            <form onSubmit={handleInvite} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold" style={{ color: '#374151' }}>Email *</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={e => { setInviteEmail(e.target.value); setInviteError(null) }}
                    placeholder="utilisateur@email.com"
                    style={inputStyle}
                    onFocus={e => focusStyle(e.target)}
                    onBlur={e => blurStyle(e.target)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold" style={{ color: '#374151' }}>Rôle</label>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as 'admin' | 'user')}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => focusStyle(e.target)}
                    onBlur={e => blurStyle(e.target)}
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>

              {inviteError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm" style={{ background: '#fef2f2', color: '#dc2626' }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />{inviteError}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button type="submit" disabled={inviteLoading || inviteEmail.length === 0} className="flex items-center gap-2 font-bold text-sm"
                  style={{ height: 38, padding: '0 16px', borderRadius: 100, border: 'none', background: inviteLoading || inviteEmail.length === 0 ? 'rgba(59,90,224,0.4)' : '#3b5ae0', color: '#fff', cursor: inviteLoading || inviteEmail.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {inviteLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Envoyer l'invitation
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ── UTILISATEURS ────────────────────────────────────────────────── */}
        <section>
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users size={17} color="#3b5ae0" />
              <span className="font-bold text-base" style={{ color: '#111827' }}>Utilisateurs</span>
              {!whitelistLoading && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,90,224,0.09)', color: '#3b5ae0' }}>
                  {whitelist.length}
                </span>
              )}
            </div>

            {whitelistError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm mb-4" style={{ background: '#fef2f2', color: '#dc2626' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />{whitelistError}
              </div>
            )}

            {whitelistLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin" color="#9ca3af" />
              </div>
            ) : whitelist.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: '#9ca3af' }}>Aucun utilisateur pour l'instant.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {whitelist.map(item => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(0,0,0,0.025)' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                        style={{ background: item.role === 'admin' ? 'rgba(59,90,224,0.10)' : 'rgba(0,0,0,0.06)' }}>
                        <ShieldCheck size={14} color={item.role === 'admin' ? '#3b5ae0' : '#9ca3af'} />
                      </div>
                      <span className="text-sm font-medium truncate" style={{ color: '#111827' }}>{item.email}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: item.role === 'admin' ? 'rgba(59,90,224,0.09)' : 'rgba(0,0,0,0.05)', color: item.role === 'admin' ? '#3b5ae0' : '#6b7280' }}>
                        {item.role === 'admin' ? 'Admin' : 'Utilisateur'}
                      </span>
                      <button type="button" onClick={() => setConfirmDelete({ type: 'user', id: item.id })} title="Supprimer"
                        style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(220,38,38,0.08)', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>
    </>
  )
}
