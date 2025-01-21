"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

interface PracticeFiltersProps {
  onFilterChange: (filters: PracticeFilters) => void
}

interface PracticeFilters {
  search: string
  status: string
  assignedOnly: boolean
}

export function PracticeFilters({ onFilterChange }: PracticeFiltersProps) {
  const [filters, setFilters] = useState<PracticeFilters>({
    search: '',
    status: 'all',
    assignedOnly: false
  })

  const handleFilterChange = (key: keyof PracticeFilters, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Cerca pratica..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtra per stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="pending">In Attesa</SelectItem>
            <SelectItem value="in_progress">In Lavorazione</SelectItem>
            <SelectItem value="needs_info">Richiesta Info</SelectItem>
            <SelectItem value="completed">Approvate</SelectItem>
            <SelectItem value="rejected">Rifiutate</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 