"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface CompanyFormData {
  companyName: string
  vatNumber: string
  address: string
  city: string
  province: string
  postalCode: string
}

interface Step2Props {
  formData: CompanyFormData
  onSubmit: (data: CompanyFormData) => void
  onBack: () => void
}

export default function Step2CompanyInfo({ formData, onSubmit, onBack }: Step2Props) {
  const [companyData, setCompanyData] = useState<CompanyFormData>({
    companyName: formData.companyName || "",
    vatNumber: formData.vatNumber || "",
    address: formData.address || "",
    city: formData.city || "",
    province: formData.province || "",
    postalCode: formData.postalCode || ""
  })

  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!companyData.companyName || !companyData.vatNumber || !companyData.address || 
        !companyData.city || !companyData.province || !companyData.postalCode) {
      toast.error("Compila tutti i campi obbligatori")
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Utente non autenticato")
        return
      }

      // Cerca la pratica più recente in bozza
      const { data: practice, error: practiceError } = await supabase
        .from('practices')
        .select('id, data')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (practiceError) {
        console.error('Errore ricerca pratica:', practiceError)
        throw practiceError
      }

      if (!practice) {
        toast.error("Nessuna pratica in bozza trovata")
        return
      }

      // Prepara i dati da salvare
      const existingData = practice.data || {}
      const updatedData = {
        ...existingData,
        company: {
          name: companyData.companyName,
          vatNumber: companyData.vatNumber,
          address: companyData.address || '',
          city: companyData.city || '',
          province: companyData.province || '',
          postalCode: companyData.postalCode || ''
        }
      }

      console.log("Dati da salvare:", updatedData)

      // Aggiorna la pratica
      const { error } = await supabase
        .from('practices')
        .update({
          data: updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', practice.id)

      if (error) {
        console.error('Errore aggiornamento pratica:', error)
        throw error
      }

      console.log("Aggiornamento completato con successo")
      onSubmit(companyData)
      
    } catch (error: any) {
      console.error('Errore completo:', error)
      toast.error(error.message || "Errore durante il salvataggio dei dati aziendali")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="companyName">Ragione Sociale *</Label>
          <Input
            id="companyName"
            value={companyData.companyName}
            onChange={(e) => setCompanyData(prev => ({ ...prev, companyName: e.target.value }))}
            placeholder="Ragione Sociale"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="vatNumber">Partita IVA *</Label>
          <Input
            id="vatNumber"
            value={companyData.vatNumber}
            onChange={(e) => setCompanyData(prev => ({ ...prev, vatNumber: e.target.value }))}
            placeholder="Partita IVA"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="address">Indirizzo *</Label>
          <Input
            id="address"
            value={companyData.address}
            onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Via/Piazza e numero civico"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="city">Città *</Label>
            <Input
              id="city"
              value={companyData.city}
              onChange={(e) => setCompanyData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Città"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="province">Provincia *</Label>
            <Input
              id="province"
              value={companyData.province}
              onChange={(e) => setCompanyData(prev => ({ ...prev, province: e.target.value }))}
              placeholder="Provincia"
              maxLength={2}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="postalCode">CAP *</Label>
            <Input
              id="postalCode"
              value={companyData.postalCode}
              onChange={(e) => setCompanyData(prev => ({ ...prev, postalCode: e.target.value }))}
              placeholder="CAP"
              maxLength={5}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Indietro
        </Button>
        <Button type="submit">
          Avanti
        </Button>
      </div>
    </form>
  )
} 