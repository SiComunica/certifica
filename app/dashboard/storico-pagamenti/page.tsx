"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Loader2, Search, CreditCard, CheckCircle, XCircle, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { toast } from "sonner"
import { format } from "date-fns"
import { it } from "date-fns/locale"

interface Practice {
  practice_number: string
  employee_name: string
  organization_id: string
}

interface Payment {
  id: string
  practice_id: string
  amount: number
  status: string
  payment_date: string
  payment_method: string
  invoice_number: string
  invoice_url?: string
  created_at: string
  practice: Practice
}

interface Organization {
  company_name: string
  address: string
  vat_number: string
}

export default function StoricoPagamentiPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
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

        // Fetch payments with practice details
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select(`
            *,
            practice:practices(practice_number, employee_name)
          `)
          .order('payment_date', { ascending: false })

        if (paymentsError) {
          toast.error('Errore nel caricamento dei pagamenti')
        } else {
          setPayments(paymentsData || [])
          setFilteredPayments(paymentsData || [])
        }

        // Fetch notifications
        const { data: notificationsData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)

        setNotifications(notificationsData || [])
      } catch (error) {
        toast.error('Errore nel caricamento dei dati')
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [router, supabase])

  useEffect(() => {
    const filtered = payments.filter(payment =>
      payment.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.practice.practice_number.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredPayments(filtered)
  }, [searchQuery, payments])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <CreditCard className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completato'
      case 'pending':
        return 'In Attesa'
      case 'failed':
        return 'Fallito'
      default:
        return 'In Elaborazione'
    }
  }

  const handleDownloadInvoice = async (payment: Payment) => {
    try {
      if (payment.invoice_url) {
        // Se abbiamo già l'URL della fattura, la scarichiamo direttamente
        const { data, error } = await supabase
          .storage
          .from('invoices')
          .download(payment.invoice_url)

        if (error) throw error

        // Crea un URL per il download
        const url = window.URL.createObjectURL(data)
        const link = document.createElement('a')
        link.href = url
        link.download = `fattura_${payment.invoice_number}.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } else {
        // Genera nuova fattura
        const { data: organizationData, error: orgError } = await supabase
          .from('organizations')
          .select('company_name, address, vat_number')
          .eq('id', payment.practice.organization_id)
          .single()

        if (orgError || !organizationData) {
          throw new Error('Impossibile trovare i dati dell\'organizzazione')
        }

        const invoiceData = {
          invoice_number: payment.invoice_number,
          payment_date: format(new Date(payment.payment_date), "d MMMM yyyy", { locale: it }),
          amount: payment.amount,
          payment_method: payment.payment_method,
          practice_number: payment.practice.practice_number,
          employee_name: payment.practice.employee_name,
          company_name: organizationData.company_name,
          company_address: organizationData.address,
          company_vat: organizationData.vat_number
        }

        // Per ora creiamo un file JSON come esempio
        const fileData = JSON.stringify(invoiceData, null, 2)
        const blob = new Blob([fileData], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `fattura_${payment.invoice_number}.json`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }

      toast.success('Fattura scaricata con successo')
    } catch (error) {
      console.error('Errore durante il download:', error)
      toast.error('Errore durante il download della fattura')
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
                Storico Pagamenti
              </h1>

              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Cerca per numero fattura o pratica..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-none shadow-sm"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              {filteredPayments.length > 0 ? (
                <div className="space-y-4">
                  {filteredPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(payment.status)}
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Fattura #{payment.invoice_number}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Pratica: {payment.practice.practice_number} - {payment.practice.employee_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(payment.payment_date), "d MMMM yyyy", { locale: it })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            € {payment.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {payment.payment_method}
                          </p>
                        </div>
                        <span className="text-sm text-gray-600">
                          {getStatusText(payment.status)}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(payment)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Scarica Fattura
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {searchQuery ? 
                    `Nessun pagamento trovato per "${searchQuery}"` : 
                    'Nessun pagamento presente'}
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 