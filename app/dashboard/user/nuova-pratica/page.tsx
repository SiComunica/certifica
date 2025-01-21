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
  // definisci qui tutti i campi del form
  step1?: any;
  step2?: any;
  step3?: any;
  // ... altri campi necessari
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
      title: "Riepilogo", 
      description: "Controlla e conferma" 
    }
  ]

  const handleSubmit = async (stepData: any) => {
    try {
      if (currentStep === 1) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          toast.error("Utente non autenticato")
          return
        }

        // Crea la pratica con i dati essenziali
        const { data, error } = await supabase
          .from('practices')
          .insert({
            user_id: user.id,
            employee_name: stepData.employeeName,
            employee_fiscal_code: stepData.fiscalCode,
            contract_type: stepData.contractType,
            status: 'draft',
            practice_number: `P${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            documents: [],
            notes: ''
          })
          .select()
          .single()

        if (error) {
          console.error('Errore Supabase:', error)
          throw new Error(`Errore durante il salvataggio: ${error.message}`)
        }

        setFormData({
          ...stepData,
          practiceId: data.id
        })

        console.log('Pratica creata con successo:', data)
      } else {
        setFormData((prev: FormData) => ({
          ...prev,
          ...stepData
        }))
      }

      setCurrentStep(prev => prev + 1)

    } catch (error: any) {
      console.error('Errore completo:', error)
      toast.error(error.message || "Errore durante il salvataggio dei dati")
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
            <Step1EmployeeInfo formData={formData} onSubmit={handleSubmit} />
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