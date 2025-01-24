"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Step1EmployeeInfo from "../Step1EmployeeInfo"

export default function Step1Page() {
  const router = useRouter()
  const [formData, setFormData] = useState({})

  const handleSubmit = (data: any) => {
    setFormData(data)
    router.push("/dashboard/user/nuova-pratica/steps/step2")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nuova Pratica - Step 1</h1>
        <p className="text-gray-600">Inserisci i dati del dipendente</p>
      </div>

      <Step1EmployeeInfo 
        formData={formData} 
        onSubmit={handleSubmit}
      />

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => router.push("/dashboard/user")}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Torna alla Dashboard
        </button>
      </div>
    </div>
  )
} 