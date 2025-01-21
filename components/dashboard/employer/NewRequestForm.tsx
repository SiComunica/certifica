import * as React from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "react-hot-toast"

const formSchema = z.object({
  employee_id: z.string(),
  contract_type: z.string(),
  is_urgent: z.boolean(),
  is_complex: z.boolean(),
  notes: z.string().optional(),
})

export function NewRequestForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const [isCalculating, setIsCalculating] = useState(false)
  const [quote, setQuote] = useState<number | null>(null)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsCalculating(true)
      
      // Calcola il preventivo
      const { data: cost } = await supabase
        .rpc('calculate_certification_cost', {
          p_is_urgent: values.is_urgent,
          p_is_complex: values.is_complex
        })

      setQuote(cost)
      
    } catch (error) {
      console.error('Error:', error)
      toast.error('Errore nel calcolo del preventivo')
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="employee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dipendente</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contract_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo Contratto</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="is_urgent"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Urgente</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_complex"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Complesso</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isCalculating}>
          {isCalculating ? 'Calcolo in corso...' : 'Calcola Preventivo'}
        </Button>

        {quote && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <p className="text-green-700">Preventivo calcolato: € {quote}</p>
            <Button 
              className="mt-2"
              onClick={() => {/* TODO: Implementare redirect al pagamento */}}
            >
              Procedi al Pagamento
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
} 