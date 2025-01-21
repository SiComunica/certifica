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

interface PracticeCommentSystemProps {
  practiceId: string
  userId: string // ID dell'utente che ha inviato la pratica
  practiceTitle: string
}

export function PracticeCommentSystem({ practiceId, userId, practiceTitle }: PracticeCommentSystemProps) {
  const [commentType, setCommentType] = useState("")
  const [comment, setComment] = useState("")
  const supabase = createClientComponentClient()

  const commentTemplates = {
    request_documents: {
      title: "Richiesta Documenti",
      template: "Si richiede di fornire la seguente documentazione aggiuntiva:"
    },
    clarification: {
      title: "Richiesta Chiarimenti",
      template: "Sono necessari chiarimenti sui seguenti punti:"
    },
    update: {
      title: "Aggiornamento Stato",
      template: "La pratica è stata aggiornata:"
    },
    approval: {
      title: "Approvazione",
      template: "La pratica è stata approvata con le seguenti note:"
    },
    rejection: {
      title: "Rifiuto",
      template: "La pratica non può essere approvata per i seguenti motivi:"
    }
  }

  const handleCommentSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non autorizzato")

      // 1. Salva il commento
      const { error: commentError } = await supabase
        .from('practice_comments')
        .insert({
          practice_id: practiceId,
          user_id: user.id,
          content: comment,
          type: commentType
        })

      if (commentError) throw commentError

      // 2. Crea una notifica per l'utente
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: `Nuovo commento sulla pratica: ${practiceTitle}`,
          message: comment,
          type: commentType,
          practice_id: practiceId
        })

      if (notificationError) throw notificationError

      // 3. Invia email all'utente
      const { error: emailError } = await supabase
        .functions.invoke('send-practice-notification', {
          body: {
            userId,
            practiceId,
            commentType,
            comment,
            practiceTitle
          }
        })

      if (emailError) throw emailError

      toast.success("Commento inviato con successo")
      setComment("")
      setCommentType("")
    } catch (error) {
      toast.error("Errore nell'invio del commento")
      console.error(error)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-medium flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Invia comunicazione all'utente
      </h3>

      <Select
        value={commentType}
        onValueChange={(value) => {
          setCommentType(value)
          setComment(commentTemplates[value as keyof typeof commentTemplates].template)
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleziona tipo di comunicazione" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(commentTemplates).map(([key, { title }]) => (
            <SelectItem key={key} value={key}>
              {title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Scrivi il tuo messaggio..."
        className="min-h-[120px]"
      />

      <Button 
        onClick={handleCommentSubmit}
        className="w-full"
        disabled={!comment.trim() || !commentType}
      >
        <Send className="h-4 w-4 mr-2" />
        Invia comunicazione
      </Button>
    </div>
  )
} 