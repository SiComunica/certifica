'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { emailService } from '@/lib/email'
import { contractsApi } from '@/lib/supabase/contracts'

interface IntegrationRequestDialogProps {
  contractId: string
  userEmail: string
  onRequestSent: () => void
}

export function IntegrationRequestDialog({
  contractId,
  userEmail,
  onRequestSent
}: IntegrationRequestDialogProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      
      // Aggiorna lo stato del contratto
      await contractsApi.update(contractId, {
        status: 'integration_required',
        notes: message
      })

      // Invia email all'utente
      await emailService.sendIntegrationRequest(userEmail, contractId, message)
      
      onRequestSent()
    } catch (error) {
      console.error('Errore nell\'invio della richiesta:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Richiedi Integrazioni</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Richiedi Integrazioni</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Descrivi i documenti o le informazioni necessarie..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !message}
          >
            {isLoading ? 'Invio in corso...' : 'Invia Richiesta'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 