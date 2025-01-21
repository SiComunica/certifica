"use client"

import { useState, useEffect } from 'react'
import { Metadata } from "next"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { RequestsQueue } from "@/components/dashboard/commission/RequestsQueue"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Dashboard Commissione",
  description: "Gestione delle richieste di certificazione",
}

export default function CommissionPage() {
  const [loading, setLoading] = useState(true)

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        Dashboard Commissione
      </h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">
            Coda Richieste
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              Caricamento...
            </div>
          ) : (
            <RequestsQueue />
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">
            Statistiche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-500">Richieste Totali</h3>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-500">In Attesa</h3>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium text-gray-500">Completate</h3>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 