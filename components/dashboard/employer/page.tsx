"use client"

import Link from 'next/link'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Company {
  nome_azienda: string
}

export default function EmployerDashboard() {
  // Dati di esempio
  const company: Company = {
    nome_azienda: "Azienda Example"
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Dashboard {company.nome_azienda}
        </h1>
        
        <Link href="/dashboard/employer/new-request">
          <Button className="flex items-center">
            <PlusIcon className="w-4 h-4 mr-2" />
            Nuova Pratica
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Pratiche Totali</h3>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">In Attesa</h3>
          <p className="text-3xl font-bold">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-2">Completate</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  )
} 