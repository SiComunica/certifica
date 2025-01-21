'use client'

import { useState } from 'react'
import { DateRange } from "react-day-picker"
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface FiltersState {
  dateRange: DateRange | null
  status: string
  contractType: string
  isUrgent: boolean
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FiltersState) => void
}

export function AdvancedFilters({ onFiltersChange }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FiltersState>({
    dateRange: null,
    status: '',
    contractType: '',
    isUrgent: false
  })

  const handleChange = (updates: Partial<FiltersState>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Periodo</label>
          <DateRangePicker
            value={filters.dateRange}
            onChange={(range) => handleChange({ dateRange: range })}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Stato</label>
          <Select
            value={filters.status}
            onValueChange={(value: string) => handleChange({ status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">In Attesa</SelectItem>
              <SelectItem value="approved">Approvata</SelectItem>
              <SelectItem value="rejected">Rifiutata</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Tipo Contratto</label>
          <Select
            value={filters.contractType}
            onValueChange={(value: string) => handleChange({ contractType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="determinato">Tempo Determinato</SelectItem>
              <SelectItem value="indeterminato">Tempo Indeterminato</SelectItem>
              <SelectItem value="apprendistato">Apprendistato</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            checked={filters.isUrgent}
            onCheckedChange={(checked) => 
              handleChange({ isUrgent: checked as boolean })
            }
          />
          <label className="text-sm font-medium">Solo Urgenti</label>
        </div>
      </div>

      <Button 
        variant="outline" 
        onClick={() => {
          const resetFilters: FiltersState = {
            dateRange: null,
            status: '',
            contractType: '',
            isUrgent: false
          }
          setFilters(resetFilters)
          onFiltersChange(resetFilters)
        }}
      >
        Reimposta Filtri
      </Button>
    </div>
  )
} 