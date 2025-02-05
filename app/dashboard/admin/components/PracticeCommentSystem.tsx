"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { MessageSquare, Send } from "lucide-react"

type CommentType = 'request_documents' | 'request_clarification' | 'status_update' | 'approval' | 'rejection' | 'request_hearing'

interface PracticeCommentSystemProps {
  practiceId: string
  userId: string // ID dell'utente che ha inviato la pratica
  practiceTitle: string
}

interface Notification {
  id?: string
  user_id: string
  message: string
  title: string
  type: string
  read?: boolean
  created_at?: string
  practice_id: string
}

export function PracticeCommentSystem({ practiceId, userId, practiceTitle }: PracticeCommentSystemProps) {
  const [content, setContent] = useState('')
  const [type, setType] = useState<CommentType>('request_documents')
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('Utente non autenticato')
        throw new Error('Non autorizzato')
      }

      console.log('1. Admin user:', user.id)
      console.log('2. Target user_id:', userId)
      console.log('3. Practice ID:', practiceId)

      const notificationTitle = {
        'request_documents': 'Richiesta Documenti',
        'request_clarification': 'Richiesta Chiarimenti',
        'status_update': 'Aggiornamento Stato',
        'approval': 'Pratica Approvata',
        'rejection': 'Pratica Rifiutata',
        'request_hearing': 'Richiesta Audizione'
      }[type]

      console.log('4. Creazione notifica con dati:', {
        user_id: userId,
        title: notificationTitle,
        message: `${notificationTitle} per la pratica "${practiceTitle}": ${content}`,
        type: type,
        practice_id: practiceId,
        read: false
      })

      // Creiamo il commento
      const { error: commentError } = await supabase
        .from('practice_comments')
        .insert({
          practice_id: practiceId,
          user_id: user.id,
          content,
          type
        })

      if (commentError) throw commentError

      // Creiamo la notifica per l'utente
      const { data: notificationData, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: notificationTitle,
          message: `${notificationTitle} per la pratica "${practiceTitle}": ${content}`,
          type: type,
          practice_id: practiceId,
          read: false
        })
        .select()

      if (notificationError) {
        console.error('5. Errore creazione notifica:', notificationError)
        throw notificationError
      }

      console.log('6. Notifica creata con successo:', notificationData)
      await toast.promise(
        Promise.resolve(),
        {
          loading: 'Invio notifica in corso...',
          success: 'Notifica inviata con successo!',
          error: 'Errore nell\'invio della notifica'
        }
      )
      setContent('')

    } catch (error: any) {
      console.error('7. Errore completo:', error)
      toast.error(`Errore nell'invio del messaggio: ${error.message}`)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-medium flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Invia comunicazione all'utente
      </h3>

      <Select
        value={type}
        onValueChange={(value) => setType(value as CommentType)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleziona tipo messaggio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="request_documents">Richiesta Documenti</SelectItem>
          <SelectItem value="request_clarification">Richiesta Chiarimenti</SelectItem>
          <SelectItem value="status_update">Aggiornamento Stato</SelectItem>
          <SelectItem value="approval">Approvazione</SelectItem>
          <SelectItem value="rejection">Rifiuto</SelectItem>
          <SelectItem value="request_hearing">Richiesta Audizione</SelectItem>
        </SelectContent>
      </Select>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={type === 'request_hearing' ? 
          "Inserisci data, ora e link alla piattaforma di video call per l'audizione..." : 
          "Scrivi un messaggio..."}
        className="min-h-[100px]"
      />

      <Button 
        onClick={handleSubmit}
        className="w-full"
        disabled={!content.trim() || !type}
      >
        <Send className="h-4 w-4 mr-2" />
        Invia comunicazione
      </Button>
    </div>
  )
} 