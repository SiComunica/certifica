"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export function DataExport() {
  const [loading, setLoading] = useState(false)
  const [includeArchived, setIncludeArchived] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      // Per ora solo un log
      console.log('Esportazione dati', {
        includeArchived,
        date: new Date().toISOString()
      })
      
      // Simuliamo il download
      setTimeout(() => {
        alert('Esportazione completata!')
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Errore esportazione:', error)
      alert('Errore durante l\'esportazione')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="archived"
          checked={includeArchived}
          onCheckedChange={(checked) => setIncludeArchived(checked as boolean)}
        />
        <label 
          htmlFor="archived"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Includi archiviate
        </label>
      </div>

      <Button 
        onClick={handleExport}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Esportazione in corso...' : 'Esporta Dati'}
      </Button>
    </div>
  )
} 