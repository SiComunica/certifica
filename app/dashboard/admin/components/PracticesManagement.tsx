"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { User, Clock } from "lucide-react"
import { PracticeCommentSystem } from "./PracticeCommentSystem"

// Definiamo gli stati validi come sono nel database
type PracticeStatus = 'draft' | 'pending_payment' | 'payment_verified' | 'submitted_to_commission'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  role: string | null
  user_id: string
}

interface PracticeComment {
  id: string
  practice_id: string
  user_id: string
  content: string
  created_at: string
  profile: Profile | null
}

interface Practice {
  id: string
  user_id: string
  title: string
  description: string
  status: PracticeStatus
  assigned_to: string | null
  created_at: string
  practice_number?: string
  assigned_profile: Profile | null
  practice_comments: PracticeComment[]
  employee_name: string
  employee_fiscal_code: string
  contract_type: string
  hiring_date: string
  documents: {
    receipt?: {
      url: string
      path: string
    }
    signed_application?: {
      url: string
      path: string
    }
    contract?: {
      url: string
      path: string
    }
    attachments?: {
      url: string
      path: string
    }[]
  } | null
}

// Tipo per i dati grezzi dalla query
interface DatabasePractice {
  id: string
  user_id: string
  title: string
  description: string
  status: string
  assigned_to: string | null
  created_at: string
  practice_number?: string
  documents: any
  assigned_profile: Profile | null
  employee_name: string
  employee_fiscal_code: string
  contract_type: string
  hiring_date: string
  practice_comments: Array<{
    id: string
    content: string
    created_at: string
    user_id: string
    profile: Profile | null
  }>
}

