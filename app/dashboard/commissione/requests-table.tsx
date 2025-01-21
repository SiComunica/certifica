"use client"

import { useState } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface Request {
  id: string
  contractType: string
  employeeName: string
  submittedDate: string
  status: "pending" | "approved" | "rejected"
  isUrgent: boolean
}

export function RequestsTable() {
  const [requests] = useState<Request[]>([
    {
      id: "1",
      contractType: "Tempo Determinato",
      employeeName: "Mario Rossi",
      submittedDate: "2024-01-15",
      status: "pending",
      isUrgent: true,
    },
    // Aggiungi altri dati di esempio
  ])

  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)

  const handleReview = (status: "approved" | "rejected") => {
    // Implementa la logica per l'approvazione/rifiuto
    console.log(`Request ${selectedRequest?.id} ${status}`)
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo Contratto</TableHead>
            <TableHead>Dipendente</TableHead>
            <TableHead>Data Invio</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Urgenza</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.contractType}</TableCell>
              <TableCell>{request.employeeName}</TableCell>
              <TableCell>{request.submittedDate}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    request.status === "approved"
                      ? "default"
                      : request.status === "rejected"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {request.status === "approved" 
                    ? "Approvato" 
                    : request.status === "rejected" 
                    ? "Rifiutato" 
                    : "In attesa"}
                </Badge>
              </TableCell>
              <TableCell>
                {request.isUrgent && (
                  <Badge variant="destructive">Urgente</Badge>
                )}
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRequest(request)}
                    >
                      Revisiona
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Revisione Richiesta</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Note di Revisione</h4>
                        <Textarea
                          placeholder="Inserisci le note per la revisione..."
                          className="mt-2"
                        />
                      </div>
                      <div className="flex space-x-4">
                        <Button
                          variant="default"
                          onClick={() => handleReview("approved")}
                        >
                          Approva
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReview("rejected")}
                        >
                          Rifiuta
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 