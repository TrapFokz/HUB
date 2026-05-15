export type Context = 'perso' | 'pro'
export type Filter = 'tous' | Context

export interface Project {
  id: string
  name: string
  description: string
  emoji: string
  href: string
  external?: boolean
  context: Context
  tags: string[]
}

export interface SupabaseProject {
  id: string
  nom: string
  description: string
  type: 'local' | 'externe'
  url: string
  contexte: Context
  icone: string
  tags: string[]
  statut: string
  created_at: string
}

export function mapSupabaseProject(row: SupabaseProject): Project {
  return {
    id: row.id,
    name: row.nom,
    description: row.description,
    emoji: row.icone,
    href: row.url,
    external: row.type === 'externe',
    context: row.contexte,
    tags: row.tags ?? [],
  }
}