export default function PracticesManagement() {
  const [practices, setPractices] = useState<Practice[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClientComponentClient()

  const validateStatus = (status: string): PracticeStatus => {
    const validStatuses: PracticeStatus[] = [
      'draft', 
      'pending_payment', 
      'payment_verified',
      'submitted_to_commission'
    ]
    return validStatuses.includes(status as PracticeStatus) 
      ? (status as PracticeStatus) 
      : 'submitted_to_commission'
  }

  const formatPractice = (practice: DatabasePractice): Practice => {
    return {
      ...practice,
      status: validateStatus(practice.status),
      assigned_profile: practice.assigned_profile,
      documents: practice.documents || null,
      practice_comments: practice.practice_comments.map(comment => ({
        ...comment,
        practice_id: practice.id,
        profile: comment.profile
      })),
      employee_name: practice.employee_name,
      employee_fiscal_code: practice.employee_fiscal_code,
      contract_type: practice.contract_type,
      hiring_date: practice.hiring_date
    }
  }

  const loadPractices = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      setCurrentUser(user)

      const { data, error } = await supabase
        .from('practices')
        .select(`
          id,
          user_id,
          title,
          description,
          status,
          assigned_to,
          created_at,
          practice_number,
          documents,
          assigned_profile:profiles!practices_assigned_to_fkey (
            id,
            username,
            full_name,
            avatar_url,
            role,
            user_id
          ),
          practice_comments (
            id,
            content,
            created_at,
            user_id,
            profile:profiles!practice_comments_user_id_fkey (
              id,
              username,
              full_name,
              role,
              user_id
            )
          ),
          employee_name,
          employee_fiscal_code,
          contract_type,
          hiring_date
        `)
        .in('status', ['submitted_to_commission', 'in_progress'])
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedPractices = (data as unknown as DatabasePractice[]).map(formatPractice)
      setPractices(formattedPractices)
      
    } catch (error: any) {
      console.error('Errore dettagliato:', error.message || error)
      toast.error(`Errore nel caricamento delle pratiche: ${error.message || 'Errore sconosciuto'}`)
    }
  }

  const handleAssignPractice = async (practiceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato')

      // Verifica che la pratica non sia già assegnata
      const { data: practiceDetails, error: practiceError } = await supabase
        .from('practices')
        .select('*')
        .eq('id', practiceId)
        .single()

      if (practiceError) throw practiceError
      if (!practiceDetails) {
        toast.error("Pratica non trovata")
        return
      }

      if (practiceDetails.assigned_to) {
        toast.error("Questa pratica è già stata assegnata ad un altro membro della commissione")
        return
      }

      // Aggiorna la pratica
      const { error: updateError } = await supabase
        .from('practices')
        .update({ 
          assigned_to: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', practiceId)

      if (updateError) throw updateError

      // Crea notifica
      await supabase
        .from('notifications')
        .insert({
          user_id: practiceDetails.user_id,
          title: "Pratica in lavorazione",
          message: `La pratica "${practiceDetails.title}" è stata presa in carico dalla commissione`,
          type: "practice_assigned",
          practice_id: practiceId
        })

      toast.success("Pratica presa in carico con successo")
      await loadPractices()

    } catch (error: any) {
      console.error('Errore:', error)
      toast.error(`Errore nella presa in carico: ${error.message}`)
    }
  }

  useEffect(() => {
    loadPractices()
  }, [])

  return (
    <div className="space-y-6">
      {practices.map((practice) => (
        <Card key={practice.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-lg">Pratica #{practice.practice_number || practice.id.slice(0, 8)}</span>
                <span className="text-sm text-gray-500">{practice.title}</span>
              </div>
              <div className="text-sm font-normal">
                {practice.assigned_to ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <User className="h-4 w-4" />
                    <span>
                      In carico a: {
                        practice.assigned_profile?.full_name || 
                        practice.assigned_profile?.username || 
                        'Membro della commissione'
                      }
                      {practice.assigned_profile?.role && ` (${practice.assigned_profile.role})`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-600">In attesa di assegnazione</span>
                    <Button 
                      onClick={() => handleAssignPractice(practice.id)}
                      variant="outline"
                      size="sm"
                      className="ml-2"
                    >
                      Prendi in carico
                    </Button>
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-medium">Dettagli Pratica</h3>
                  
                  {/* Dati Dipendente */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nome Dipendente</p>
                      <p className="text-sm">{practice.employee_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Codice Fiscale</p>
                      <p className="text-sm">{practice.employee_fiscal_code}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tipo Contratto</p>
                      <p className="text-sm">{practice.contract_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data Assunzione</p>
                      <p className="text-sm">{new Date(practice.hiring_date).toLocaleDateString('it-IT')}</p>
                    </div>
                  </div>

                  {/* Stato Pratica */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500">Stato Pratica</h4>
                    <p className={`text-sm ${
                      practice.status === 'submitted_to_commission' ? 'text-orange-600' : 'text-gray-900'
                    }`}>
                      {practice.status === 'submitted_to_commission' ? 'In attesa di assegnazione' : 'In lavorazione'}
                    </p>
                  </div>

                  {/* Documenti Allegati */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Documenti allegati:</h4>
                    <div className="space-y-3">
                      {/* Istanza Firmata */}
                      {practice.documents?.signed_application && (
                        <div className="flex items-center gap-2">
                          <svg 
                            className="w-5 h-5 text-blue-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                            />
                          </svg>
                          <a 
                            href={practice.documents.signed_application.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Istanza Firmata
                          </a>
                        </div>
                      )}

                      {/* Ricevuta di Pagamento */}
                      {practice.documents?.receipt && (
                        <div className="flex items-center gap-2">
                          <svg 
                            className="w-5 h-5 text-green-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                            />
                          </svg>
                          <a 
                            href={practice.documents.receipt.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Ricevuta di Pagamento
                          </a>
                        </div>
                      )}

                      {/* Contratto */}
                      {practice.documents?.contract && (
                        <div className="flex items-center gap-2">
                          <svg 
                            className="w-5 h-5 text-blue-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                            />
                          </svg>
                          <a 
                            href={practice.documents.contract.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Contratto di Lavoro
                          </a>
                        </div>
                      )}

                      {/* Altri Documenti */}
                      {practice.documents?.attachments?.map((doc, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <svg 
                            className="w-5 h-5 text-blue-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                            />
                          </svg>
                          <a 
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Documento Allegato {index + 1}
                          </a>
                        </div>
                      ))}

                      {(!practice.documents?.receipt && 
                        !practice.documents?.signed_application && 
                        !practice.documents?.contract && 
                        !practice.documents?.attachments?.length) && (
                        <p className="text-sm text-gray-500 italic">
                          Nessun documento allegato
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  Creata il: {new Date(practice.created_at).toLocaleDateString('it-IT')}
                </div>
              </div>

              {/* Sistema commenti sempre visibile per le pratiche assegnate */}
              {practice.assigned_to && (
                <>
                  {/* Commenti esistenti */}
                  {practice.practice_comments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium">Cronologia comunicazioni</h4>
                      {practice.practice_comments.map((comment) => (
                        <div 
                          key={comment.id}
                          className="p-3 bg-gray-50 rounded-lg text-sm"
                        >
                          <div className="flex justify-between items-start">
                            <p>{comment.content}</p>
                            <span className="text-xs text-gray-500">
                              {comment.profile?.full_name || comment.profile?.username || 'Utente sconosciuto'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sistema commenti per pratiche assegnate */}
                  <PracticeCommentSystem
                    practiceId={practice.id}
                    userId={practice.user_id}
                    practiceTitle={practice.title}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 