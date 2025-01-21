"use client"

import { useState } from "react"
import Step4Payment from "../step4payment"
import { useNewPracticeStore } from "@/store/new-practice-store"

export default function Step4() {
  const { formData, setFormData } = useNewPracticeStore()

  console.log("Step4 Page rendering", { formData })

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold mb-6">Riepilogo e Pagamento</h2>
      <Step4Payment 
        formData={formData} 
        setFormData={setFormData} 
      />
    </div>
  )
} 