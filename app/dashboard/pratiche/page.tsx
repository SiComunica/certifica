"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { FileUpload } from "@/components/FileUpload"

interface Practice {
  id: string
  created_at: string
  status: string
  employee_name: string
  contract_type_name: string
  final_price: number
  payment_receipt?: string
  documents: any[]
}

export default function PratichePage() {
  const [practices, setPractices] = useState<Practice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadPractices()
  }, [])

  const loadPractices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('practices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPractices(data || [])
    } catch (error) {
      console.error('Errore caricamento pratiche:', error)
      toast.error("Errore nel caricamento delle pratiche")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadReceipt = async (practice: Practice) => {
    try {
      const { data, error } = await supabase.storage
        .from('receipts')
        .download(practice.payment_receipt!)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `fattura-${practice.id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Errore download fattura:', error)
      toast.error("Errore nel download della fattura")
    }
  }

  const handleSubmitToCommission = async (practiceId: string) => {
    try {
      setIsLoading(true)

      const { error } = await supabase
        .from('practices')
        .update({ 
          status: 'submitted_to_commission',
          submitted_at: new Date().toISOString()
        })
        .eq('id', practiceId)

      if (error) throw error

      toast.success("Pratica inviata alla commissione con successo")
      loadPractices()
    } catch (error) {
      console.error('Errore invio alla commissione:', error)
      toast.error("Errore nell'invio alla commissione")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string, color: string }> = {
      'draft': { label: 'Bozza', color: 'text-gray-600' },
      'pending_payment': { label: 'In attesa di fattura', color: 'text-yellow-600' },
      'payment_verified': { label: 'Pronta per invio', color: 'text-green-600' },
      'submitted_to_commission': { label: 'Inviata alla commissione', color: 'text-blue-600' }
    }
    return statusMap[status] || { label: status, color: 'text-gray-600' }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <p>Caricamento pratiche...</p>
    </div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Le mie pratiche</h1>
      
      <div className="grid gap-6">
        {practices.map((practice) => {
          const status = getStatusLabel(practice.status)
          
          return (
            <Card key={practice.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{practice.employee_name}</h3>
                  <p className="text-sm text-gray-600">{practice.contract_type_name}</p>
                  <p className={`text-sm font-medium ${status.color}`}>{status.label}</p>
                </div>
                <p className="text-lg font-bold">€{practice.final_price.toFixed(2)}</p>
              </div>

              {practice.status === 'pending_payment' && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-md">
                    <p className="text-sm text-yellow-800">
                      Per completare la pratica, carica la fattura ricevuta dall'università.
                    </p>
                  </div>
                  
                  <FileUpload
                    practiceId={practice.id}
                    onUploadComplete={loadPractices}
                    acceptedFileTypes={['.pdf']}
                    maxSize={5 * 1024 * 1024}
                  />
                </div>
              )}

              {practice.payment_receipt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReceipt(practice)}
                  className="mt-2"
                >
                  Scarica Fattura
                </Button>
              )}

              {practice.status === 'payment_verified' && (
                <div className="mt-4">
                  <Button 
                    onClick={() => handleSubmitToCommission(practice.id)}
                    className="w-full"
                  >
                    Invia alla Commissione
                  </Button>
                </div>
              )}

              {practice.status === 'submitted_to_commission' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    Pratica inviata alla commissione. Verrai contattato per gli aggiornamenti.
                  </p>
                </div>
              )}
            </Card>
          )
        })}

        {practices.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Non hai ancora creato nessuna pratica
          </div>
        )}
      </div>
    </div>
  )
} 