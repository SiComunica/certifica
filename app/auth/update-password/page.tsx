"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/lib/supabase/client"
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

const resetSchema = z.object({
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
})

type ResetFormData = z.infer<typeof resetSchema>

export default function UpdatePasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSessionLoaded, setIsSessionLoaded] = useState(false)

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/auth/login'
      } else {
        setIsSessionLoaded(true)
      }
    }
    checkSession()
  }, [])

  async function onSubmit(data: ResetFormData) {
    try {
      setIsLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Sessione non valida')
      }

      const { error } = await supabase.auth.updateUser({
        password: data.password
      })

      if (error) throw error

      await supabase.auth.signOut()
      
      toast.success('Password aggiornata con successo')
      window.location.href = '/auth/login'
      
    } catch (error: any) {
      console.error('Errore:', error)
      toast.error(error.message || 'Errore durante l\'aggiornamento della password')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSessionLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
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
          Imposta nuova password
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Aggiornamento in corso...</span>
                </div>
              ) : (
                "Imposta nuova password"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
} 