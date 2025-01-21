'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Badge } from "@/components/ui/badge"

interface Filters {
  search: string
  status: string
  dateRange: { from: Date | null; to: Date | null }
  urgentOnly: boolean
}

interface RequestFiltersProps {
  onFiltersChange: (filters: Filters) => void
}

export function RequestFilters({ onFiltersChange }: RequestFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
    dateRange: { from: null, to: null },
    urgentOnly: false
  })

  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const updateFilters = (newFilters: Partial<Filters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)

    // Aggiorna i filtri attivi
    const active = []
    if (updated.search) active.push('Ricerca')
    if (updated.status !== 'all') active.push('Stato')
    if (updated.dateRange.from || updated.dateRange.to) active.push('Data')
    if (updated.urgentOnly) active.push('Solo Urgenti')
    setActiveFilters(active)
  }

  const clearFilters = () => {
    const defaultFilters = {
      search: '',
      status: 'all',
      dateRange: { from: null, to: null },
      urgentOnly: false
    }
    setFilters(defaultFilters)
    setActiveFilters([])
    onFiltersChange(defaultFilters)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Cerca pratica o azienda..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />

        <Select
          value={filters.status}
          onValueChange={(value) => updateFilters({ status: value })}
        >
          <option value="all">Tutti gli stati</option>
          <option value="pending">In Attesa</option>
          <option value="approved">Approvate</option>
          <option value="rejected">Rifiutate</option>
        </Select>

        <DateRangePicker
          value={filters.dateRange}
          onChange={(range) => updateFilters({ dateRange: range })}
        />

        <Button
          variant={filters.urgentOnly ? "default" : "outline"}
          onClick={() => updateFilters({ urgentOnly: !filters.urgentOnly })}
        >
          Solo Urgenti
        </Button>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Filtri attivi:</span>
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="secondary">
              {filter}
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Cancella filtri
          </Button>
        </div>
      )}
    </div>
  )
} 