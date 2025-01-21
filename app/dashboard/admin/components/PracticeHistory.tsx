"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Practice {
  id: string
  created_at: string
  status: string
  practice_number?: string
  employee_name: string
  title?: string
  description?: string
  priority?: string
}

export function PracticeHistory() {
  const [practices, setPractices] = useState<Practice[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  const fetchPractices = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('practices')
        .select('*')
        .in('status', ['submitted_to_commission', 'in_review', 'completed'])
        .order('created_at', { ascending: false })

      if (error) throw error

      setPractices(data || [])
      
    } catch (error: any) {
      console.error('Errore caricamento storico:', error)
      toast.error("Errore nel caricamento dello storico pratiche")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPractices()

    // Sottoscrizione ai cambiamenti
    const channel = supabase
      .channel('practice_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'practices',
          filter: `status=in.(submitted_to_commission,in_review,completed)`
        }, 
        () => {
          fetchPractices()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="p-4">
        <p>Caricamento storico pratiche...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Storico Pratiche</h2>
      
      {practices.length === 0 ? (
        <Card className="p-4">
          <p className="text-gray-500 text-center">Nessuna pratica nello storico</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {practices.map((practice) => (
            <Card key={practice.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    {practice.title || `Pratica #${practice.id.slice(0, 8)}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Dipendente: {practice.employee_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Stato: {practice.status === 'submitted_to_commission' 
                      ? 'In attesa di assegnazione'
                      : practice.status === 'in_review' 
                        ? 'In revisione'
                        : 'Completata'
                    }
                  </p>
                  {practice.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {practice.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Creata il: {new Date(practice.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {practice.priority && (
                    <span className={`px-2 py-1 rounded text-xs ${
                      practice.priority === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : practice.priority === 'normal'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {practice.priority === 'high' ? 'Alta Priorità' : 
                       practice.priority === 'normal' ? 'Normale' : 'Bassa'}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 