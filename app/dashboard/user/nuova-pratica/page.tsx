"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Step1EmployeeInfo from "./steps/Step1EmployeeInfo"
import Step2CompanyInfo from "./steps/Step2CompanyInfo"
import Step3Documents from "./steps/Step3Documents"
import Step4Payment from "./steps/Step4Payment"
import { Steps } from "@/components/ui/steps"

interface FormData {
  practiceId?: string
  employeeName?: string
  fiscalCode?: string
  contractType?: string
  totalPrice?: number
  productCode?: string
  employeeInfo?: {
    firstName: string
    lastName: string
    fiscalCode: string
    email?: string
  }
  companyInfo?: {
    companyName: string
    vatNumber: string
  }
  documents?: Array<{
    name: string
    path: string
    template_id: number
  }>
  [key: string]: any
}

export default function NewPractice() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({})
  const supabase = createClientComponentClient()

  const steps = [
    { 
      title: "Dati Dipendente", 
      description: "Inserisci i dati anagrafici del dipendente" 
    },
    { 
      title: "Dati Azienda", 
      description: "Verifica i dati aziendali" 
    },
    { 
      title: "Documenti", 
      description: "Carica i documenti necessari" 
    },
    { 
      title: "Pagamento", 
      description: "Completa il pagamento" 
    }
  ]

  const handleSubmit = async (stepData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Utente non autenticato")
        return
      }

      // Aggiorna formData con i nuovi dati dello step
      const updatedFormData = {
        ...formData,
        ...stepData
      }
      setFormData(updatedFormData)

      // Se è il primo step, crea la pratica
      if (currentStep === 1) {
        const { data, error } = await supabase
          .from('practices')
          .insert({
            user_id: user.id,
            employee_name: `${stepData.firstName} ${stepData.lastName}`,
            employee_fiscal_code: stepData.fiscalCode,
            contract_type: stepData.contractType,
            status: 'draft',
            payment_status: 'pending',
            practice_number: `P${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        // Aggiorna formData con l'ID della pratica
        setFormData(prev => ({
          ...prev,
          ...stepData,
          practiceId: data.id
        }))
      } else {
        // Aggiorna la pratica esistente
        const { error } = await supabase
          .from('practices')
          .update({
            ...stepData,
            updated_at: new Date().toISOString()
          })
          .eq('id', formData.practiceId)

        if (error) throw error
      }

      // Passa allo step successivo
      setCurrentStep(prev => prev + 1)

    } catch (error) {
      console.error('Errore:', error)
      toast.error("Errore durante il salvataggio dei dati")
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader className="border-b pb-4">
          <CardTitle>Nuova Pratica</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-8">
            <Steps
              steps={steps}
              currentStep={currentStep}
              className="mb-8"
            />
          </div>

          {currentStep === 1 && (
            <Step1EmployeeInfo 
              formData={formData} 
              onSubmit={handleSubmit} 
            />
          )}
          {currentStep === 2 && (
            <Step2CompanyInfo 
              formData={formData} 
              onSubmit={handleSubmit}
              onBack={() => setCurrentStep(prev => prev - 1)}
            />
          )}
          {currentStep === 3 && (
            <Step3Documents 
              formData={formData}
              onSubmit={handleSubmit}
              onBack={() => setCurrentStep(prev => prev - 1)}
            />
          )}
          {currentStep === 4 && (
            <Step4Payment 
              formData={formData}
              setFormData={setFormData}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}