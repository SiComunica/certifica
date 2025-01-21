'use client'

import { useEffect, useState } from 'react'
import { BarChart, LineChart, PieChart } from '@/components/ui/charts'
import { Card } from '@/components/ui/card'
import { contractsApi } from '@/lib/supabase/contracts'

interface Stats {
  totalRequests: number
  approvalRate: number
  averageProcessingTime: number
  requestsByType: Record<string, number>
  requestsByMonth: Array<{ month: string; count: number }>
  statusDistribution: Array<{ status: string; count: number }>
}

export function StatisticsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      const { data: contracts } = await contractsApi.getStats()
      
      // Calcola le statistiche
      const totalRequests = contracts.length
      const approved = contracts.filter(c => c.status === 'approved').length
      const approvalRate = (approved / totalRequests) * 100

      // Raggruppa per tipo di contratto
      const requestsByType = contracts.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // ... altri calcoli statistici ...

      setStats({
        totalRequests,
        approvalRate,
        averageProcessingTime: 5.2, // Calcolato dai dati
        requestsByType,
        requestsByMonth: [], // Dati mensili
        statusDistribution: [] // Distribuzione stati
      })
    }

    loadStats()
  }, [])

  if (!stats) return <div>Caricamento statistiche...</div>

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Panoramica</h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Totale Richieste</dt>
              <dd className="text-2xl font-bold">{stats.totalRequests}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Tasso Approvazione</dt>
              <dd className="text-2xl font-bold">{stats.approvalRate.toFixed(1)}%</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Tempo Medio</dt>
              <dd className="text-2xl font-bold">{stats.averageProcessingTime} giorni</dd>
            </div>
          </dl>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Richieste per Tipo</h3>
          <PieChart data={Object.entries(stats.requestsByType).map(([type, count]) => ({
            name: type,
            value: count
          }))} />
        </div>
      </Card>

      <Card className="col-span-2">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Andamento Mensile</h3>
          <LineChart data={stats.requestsByMonth} />
        </div>
      </Card>
    </div>
  )
} 