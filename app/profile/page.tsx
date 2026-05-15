'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, Check, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

const inputStyle: React.CSSProperties = {
  height: 44,
  width: '100%',
  paddingLeft: 38,
  paddingRight: 44,
  border: '1.5px solid rgba(0,0,0,0.10)',
  borderRadius: 100,
  background: 'rgba(255,255,255,0.82)',
  fontSize: '0.875rem',
  color: '#111827',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

function focusStyle(el: EventTarget & HTMLElement) {
  el.style.borderColor = '#3b5ae0'
  el.style.boxShadow = '0 0 0 3px rgba(59,90,224,0.10)'
}
function blurStyle(el: EventTarget & HTMLElement) {
  el.style.borderColor = 'rgba(0,0,0,0.10)'
  el.style.boxShadow = 'none'
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/login'); return }
      setEmail(user.email ?? '')
    })
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  const disabled = loading || !newPassword || !confirmPassword

  return (
    <>
      {/* Liquid Mesh background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ opacity: 0.42 }}>
        <div className="blob-1 absolute rounded-full" style={{ width: 520, height: 520, top: -80, left: '10%', background: '#bfdbfe', filter: 'blur(110px)' }} />
        <div className="blob-2 absolute rounded-full" style={{ width: 440, height: 440, top: '30%', right: '8%', background: '#c7d2fe', filter: 'blur(100px)' }} />
        <div className="blob-3 absolute rounded-full" style={{ width: 380, height: 380, bottom: '10%', left: '35%', background: '#fef9c3', filter: 'blur(100px)' }} />
        <div className="blob-1 absolute rounded-full" style={{ width: 300, height: 300, bottom: '5%', right: '20%', background: '#e0e7ff', filter: 'blur(90px)', animationDelay: '-6s' }} />
      </div>

      <main className="mx-auto max-w-4xl px-6 flex flex-col items-center justify-center" style={{ minHeight: '100dvh' }}>

        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: '#3b5ae0', letterSpacing: '.18em' }}>
            Mon compte
          </p>
          <h1 className="font-black tracking-tighter mb-4 leading-none" style={{ fontSize: 'clamp(2.5rem,6vw,4rem)', color: '#111827' }}>
            Changer mon mot de passe
          </h1>
          {email && (
            <p className="text-sm font-medium" style={{ color: '#6b7280' }}>{email}</p>
          )}
        </div>

        {/* Card */}
        <div className="card p-8 w-full" style={{ maxWidth: 420 }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Nouveau mot de passe */}
            <div className="flex flex-col gap-2">
              <label htmlFor="new-password" className="text-sm font-bold" style={{ color: '#374151' }}>
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock size={15} className="absolute top-1/2 -translate-y-1/2 pointer-events-none" style={{ left: 14, color: '#9ca3af' }} />
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  required
                  autoFocus
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(null); setSuccess(false) }}
                  placeholder="Min. 8 caractères"
                  style={inputStyle}
                  onFocus={(e) => focusStyle(e.target)}
                  onBlur={(e) => blurStyle(e.target)}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(v => !v)}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirmation */}
            <div className="flex flex-col gap-2">
              <label htmlFor="confirm-password" className="text-sm font-bold" style={{ color: '#374151' }}>
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock size={15} className="absolute top-1/2 -translate-y-1/2 pointer-events-none" style={{ left: 14, color: '#9ca3af' }} />
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(null); setSuccess(false) }}
                  placeholder="Répétez le mot de passe"
                  style={inputStyle}
                  onFocus={(e) => focusStyle(e.target)}
                  onBlur={(e) => blurStyle(e.target)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm" style={{ background: '#fef2f2', color: '#dc2626' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />{error}
              </div>
            )}

            {/* Succès */}
            {success && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <Check size={15} style={{ flexShrink: 0 }} />
                Mot de passe mis à jour avec succès
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={disabled}
              className="flex items-center justify-center gap-2 font-bold text-sm"
              style={{
                height: 44,
                borderRadius: 100,
                border: 'none',
                background: disabled ? 'rgba(59,90,224,0.4)' : '#3b5ae0',
                color: '#fff',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = '#2d4bc4' }}
              onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = '#3b5ae0' }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <><Check size={15} />Enregistrer</>
              )}
            </button>

          </form>
        </div>

        {/* Retour */}
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-2 font-bold text-sm mt-6"
          style={{ height: 38, padding: '0 16px', borderRadius: 100, border: '1.5px solid rgba(0,0,0,0.10)', background: 'rgba(255,255,255,0.82)', color: '#374151', cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(20px)' }}
        >
          <ArrowLeft size={15} />
          Retour au dashboard
        </button>

      </main>
    </>
  )
}
