"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Tag, Percent, Handshake, Users } from "lucide-react"
import DocumentsManagement from "./components/DocumentsManagement"
import PricesManagement from "./components/PricesManagement"
import ConventionsManagement from "./components/ConventionsManagement"
import CommissionManagement from "./components/CommissionManagement"
import { AlertDialog } from "@/components/ui/alert-dialog"
import PracticesManagement from "./components/PracticesManagement"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("templates")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Errore durante il logout:', error)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestione Amministrativa</h1>
        <p className="text-gray-500 mt-2">
          Gestisci templates, tariffe, codici sconto, convenzioni e membri
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white p-1 rounded-lg border">
          <TabsTrigger value="templates" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="rates" className="flex-1">
            <Tag className="h-4 w-4 mr-2" />
            Tariffe
          </TabsTrigger>
          <TabsTrigger value="discounts" className="flex-1">
            <Percent className="h-4 w-4 mr-2" />
            Codici Sconto
          </TabsTrigger>
          <TabsTrigger value="conventions" className="flex-1">
            <Handshake className="h-4 w-4 mr-2" />
            Convenzioni
          </TabsTrigger>
          <TabsTrigger value="commission" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Commissione
          </TabsTrigger>
          <TabsTrigger value="practices" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Pratiche
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentsManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Tariffe</CardTitle>
            </CardHeader>
            <CardContent>
              <PricesManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discounts">
          {/* ... il tuo codice esistente per i codici sconto ... */}
        </TabsContent>

        <TabsContent value="conventions">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Convenzioni</CardTitle>
            </CardHeader>
            <CardContent>
              <ConventionsManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Commissione</CardTitle>
            </CardHeader>
            <CardContent>
              <CommissionManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practices">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Pratiche</CardTitle>
            </CardHeader>
            <CardContent>
              <PracticesManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        {/* ... il tuo codice esistente per il dialog ... */}
      </AlertDialog>

      <Button 
        onClick={handleLogout}
        className="fixed top-4 right-4 bg-red-600 hover:bg-red-700 text-white"
      >
        Logout
      </Button>
    </div>
  )
} 