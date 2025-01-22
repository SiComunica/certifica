"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, FormProvider, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/lib/supabase"
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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { Suspense } from 'react'

const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
  remember: z.boolean().default(false),
})

interface LoginFormData {
  email: string
  password: string
  remember: boolean
}

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const methods = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
      remember: false
    }
  })

  async function onSubmit(data: LoginFormData) {
    try {
      setIsLoading(true)
      console.log('Tentativo di login con:', data.email)
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        throw error
      }

      if (authData?.user) {
        console.log('Login effettuato come:', authData.user.email)

        if (authData.user.email === 'francescocro76@gmail.com') {
          console.log('Reindirizzamento admin')
          await router.push('/dashboard/admin')
        } else {
          console.log('Reindirizzamento user')
          await router.push('/dashboard/user')
        }
      }
      
    } catch (error: any) {
      console.error('Error:', error.message)
      toast.error('Credenziali non valide')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormProvider {...methods}>
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
                <Form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={methods.control}
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
                    control={methods.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Inserisci la password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="remember"
                      control={methods.control}
                      render={({ field }) => (
                        <Checkbox
                          id="remember"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Ricordami
                    </label>
                  </div>

                  <Link 
                    href="/auth/reset-password"
                    className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Reimposta password
                  </Link>

                  {methods.formState.errors.root && (
                    <div className="text-sm text-red-500">
                      {methods.formState.errors.root.message}
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
    </FormProvider>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <LoginContent />
    </Suspense>
  )
}