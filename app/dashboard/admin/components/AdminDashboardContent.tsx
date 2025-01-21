"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { FileText, Tag, Handshake, Users } from "lucide-react"
import DocumentsManagement from "./DocumentsManagement"
import PricesManagement from "./PricesManagement"
import ConventionsManagement from "./ConventionsManagement"
import CommissionInvites from "./CommissionInvites"

export default function AdminDashboardContent() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid grid-cols-4 gap-4 bg-muted p-1 rounded-lg">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="prices" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tariffe
          </TabsTrigger>
          <TabsTrigger value="conventions" className="flex items-center gap-2">
            <Handshake className="h-4 w-4" />
            Convenzioni
          </TabsTrigger>
          <TabsTrigger value="commission" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Commissione
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <Card className="p-6">
            <DocumentsManagement />
          </Card>
        </TabsContent>

        <TabsContent value="prices">
          <Card className="p-6">
            <PricesManagement />
          </Card>
        </TabsContent>

        <TabsContent value="conventions">
          <Card className="p-6">
            <ConventionsManagement />
          </Card>
        </TabsContent>

        <TabsContent value="commission">
          <Card className="p-6">
            <CommissionInvites />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 