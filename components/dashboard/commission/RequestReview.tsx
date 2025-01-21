'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"
import { supabase } from "@/lib/supabase"

interface RequestReviewProps {
  requestId: string
  onReviewComplete: () => void
}

export function RequestReview({ requestId, onReviewComplete }: RequestReviewProps) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReview = async (status: 'approved' | 'rejected') => {
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('certification_requests')
        .update({ 
          status,
          review_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) throw error

      toast.success(`Pratica ${status === 'approved' ? 'approvata' : 'respinta'} con successo`)
      onReviewComplete()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Errore durante la revisione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Note di revisione..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-[100px]"
      />

      <div className="flex space-x-4">
        <Button
          variant="success"
          onClick={() => handleReview('approved')}
          disabled={loading}
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