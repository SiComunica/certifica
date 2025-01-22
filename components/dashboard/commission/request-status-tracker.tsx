"use client"

import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'

interface Step {
  name: string
  status: string
  statusText: string
  date?: string
  icon: any
}

interface StatusTrackerProps {
  status: string
  submittedDate?: string
  reviewedDate?: string
}

export function RequestStatusTracker({ 
  status, 
  submittedDate, 
  reviewedDate 
}: StatusTrackerProps) {
  const steps: Step[] = [
    {
      name: "Inviata",
      status: "completed",
      statusText: "Inviata",
      date: submittedDate,
      icon: Clock
    },
    {
      name: "In Revisione",
      status: status === "pending" ? "current" : "completed",
      statusText: "In corso",
      icon: Clock
    },
    {
      name: "Completata",
      status: status === "pending" ? "upcoming" : "completed",
      statusText: status === "approved" ? "Approvata" : "Respinta",
      date: reviewedDate,
      icon: status === "approved" ? CheckCircle2 : AlertCircle
    }
  ]

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div 
          key={index} 
          className={`flex items-center space-x-3 ${
            step.status === 'completed' ? 'text-green-600' :
            step.status === 'current' ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <step.icon className="w-5 h-5" />
          <div>
            <p className="font-medium">{step.name}</p>
            <p className="text-sm">{step.statusText}</p>
            {step.date && (
              <p className="text-xs text-gray-500">{step.date}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 