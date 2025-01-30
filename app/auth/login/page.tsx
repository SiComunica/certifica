"use client"

import React from 'react'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import Link from "next/link"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2, CreditCard } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
  remember: z.boolean().default(false),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) throw error

      // Ottieni il profilo utente
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', authData.user.id)
        .single()

      // Reindirizza in base al ruolo
      if (profile?.role === 'admin') {
        router.push('/dashboard/admin') // dashboard commissione
      } else {
        router.push('/dashboard/user') // dashboard aziende
      }

    } catch (error) {
      console.error('Errore completo:', error)
      toast("Errore durante il login. Riprova.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flex w-[800px] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Box Login */}
        <div className="w-[400px] p-8">
          <div className="text-center mb-8">
            <Image
              src="/images/certifica-logo.svg"
              alt="SI Certifica"
              width={180}
              height={50}
              className="mx-auto"
            />
          </div>

          <Tabs defaultValue="credentials" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="credentials">Credenziali</TabsTrigger>
              <TabsTrigger value="cie">CIE</TabsTrigger>
            </TabsList>

            <TabsContent value="credentials">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="Inserisci la tua email" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Inserisci la password" 
                            {...field} 
                            autoComplete="current-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name="remember"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label
                            htmlFor="remember"
                            className="text-sm text-gray-600"
                          >
                            Memorizza credenziali
                          </label>
                        </div>
                      )}
                    />
                    
                    <Link 
                      href="/auth/reset-password"
                      className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Reimposta password
                    </Link>
                  </div>

                  {form.formState.errors.root && (
                    <div className="text-sm text-red-500">
                      {form.formState.errors.root.message}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-[#007bff] hover:bg-blue-600 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Invia
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="cie">
              <div className="text-center space-y-6">
                <CreditCard className="h-16 w-16 mx-auto text-gray-400" />
                <p className="text-gray-600">
                  Accedi in modo sicuro utilizzando la tua Carta d'Identità Elettronica
                </p>
                <Button className="w-full bg-[#007bff] hover:bg-blue-600 transition-colors">
                  Accedi con CIE
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Box Registrazione */}
        <div className="w-[400px] bg-[#ff7f00] p-8 flex items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">
              Non sei registrato?
            </h2>
            <p className="text-lg text-white/90">
              La registrazione è gratuita e non comporta alcun impegno. 
              Procedendo entrerai a far parte della piattaforma di certificazione dei contratti.
            </p>
            <div className="space-y-4">
              <Link href="/auth/register">
                <Button className="w-full bg-white text-[#ff7f00] hover:bg-orange-50 transition-colors">
                  Registrati
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full border-white text-white hover:bg-white/10 transition-colors"
              >
                Contattaci
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}