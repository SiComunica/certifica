"use client"

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Download, Calendar, Filter } from 'lucide-react'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import Papa from 'papaparse'
import { Database } from '@/types/supabase'
import { useRouter } from 'next/navigation'

// Estendi jsPDF con autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface Practice {
  id: string
  status: string
  user_id: string
  practice_number: string
  employee_name: string
  submission_date: string
  created_at: string
  updated_at: string
  notes: string
  contract_type: string
}

interface Member {
  id: string
  name: string
}

interface Statistics {
  totalPractices: number
  inProgress: number
  completed: number
  rejected: number
  averageCompletionTime: number
  memberPerformance: {
    memberId: string
    memberName: string
    completedPractices: number
    averageTime: number
  }[]
  contractTypeStats: {
    type: string
    count: number
  }[]
  monthlyStats: {
    month: string
    submissions: number
    completions: number
  }[]
}

const CONTRACT_TYPES = [
  { id: '21', name: 'Contratto a Tempo Determinato' },
  { id: '22', name: 'Contratto a Tempo Indeterminato' },
  { id: '23', name: 'Contratto di Apprendistato' },
  { id: '24', name: 'Contratto di Appalto' },
  { id: '25', name: 'Contratto Commerciale Base' },
  { id: '26', name: 'Certificazione Clausole' },
  { id: '27', name: 'Certificazione Rinuncia' },
  { id: '28', name: 'Certificazione Conciliazione' }
]

