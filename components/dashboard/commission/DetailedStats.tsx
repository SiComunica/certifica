'use client'

import * as React from "react"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface Stats {
  daily: {
    date: string
    total: number
    approved: number
    rejected: number
  }[]
  byCompany: {
    company: string
    total: number
    approved: number
    rejected: number
  }[]
  byType: {
    type: string
    count: number
  }[]
  averageProcessingTime: number
  urgentPercentage: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function DetailedStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week') // week, month, year

  useEffect(() => {
    loadStats()
  }, [timeRange])

  const loadStats = async () => {
    try {
      setLoading(true)

      // Carica statistiche giornaliere
      const { data: dailyStats } = await supabase
        .rpc('get_daily_certification_stats', {
          p_time_range: timeRange
        })

      // Carica statistiche per azienda
      const { data: companyStats } = await supabase
        .rpc('get_company_certification_stats', {
          p_time_range: timeRange
        })

      // Carica altri dati statistici
      const { data: generalStats } = await supabase
        .rpc('get_general_certification_stats', {
          p_time_range: timeRange
        })

      setStats({
        daily: dailyStats || [],
        byCompany: companyStats || [],
        byType: generalStats?.by_type || [],
        averageProcessingTime: generalStats?.avg_processing_time || 0,
        urgentPercentage: generalStats?.urgent_percentage || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) return <div>Caricamento statistiche...</div>

  return (
    <div className="space-y-6">
      <Tabs defaultValue="daily" className="w-full">
        <TabsList>
          <TabsTrigger value="daily">Andamento Temporale</TabsTrigger>
          <TabsTrigger value="companies">Per Azienda</TabsTrigger>
          <TabsTrigger value="types">Per Tipologia</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#8884d8" />
              <Line type="monotone" dataKey="approved" stroke="#82ca9d" />
              <Line type="monotone" dataKey="rejected" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="companies" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.byCompany}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="company" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#8884d8" />
              <Bar dataKey="approved" fill="#82ca9d" />
              <Bar dataKey="rejected" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="types" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.byType}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label
              >
                {stats.byType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tempo Medio di Elaborazione</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageProcessingTime.toFixed(1)} giorni
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Percentuale Pratiche Urgenti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.urgentPercentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 