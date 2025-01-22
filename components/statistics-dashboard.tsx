'use client'

import { Card } from "@/components/ui/card"
import { LineChart } from "@/components/ui/line-chart"

interface ChartData {
  name: string
  value: number
}

interface Statistics {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  monthlyStats: ChartData[]
}

export function StatisticsDashboard() {
  // Dati di esempio
  const stats: Statistics = {
    totalRequests: 150,
    pendingRequests: 45,
    approvedRequests: 90,
    rejectedRequests: 15,
    monthlyStats: [
      { name: "Gen", value: 10 },
      { name: "Feb", value: 15 },
      { name: "Mar", value: 20 },
      { name: "Apr", value: 25 },
      { name: "Mag", value: 30 },
      { name: "Giu", value: 35 }
    ]
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Totale Richieste
          </h3>
          <p className="text-3xl font-bold">
            {stats.totalRequests}
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            In Attesa
          </h3>
          <p className="text-3xl font-bold">
            {stats.pendingRequests}
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Approvate
          </h3>
          <p className="text-3xl font-bold">
            {stats.approvedRequests}
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Rifiutate
          </h3>
          <p className="text-3xl font-bold">
            {stats.rejectedRequests}
          </p>
        </div>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Andamento Mensile
          </h3>
          <LineChart data={stats.monthlyStats} />
        </div>
      </Card>
    </div>
  )
} 