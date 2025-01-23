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
import { signIn } from "next-auth/react"

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
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
      remember: false
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true)
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Credenziali non valide")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      toast.error("Si è verificato un errore")
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormProvider {...form}>
      <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <img src="/logo.png" alt="Logo" className="h-8" />
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                Piattaforma per la gestione delle certificazioni
              </p>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Accedi al tuo account
              </h1>
              <p className="text-sm text-muted-foreground">
                Inserisci le tue credenziali per accedere
              </p>
            </div>

            <Tabs defaultValue="credentials" className="space-y-4">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="credentials">Email</TabsTrigger>
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
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="remember"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-medium leading-none">
                              Ricordami
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <div className="flex-1 text-right">
                        <Link
                          href="/auth/reset"
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          Password dimenticata?
                        </Link>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Caricamento..." : "Accedi"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>

            <p className="px-8 text-center text-sm text-muted-foreground">
              Non hai un account?{" "}
              <Link
                href="/register"
                className="underline underline-offset-4 hover:text-primary"
              >
                Registrati
              </Link>
            </p>
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