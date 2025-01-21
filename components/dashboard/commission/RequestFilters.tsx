'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Filters {
  search?: string
  status?: string
  priority?: string
}

export function RequestFilters() {
  const [filters, setFilters] = useState<Filters>({})

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Cerca..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        <Select
          value={filters.status || ''}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <option value="">Stato</option>
          <option value="pending">In Attesa</option>
          <option value="approved">Approvata</option>
          <option value="rejected">Rifiutata</option>
        </Select>

        <Select
          value={filters.priority || ''}
          onValueChange={(value) => handleFilterChange('priority', value)}
        >
          <option value="">Priorità</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Bassa</option>
        </Select>
      </div>

      {/* Filtri attivi */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(filters).map(([key, value]) => 
          value && (
            <Badge key={key} variant="secondary">
              {key}: {value}
            </Badge>
          )
        )}
      </div>
    </div>
  )
} 