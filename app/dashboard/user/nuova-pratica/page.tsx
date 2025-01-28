"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import Step1EmployeeInfo from "./steps/Step1EmployeeInfo"
import Step3Documents from "./steps/Step3Documents"
import Step4Payment from "./steps/Step4Payment"

interface BaseFormData {
  employeeName: string
  fiscalCode: string
  contractType: string
  contractTypeName: string
  contractValue: number
  quantity: number
  isOdcec: boolean
  isRenewal: boolean
  documents: Record<string, string>
}

interface PriceInfo {
  id: number
  contract_type_id: number
  base_price: number
  is_percentage: boolean
  percentage_value: number | null
  threshold_value: number | null
  min_quantity: number
  is_odcec: boolean
  is_renewal: boolean
}

interface FormData extends BaseFormData {
  practiceId: string
  priceInfo: PriceInfo
  conventionCode?: string
  conventionDiscount?: number
}

interface PracticeData extends FormData {
  status: string
  user_id: string
  created_at: string
}

export default function NuovaPraticaPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    employeeName: "",
    fiscalCode: "",
    contractType: "",
    contractTypeName: "",
    contractValue: 0,
    quantity: 1,
    isOdcec: false,
    isRenewal: false,
    practiceId: "",
    priceInfo: {
      id: 0,
      contract_type_id: 0,
      base_price: 0,
      is_percentage: false,
      percentage_value: null,
      threshold_value: null,
      min_quantity: 1,
      is_odcec: false,
      is_renewal: false
    },
    documents: {}
  })

  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleStep1Submit = (stepData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }))
    setCurrentStep(3)
  }

  const handleStep3Submit = (stepData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }))
    setCurrentStep(4)
  }

  const handleStep4Submit = async (stepData: Partial<FormData>) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Utente non autenticato")
        return
      }

      const practiceData: PracticeData = {
        ...formData,
        ...stepData,
        status: "pending_payment",
        user_id: user.id,
        created_at: new Date().toISOString()
      }

      const { error: practiceError } = await supabase
        .from('practices')
        .insert([practiceData])

      if (practiceError) throw practiceError

      toast.success("Pratica creata con successo")
      router.push('/dashboard/pratiche')
    } catch (error) {
      console.error('Errore:', error)
      toast.error("Si è verificato un errore. Riprova.")
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Nuova Pratica</h1>
          <p className="text-gray-600">Step {currentStep} di 4</p>
        </div>

        {currentStep === 1 && (
          <Step1EmployeeInfo
            formData={formData}
            onSubmit={handleStep1Submit}
          />
        )}

        {currentStep === 3 && (
          <Step3Documents
            formData={formData}
            onSubmit={handleStep3Submit}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 4 && (
          <Step4Payment
            formData={formData}
            onSubmit={handleStep4Submit}
            onBack={() => setCurrentStep(3)}
          />
        )}
      </div>
    </div>
  )
}