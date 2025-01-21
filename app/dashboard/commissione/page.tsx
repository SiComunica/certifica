import { Metadata } from "next"
import { RequestsTable } from "@/components/requests-table"

export const metadata: Metadata = {
  title: "Commissione",
  description: "Gestione delle richieste di certificazione",
}

export default function CommissionPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Gestione Richieste</h1>
      <RequestsTable />
    </div>
  )
} 