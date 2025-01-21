"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Loader2, Clock, CheckCircle, XCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { toast } from "sonner"
import { format } from "date-fns"
import { it } from "date-fns/locale"

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
}

export default function StoricoPratichePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [practices, setPractices] = useState<Practice[]>([])
  const [filteredPractices, setFilteredPractices] = useState<Practice[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push('/auth/login')
          return
        }

        setUser(user)

        const { data: practicesData, error: practicesError } = await supabase
          .from('practices')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (practicesError) {
          toast.error('Errore nel caricamento delle pratiche')
        } else {
          setPractices(practicesData || [])
          setFilteredPractices(practicesData || [])
        }
      } catch (error) {
        toast.error('Errore nel caricamento dei dati')
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [router, supabase])

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
        user={user}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold text-[#1e1e1e]">
                Storico Pratiche
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

            <div className="bg-white rounded-lg shadow-md p-6">
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
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          {getStatusText(practice.status)}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/dashboard/pratiche/${practice.id}`)}
                        >
                          Visualizza Dettagli
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {searchQuery ? 
                    `Nessuna pratica trovata per "${searchQuery}"` : 
                    'Nessuna pratica presente'}
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 