"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

export default function Register() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    company: "",
    vatNumber: "",
    fiscalCode: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  })

  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Le password non coincidono")
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (signUpError) throw signUpError

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            username: formData.email,
            role: 'user'  // tutti i nuovi utenti sono 'user' di default
          })
      }

      toast.success("Registrazione completata! Controlla la tua email per confermare l'account.")
      router.push('/auth/login')

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-[180px] h-[60px] mb-6">
          <Image
            src="/images/certifica-logo.svg"
            alt="Certifica Logo"
            width={180}
            height={60}
            priority
            className="object-contain"
          />
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-2">
          Benvenuto in Certifica
        </p>
        <p className="text-gray-600 text-center max-w-md">
          Completa la registrazione per accedere a tutti i servizi della piattaforma
        </p>
      </div>

      <Card className="w-full max-w-2xl shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="space-y-1 pb-8">
          <h2 className="text-2xl font-bold tracking-tight text-center text-gray-900">
            Registrazione Account
          </h2>
          <p className="text-center text-gray-600">
            Inserisci i tuoi dati per creare un nuovo account
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sezione Dati Personali */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-1 bg-blue-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900">Dati Personali</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    Nome *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    className="h-11"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Cognome *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    className="h-11"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="h-11"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiscalCode" className="text-sm font-medium">
                    Codice Fiscale *
                  </Label>
                  <Input
                    id="fiscalCode"
                    type="text"
                    className="h-11"
                    value={formData.fiscalCode}
                    onChange={(e) => setFormData({ ...formData, fiscalCode: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    className="h-11"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Conferma Password *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="h-11"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sezione Dati Aziendali */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-1 bg-blue-600 rounded-full" />
                <h3 className="text-lg font-semibold text-gray-900">Dati Aziendali</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium">
                    Ragione Sociale
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    className="h-11"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vatNumber" className="text-sm font-medium">
                    Partita IVA
                  </Label>
                  <Input
                    id="vatNumber"
                    type="text"
                    className="h-11"
                    value={formData.vatNumber}
                    onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Indirizzo *
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    className="h-11"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    Città *
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    className="h-11"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province" className="text-sm font-medium">
                    Provincia *
                  </Label>
                  <Input
                    id="province"
                    type="text"
                    className="h-11"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-sm font-medium">
                    CAP *
                  </Label>
                  <Input
                    id="postalCode"
                    type="text"
                    className="h-11"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium bg-blue-600 hover:bg-blue-700" 
                disabled={loading}
              >
                {loading ? "Registrazione in corso..." : "Crea Account"}
              </Button>
              
              <p className="text-center text-sm text-gray-600">
                Hai già un account?{" "}
                <Link 
                  href="/auth/login" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Accedi
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 