'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"
import { supabase } from "@/lib/supabase"

interface RequestReviewProps {
  requestId: string
  onReviewComplete?: () => void
}

export function RequestReview({ requestId, onReviewComplete }: RequestReviewProps) {
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')

  const handleReview = async (status: 'approved' | 'rejected') => {
    setLoading(true)
    try {
      // Simuliamo una chiamata API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Review submitted:', {
        requestId,
        status,
        notes
      })
      
      onReviewComplete?.()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Errore durante la revisione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Note (opzionali)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-[100px]"
      />

      <div className="flex space-x-4">
        <Button
          variant="default"
          onClick={() => handleReview('approved')}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          Approva
        </Button>

        <Button
          variant="destructive"
          onClick={() => handleReview('rejected')}
          disabled={loading}
        >
          Rifiuta
        </Button>
      </div>
    </div>
  )
} 