"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const TEMPLATE_COMMENTS = {
  request_docs: "Si richiede l'invio della seguente documentazione aggiuntiva:",
  incomplete_docs: "La documentazione fornita risulta incompleta. Nello specifico:",
  clarification: "Si richiedono chiarimenti in merito a:",
  approval: "La pratica è stata approvata. Note:",
  rejection: "La pratica non può essere accettata per i seguenti motivi:"
}

export function PracticeTemplateComments({ onSubmit }: { onSubmit: (comment: string) => void }) {
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [customText, setCustomText] = useState("")

  const handleSubmit = () => {
    const finalComment = selectedTemplate 
      ? `${TEMPLATE_COMMENTS[selectedTemplate as keyof typeof TEMPLATE_COMMENTS]}\n${customText}`
      : customText
    onSubmit(finalComment)
    setCustomText("")
  }

  return (
    <div className="space-y-4">
      <Select onValueChange={setSelectedTemplate}>
        <SelectTrigger>
          <SelectValue placeholder="Seleziona template commento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="request_docs">Richiesta Documenti</SelectItem>
          <SelectItem value="incomplete_docs">Documenti Incompleti</SelectItem>
          <SelectItem value="clarification">Richiesta Chiarimenti</SelectItem>
          <SelectItem value="approval">Approvazione</SelectItem>
          <SelectItem value="rejection">Rifiuto</SelectItem>
        </SelectContent>
      </Select>
      
      <Textarea
        value={customText}
        onChange={(e) => setCustomText(e.target.value)}
        placeholder="Aggiungi dettagli al commento..."
        className="min-h-[100px]"
      />
      
      <Button onClick={handleSubmit}>Invia Commento</Button>
    </div>
  )
} 