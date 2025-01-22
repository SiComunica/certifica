'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { emailService } from '@/lib/email'

interface IntegrationRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
  contractId: string
  onRequestSent: () => void
}

export function IntegrationRequestDialog({
  isOpen,
  onClose,
  userEmail,
  contractId,
  onRequestSent
}: IntegrationRequestDialogProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Usa il metodo generico sendEmail invece di sendIntegrationRequest
      await emailService.sendEmail(
        userEmail,
        'Richiesta Integrazione Documenti',
        `Richiesta integrazione per contratto ${contractId}:\n\n${message}`
      )
      
      onRequestSent()
      onClose()
    } catch (error) {
      console.error('Errore invio richiesta:', error)
      alert('Errore nell\'invio della richiesta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Richiedi Integrazione</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="Messaggio per l'utente..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading || !message.trim()}
            >
              {loading ? 'Invio...' : 'Invia Richiesta'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 