"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface RequestFormValues {
  employeeName: string
  employeeId: string
  certificationType: string
  notes?: string
}

export function CertificationRequestForm() {
  const { register, handleSubmit, reset } = useForm<RequestFormValues>()
  const { showToast } = useToast()

  function onSubmit(data: RequestFormValues) {
    // Per ora solo un log dei dati
    console.log(data)
    
    showToast("La tua richiesta di certificazione è stata inviata con successo", "success")
    
    // Reset del form
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium">
          Nome Dipendente
        </label>
        <Input
          {...register("employeeName")}
          className="mt-1"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          ID Dipendente
        </label>
        <Input
          {...register("employeeId")}
          className="mt-1"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Tipo Certificazione
        </label>
        <select
          {...register("certificationType")}
          className="w-full mt-1 p-2 border rounded"
          required
        >
          <option value="">Seleziona tipo...</option>
          <option value="type1">Tipo 1</option>
          <option value="type2">Tipo 2</option>
          <option value="type3">Tipo 3</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">
          Note (opzionale)
        </label>
        <Input
          {...register("notes")}
          className="mt-1"
        />
      </div>

      <Button type="submit">
        Invia Richiesta
      </Button>
    </form>
  )
} 
