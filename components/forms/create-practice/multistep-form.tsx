"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, ChevronRight, Trash2, PenLine, Users } from "lucide-react"
import { EmployeeForm } from "./steps/employee-form"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"
import { DocumentsForm } from "./steps/documents-form"

interface CreatePracticeFormProps {
  onCancel: () => void
}

interface Step {
  title: string
  description: string
}

interface Employee {
  name: string
  surname: string
  fiscal_code: string
  birth_date: Date
  phone: string
  city: string
  address: string
  contract_type: string
}

const steps: Step[] = [
  {
    title: "Anagrafica",
    description: "Inserisci i dati dei dipendenti"
  },
  {
    title: "Documenti",
    description: "Gestisci le istanze da firmare"
  },
  {
    title: "Riepilogo",
    description: "Verifica le pratiche create"
  },
  {
    title: "Pagamento",
    description: "Procedi al pagamento"
  }
]

export function CreatePracticeForm({ onCancel }: CreatePracticeFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const handleAddEmployee = (data: Employee) => {
    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => 
        emp.fiscal_code === editingEmployee.fiscal_code ? data : emp
      ))
      setEditingEmployee(null)
      toast.success("Dipendente modificato con successo")
    } else {
      if (employees.some(emp => emp.fiscal_code === data.fiscal_code)) {
        toast.error("Dipendente già presente")
        return
      }
      setEmployees(prev => [...prev, data])
      toast.success("Dipendente aggiunto con successo")
    }
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
  }

  const handleDeleteEmployee = (fiscal_code: string) => {
    setEmployees(prev => prev.filter(emp => emp.fiscal_code !== fiscal_code))
    toast.success("Dipendente rimosso con successo")
  }

  const getContractTypeName = (id: string) => {
    const types: { [key: string]: string } = {
      "1": "Tempo Indeterminato",
      "2": "Tempo Determinato",
      "3": "Apprendistato",
      "4": "Collaborazione"
    }
    return types[id] || id
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    } else {
      onCancel()
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Crea Nuova Pratica</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            Annulla
          </Button>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.title} className="flex flex-col items-center">
                <div 
                  className={`
                    w-10 h-10 rounded-full border-2 flex items-center justify-center
                    ${index === currentStep 
                      ? "border-primary bg-primary text-white"
                      : index < currentStep
                      ? "border-primary bg-primary text-white"
                      : "border-gray-300 text-gray-300"
                    }
                  `}
                >
                  {index < currentStep ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="text-center mt-2">
                  <div className={`font-medium ${index === currentStep ? "text-primary" : "text-gray-500"}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden sm:block w-24 border-t border-gray-300 mt-5" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contenuto Step */}
        <Card className="p-6 bg-white shadow-lg border-0">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Anagrafica Dipendenti</h2>
                    <p className="text-gray-500 mt-1">Inserisci i dati dei dipendenti da certificare</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-600">{employees.length} dipendenti</span>
                  </div>
                </div>

                <AnimatePresence>
                  {employees.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mb-8 rounded-lg border border-gray-100 overflow-hidden"
                    >
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome e Cognome</TableHead>
                            <TableHead>Codice Fiscale</TableHead>
                            <TableHead>Data di Nascita</TableHead>
                            <TableHead>Città</TableHead>
                            <TableHead>Contratto</TableHead>
                            <TableHead className="text-right">Azioni</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {employees.map((employee) => (
                            <TableRow key={employee.fiscal_code}>
                              <TableCell className="font-medium">
                                {employee.name} {employee.surname}
                              </TableCell>
                              <TableCell>{employee.fiscal_code}</TableCell>
                              <TableCell>
                                {format(new Date(employee.birth_date), "d MMM yyyy", { locale: it })}
                              </TableCell>
                              <TableCell>{employee.city}</TableCell>
                              <TableCell>{getContractTypeName(employee.contract_type)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditEmployee(employee)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <PenLine className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteEmployee(employee.fiscal_code)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </motion.div>
                  )}
                </AnimatePresence>

                <EmployeeForm 
                  onSubmit={handleAddEmployee} 
                  initialData={editingEmployee}
                  isEditing={!!editingEmployee}
                />
              </motion.div>
            )}

            {currentStep === 1 && (
              <div>
                <DocumentsForm 
                  onComplete={() => nextStep()} 
                  employees={employees}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Riepilogo Pratiche</h2>
                {/* Qui inseriremo il riepilogo */}
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Pagamento</h2>
                {/* Qui inseriremo il form di pagamento */}
              </div>
            )}
          </AnimatePresence>

          {/* Pulsanti Navigazione con animazione */}
          <motion.div 
            className="flex justify-between mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isLoading}
            >
              {currentStep === 0 ? 'Annulla' : 'Indietro'}
            </Button>
            <Button
              onClick={nextStep}
              disabled={(currentStep === 0 && employees.length === 0) || currentStep === steps.length - 1 || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {currentStep === steps.length - 1 ? (
                "Completa"
              ) : (
                <>
                  Avanti
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  )
} 