export default function StatisticsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    dateRange: {
      start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    contractType: 'all',
    memberId: 'all',
    status: 'all'
  })
  const [availableFilters, setAvailableFilters] = useState({
    contractTypes: [] as string[],
    members: [] as Member[]
  })

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    loadFiltersData()
    loadStatistics()
  }, [filters])

  const loadFiltersData = async () => {
    // Carica tipi di contratto unici
    const { data: practices } = await supabase
      .from('practices')
      .select('contract_type')

    // Usa Array.from invece di spread operator con Set
    const uniqueTypes = Array.from(
      new Set(practices?.map(p => p.contract_type).filter(Boolean) as string[])
    )

    // Carica membri
    const { data: members } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'commission_member')

    setAvailableFilters({
      contractTypes: uniqueTypes,
      members: members?.map(m => ({ id: m.id, name: m.full_name })) || []
    })
  }

  const loadStatistics = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('practices')
        .select(`
          id,
          status,
          user_id,
          practice_number,
          employee_name,
          submission_date,
          created_at,
          updated_at,
          notes,
          contract_type
        `)
        .gte('submission_date', filters.dateRange.start)
        .lte('submission_date', filters.dateRange.end)

      if (filters.contractType !== 'all') {
        query = query.eq('contract_type', filters.contractType)
      }
      if (filters.memberId !== 'all') {
        query = query.eq('user_id', filters.memberId)
      }
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      const { data: practices, error } = await query

      if (error) throw error

      if (!practices) {
        setStats(null)
        return
      }

      // Calcola le statistiche
      const statistics: Statistics = {
        totalPractices: practices.length,
        inProgress: practices.filter(p => p.status === 'in_progress').length,
        completed: practices.filter(p => p.status === 'completed').length,
        rejected: practices.filter(p => p.status === 'rejected').length,
        averageCompletionTime: calculateAverageCompletionTime(practices),
        memberPerformance: calculateMemberPerformance(practices, availableFilters.members),
        contractTypeStats: calculateContractTypeStats(practices),
        monthlyStats: calculateMonthlyStats(practices)
      }

      setStats(statistics)

    } catch (error) {
      console.error('Errore nel caricamento statistiche:', error)
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  const calculateAverageCompletionTime = (practices: Practice[]) => {
    const completedPractices = practices.filter(p => 
      p.status === 'completed' && p.submission_date && p.updated_at
    )

    if (completedPractices.length === 0) return 0

    const totalTime = completedPractices.reduce((acc, practice) => {
      const submitted = new Date(practice.submission_date)
      const completed = new Date(practice.updated_at)
      return acc + (completed.getTime() - submitted.getTime())
    }, 0)

    return Math.round(totalTime / completedPractices.length / (1000 * 60 * 60 * 24))
  }

  const calculateMemberPerformance = (practices: Practice[], members: Member[]) => {
    const memberStats = new Map<string, {
      memberId: string
      memberName: string
      completedPractices: number
      totalTime: number
      practiceCount: number
    }>()

    practices.forEach(practice => {
      if (!practice.user_id) return

      const member = members.find(m => m.id === practice.user_id)
      if (!member) return

      const memberData = memberStats.get(practice.user_id) || {
        memberId: practice.user_id,
        memberName: member.name,
        completedPractices: 0,
        totalTime: 0,
        practiceCount: 0
      }

      if (practice.status === 'completed' && practice.submission_date && practice.updated_at) {
        memberData.completedPractices++
        memberData.totalTime += new Date(practice.updated_at).getTime() - 
                               new Date(practice.submission_date).getTime()
        memberData.practiceCount++
      }

      memberStats.set(practice.user_id, memberData)
    })

    return Array.from(memberStats.values()).map(member => ({
      ...member,
      averageTime: member.practiceCount ? 
        Math.round(member.totalTime / member.practiceCount / (1000 * 60 * 60 * 24)) : 
        0
    }))
  }

  const calculateContractTypeStats = (practices: Practice[]) => {
    const stats = new Map<string, number>()
    
    practices.forEach(practice => {
      const type = practice.contract_type || 'Non specificato'
      stats.set(type, (stats.get(type) || 0) + 1)
    })

    return Array.from(stats.entries()).map(([type, count]) => ({
      type,
      count
    }))
  }

  const calculateMonthlyStats = (practices: Practice[]) => {
    const last6Months = Array.from({length: 6}, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      return d.toISOString().slice(0, 7) // YYYY-MM
    }).reverse()

    return last6Months.map(month => ({
      month: new Date(month + '-01').toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
      submissions: practices.filter(p => p.submission_date?.startsWith(month)).length,
      completions: practices.filter(p => 
        p.status === 'completed' && 
        p.updated_at?.startsWith(month)
      ).length
    }))
  }

  const exportToExcel = () => {
    if (!stats) return

    // Prepara i dati per l'export
    const exportData = {
      'Statistiche Generali': [
        ['Metriche', 'Valore'],
        ['Pratiche Totali', stats.totalPractices],
        ['In Lavorazione', stats.inProgress],
        ['Completate', stats.completed],
        ['Rifiutate', stats.rejected],
        ['Tempo Medio (giorni)', stats.averageCompletionTime]
      ],
      'Performance Membri': stats.memberPerformance.map(member => ({
        'Nome': member.memberName,
        'Pratiche Completate': member.completedPractices,
        'Tempo Medio (giorni)': member.averageTime
      })),
      'Statistiche Mensili': stats.monthlyStats.map(stat => ({
        'Mese': stat.month,
        'Inviate': stat.submissions,
        'Completate': stat.completions
      })),
      'Tipi Contratto': stats.contractTypeStats.map(stat => ({
        'Tipo': stat.type,
        'Totale': stat.count
      }))
    }

    // Crea il workbook
    const wb = XLSX.utils.book_new()

    // Aggiungi i fogli
    Object.entries(exportData).forEach(([sheetName, data]) => {
      const ws = XLSX.utils.json_to_sheet(
        Array.isArray(data) ? data : [data],
        { skipHeader: Array.isArray(data) }
      )
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    })

    // Scarica il file
    XLSX.writeFile(wb, `statistiche_${filters.dateRange.start}_${filters.dateRange.end}.xlsx`)
  }

  const exportToPDF = () => {
    if (!stats) return

    const doc = new jsPDF()
    
    // Titolo
    doc.setFontSize(16)
    doc.text('Report Statistiche', 14, 15)
    doc.setFontSize(10)
    doc.text(`Periodo: ${filters.dateRange.start} - ${filters.dateRange.end}`, 14, 25)

    // Statistiche generali
    doc.autoTable({
      head: [['Metrica', 'Valore']],
      body: [
        ['Pratiche Totali', stats.totalPractices.toString()],
        ['In Lavorazione', stats.inProgress.toString()],
        ['Completate', stats.completed.toString()],
        ['Rifiutate', stats.rejected.toString()],
        ['Tempo Medio (giorni)', stats.averageCompletionTime.toString()]
      ],
      startY: 35
    })

    // Performance membri
    doc.addPage()
    doc.text('Performance Membri', 14, 15)
    doc.autoTable({
      head: [['Membro', 'Pratiche Completate', 'Tempo Medio (giorni)']],
      body: stats.memberPerformance.map(m => [
        m.memberName,
        m.completedPractices.toString(),
        m.averageTime.toString()
      ]),
      startY: 25
    })

    // Statistiche mensili
    doc.addPage()
    doc.text('Statistiche Mensili', 14, 15)
    doc.autoTable({
      head: [['Mese', 'Inviate', 'Completate']],
      body: stats.monthlyStats.map(m => [
        m.month,
        m.submissions.toString(),
        m.completions.toString()
      ]),
      startY: 25
    })

    doc.save(`statistiche_${filters.dateRange.start}_${filters.dateRange.end}.pdf`)
  }

  const exportToCSV = () => {
    if (!stats) return

    const data = [
      ['Statistiche Generali'],
      ['Metrica', 'Valore'],
      ['Pratiche Totali', stats.totalPractices],
      ['In Lavorazione', stats.inProgress],
      ['Completate', stats.completed],
      ['Rifiutate', stats.rejected],
      ['Tempo Medio (giorni)', stats.averageCompletionTime],
      [],
      ['Performance Membri'],
      ['Nome', 'Pratiche Completate', 'Tempo Medio (giorni)'],
      ...stats.memberPerformance.map(m => [
        m.memberName,
        m.completedPractices,
        m.averageTime
      ]),
      [],
      ['Statistiche Mensili'],
      ['Mese', 'Inviate', 'Completate'],
      ...stats.monthlyStats.map(m => [
        m.month,
        m.submissions,
        m.completions
      ]),
      [],
      ['Tipi Contratto'],
      ['Tipo', 'Totale'],
      ...stats.contractTypeStats.map(s => [
        s.type,
        s.count
      ])
    ]

    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `statistiche_${filters.dateRange.start}_${filters.dateRange.end}.csv`
    link.click()
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Errore durante il logout:', error)
    }
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Statistiche</h1>
        
        <div className="flex items-center gap-6">
          {/* Filtri */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: e.target.value }
                }))}
                className="border rounded px-2 py-1"
              />
              <span>a</span>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: e.target.value }
                }))}
                className="border rounded px-2 py-1"
              />
            </div>

            {/* Filtro tipo contratto aggiornato */}
            <select
              value={filters.contractType}
              onChange={(e) => setFilters(prev => ({ ...prev, contractType: e.target.value }))}
              className="border rounded px-2 py-1 min-w-[200px]"
            >
              <option value="all">Tutti i contratti</option>
              {CONTRACT_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            {/* Filtro membro */}
            <select
              value={filters.memberId}
              onChange={(e) => setFilters(prev => ({ ...prev, memberId: e.target.value }))}
              className="border rounded px-2 py-1"
            >
              <option value="all">Tutti i membri</option>
              {availableFilters.members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>

            {/* Filtro stato */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border rounded px-2 py-1"
            >
              <option value="all">Tutti gli stati</option>
              <option value="in_progress">In Lavorazione</option>
              <option value="completed">Completate</option>
              <option value="rejected">Rifiutate</option>
            </select>
          </div>

          {/* Pulsanti Export */}
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              disabled={!stats || loading}
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              disabled={!stats || loading}
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              disabled={!stats || loading}
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>

          {/* Pulsante Logout */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : !stats ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Nessun dato disponibile per il periodo selezionato</p>
        </div>
      ) : (
        // ... resto del JSX per i grafici e le statistiche ...
        <div>
          {/* Qui inserisci il resto del JSX esistente per i grafici */}
        </div>
      )}
    </div>
  )
} 