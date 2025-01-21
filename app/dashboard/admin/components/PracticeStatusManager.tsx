"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useState } from "react"
import { toast } from "sonner"

interface PracticeStatusManagerProps {
  practiceId: string
  currentStatus: string
  onStatusChange: () => void
  isAssigned: boolean
  assignedToCurrentUser: boolean
}

export function PracticeStatusManager({
  practiceId,
  currentStatus,
  onStatusChange,
  isAssigned,
  assignedToCurrentUser
}: PracticeStatusManagerProps) {
  const [newStatus, setNewStatus] = useState<string>(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClientComponentClient()

  const statusOptions = [
    { value: 'in_progress', label: 'In Lavorazione' },
    { value: 'needs_info', label: 'Richiesta Informazioni' },
    { value: 'completed', label: 'Approvata' },
    { value: 'rejected', label: 'Rifiutata' }
  ]

  const handleStatusUpdate = async () => {
    if (!assignedToCurrentUser) {
      toast.error("Solo il membro assegnato può modificare lo stato")
      return
    }

    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('practices')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', practiceId)

      if (error) throw error

      toast.success("Stato aggiornato con successo")
      onStatusChange()
    } catch (error) {
      toast.error("Errore nell'aggiornamento dello stato")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={newStatus}
        onValueChange={setNewStatus}
        disabled={!assignedToCurrentUser || !isAssigned}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Seleziona stato" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        onClick={handleStatusUpdate}
        disabled={!assignedToCurrentUser || !isAssigned || currentStatus === newStatus || isUpdating}
      >
        Aggiorna Stato
      </Button>
    </div>
  )
} 