"use client"

import { Suspense } from "react"
import PaymentCallback from "./PaymentCallback"

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <PaymentCallback />
    </Suspense>
  )
} 