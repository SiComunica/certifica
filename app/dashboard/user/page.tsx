"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Loader2, FileText, History, CreditCard, Search, Clock, CheckCircle, XCircle, Upload, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { toast } from "sonner"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import Link from "next/link"
import { PendingPractices } from "./components/PendingPractices"
import { CreatePracticeForm } from "@/components/forms/create-practice/multistep-form"

interface Practice {
  id: string
  practice_number: string
  employee_name: string
  status: string
  created_at: string
  organization_id: string
  contract_type: string
  employee_fiscal_code: string
  submission_date: string
  notes: string
  payment_receipt?: string
}

interface Notification {
  id: string
  message: string
  read: boolean
  created_at: string
  user_id: string
  type?: string
  title?: string
}

export default function DashboardPage() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [practices, setPractices] = useState<Practice[]>([])
  const [filteredPractices, setFilteredPractices] = useState<Practice[]>([])
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('Verifica sessione utente...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          console.log('Nessuna sessione trovata')
          router.push('/login')
          return
        }

        console.log('Sessione trovata per:', session.user.email)

        // Se è l'admin, reindirizza alla dashboard admin
        if (session.user.email === 'francescocro76@gmail.com') {
          console.log('Utente admin rilevato, reindirizzamento...')
          router.push('/dashboard/admin')
          return
        }

        // Altrimenti procedi con il caricamento dei dati utente
        console.log('Caricamento dati utente normale...')
        setUser(session.user)
        
        // Fetch notifications
        const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', session.user.id)

        if (!notificationsError) {
          setNotifications(notificationsData || [])
        }

        // Fetch practices
        const { data: practicesData, error: practicesError } = await supabase
          .from('practices')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        if (!practicesError) {
          setPractices(practicesData || [])
          setFilteredPractices(practicesData || [])
        }
        
      } catch (error) {
        console.error('Errore generale:', error)
        toast.error('Errore nel caricamento dei dati')
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [router, supabase])

  // Filtro pratiche
  useEffect(() => {
    const filtered = practices.filter(practice =>
      practice.practice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      practice.employee_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredPractices(filtered)
  }, [searchQuery, practices])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completata'
      case 'pending':
        return 'In Attesa'
      case 'rejected':
        return 'Rifiutata'
      default:
        return 'In Lavorazione'
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Errore durante il logout:', error)
    }
  }

  const handleFileUpload = async (practiceId: string, file: File) => {
    try {
      setUploadingId(practiceId)
      
      // 1. Upload file
      const fileExt = file.name.split('.').pop()
      const fileName = `${practiceId}-receipt.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName)

      // 3. Update practice
      const { error: updateError } = await supabase
        .from('practices')
        .update({ 
          status: 'pending_approval',
          payment_receipt: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', practiceId)

      if (updateError) throw updateError

      toast.success("Ricevuta caricata con successo")
      loadPractices()

    } catch (error) {
      console.error('Errore nel caricamento:', error)
      toast.error("Errore nel caricamento della ricevuta")
    } finally {
      setUploadingId(null)
    }
  }

  const loadPractices = async () => {
    try {
      const { data: practicesData, error } = await supabase
        .from('practices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPractices(practicesData || [])
      setFilteredPractices(practicesData || [])
    } catch (error) {
      console.error('Errore nel caricamento pratiche:', error)
      toast.error("Errore nel caricamento delle pratiche")
    }
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-[#f0f0f0]">
        <Header 
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          user={user}
        />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <CreatePracticeForm onCancel={() => setShowCreateForm(false)} />
          </main>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      <Header 
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        user={user}
      />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold text-[#1e1e1e]">
                Benvenuto, {user?.email?.split('@')[0]}
              </h1>

              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Cerca pratiche..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-none shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card Nuova Pratica */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-none bg-white shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <FileText className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-[#1e1e1e]">Nuova Pratica</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600">
                    Avvia una nuova richiesta di certificazione
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    onClick={() => router.push('/dashboard/user/nuova-pratica')}
                  >
                    Avvia Pratica
                  </Button>
                </CardContent>
              </Card>

              {/* Card Storico Pratiche */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-none bg-white shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                      <History className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-[#1e1e1e]">Storico Pratiche</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600">
                    Visualizza lo storico delle tue pratiche
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                    onClick={() => router.push('/dashboard/storico-pratiche')}
                  >
                    Visualizza Storico
                  </Button>
                </CardContent>
              </Card>

              {/* Card Storico Pagamenti */}
              <Card className="group hover:shadow-xl transition-all duration-300 border-none bg-white shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-[#1e1e1e]">Storico Pagamenti</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600">
                    Visualizza lo storico dei tuoi pagamenti
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    onClick={() => router.push('/dashboard/storico-pagamenti')}
                  >
                    Visualizza Pagamenti
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Lista Pratiche Filtrate */}
            {searchQuery && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Risultati Ricerca</h2>
                {filteredPractices.length > 0 ? (
                  <div className="space-y-4">
                    {filteredPractices.map((practice) => (
                      <div
                        key={practice.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/dashboard/pratiche/${practice.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(practice.status)}
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {practice.practice_number} - {practice.employee_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {format(new Date(practice.submission_date), "d MMMM yyyy", { locale: it })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {getStatusText(practice.status)}
                          </span>
                          <Button variant="ghost" size="sm">
                            Visualizza
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Nessuna pratica trovata per "{searchQuery}"
                  </p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <PendingPractices />
    </div>
  )
} 