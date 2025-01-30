"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PraticaFormData, EmployeeData, PriceRange } from "./types"
import Step1EmployeeInfo from "./steps/Step1EmployeeInfo"
import Step3Documents from "./steps/Step3Documents"
import { Step4Payment } from "./steps/Step4Payment"

type Step1Data = {
  employeeName: string
  fiscalCode: string
  email: string
  contractType: string
  contractValue: number
  contractTypeName?: string
  isOdcec: boolean
  isRenewal: boolean
  priceInfo?: {
    id: number
    contract_type_id: number
    min_quantity: number
    max_quantity: number
    base_price: number
    is_percentage: boolean
    percentage_value: number
    threshold_value: number | null
    is_odcec: boolean
    is_renewal: boolean
  }
}

export default function NuovaPratica() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PraticaFormData>({
    employeeName: "",
    fiscalCode: "",
    email: "",
    contractType: "",
    contractTypeName: "",
    contractValue: 0,
    documents: [],
    conventionCode: "",
    conventionDiscount: 0,
    isOdcec: false,
    isRenewal: false,
    quantity: 1,
    productId: "",
    practiceId: "",
    priceInfo: {
      id: 0,
      contract_type_id: 0,
      min_quantity: 1,
      max_quantity: 1,
      base_price: 0,
      base: 0,
      is_percentage: false,
      percentage_value: 0,
      threshold_value: null,
      is_odcec: false,
      is_renewal: false,
      inputs: {
        isPercentage: false,
        threshold: null,
        contractValue: 0,
        basePrice: 0,
        quantity: 1,
        isOdcec: false,
        isRenewal: false,
        conventionDiscount: 0
      },
      withVAT: 0
    }
  })

  const supabase = createClientComponentClient()

  const updateFormData = (data: Partial<PraticaFormData>) => {
    setFormData((prev: PraticaFormData) => {
      const newData = { ...prev, ...data }
      // Calcolo prezzo
      const basePrice = newData.priceInfo?.base_price || 0
      const quantity = newData.quantity || 1
      const conventionDiscount = newData.conventionDiscount || 0

      let price = basePrice * quantity
      if (conventionDiscount > 0) {
        price = price * (1 - conventionDiscount / 100)
      }

      return {
        ...newData,
        priceInfo: {
          ...newData.priceInfo,
          base: basePrice,
          inputs: {
            isPercentage: newData.priceInfo?.is_percentage || false,
            threshold: newData.priceInfo?.threshold_value || null,
            contractValue: newData.contractValue || 0,
            basePrice: basePrice,
            quantity: quantity,
            isOdcec: newData.isOdcec || false,
            isRenewal: newData.isRenewal || false,
            conventionDiscount: conventionDiscount
          },
          withVAT: price * 1.22
        }
      }
    })
  }

  const handleStep1Submit = async (data: Step1Data) => {
    updateFormData({
      ...data,
      priceInfo: data.priceInfo ? {
        ...formData.priceInfo,
        ...data.priceInfo,
        base: data.priceInfo.base_price,
        inputs: {
          isPercentage: data.priceInfo.is_percentage,
          threshold: data.priceInfo.threshold_value,
          contractValue: data.contractValue,
          basePrice: data.priceInfo.base_price,
          quantity: 1,
          isOdcec: data.isOdcec,
          isRenewal: data.isRenewal,
          conventionDiscount: 0
        },
        withVAT: data.priceInfo.base_price * 1.22
      } : formData.priceInfo
    })
    handleNextStep()
  }

  const handleStep2Submit = async (stepData: Partial<PraticaFormData>) => {
    updateFormData(stepData)
    handleNextStep()
  }

  const handleStep3Submit = async (stepData: Partial<PraticaFormData>) => {
    updateFormData(stepData)
    handleNextStep()
  }

  const handleStep4Submit = async (stepData: Partial<PraticaFormData>) => {
    updateFormData(stepData)
    // Logica per il pagamento
  }

  const handleNextStep = () => {
    setCurrentStep((prev: number) => prev + 1)
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
        {currentStep === 2 && (
          <Step3Documents
            formData={formData}
            onSubmit={handleStep2Submit}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <Step3Documents
            formData={formData}
            onSubmit={handleStep3Submit}
            onBack={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 4 && (
          <Step4Payment
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={handleStep4Submit}
            onBack={() => setCurrentStep(3)}
          />
        )}
      </div>
    </div>
  )
}