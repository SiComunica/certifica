"use client"

import { useState, useEffect, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useSearchParams } from 'next/navigation'

const resetSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
})

type ResetFormData = z.infer<typeof resetSchema>

function ResetPasswordContent() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const supabase = createClientComponentClient()

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    if (!token) {
      toast.error('Token mancante. Usa il link ricevuto via email.')
    }
  }, [token])

  async function onSubmit(data: ResetFormData) {
    try {
      setIsLoading(true)
      console.log('Inizio processo di reset con email:', data.email)

      // Prima verifichiamo l'OTP
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: data.email,
        token: token || '',
        type: 'invite',
      })

      if (verifyError) {
        console.error('Errore verifica:', verifyError)
        throw verifyError
      }

      console.log('OTP verificato con successo')

      // Poi aggiorniamo la password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password
      })

      if (updateError) {
        console.error('Errore aggiornamento:', updateError)
        throw updateError
      }

      console.log('Password aggiornata con successo')

      toast.success('Password impostata con successo')
      window.location.href = '/auth/login'
      
    } catch (error: any) {
      console.error('Errore completo:', error)
      toast.error(error.message || 'Errore durante l\'impostazione della password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-[400px] bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8">
        <div className="text-center mb-8">
          <Image
            src="/images/certifica-logo.svg"
            alt="SI Certifica"
            width={180}
            height={50}
            className="mx-auto"
            style={{ width: 'auto', height: '50px' }}
          />
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center">
          Imposta la tua password
        </h2>

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
                  <FormLabel>Nuova Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Inserisci la nuova password"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conferma Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Conferma la nuova password"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-[#007bff] hover:bg-blue-600 transition-colors"
              disabled={isLoading || !token}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Impostazione in corso...</span>
                </div>
              ) : (
                "Imposta password"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
} 