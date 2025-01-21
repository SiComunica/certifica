"use client"

import { useState } from 'react'
import { RequestsQueue } from "./RequestsQueue"
import { DataExport } from "./DataExport"

interface Widget {
  id: string
  title: string
  component: React.ReactNode
}

export function CustomDashboard() {
  const [widgets] = useState<Widget[]>([
    {
      id: '1',
      title: 'Richieste in Coda',
      component: <RequestsQueue />
    },
    {
      id: '2',
      title: 'Esportazione Dati',
      component: <DataExport />
    }
  ])

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Dashboard Commissione</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {widgets.map((widget) => (
          <div 
            key={widget.id}
            className="bg-white p-4 rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold mb-4">{widget.title}</h3>
            {widget.component}
          </div>
        ))}
      </div>
    </div>
  )
} 