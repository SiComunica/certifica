"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from "recharts"

interface StatsProps {
  practices: any[]
}

export function PracticeStats({ practices }: StatsProps) {
  // Calcola statistiche
  const stats = {
    total: practices.length,
    byStatus: practices.reduce((acc: any, practice) => {
      acc[practice.status] = (acc[practice.status] || 0) + 1
      return acc
    }, {}),
    byPriority: practices.reduce((acc: any, practice) => {
      acc[practice.priority] = (acc[practice.priority] || 0) + 1
      return acc
    }, {})
  }

  const chartData = Object.entries(stats.byStatus).map(([status, count]) => ({
    name: status,
    count
  }))

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Totale Pratiche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Distribuzione Stati
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
} 