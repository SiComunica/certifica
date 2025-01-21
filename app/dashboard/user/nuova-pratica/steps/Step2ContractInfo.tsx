"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const contractSchema = z.object({
  type: z.string().min(1, "Tipo contratto richiesto"),
  startDate: z.string().min(1, "Data inizio richiesta"),
  endDate: z.string().optional(),
  salary: z.string().min(1, "Retribuzione richiesta"),
  notes: z.string().optional()
})

type ContractFormData = z.infer<typeof contractSchema>

interface Step2Props {
  data: ContractFormData
  updateData: (data: ContractFormData) => void
  onNext: () => void
  onBack: () => void
}

const CONTRACT_TYPES = [
  { id: 1, code: 'determinato', name: 'Determinato' },
  { id: 2, code: 'indeterminato', name: 'Indeterminato' },
  { id: 3, code: 'cooperativa', name: 'Cooperativa' },
  { id: 4, code: 'apprendistato', name: 'Apprendistato' }
]

export default function Step2ContractInfo({ data, updateData, onNext, onBack }: Step2Props) {
  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: data
  })

  const onSubmit = (formData: ContractFormData) => {
    updateData(formData)
    onNext()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold mb-6">Tipo di Contratto</h2>
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo Contratto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo contratto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTRACT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.code}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retribuzione Mensile (€)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (opzionale)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Indietro
          </Button>
          <Button type="submit">
            Avanti
          </Button>
        </div>
      </form>
    </Form>
  )
} 