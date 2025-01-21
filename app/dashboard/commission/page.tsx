import * as React from "react"
import { Metadata } from "next"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { RequestsQueue } from "@/components/dashboard/commission/RequestsQueue"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Dashboard Commissione",
  description: "Gestione delle richieste di certificazione",
}

export default async function CommissionDashboard() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session || session.user.user_metadata.role !== 'commission') {
    redirect('/auth/login')
  }

  // Recupera le pratiche pendenti
  const { data: requests } = await supabase
    .from('certification_requests')
    .select(`
      *,
      companies (company_name),
      employees (first_name, last_name)
    `)
    .order('is_urgent', { ascending: false })
    .order('created_at', { ascending: true })

  // Statistiche
  const pendingCount = requests?.filter(r => r.status === 'pending').length || 0
  const urgentCount = requests?.filter(r => r.is_urgent && r.status === 'pending').length || 0
  const todayCount = requests?.filter(r => {
    const today = new Date().toISOString().split('T')[0]
    return r.created_at.startsWith(today)
  }).length || 0

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Dashboard Commissione</h1>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pratiche in Attesa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pratiche Urgenti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuove Oggi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Coda Richieste</h2>
        <RequestsQueue 
          requests={requests?.map(r => ({
            ...r,
            company_name: r.companies.company_name,
            employee_name: `${r.employees.first_name} ${r.employees.last_name}`
          })) || []} 
        />
      </div>
    </div>
  )
} 