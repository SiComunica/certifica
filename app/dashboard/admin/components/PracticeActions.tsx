"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface PracticeActionsProps {
  practiceId: string
  practiceData: any
}

export function PracticeActions({ practiceId, practiceData }: PracticeActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const supabase = createClientComponentClient()

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      const { data, error } = await supabase
        .functions.invoke('generate-practice-pdf', {
          body: { practiceId, practiceData }
        })

      if (error) throw error

      // Crea un blob dal PDF e scaricalo
      const blob = new Blob([data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pratica-${practiceId}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success("PDF generato con successo")
    } catch (error) {
      toast.error("Errore nella generazione del PDF")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button 
      onClick={generatePDF} 
      disabled={isGenerating}
      variant="outline"
      size="sm"
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generazione...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Genera PDF
        </>
      )}
    </Button>
  )
} 