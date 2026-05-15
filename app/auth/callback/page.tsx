'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()

    async function handle() {
      const code = searchParams.get('code')

      // Flux PKCE : code dans les query params
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        router.replace(error ? '/login?error=true' : '/')
        return
      }

      // Flux implicite : token dans le fragment (#access_token=...&refresh_token=...)
      const hash = window.location.hash.slice(1)
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        router.replace(error ? '/login?error=true' : '/')
        return
      }

      // Ni code ni token valide (ex : lien expiré avec #error=... dans le fragment)
      router.replace('/login?error=true')
    }

    handle()
  }, [router, searchParams])

  return null
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  )
}
