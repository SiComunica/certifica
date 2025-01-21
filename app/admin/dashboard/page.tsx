"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PdfTemplates } from '@/components/admin/pdf-templates'
import { PriceRanges } from '@/components/admin/price-ranges'
import { DiscountCodes } from '@/components/admin/discount-codes'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function AdminDashboard() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/login')
    }
  })

  // Verifica se l'utente è admin
  if (session?.user?.email !== 'francescoco76@gmail.com') {
    redirect('/')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Amministratore</h1>
      
      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Template PDF</TabsTrigger>
          <TabsTrigger value="prices">Tariffe</TabsTrigger>
          <TabsTrigger value="discounts">Buoni Sconto</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <PdfTemplates />
        </TabsContent>

        <TabsContent value="prices">
          <PriceRanges />
        </TabsContent>

        <TabsContent value="discounts">
          <DiscountCodes />
        </TabsContent>
      </Tabs>
    </div>
  )
} 