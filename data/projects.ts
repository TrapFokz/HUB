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

export const projects: Project[] = [
  {
    id: 'template',
    name: 'Template',
    description: 'Voici un template',
    emoji: '📁',
    href: '/projects/template/index.html',
    context: 'perso',
    tags: ['Template'],
  },
  {
    id: 't2j',
    name: 'T2J',
    description: 'Teams 2 Jira',
    emoji: '🔗',
    href: 'https://usine-a-sites.s3.eu-west-1.amazonaws.com/0_host/T2J_v4.html',
    external: true,
    context: 'pro',
    tags: ['Externe'],
  },
]
