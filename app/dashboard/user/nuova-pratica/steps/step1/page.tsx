"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Step1EmployeeInfo from "../Step1EmployeeInfo"
import { PraticaFormData } from "../../types"

type Step1Data = {
  employeeName: string
  fiscalCode: string
  email: string
  contractType: string
  contractValue: number
  isOdcec: boolean
  isRenewal: boolean
  quantity: number
  contractTypeName?: string
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

export default function Step1Page() {
  const router = useRouter()
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

  const handleSubmit = (data: Step1Data) => {
    setFormData(prev => ({
      ...prev,
      ...data,
      priceInfo: data.priceInfo ? {
        ...prev.priceInfo,
        ...data.priceInfo,
        base: data.priceInfo.base_price,
        inputs: {
          isPercentage: data.priceInfo.is_percentage,
          threshold: data.priceInfo.threshold_value,
          contractValue: data.contractValue,
          basePrice: data.priceInfo.base_price,
          quantity: data.quantity,
          isOdcec: data.isOdcec,
          isRenewal: data.isRenewal,
          conventionDiscount: 0
        },
        withVAT: data.priceInfo.base_price * 1.22
      } : prev.priceInfo
    }))
    router.push("/dashboard/user/nuova-pratica/step2")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Step1EmployeeInfo 
          formData={formData} 
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
} 