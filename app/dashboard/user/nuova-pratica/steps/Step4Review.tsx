"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface ReviewProps {
  formData: {
    employeeInfo: {
      firstName: string
      lastName: string
      fiscalCode: string
      address: string
      city: string
      email: string
    }
    contractInfo: {
      type: string
      startDate: string
      endDate?: string
      salary: string
      notes?: string
    }
    documents: Array<{
      name: string
      url: string
    }>
  }
  onSubmit: () => Promise<void>
  onBack: () => void
  isLoading: boolean
}

export default function Step4Review({ formData, onSubmit, onBack, isLoading }: ReviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Dati Dipendente</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nome</p>
              <p>{formData.employeeInfo.firstName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cognome</p>
              <p>{formData.employeeInfo.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Codice Fiscale</p>
              <p>{formData.employeeInfo.fiscalCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{formData.employeeInfo.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Indirizzo</p>
              <p>{formData.employeeInfo.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Città</p>
              <p>{formData.employeeInfo.city}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Dati Contratto</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Tipo Contratto</p>
              <p>{formData.contractInfo.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data Inizio</p>
              <p>{formData.contractInfo.startDate}</p>
            </div>
            {formData.contractInfo.endDate && (
              <div>
                <p className="text-sm text-gray-500">Data Fine</p>
                <p>{formData.contractInfo.endDate}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Retribuzione</p>
              <p>€ {formData.contractInfo.salary}</p>
            </div>
          </div>
          {formData.contractInfo.notes && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Note</p>
              <p>{formData.contractInfo.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Documenti Caricati</h3>
          <ul className="space-y-2">
            {formData.documents.map((doc, index) => (
              <li key={index} className="flex items-center justify-between">
                <span>{doc.name}</span>
                <Button variant="link" onClick={() => window.open(doc.url, '_blank')}>
                  Visualizza
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Indietro
        </Button>
        <Button onClick={onSubmit} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Conferma e Procedi al Pagamento
        </Button>
      </div>
    </div>
  )
} 