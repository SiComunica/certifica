'use client'

import * as React from "react"
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { supabase } from "@/lib/supabase"
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { PDFDocument, StandardFonts } from 'pdf-lib'

interface ExportFields {
  request_number: boolean
  company_name: boolean
  employee_name: boolean
  status: boolean
  payment_status: boolean
  created_at: boolean
  reviewed_at: boolean
  review_notes: boolean
}

export function DataExport() {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [selectedFields, setSelectedFields] = useState<ExportFields>({
    request_number: true,
    company_name: true,
    employee_name: true,
    status: true,
    payment_status: true,
    created_at: true,
    reviewed_at: true,
    review_notes: true
  })

  const fetchData = async () => {
    const query = supabase
      .from('certification_requests')
      .select(`
        request_number,
        status,
        payment_status,
        created_at,
        reviewed_at,
        review_notes,
        companies (company_name),
        employees (first_name, last_name)
      `)
      .order('created_at', { ascending: false })

    if (dateRange.from) {
      query.gte('created_at', dateRange.from.toISOString())
    }
    if (dateRange.to) {
      query.lte('created_at', dateRange.to.toISOString())
    }

    const { data, error } = await query

    if (error) throw error

    return data.map(row => ({
      request_number: row.request_number,
      company_name: row.companies.company_name,
      employee_name: `${row.employees.first_name} ${row.employees.last_name}`,
      status: row.status,
      payment_status: row.payment_status,
      created_at: new Date(row.created_at).toLocaleDateString(),
      reviewed_at: row.reviewed_at ? new Date(row.reviewed_at).toLocaleDateString() : '',
      review_notes: row.review_notes || ''
    }))
  }

  const exportToExcel = async () => {
    try {
      setLoading(true)
      const data = await fetchData()

      // Filtra i campi selezionati
      const filteredData = data.map(row => {
        const filtered: any = {}
        Object.keys(selectedFields).forEach(key => {
          if (selectedFields[key as keyof ExportFields]) {
            filtered[key] = row[key as keyof typeof row]
          }
        })
        return filtered
      })

      const ws = XLSX.utils.json_to_sheet(filteredData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Pratiche')
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      saveAs(new Blob([excelBuffer]), `pratiche_${new Date().toISOString()}.xlsx`)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = async () => {
    try {
      setLoading(true)
      const data = await fetchData()

      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

      let yOffset = page.getHeight() - 50
      const lineHeight = 15

      // Intestazione
      page.drawText('Report Pratiche di Certificazione', {
        x: 50,
        y: yOffset,
        size: 16,
        font
      })
      yOffset -= lineHeight * 2

      // Dati
      data.forEach(row => {
        if (yOffset < 50) {
          // Nuova pagina se necessario
          yOffset = page.getHeight() - 50
          page = pdfDoc.addPage()
        }

        Object.keys(selectedFields).forEach(key => {
          if (selectedFields[key as keyof ExportFields]) {
            const value = row[key as keyof typeof row]
            page.drawText(`${key}: ${value}`, {
              x: 50,
              y: yOffset,
              size: 10,
              font
            })
            yOffset -= lineHeight
          }
        })
        yOffset -= lineHeight
      })

      const pdfBytes = await pdfDoc.save()
      saveAs(new Blob([pdfBytes]), `pratiche_${new Date().toISOString()}.pdf`)
    } catch (error) {
      console.error('Error exporting to PDF:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Esporta Dati</h3>
      
      <div className="space-y-2">
        <div className="font-medium">Periodo</div>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <div className="space-y-2">
        <div className="font-medium">Campi da esportare</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(selectedFields).map(([field, checked]) => (
            <div key={field} className="flex items-center space-x-2">
              <Checkbox
                checked={checked}
                onCheckedChange={(checked) => 
                  setSelectedFields(prev => ({
                    ...prev,
                    [field]: !!checked
                  }))
                }
              />
              <label className="text-sm">{field}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={exportToExcel}
          disabled={loading}
        >
          Esporta Excel
        </Button>
        <Button
          onClick={exportToPDF}
          disabled={loading}
        >
          Esporta PDF
        </Button>
      </div>
    </div>
  )
} 