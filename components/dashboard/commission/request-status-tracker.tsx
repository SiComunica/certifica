"use client"

import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

type Status = "submitted" | "review" | "approved" | "rejected"

interface RequestStatusTrackerProps {
  status: Status
  submittedDate: string
  reviewDate?: string
  completedDate?: string
}

export function RequestStatusTracker({
  status,
  submittedDate,
  reviewDate,
  completedDate,
}: RequestStatusTrackerProps) {
  const steps = [
    {
      name: "Inviata",
      status: "submitted",
      date: submittedDate,
      icon: Clock,
    },
    {
      name: "In Revisione",
      status: "review",
      date: reviewDate,
      icon: Clock,
    },
    {
      name: "Completata",
      status: status === "approved" ? "Approvata" : "Respinta",
      status: status === "approved" ? "approved" : "rejected",
      date: completedDate,
      icon: status === "approved" ? CheckCircle2 : AlertCircle,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute left-0 top-1/2 h-0.5 w-full bg-gray-200 -translate-y-1/2" />
        <div
          className="absolute left-0 top-1/2 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-500"
          style={{
            width:
              status === "submitted"
                ? "0%"
                : status === "review"
                ? "50%"
                : "100%",
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = [
              "submitted",
              status === "review" && "review",
              status === "approved" && "approved",
              status === "rejected" && "rejected",
            ].includes(step.status)

            return (
              <div
                key={step.name}
                className={`flex flex-col items-center ${
                  isActive ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isActive ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <step.icon className="h-5 w-5 text-white" />
                </div>
                <div className="mt-2 text-sm font-medium">{step.name}</div>
                {step.date && (
                  <div className="mt-1 text-xs text-gray-500">{step.date}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 