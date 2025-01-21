"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const registerSchema = z.object({
  ragioneSociale: z.string().min(1, "Campo obbligatorio"),
  partitaIVA: z.string().min(11, "Partita IVA non valida").max(11),
  codiceFiscale: z.string().min(1, "Campo obbligatorio"),
  email: z.string().email("Email non valida"),
  pec: z.string().min(1, "Campo obbligatorio"),
  telefono: z.string().min(1, "Campo obbligatorio"),
  settore: z.string().min(1, "Campo obbligatorio"),
  ccnl: z.string().min(1, "Campo obbligatorio"),
  indirizzo: z.string().min(1, "Campo obbligatorio"),
  cap: z.string().min(5, "CAP non valido").max(5),
  citta: z.string().min(1, "Campo obbligatorio"),
  provincia: z.string().min(1, "Campo obbligatorio"),
  
  // Rappresentante Legale
  nome: z.string().min(1, "Campo obbligatorio"),
  cognome: z.string().min(1, "Campo obbligatorio"), 
  cfRappresentante: z.string().min(1, "Campo obbligatorio"),
  emailRappresentante: z.string().email("Email non valida"),
  telefonoRappresentante: z.string().min(1, "Campo obbligatorio"),
  dataNascita: z.string().min(1, "Campo obbligatorio"),
  luogoNascita: z.string().min(1, "Campo obbligatorio"),
  
  // Dati Amministrativi
  dataCostituzione: z.string().min(1, "Campo obbligatorio"),
  numeroREA: z.string().min(1, "Campo obbligatorio"),
  cciaa: z.string().min(1, "Campo obbligatorio"),
  numeroDipendenti: z.string().min(1, "Campo obbligatorio"),
  
  password: z.string().min(6, "Minimo 6 caratteri"),
  confermaPassword: z.string()
}).refine((data) => data.password === data.confermaPassword, {
  message: "Le password non coincidono",
  path: ["confermaPassword"], 
})

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    setIsLoading(true)
    // Logica submit
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-[#ff7f00]">Registrazione</h1>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          
          {/* Grid a due colonne */}
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Colonna Sinistra - Dati Azienda */}
            <div>
              <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-200">
                Dati Azienda
              </h2>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="ragioneSociale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Ragione Sociale</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="border-gray-300 focus:border-[#ff7f00] focus:ring-[#ff7f00]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ... altri campi azienda ... */}
              </div>
            </div>

            {/* Colonna Destra - Rappresentante e Dati Admin */}
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-200">
                  Rappresentante Legale
                </h2>
                
                <div className="space-y-4">
                  {/* ... campi rappresentante ... */}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-200">
                  Dati Amministrativi
                </h2>
                
                <div className="space-y-4">
                  {/* ... campi amministrativi ... */}
                </div>
              </div>
            </div>
          </div>

          {/* Bottoni */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
            <Button 
              variant="outline"
              onClick={() => router.push('/login')}
              className="px-6"
            >
              Annulla
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              className="bg-[#ff7f00] hover:bg-[#ff7f00]/90 text-white px-6"
              disabled={isLoading}
            >
              {isLoading ? 'Registrazione...' : 'Registra Azienda'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 