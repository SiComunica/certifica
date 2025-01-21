import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from '@/components/ui/use-toast'

export const notificationsApi = {
  subscribeToContractUpdates(contractId: string, callback: (payload: any) => void) {
    const supabase = createClientComponentClient()
    return supabase
      .channel(`contract-${contractId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contracts',
          filter: `id=eq.${contractId}`
        },
        callback
      )
      .subscribe()
  },

  setupContractNotifications(userId: string) {
    const supabase = createClientComponentClient()
    const contractsChannel = supabase
      .channel('contract-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contracts',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          const { new: newData } = payload

          if (payload.eventType === 'UPDATE') {
            const statusMessages = {
              approved: 'La tua richiesta è stata approvata!',
              rejected: 'La tua richiesta è stata rifiutata.',
              integration_required: 'Sono richieste integrazioni per la tua richiesta.'
            }

            const message = statusMessages[newData.status as keyof typeof statusMessages]
            if (message) {
              toast({
                title: 'Aggiornamento Stato',
                description: message,
                variant: newData.status === 'approved' ? 'default' : 'destructive'
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(contractsChannel)
    }
  }
} 