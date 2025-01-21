"use client"

import { cn } from "@/lib/utils"

type Status = "pending" | "review" | "approved" | "rejected"

interface RequestStatusTrackerProps {
  status: Status
  submittedDate: string
  reviewDate?: string
}

export function RequestStatusTracker({
  status,
  submittedDate,
  reviewDate,
}: RequestStatusTrackerProps) {
  const steps = [
    {
      name: "Inviata",
      status: status === "pending" ? "current" : "complete",
      date: new Date(submittedDate).toLocaleDateString("it-IT"),
    },
    {
      name: "In Revisione",
      status:
        status === "pending"
          ? "upcoming"
          : status === "review"
          ? "current"
          : "complete",
      date: reviewDate
        ? new Date(reviewDate).toLocaleDateString("it-IT")
        : undefined,
    },
    {
      name: status === "approved" ? "Approvata" : "Rifiutata",
      status:
        status === "pending" || status === "review"
          ? "upcoming"
          : "current",
      date: reviewDate
        ? new Date(reviewDate).toLocaleDateString("it-IT")
        : undefined,
    },
  ]

  return (
    <div className="space-y-4">
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
          {steps.map((step, index) => (
            <li key={step.name} className="md:flex-1">
              <div className="group flex flex-col border-l-4 border-slate-200 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                <span className="text-sm font-medium text-slate-500">
                  Step {index + 1}
                </span>
                <span className="text-lg font-semibold">
                  {step.name}
                </span>
                {step.date && (
                  <span className="text-sm text-slate-500">
                    {step.date}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
} 