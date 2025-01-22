"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function Switch({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "peer h-6 w-11 rounded-full bg-gray-200 transition-colors",
        "checked:bg-blue-600",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
        className
      )}
      role="switch"
      {...props}
    />
  )
} 