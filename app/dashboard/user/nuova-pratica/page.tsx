"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import Step1EmployeeInfo from "./steps/Step1EmployeeInfo"
import Step2CompanyInfo from "./steps/Step2CompanyInfo"
import Step3Documents from "./steps/Step3Documents"
import Step4Payment from "./steps/Step4Payment"

interface FormData {
  employeeName: string
  fiscalCode: string
  contractType: string
  contractValue: number
  isOdcec: boolean
  isRenewal: boolean
  quantity: number
  odcecNumber: string
  odcecProvince: string
  companyName: string
  vatNumber: string
  address: string
  city: string
  province: string
  postalCode: string
  documents: any[]
  practiceId: string
  contractTypeName: string
  email?: string
}

export default function NuovaPraticaPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    // Dati dipendente
    employeeName: "",
    fiscalCode: "",
    contractType: "",
    contractValue: 0,
    isOdcec: false,
    isRenewal: false,
    quantity: 1,
    odcecNumber: "",
    odcecProvince: "",
    
    // Dati azienda
    companyName: "",
    vatNumber: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    
    // Documenti
    documents: [],
    
    // Altri dati
    practiceId: "",
    contractTypeName: "",
  })

  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (stepData: any) => {
    try {
      console.log("Step data received:", stepData)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Utente non autenticato")
        return
      }

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
          created_at: new Date().toISOString(),
          employee_name: stepData.employeeName || '',
          employee_fiscal_code: stepData.fiscalCode || '',
          contract_type: stepData.contractType || 'standard'  // Aggiunto questo campo
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
          updated_at: new Date().toISOString(),
          employee_name: stepData.employeeName || '',
          employee_fiscal_code: stepData.fiscalCode || '',
          contract_type: stepData.contractType || 'standard'  // Aggiunto questo campo
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

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Nuova Pratica</h1>
        <p className="text-gray-600">Step {currentStep} di 4</p>
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
          onBack={handleBack}
        />
      )}

      {currentStep === 3 && (
        <Step3Documents
          formData={formData}
          onSubmit={handleSubmit}
          onBack={handleBack}
        />
      )}

      {currentStep === 4 && (
        <Step4Payment
          formData={formData}
          onSubmit={handleSubmit}
          onBack={handleBack}
        />
      )}
    </div>
  )
}