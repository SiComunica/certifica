"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
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
import { toast } from "sonner"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface RegisterFormData {
  ragioneSociale: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const form = useForm<RegisterFormData>({
    defaultValues: {
      ragioneSociale: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true)
      
      if (data.password !== data.confirmPassword) {
        toast.error("Le password non coincidono")
        return
      }

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            ragione_sociale: data.ragioneSociale,
          }
        }
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Registrazione effettuata con successo! Controlla la tua email per confermare l'account.")
      router.push("/login")
    } catch (error) {
      toast.error("Si è verificato un errore durante la registrazione")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img src="/logo.png" alt="Logo" className="h-8" />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Registrati alla piattaforma per la gestione delle certificazioni
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Crea un account
            </h1>
            <p className="text-sm text-muted-foreground">
              Inserisci i tuoi dati per registrarti
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="ragioneSociale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ragione Sociale</FormLabel>
                    <FormControl>
                      <Input placeholder="La tua azienda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="nome@esempio.com"
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
                      <Input type="password" {...field} />
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
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registrazione in corso..." : "Registrati"}
              </Button>
            </form>
          </Form>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Hai già un account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 