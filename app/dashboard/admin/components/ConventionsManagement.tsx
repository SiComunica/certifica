"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"

interface Convention {
  id: string
  code: string
  discount_percentage: number
  is_active: boolean
}

interface Company {
  id: string
  company_name: string
  email: string
}

interface CompanyConventionData {
  id: number
  convention_id: number
  company_id: number
  notification_sent: boolean
  company: {
    company_name: string
    email: string
  }
  convention: {
    code: string
    discount_percentage: number
  }
}

interface ApiError {
  error: string
  status?: number
}

const fetchData = async () => {
  try {
    const response = await fetch('/api/admin/conventions/list')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Errore nel caricamento dati')
    }

    return data
  } catch (err) {
    if (err instanceof Error) {
      toast.error(err.message)
    } else {
      toast.error('Errore imprevisto')
    }
    return null
  }
}

export default function ConventionsManagement() {
  const [conventions, setConventions] = useState<Convention[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [companyConventions, setCompanyConventions] = useState<CompanyConventionData[]>([])
  const [loading, setLoading] = useState(true)
  const [newConvention, setNewConvention] = useState({
    code: "",
    discount_percentage: ""
  })
  const [selectedCompany, setSelectedCompany] = useState("")
  const [selectedConvention, setSelectedConvention] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedConventionAction, setSelectedConventionAction] = useState<{
    convention: Convention | null;
    action: 'toggle' | 'delete';
  }>({ convention: null, action: 'toggle' })
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any[]>([])

  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await fetchData()
        if (result) {
          setData(result)
        } else {
          setError('Impossibile caricare i dati')
        }
      } catch (err) {
        console.error('Component error:', err)
        setError('Errore imprevisto')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleDataFetch = async () => {
    const associationsData = await fetchData();
    if (associationsData) {
      const mappedData = associationsData.map((item: any) => ({
        id: item.id,
        convention_id: item.convention_id,
        company_id: item.company_id,
        notification_sent: item.notification_sent,
        company: item.company[0],
        convention: item.convention[0]
      }));
      setCompanyConventions(mappedData);
    }
  };

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Carica convenzioni
      const { data: conventionsData } = await supabase
        .from('conventions')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Carica aziende
      const { data: companiesData } = await supabase
        .from('profiles')
        .select('id, company_name, email')
        .eq('is_company', true)
        .order('company_name')

      // Carica associazioni esistenti
      const { data: associationsData } = await supabase
        .from('company_conventions')
        .select(`
          id,
          convention_id,
          company_id,
          notification_sent,
          company:profiles(company_name, email),
          convention:conventions(code, discount_percentage)
        `)
        .order('created_at', { ascending: false })

      setConventions(conventionsData || [])
      setCompanies(companiesData || [])
      handleDataFetch()
      setLoading(false)
    } catch (error) {
      console.error('Errore caricamento dati:', error)
      toast.error("Errore nel caricamento dei dati")
    }
  }

  const handleCreateConvention = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('conventions')
        .insert([{
          code: newConvention.code,
          discount_percentage: parseFloat(newConvention.discount_percentage),
          is_active: true
        }])
        .select()

      if (error) throw error

      toast.success("Convenzione creata con successo")
      setNewConvention({ code: "", discount_percentage: "" })
      loadData()
    } catch (error: any) {
      toast.error(`Errore: ${error.message}`)
    }
  }

  const handleAssignConvention = async () => {
    if (!selectedCompany || !selectedConvention) {
      toast.error("Seleziona un'azienda e una convenzione")
      return
    }

    try {
      const { error } = await supabase
        .from('company_conventions')
        .insert([{
          convention_id: selectedConvention,
          company_id: selectedCompany,
          notification_sent: false
        }])

      if (error) throw error

      toast.success("Convenzione assegnata con successo")
      setSelectedCompany("")
      setSelectedConvention("")
      loadData()
    } catch (error: any) {
      toast.error(`Errore: ${error.message}`)
    }
  }

  const handleConfirmAction = async () => {
    if (!selectedConventionAction.convention) return

    try {
      if (selectedConventionAction.action === 'toggle') {
        const { error } = await supabase
          .from('conventions')
          .update({ 
            is_active: !selectedConventionAction.convention.is_active 
          })
          .eq('id', selectedConventionAction.convention.id)

        if (error) throw error
        toast.success(`Convenzione ${selectedConventionAction.convention.is_active ? 'disattivata' : 'attivata'} con successo`)
      } else {
        // Verifica se ci sono associazioni
        const { data: associations } = await supabase
          .from('company_conventions')
          .select('id')
          .eq('convention_id', selectedConventionAction.convention.id)

        if (associations && associations.length > 0) {
          toast.error("Non è possibile eliminare una convenzione con aziende associate")
          return
        }

        const { error } = await supabase
          .from('conventions')
          .delete()
          .eq('id', selectedConventionAction.convention.id)

        if (error) throw error
        toast.success('Convenzione eliminata con successo')
      }

      loadData()
    } catch (error: any) {
      toast.error(`Errore: ${error.message}`)
    } finally {
      setShowConfirmDialog(false)
      setSelectedConventionAction({ convention: null, action: 'toggle' })
    }
  }

  // Funzione per caricare i profili aziendali
  const fetchCompanyProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, company_name, email')
        .eq('is_company', true)
        .order('company_name')
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching company profiles:', error)
      toast.error('Errore nel caricamento dei profili aziendali')
      return []
    }
  }

  // Funzione per caricare le convenzioni
  const fetchConventions = async () => {
    try {
      const { data, error } = await supabase
        .from('company_conventions')
        .select(`
          id,
          convention_id,
          company_id,
          notification_sent,
          company:profiles!company_id (
            company_name,
            email
          ),
          convention:conventions!convention_id (
            code,
            discount_percentage
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching conventions:', error)
      toast.error('Errore nel caricamento delle convenzioni')
      return []
    }
  }

  if (loading) return <div>Caricamento...</div>

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Riprova
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Creazione nuova convenzione */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Crea Nuova Convenzione</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateConvention} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Codice Convenzione</Label>
                <Input
                  id="code"
                  value={newConvention.code}
                  onChange={(e) => setNewConvention(prev => ({
                    ...prev,
                    code: e.target.value
                  }))}
                  placeholder="es. convenzione12a"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Percentuale Sconto</Label>
                <Input
                  id="discount"
                  type="number"
                  value={newConvention.discount_percentage}
                  onChange={(e) => setNewConvention(prev => ({
                    ...prev,
                    discount_percentage: e.target.value
                  }))}
                  placeholder="es. 10"
                  required
                />
              </div>
            </div>
            <Button type="submit">Crea Convenzione</Button>
          </form>
        </CardContent>
      </Card>

      {/* Assegnazione convenzione */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Assegna Convenzione</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seleziona Azienda</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un'azienda" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Seleziona Convenzione</Label>
                <Select value={selectedConvention} onValueChange={setSelectedConvention}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona una convenzione" />
                  </SelectTrigger>
                  <SelectContent>
                    {conventions.map((convention) => (
                      <SelectItem key={convention.id} value={convention.id}>
                        {convention.code} ({convention.discount_percentage}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAssignConvention}>Assegna Convenzione</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista associazioni esistenti */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Convenzioni Assegnate</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companyConventions.map((association) => (
              <Card key={association.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{association.company.company_name}</p>
                      <p className="text-sm text-gray-500">
                        Convenzione: {association.convention.code} ({association.convention.discount_percentage}%)
                      </p>
                      <p className="text-sm text-gray-500">
                        Stato: {association.notification_sent ? "Notificata" : "Da notificare"}
                      </p>
                    </div>
                    {!association.notification_sent && (
                      <Button 
                        variant="outline"
                        onClick={() => {/* Implementare invio notifica */}}
                      >
                        Invia Notifica
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Convenzioni Disponibili</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conventions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nessuna convenzione creata
              </p>
            ) : (
              conventions.map((convention) => (
                <Card key={convention.id} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-blue-600">
                          Codice: {convention.code}
                        </p>
                        <p className="text-sm text-gray-600">
                          Sconto: {convention.discount_percentage}%
                        </p>
                        <p className="text-sm">
                          Stato: {' '}
                          <span className={`font-medium ${
                            convention.is_active ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {convention.is_active ? 'Attiva' : 'Disattiva'}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant={convention.is_active ? "destructive" : "default"}
                          onClick={() => {
                            setSelectedConventionAction({ 
                              convention, 
                              action: 'toggle' 
                            })
                            setShowConfirmDialog(true)
                          }}
                        >
                          {convention.is_active ? 'Disattiva' : 'Attiva'}
                        </Button>
                        <Button
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedConventionAction({ 
                              convention, 
                              action: 'delete' 
                            })
                            setShowConfirmDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog di conferma */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedConventionAction.action === 'toggle' ? 
                `Conferma ${selectedConventionAction.convention?.is_active ? 'disattivazione' : 'attivazione'}` : 
                'Conferma eliminazione'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedConventionAction.action === 'toggle' ? 
                `Sei sicuro di voler ${selectedConventionAction.convention?.is_active ? 'disattivare' : 'attivare'} questa convenzione?` : 
                'Sei sicuro di voler eliminare questa convenzione? Questa azione non può essere annullata.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction}
              className={selectedConventionAction.action === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              Conferma
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 