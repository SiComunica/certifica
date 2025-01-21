import * as React from "react"
import { Metadata } from "next"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { StatisticsCards } from "@/components/dashboard/employer/StatisticsCards"
import { RequestsTable } from "@/components/dashboard/commission/RequestsTable"
import { getCompanyData, getCertificationRequests, getStatistics } from "@/lib/api"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus as PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Dashboard Datore di Lavoro",
  description: "Gestione delle pratiche di certificazione",
}

export default async function EmployerDashboard() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  try {
    const company = await getCompanyData(session.user.id)
    const requests = await getCertificationRequests(company.id)
    const stats = await getStatistics(company.id)

    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard {company.company_name}</h1>
          <div className="space-x-2">
            <Button asChild>
              <Link href="/dashboard/employer/new-request">
                <PlusIcon className="w-4 h-4 mr-2" />
                Nuova Pratica
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/employer/archivio">
                Archivio
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <StatisticsCards {...stats} />
          
          <div>
            <h2 className="text-2xl font-bold mb-4">Pratiche Recenti</h2>
            <RequestsTable requests={requests} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error:', error)
    return <div>Si è verificato un errore nel caricamento dei dati.</div>
  }
} 