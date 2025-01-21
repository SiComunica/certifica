"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"

const requestFormSchema = z.object({
  contractType: z.string().min(2, {
    message: "Il tipo di contratto è obbligatorio",
  }),
  employeeName: z.string().min(2, {
    message: "Il nome del dipendente è obbligatorio",
  }),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string().min(10, {
    message: "La descrizione deve essere di almeno 10 caratteri",
  }),
  isUrgent: z.boolean().default(false),
  attachments: z.string().optional(),
})

type RequestFormValues = z.infer<typeof requestFormSchema>

export function CertificationRequestForm() {
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      isUrgent: false,
    },
  })

  function onSubmit(data: RequestFormValues) {
    toast({
      title: "Richiesta inviata",
      description: "La tua richiesta di certificazione è stata inviata con successo",
    })
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="contractType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo di Contratto</FormLabel>
              <FormControl>
                <Input placeholder="Es: Tempo Determinato" {...field} />
              </FormControl>
              <FormDescription>
                Specifica il tipo di contratto da certificare
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="employeeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Dipendente</FormLabel>
              <FormControl>
                <Input placeholder="Nome e Cognome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Inizio</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Fine (opzionale)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrizione</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrivi i dettagli del contratto..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isUrgent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Richiesta Urgente</FormLabel>
                <FormDescription>
                  Seleziona se la richiesta richiede una gestione prioritaria
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit">Invia Richiesta</Button>
      </form>
    </Form>
  )
} 