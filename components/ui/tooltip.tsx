"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: string
  children: React.ReactNode
  className?: string
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1 text-sm",
            "bg-gray-900 text-white rounded",
            "bottom-full left-1/2 -translate-x-1/2 mb-2",
            className
          )}
          role="tooltip"
        >
          {content}
          {/* Freccia */}
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2
                       border-4 border-transparent border-t-gray-900"
          />
        </div>
      )}
    </div>
  )
}

// Provider per gestire i tooltip a livello globale
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return children
} 