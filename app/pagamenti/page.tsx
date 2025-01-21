"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Download, Search } from 'lucide-react'

export default function PagamentiPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Dati di esempio
  const pagamenti = [
    { 
      id: 1, 
      numero: "F-2024-001", 
      importo: "150,00 €", 
      data: "2024-03-20", 
      stato: "Pagato",
      fattura: true
    },
    { 
      id: 2, 
      numero: "F-2024-002", 
      importo: "250,00 €", 
      data: "2024-03-15", 
      stato: "In attesa",
      fattura: true
    },
    { 
      id: 3, 
      numero: "F-2024-003", 
      importo: "180,00 €", 
      data: "2024-03-10", 
      stato: "Pagato",
      fattura: true
    },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Storico Pagamenti</h1>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Cerca pagamenti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 px-4 py-2 pl-10 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Tabella Pagamenti */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Numero Fattura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Importo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagamenti.map((pagamento) => (
              <tr key={pagamento.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {pagamento.numero}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {pagamento.importo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {pagamento.data}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${pagamento.stato === 'Pagato' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {pagamento.stato}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {pagamento.fattura && (
                    <button className="flex items-center text-blue-600 hover:text-blue-900">
                      <Download size={16} className="mr-1" />
                      Scarica Fattura
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 