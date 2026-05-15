'use client'

import { Search } from 'lucide-react'
import { Filter } from '@/data/projects'

interface FilterBarProps {
  activeFilter: Filter
  searchQuery: string
  onFilterChange: (filter: Filter) => void
  onSearchChange: (query: string) => void
}

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'Tous', value: 'tous' },
  { label: 'Perso', value: 'perso' },
  { label: 'Pro', value: 'pro' },
]

export default function FilterBar({
  activeFilter,
  searchQuery,
  onFilterChange,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="toggle-group">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            className={`toggle-btn${activeFilter === value ? ' active' : ''}`}
            onClick={() => onFilterChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 relative">
        <Search
          size={14}
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: 12, color: '#9ca3af' }}
        />
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher un projet…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  )
}
