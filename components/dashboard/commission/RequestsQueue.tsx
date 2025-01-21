"use client"

import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckIcon, Cross1Icon, EyeOpenIcon, Cross2Icon } from "@radix-ui/react-icons"

interface Request {
  id: string
  title: string
  status: string
  date: string
}

export function RequestsQueue() {
  // Dati di esempio
  const requests: Request[] = [
    {
      id: '1',
      title: 'Richiesta #001',
      status: 'pending',
      date: '2024-01-21'
    },
    {
      id: '2',
      title: 'Richiesta #002',
      status: 'in-progress',
      date: '2024-01-21'
    }
  ]

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div 
          key={request.id}
          className="p-3 bg-gray-50 rounded border"
        >
          <h4 className="font-medium">{request.title}</h4>
          <div className="text-sm text-gray-500">
            <span>{request.status}</span>
            <span className="mx-2">•</span>
            <span>{request.date}</span>
          </div>
        </div>
      ))}
    </div>
  )
} 