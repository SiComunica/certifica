"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useState } from "react"

interface Practice {
  id: string
  title: string
  status: string
  created_at: string
  // ... altri campi
}

export function PracticeExport({ practices }: { practices: Practice[] }) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToCsv = () => {
    setIsExporting(true)
    try {
      const headers = ['ID', 'Titolo', 'Stato', 'Data Creazione']
      const data = practices.map(p => [
        p.id,
        p.title,
        p.status,
        new Date(p.created_at).toLocaleDateString()
      ])

      const csvContent = [
        headers.join(','),
        ...data.map(row => row.join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `pratiche_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button 
      onClick={exportToCsv} 
      disabled={isExporting}
      variant="outline"
    >
      <Download className="mr-2 h-4 w-4" />
      Esporta Pratiche
    </Button>
  )
} 