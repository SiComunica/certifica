"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Step1EmployeeInfo from "./steps/Step1EmployeeInfo"
import Step2CompanyInfo from "./steps/Step2CompanyInfo"
import Step2ContractInfo from "./steps/Step2ContractInfo"
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

  const handleSubmit = async (stepData: any) => {
    try {
      console.log("Step data received:", stepData)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Utente non autenticato")
        return
      }

      const currentDate = new Date().toISOString()
      const updatedFormData = {
        ...formData,
        ...stepData
      }
      
      // Se è il primo step, crea una nuova pratica
      if (currentStep === 1) {
        const practiceData = {
          user_id: user.id,
          status: 'draft',
          data: updatedFormData,
          created_at: currentDate,
          submission_date: currentDate,
          employee_name: stepData.employeeName || '',
          employee_fiscal_code: stepData.fiscalCode || '',
          contract_type: stepData.contractType || 'standard'
        }

        console.log("Inserting practice data:", practiceData)

        const { data, error } = await supabase
          .from('practices')
          .insert(practiceData)
          .select()
          .single()

        if (error) {
          console.error('Error details:', error)
          throw error
        }

        console.log("Practice created:", data)
      } else {
        const updateData = {
          data: updatedFormData,
          updated_at: currentDate,
          submission_date: currentDate,
          employee_name: stepData.employeeName || '',
          employee_fiscal_code: stepData.fiscalCode || '',
          contract_type: stepData.contractType || 'standard'
        }

        console.log("Updating practice data:", updateData)

        const { error } = await supabase
          .from('practices')
          .update(updateData)
          .eq('user_id', user.id)
          .eq('status', 'draft')

        if (error) {
          console.error('Error details:', error)
          throw error
        }
      }

      setFormData(updatedFormData)
      setCurrentStep(prev => prev + 1)
      
    } catch (error: any) {
      console.error('Errore:', error)
      toast.error(error.message || "Errore durante il salvataggio")
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Nuova Pratica</CardTitle>
        </CardHeader>
        <CardContent>
          <Steps 
            currentStep={currentStep} 
            steps={[
              { label: "Dati Dipendente" },
              { label: "Dati Azienda" },
              { label: "Documenti" },
              { label: "Pagamento" }
            ]} 
          />

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
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <Step3Documents 
              formData={formData}
              onSubmit={handleSubmit}
              onBack={() => setCurrentStep(2)}
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