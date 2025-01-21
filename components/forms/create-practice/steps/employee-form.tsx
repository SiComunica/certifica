"use client"

import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, UserPlus, PenLine } from "lucide-react"
import { it } from "date-fns/locale"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { addYears, subYears } from "date-fns"

const employeeSchema = z.object({
  name: z.string().min(2, "Il nome è obbligatorio"),
  surname: z.string().min(2, "Il cognome è obbligatorio"),
  fiscal_code: z.string().length(16, "Il codice fiscale deve essere di 16 caratteri"),
  birth_date: z.date({
    required_error: "La data di nascita è obbligatoria",
  }),
  phone: z.string().min(6, "Il numero di telefono è obbligatorio"),
  city: z.string().min(2, "La città è obbligatoria"),
  address: z.string().min(2, "L'indirizzo è obbligatorio"),
  contract_type: z.string().min(1, "Seleziona un tipo di contratto"),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

interface EmployeeFormProps {
  onSubmit: (data: EmployeeFormValues) => void
  initialData?: EmployeeFormValues | null
  isEditing?: boolean
}

const contractTypes = [
  { id: "1", name: "Tempo Indeterminato" },
  { id: "2", name: "Tempo Determinato" },
  { id: "3", name: "Apprendistato" },
  { id: "4", name: "Collaborazione" },
]

export function EmployeeForm({ onSubmit, initialData, isEditing }: EmployeeFormProps) {
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: initialData || {
      name: "",
      surname: "",
      fiscal_code: "",
      phone: "",
      city: "",
      address: "",
      contract_type: "",
    },
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 bg-white shadow-lg border-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Nome</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Mario" 
                        {...field} 
                        className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Cognome</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Rossi" 
                        {...field}
                        className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fiscal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Codice Fiscale</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="RSSMRA80A01H501U" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e.target.value.toUpperCase())
                        }}
                        className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 uppercase"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-gray-700">Data di Nascita</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal border-gray-200 hover:bg-gray-50 ${
                              !field.value && "text-gray-500"
                            }`}
                          >
                            {field.value ? (
                              format(field.value, "d MMMM yyyy", { locale: it })
                            ) : (
                              <span>Seleziona una data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0 bg-white border border-gray-200 shadow-xl" 
                        align="start"
                        sideOffset={5}
                      >
                        <div className="p-4 border-b border-gray-100 bg-white">
                          <div className="grid grid-cols-3 gap-3">
                            {/* Selezione Giorno */}
                            <Select
                              value={field.value ? format(field.value, "d") : ""}
                              onValueChange={(day) => {
                                const currentDate = field.value || new Date()
                                const newDate = new Date(currentDate)
                                newDate.setDate(parseInt(day))
                                field.onChange(newDate)
                              }}
                            >
                              <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="G" />
                              </SelectTrigger>
                              <SelectContent 
                                position="popper" 
                                className="bg-white shadow-xl border-gray-200"
                                sideOffset={5}
                              >
                                <div className="max-h-[200px] overflow-y-auto">
                                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                    <SelectItem 
                                      key={day} 
                                      value={day.toString()}
                                      className="hover:bg-blue-50"
                                    >
                                      {day}
                                    </SelectItem>
                                  ))}
                                </div>
                              </SelectContent>
                            </Select>

                            {/* Selezione Mese */}
                            <Select
                              value={field.value ? format(field.value, "M") : ""}
                              onValueChange={(month) => {
                                const currentDate = field.value || new Date()
                                const newDate = new Date(currentDate)
                                newDate.setMonth(parseInt(month) - 1)
                                field.onChange(newDate)
                              }}
                            >
                              <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="M" />
                              </SelectTrigger>
                              <SelectContent 
                                position="popper" 
                                className="bg-white shadow-xl border-gray-200"
                                sideOffset={5}
                              >
                                <div className="max-h-[200px] overflow-y-auto">
                                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                    <SelectItem 
                                      key={month} 
                                      value={month.toString()}
                                      className="hover:bg-blue-50"
                                    >
                                      {format(new Date(2024, month - 1, 1), "MMMM", { locale: it })}
                                    </SelectItem>
                                  ))}
                                </div>
                              </SelectContent>
                            </Select>

                            {/* Selezione Anno */}
                            <Select
                              value={field.value ? format(field.value, "yyyy") : ""}
                              onValueChange={(year) => {
                                const currentDate = field.value || new Date()
                                const newDate = new Date(currentDate)
                                newDate.setFullYear(parseInt(year))
                                field.onChange(newDate)
                              }}
                            >
                              <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="A" />
                              </SelectTrigger>
                              <SelectContent 
                                position="popper" 
                                className="bg-white shadow-xl border-gray-200"
                                sideOffset={5}
                              >
                                <div className="max-h-[200px] overflow-y-auto">
                                  {Array.from(
                                    { length: 100 },
                                    (_, i) => new Date().getFullYear() - i
                                  ).map((year) => (
                                    <SelectItem 
                                      key={year} 
                                      value={year.toString()}
                                      className="hover:bg-blue-50"
                                    >
                                      {year}
                                    </SelectItem>
                                  ))}
                                </div>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="p-3 bg-white border-t border-gray-100">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > subYears(new Date(), 16) ||
                              date < subYears(new Date(), 100)
                            }
                            initialFocus
                            locale={it}
                            className="rounded-md border-gray-200"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Telefono</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+39 123 456 7890" 
                        {...field}
                        className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Città</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Roma" 
                        {...field}
                        className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Indirizzo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Via Roma, 1" 
                      {...field}
                      className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="contract_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Tipo Contratto</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white">
                          <SelectValue placeholder="Seleziona il tipo di contratto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent 
                        position="popper" 
                        className="bg-white shadow-xl border border-gray-200"
                        sideOffset={5}
                      >
                        <div className="max-h-[200px] overflow-y-auto py-1">
                          {contractTypes.map((type) => (
                            <SelectItem 
                              key={type.id} 
                              value={type.id}
                              className="hover:bg-blue-50"
                            >
                              {type.name}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 h-11"
                >
                  {isEditing ? (
                    <>
                      <PenLine className="w-4 h-4" />
                      Modifica Dipendente
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Aggiungi Dipendente
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
        </Form>
      </Card>
    </motion.div>
  )
} 