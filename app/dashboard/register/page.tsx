"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const formSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
  name: z.string().min(2, "Il nome deve essere di almeno 2 caratteri"),
  fiscalCode: z.string().length(16, "Il codice fiscale deve essere di 16 caratteri"),
  // Dati fatturazione
  companyName: z.string().min(2, "La ragione sociale deve essere di almeno 2 caratteri"),
  vatNumber: z.string().min(11, "La partita IVA deve essere di almeno 11 caratteri"),
  companyFiscalCode: z.string().length(16, "Il codice fiscale aziendale deve essere di 16 caratteri"),
  address: z.string().min(5, "L'indirizzo deve essere di almeno 5 caratteri"),
  city: z.string().min(2, "La città deve essere di almeno 2 caratteri"),
  postalCode: z.string().length(5, "Il CAP deve essere di 5 caratteri"),
  country: z.string().min(2, "Il paese deve essere di almeno 2 caratteri").default("IT"),
})

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      fiscalCode: "",
      companyName: "",
      vatNumber: "",
      companyFiscalCode: "",
      address: "",
      city: "",
      postalCode: "",
      country: "IT",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // 1. Registrazione utente in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      })

      if (authError) throw authError

      // 2. Salvataggio dati utente e fatturazione nel database
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          email: values.email,
          full_name: values.name,
          fiscal_code: values.fiscalCode,
          // Dati fatturazione
          company_name: values.companyName,
          vat_number: values.vatNumber,
          company_fiscal_code: values.companyFiscalCode,
          address: values.address,
          city: values.city,
          postal_code: values.postalCode,
          country: values.country,
        })

      if (profileError) throw profileError

      toast.success("Registrazione completata con successo!")
      router.push('/dashboard')
    } catch (error) {
      console.error('Errore durante la registrazione:', error)
      toast.error("Errore durante la registrazione")
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Dati Personali</h2>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@esempio.it" {...field} />
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Mario Rossi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fiscalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Codice Fiscale</FormLabel>
                  <FormControl>
                    <Input placeholder="RSSMRA80A01H501U" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Dati Fatturazione</h2>
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ragione Sociale</FormLabel>
                  <FormControl>
                    <Input placeholder="Azienda SRL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vatNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partita IVA</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678901" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyFiscalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Codice Fiscale Azienda</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678901" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indirizzo</FormLabel>
                  <FormControl>
                    <Input placeholder="Via Roma 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Città</FormLabel>
                  <FormControl>
                    <Input placeholder="Roma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CAP</FormLabel>
                  <FormControl>
                    <Input placeholder="00100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paese</FormLabel>
                  <FormControl>
                    <Input placeholder="IT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit">Registrati</Button>
        </form>
      </Form>
    </div>
  )
} 