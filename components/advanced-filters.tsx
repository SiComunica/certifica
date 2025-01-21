"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function AdvancedFilters() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(!isOpen)}
      >
        Filtri Avanzati
      </Button>

      {isOpen && (
        <div className="p-4 border rounded-lg">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Stato
              </label>
              <select className="w-full p-2 border rounded">
                <option value="">Tutti</option>
                <option value="active">Attivo</option>
                <option value="completed">Completato</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Priorità
              </label>
              <select className="w-full p-2 border rounded">
                <option value="">Tutte</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Bassa</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 