"use client"

import { Suspense } from "react"
import PaymentCallbackContent from "./PaymentCallbackContent"
import { Loader2 } from "lucide-react"

export default function PaymentCallback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
} 